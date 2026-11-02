import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { hashPassword } from './passwords.js';
import { models } from './model-doubles.js';
import { createApp, mailFor, verifyAccount, finishLogin } from './auth-fixtures.js';
import { emailSettings, makeMailer } from './email.js';

const credentials = { email: 'learner@example.test', password: 'A fictional practice passphrase 42!' };
const secret = 'A-test-only-secret-with-more-than-32-characters';
const dummyHash = await hashPassword('A fictional dummy practice password');
const post = (agent, path, token, body = {}) => agent.post(`/api/auth/${path}`).set('X-CSRF-Token', token).send(body);
const link = message => new URL(message.text.match(/https?:\/\/\S+/)[0]);
const otp = message => message.text.match(/code is: (\d{6})/)[1];
async function setup() {
  let time = Date.now();
  const data = models();
  const app = createApp({ ...data, secret, dummyHash, limiter: false, authClock: () => time });
  const agent = request.agent(app);
  const csrf = (await agent.get('/api/auth/csrf')).body.csrfToken;
  return { app, agent, csrf, data, advance: milliseconds => { time += milliseconds; } };
}
async function registered() {
  const context = await setup();
  await post(context.agent, 'register', context.csrf, credentials).expect(201);
  return context;
}
async function verified() {
  const context = await registered();
  await verifyAccount(context.app, credentials.email);
  return context;
}

test('registration stores a link digest and keeps unverified accounts out', async () => {
  const { app, agent, csrf, data } = await registered();
  const url = link(mailFor(app, credentials.email, 'Verify'));
  assert.equal(url.origin, 'http://localhost:5173');
  assert.match(url.searchParams.get('token'), /^[a-f0-9]{64}$/);
  const user = await data.User.findOne({ email: credentials.email });
  assert.equal(user.emailVerifiedAt, null);
  assert.notEqual(user.verificationTokenHash, url.searchParams.get('token'));
  await post(agent, 'login', csrf, credentials).expect(403);
  await agent.get('/api/tasks').expect(401);
  assert.equal(data.mailer.messages.length, 1);
});

test('verification link is single-use, verifies email, and never logs the user in', async () => {
  const { app, agent, data } = await registered();
  const url = link(mailFor(app, credentials.email, 'Verify'));
  await verifyAccount(app, credentials.email);
  const replay = await agent.get(url.pathname + url.search).expect(303);
  assert.equal(new URL(replay.headers.location).searchParams.get('verification'), 'invalid');
  const user = await data.User.findOne({ email: credentials.email });
  assert.ok(user.emailVerifiedAt);
  assert.equal(user.verificationTokenHash, undefined);
  assert.equal(replay.headers['referrer-policy'], 'no-referrer');
  await agent.get('/api/auth/me').expect(401);
});

test('expired and malformed verification links do not verify an account', async () => {
  const { app, agent, data, advance } = await registered();
  const url = link(mailFor(app, credentials.email, 'Verify'));
  advance(30 * 60000);
  for (const path of [url.pathname + url.search, '/api/auth/verify-email?token=bad']) {
    const response = await agent.get(path).expect(303);
    assert.equal(new URL(response.headers.location).searchParams.get('verification'), 'invalid');
  }
  assert.equal((await data.User.findOne({ email: credentials.email })).emailVerifiedAt, null);
});

test('verification resend requires the password, enforces cooldown, and replaces the old link', async () => {
  const { app, agent, csrf, advance } = await registered();
  const first = link(mailFor(app, credentials.email, 'Verify'));
  await post(agent, 'resend-verification', csrf, { ...credentials, password: 'A different practice passphrase' }).expect(401);
  await post(agent, 'resend-verification', csrf, credentials).expect(429);
  advance(60000);
  await post(agent, 'resend-verification', csrf, credentials).expect(200);
  const replaced = await agent.get(first.pathname + first.search).expect(303);
  assert.equal(new URL(replaced.headers.location).searchParams.get('verification'), 'invalid');
  await verifyAccount(app, credentials.email);
});

test('a Gmail failure leaves no valid token and can recover with resend', async () => {
  const { app, agent, csrf, data, advance } = await setup();
  const deliver = data.mailer.sendMail.bind(data.mailer);
  data.mailer.sendMail = async () => { throw new Error('private SMTP credentials and diagnostics'); };
  const failed = await post(agent, 'register', csrf, credentials).expect(503);
  assert.equal(failed.body.code, 'MAIL_UNAVAILABLE');
  assert.doesNotMatch(JSON.stringify(failed.body), /private SMTP/);
  const user = await data.User.findOne({ email: credentials.email });
  assert.equal(user.emailVerifiedAt, null);
  assert.equal(user.verificationTokenHash, undefined);
  data.mailer.sendMail = deliver; advance(60000);
  await post(agent, 'resend-verification', csrf, credentials).expect(200);
  await verifyAccount(app, credentials.email);
});

