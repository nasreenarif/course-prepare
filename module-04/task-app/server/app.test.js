import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp, verifyAccount, finishLogin } from './auth-fixtures.js';
import { hashPassword, verifyPassword } from './passwords.js';

// Route tests intentionally replace MongoDB; see README for the live checklist.
import { models } from './model-doubles.js';

test('password helper salts records and rejects incorrect passwords', async () => {
  const password = 'A long practice passphrase';
  const first = await hashPassword(password);
  const second = await hashPassword(password);
  assert.notEqual(first, second);
  assert.equal(await verifyPassword(password, first), true);
  assert.equal(await verifyPassword('A different practice passphrase', first), false);
});

test('account lifecycle, CSRF, input validation, and cross-account ownership', async t => {
  const app = createApp({ ...models(), secret: 'test-only-secret-with-at-least-32-characters', dummyHash: await hashPassword('Dummy-only-practice-passphrase'), limiter: false });
  const alice = request.agent(app), bob = request.agent(app);
  const password = 'A long practice passphrase';
  let aToken, bToken, taskId, oldCookie;
  const write = (agent, method, path, token, body = {}) => agent[method](path).set('X-CSRF-Token', token).send(body);
  await t.test('guest cannot read private records', async () => {
    await alice.get('/api/tasks').expect(401);
    await alice.get('/api/auth/me').expect(401);
  });
  await t.test('initialization issues a token and HttpOnly cookie', async () => {
    const a = await alice.get('/api/auth/csrf').expect(200);
    aToken = a.body.csrfToken; oldCookie = a.headers['set-cookie'][0].split(';')[0];
    assert.match(aToken, /^[a-f0-9]{64}$/);
    assert.match(a.headers['set-cookie'][0], /HttpOnly/);
    assert.match(a.headers['set-cookie'][0], /SameSite=Lax/);
    bToken = (await bob.get('/api/auth/csrf').expect(200)).body.csrfToken;
  });
  await t.test('state changes require a matching token', async () => {
    await alice.post('/api/auth/register').send({ email: 'a@example.test', password }).expect(403);
    await write(alice, 'post', '/api/auth/register', bToken, { email: 'a@example.test', password }).expect(403);
  });
  await t.test('registration validates input and hides hashes', async () => {
    await write(alice, 'post', '/api/auth/register', aToken, { email: {}, password }).expect(400);
    await write(alice, 'post', '/api/auth/register', aToken, { email: 'a@example.test', password: 'short' }).expect(400);
    const result = await write(alice, 'post', '/api/auth/register', aToken, { email: ' A@example.test ', password }).expect(201);
    assert.deepEqual(Object.keys(result.body.user).sort(), ['email', 'id']);
    assert.equal(result.body.user.email, 'a@example.test');
    await write(alice, 'post', '/api/auth/register', aToken, { email: 'a@example.test', password }).expect(409);
    await alice.get('/api/auth/me').expect(401);
    await write(bob, 'post', '/api/auth/register', bToken, { email: 'b@example.test', password }).expect(201);
    await verifyAccount(app, 'a@example.test');
    await verifyAccount(app, 'b@example.test');
  });
  await t.test('unknown account and wrong password share a response', async () => {
    const first = await write(alice, 'post', '/api/auth/login', aToken, { email: 'unknown@example.test', password }).expect(401);
    const second = await write(alice, 'post', '/api/auth/login', aToken, { email: 'a@example.test', password: 'A different practice password' }).expect(401);
    assert.deepEqual(first.body, second.body);
  });
  await t.test('login rotates the session and CSRF token', async () => {
    const pending = await write(alice, 'post', '/api/auth/login', aToken, { email: 'a@example.test', password }).expect(202);
    await alice.get('/api/tasks').expect(401);
    const login = await finishLogin(app, alice, pending, 'a@example.test');
    assert.notEqual(login.body.csrfToken, aToken);
    assert.notEqual(login.headers['set-cookie'][0].split(';')[0], oldCookie);
    await write(alice, 'post', '/api/tasks', aToken, { title: 'Stale token' }).expect(403);
    aToken = login.body.csrfToken;
    await request(app).get('/api/auth/me').set('Cookie', oldCookie).expect(401);
    assert.equal((await alice.get('/api/auth/me').expect(200)).body.user.email, 'a@example.test');
    const bPending = await write(bob, 'post', '/api/auth/login', bToken, { email: 'b@example.test', password }).expect(202);
    bToken = (await finishLogin(app, bob, bPending, 'b@example.test')).body.csrfToken;
  });
  await t.test('server rejects owner injection and invalid fields', async () => {
    await write(alice, 'post', '/api/tasks', aToken, { title: 'Secret', owner: 'forged' }).expect(400);
    await write(alice, 'post', '/api/tasks', aToken, { title: 'Secret', completed: 'true' }).expect(400);
    await write(alice, 'post', '/api/tasks', aToken, { title: '  ' }).expect(400);
    await alice.get('/api/tasks/not-an-id').expect(400);
    await alice.post('/api/tasks').set('X-CSRF-Token', aToken).type('text').send('hello').expect(415);
  });
  await t.test('owner creates, reads, and updates a record', async () => {
    const result = await write(alice, 'post', '/api/tasks', aToken, { title: 'Private task' }).expect(201);
    taskId = result.body.task.id;
    assert.equal(result.body.task.completed, false);
    await alice.get(`/api/tasks/${taskId}`).expect(200);
    const updated = await write(alice, 'patch', `/api/tasks/${taskId}`, aToken, { completed: true }).expect(200);
    assert.equal(updated.body.task.completed, true);
  });
  await t.test('non-owner cannot list, read, update, or delete the record', async () => {
    assert.deepEqual((await bob.get('/api/tasks').expect(200)).body.tasks, []);
    await bob.get(`/api/tasks/${taskId}`).expect(404);
    await write(bob, 'patch', `/api/tasks/${taskId}`, bToken, { title: 'Tampered' }).expect(404);
    await write(bob, 'delete', `/api/tasks/${taskId}`, bToken).expect(404);
    const original = await alice.get(`/api/tasks/${taskId}`).expect(200);
    assert.equal(original.body.task.title, 'Private task');
    assert.equal(original.body.task.completed, true);
  });
  await t.test('owner deletion returns an empty 204', async () => {
    const result = await write(alice, 'delete', `/api/tasks/${taskId}`, aToken).expect(204);
    assert.equal(result.text, '');
    await alice.get(`/api/tasks/${taskId}`).expect(404);
  });
  await t.test('logout revokes the session and clears the cookie', async () => {
    const result = await write(alice, 'post', '/api/auth/logout', aToken).expect(204);
    assert.match(result.headers['set-cookie'][0], /Expires=Thu, 01 Jan 1970/);
    await alice.get('/api/auth/me').expect(401);
    await alice.get('/api/tasks').expect(401);
  });
});
