import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp, verifyAccount, finishLogin } from './auth-fixtures.js';
import { models } from './model-doubles.js';
import { hashPassword } from './passwords.js';

// Complete learning example: real middleware/HTTP flow, controlled in-memory data.
test('worked trace: rejected writes preserve state; corrected write can be read', async () => {
  const app = createApp({ ...models(), limiter: false,
    secret: 'fictional-quality-test-secret-at-least-32-characters',
    dummyHash: await hashPassword('Fictional dummy passphrase 8!') });
  const agent = request.agent(app); // Keeps cookies between requests.
  const credentials = { email: 'quality@example.test', password: 'Fictional quality passphrase 8!' };
  const initial = (await agent.get('/api/auth/csrf').expect(200)).body.csrfToken;
  await agent.post('/api/auth/register').set('X-CSRF-Token', initial).send(credentials).expect(201);
  await verifyAccount(app, credentials.email);
  const pending = await agent.post('/api/auth/login').set('X-CSRF-Token', initial).send(credentials).expect(202);
  await agent.get('/api/tasks').expect(401);
  const login = await finishLogin(app, agent, pending, credentials.email);
  const current = login.body.csrfToken; // Login rotates the token.
  assert.notEqual(current, initial);
  await agent.post('/api/tasks').set('X-CSRF-Token', initial).send({ title: 'Must not save' }).expect(403);
  assert.deepEqual((await agent.get('/api/tasks').expect(200)).body.tasks, []);
  const invalid = await agent.post('/api/tasks').set('X-CSRF-Token', current)
    .set('Content-Type', 'application/json').send('{broken').expect(400);
  assert.equal(invalid.body.code, 'INVALID_JSON');
  assert.equal(invalid.body.requestId, invalid.headers['x-request-id']);
  assert.deepEqual((await agent.get('/api/tasks').expect(200)).body.tasks, []);
  const created = await agent.post('/api/tasks').set('X-CSRF-Token', current)
    .send({ title: 'Read back this task' }).expect(201);
  const read = await agent.get(`/api/tasks/${created.body.task.id}`).expect(200);
  assert.equal(read.body.task.title, 'Read back this task');
  assert.equal(read.body.task.completed, false);
});