test('password-only login is pending and cannot read tasks or the current user', async () => {
  const { app, agent, csrf, data } = await verified();
  const pending = await post(agent, 'login', csrf, credentials).expect(202);
  assert.equal(pending.body.otpRequired, true);
  assert.equal(pending.body.user, undefined);
  assert.notEqual(pending.body.csrfToken, csrf);
  await agent.get('/api/auth/me').expect(401);
  await agent.get('/api/tasks').expect(401);
  const state = await agent.get('/api/auth/pending').expect(200);
  assert.equal(state.body.otpRequired, true);
  assert.equal(state.body.expiresInSeconds, 300);
  const code = otp(mailFor(app, credentials.email, 'sign-in'));
  const user = await data.User.findOne({ email: credentials.email });
  assert.notEqual(user.loginCodeHash, code);
  assert.match(user.loginCodeHash, /^[a-f0-9]{64}$/);
  assert.equal(JSON.stringify(pending.body).includes(code), false);
});

test('OTP completion rotates session and CSRF, consumes the code, and opens protected routes', async () => {
  const { app, agent, csrf, data } = await verified();
  const pending = await post(agent, 'login', csrf, credentials).expect(202);
  const completed = await finishLogin(app, agent, pending, credentials.email);
  assert.notEqual(completed.body.csrfToken, pending.body.csrfToken);
  assert.notEqual(completed.headers['set-cookie'][0].split(';')[0], pending.headers['set-cookie'][0].split(';')[0]);
  assert.deepEqual(Object.keys(completed.body.user).sort(), ['email', 'id']);
  await agent.get('/api/tasks').expect(200);
  await agent.get('/api/auth/me').expect(200);
  assert.equal((await data.User.findOne({ email: credentials.email })).loginCodeHash, undefined);
  await post(agent, 'verify-otp', completed.body.csrfToken, { code: otp(mailFor(app, credentials.email, 'sign-in')) }).expect(401);
});

test('a code cannot be submitted without the browser session that passed the password', async () => {
  const { app, agent, csrf } = await verified();
  await post(agent, 'login', csrf, credentials).expect(202);
  const other = request.agent(app);
  const token = (await other.get('/api/auth/csrf')).body.csrfToken;
  await post(other, 'verify-otp', token, { code: otp(mailFor(app, credentials.email, 'sign-in')) }).expect(401);
  await other.get('/api/tasks').expect(401);
});

test('five incorrect OTP guesses exhaust that code, including a later correct guess', async () => {
  const { app, agent, csrf, data } = await verified();
  const pending = await post(agent, 'login', csrf, credentials).expect(202);
  const code = otp(mailFor(app, credentials.email, 'sign-in'));
  const wrong = code === '000000' ? '999999' : '000000';
  for (let attempt = 0; attempt < 5; attempt++) await post(agent, 'verify-otp', pending.body.csrfToken, { code: wrong }).expect(401);
  await post(agent, 'verify-otp', pending.body.csrfToken, { code }).expect(401);
  assert.equal((await data.User.findOne({ email: credentials.email })).loginCodeAttempts, 5);
  await agent.get('/api/tasks').expect(401);
});

test('concurrent incorrect guesses cannot exceed the atomic attempt limit', async () => {
  const { app, agent, csrf, data } = await verified();
  const pending = await post(agent, 'login', csrf, credentials).expect(202);
  const code = otp(mailFor(app, credentials.email, 'sign-in'));
  const wrong = code === '000000' ? '999999' : '000000';
  const results = await Promise.all(Array.from({ length: 8 }, () => post(agent, 'verify-otp', pending.body.csrfToken, { code: wrong })));
  assert.ok(results.every(result => result.status === 401));
  assert.equal((await data.User.findOne({ email: credentials.email })).loginCodeAttempts, 5);
});

test('concurrent correct submissions consume the code only once', async () => {
  const { app, agent, csrf } = await verified();
  const pending = await post(agent, 'login', csrf, credentials).expect(202);
  const code = otp(mailFor(app, credentials.email, 'sign-in'));
  const results = await Promise.all(Array.from({ length: 2 }, () => post(agent, 'verify-otp', pending.body.csrfToken, { code })));
  assert.deepEqual(results.map(result => result.status).sort(), [200, 401]);
});

