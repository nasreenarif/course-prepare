import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp as application } from './app.js';
import { models } from './model-doubles.js';

const fixtures = new WeakMap();
export function createApp(options) {
  const data = { ...models(), ...options };
  const app = application(data);
  fixtures.set(app, data);
  return app;
}
export function mailFor(app, email, subject) {
  const message = fixtures.get(app).mailer.messages.findLast(item => item.to === email && item.subject.includes(subject));
  assert.ok(message, 'Expected a captured fixture email; no message was sent externally.');
  return message;
}
export async function verifyAccount(app, email) {
  const message = mailFor(app, email, 'Verify');
  const url = new URL(message.text.match(/https?:\/\/\S+/)[0]);
  const response = await request(app).get(url.pathname + url.search).expect(303);
  assert.equal(new URL(response.headers.location).searchParams.get('verification'), 'success');
}
export async function finishLogin(app, agent, pending, email) {
  assert.equal(pending.body.otpRequired, true);
  const code = mailFor(app, email, 'sign-in').text.match(/code is: (\d{6})/)[1];
  return agent.post('/api/auth/verify-otp').set('X-CSRF-Token', pending.body.csrfToken).send({ code }).expect(200);
}