test('expired OTPs cannot complete sign-in or extend their expired pending session', async () => {
  const { app, agent, csrf, advance } = await verified();
  const pending = await post(agent, 'login', csrf, credentials).expect(202);
  advance(5 * 60000);
  await post(agent, 'verify-otp', pending.body.csrfToken, { code: otp(mailFor(app, credentials.email, 'sign-in')) }).expect(401);
  await post(agent, 'resend-otp', pending.body.csrfToken).expect(401);
  await agent.get('/api/tasks').expect(401);
});

test('resending a code is throttled, keeps access closed, and allows completion with the newest code', async () => {
  const { app, agent, csrf, advance } = await verified();
  const pending = await post(agent, 'login', csrf, credentials).expect(202);
  await post(agent, 'resend-otp', pending.body.csrfToken).expect(429);
  advance(60000);
  const replacement = await post(agent, 'resend-otp', pending.body.csrfToken).expect(202);
  await agent.get('/api/tasks').expect(401);
  await finishLogin(app, agent, replacement, credentials.email);
});

test('a new login challenge in another browser invalidates the earlier browser challenge', async () => {
  const { app, agent, csrf, advance } = await verified();
  const pending = await post(agent, 'login', csrf, credentials).expect(202);
  const oldCode = otp(mailFor(app, credentials.email, 'sign-in'));
  advance(60000);
  const other = request.agent(app);
  const token = (await other.get('/api/auth/csrf')).body.csrfToken;
  const newer = await post(other, 'login', token, credentials).expect(202);
  await post(agent, 'verify-otp', pending.body.csrfToken, { code: oldCode }).expect(401);
  await finishLogin(app, other, newer, credentials.email);
});

test('logout cancels a pending login and malformed OTP inputs never authenticate', async () => {
  const { app, agent, csrf } = await verified();
  const pending = await post(agent, 'login', csrf, credentials).expect(202);
  for (const code of [123456, {}, '12345', '1234567', 'abcdef']) await post(agent, 'verify-otp', pending.body.csrfToken, { code }).expect(400);
  await post(agent, 'logout', pending.body.csrfToken).expect(204);
  const fresh = (await agent.get('/api/auth/csrf')).body.csrfToken;
  await post(agent, 'verify-otp', fresh, { code: otp(mailFor(app, credentials.email, 'sign-in')) }).expect(401);
});

test('Gmail configuration uses an App Password and a fixed browser origin', () => {
  const valid = { GMAIL_USER: 'sender@gmail.com', GMAIL_APP_PASSWORD: 'abcd efgh ijkl mnop', APP_ORIGIN: 'http://localhost:5173' };
  assert.equal(emailSettings(valid).pass, 'abcdefghijklmnop');
  for (const changes of [{ GMAIL_APP_PASSWORD: '' }, { APP_ORIGIN: 'javascript:bad' }, { APP_ORIGIN: 'http://remote.example' },
    { APP_ORIGIN: 'https://example.test/path' }, { APP_ORIGIN: 'https://user:password@example.test' }, { NODE_ENV: 'production' }]) {
    assert.throws(() => emailSettings({ ...valid, ...changes }));
  }
  assert.equal(emailSettings({ ...valid, NODE_ENV: 'production', APP_ORIGIN: 'https://example.test' }).appOrigin, 'https://example.test');
});

test('Nodemailer transport uses Gmail, keeps the sender fixed, and rejects unaccepted delivery', async () => {
  let options, message;
  const mailer = makeMailer({ user: 'sender@gmail.com', pass: 'fixture-password' }, config => {
    options = config;
    return { async sendMail(value) { message = value; return { accepted: ['recipient@example.test'], rejected: [] }; } };
  });
  await mailer.sendMail({ from: 'forged@example.test', to: 'recipient@example.test', subject: 'Fixture', text: 'Fixture body' });
  assert.equal(options.service, 'gmail');
  assert.equal(options.auth.user, 'sender@gmail.com');
  assert.equal(options.disableFileAccess, true);
  assert.equal(message.from, 'sender@gmail.com');
  const rejected = makeMailer({ user: 'sender@gmail.com', pass: 'fixture' }, () => ({ sendMail: async () => ({ accepted: [], rejected: ['recipient@example.test'] }) }));
  await assert.rejects(rejected.sendMail({ to: 'recipient@example.test', subject: 'Fixture', text: 'Fixture' }));
});
