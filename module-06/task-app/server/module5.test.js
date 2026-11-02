import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { taskInput } from './validation.js';
import { createApp, verifyAccount, finishLogin } from './auth-fixtures.js';
import { models } from './model-doubles.js';
const config = () => ({ ...models(), secret: 'test-only-secret-with-at-least-32-characters', limiter: false });
test('validation boundaries, partial updates, and field maps', () => {
  assert.deepEqual(taskInput({ title: ' x ' }), { title: 'x' });
  assert.equal(taskInput({ title: 'x'.repeat(200) }).title.length, 200);
  assert.deepEqual(taskInput({ completed: false }, true), { completed: false });
  for (const title of ['', '   ', 'x'.repeat(201), 12, null, {}]) {
    assert.throws(() => taskInput({ title }), e => e.status === 400 && e.code === 'VALIDATION_ERROR' && Boolean(e.fields.title));
  }
  for (const body of [null, [], {}, { owner: 'other', title: 'x' }, { completed: 'false' }]) assert.throws(() => taskInput(body, true));
});
test('parser failures have a safe consistent contract and request reference', async () => {
  const app = createApp(config());
  const result = await request(app).post('/api/tasks').set('Content-Type','application/json').send('{broken').expect(400);
  assert.equal(result.body.code,'INVALID_JSON');
  assert.deepEqual(result.body.fields,{});
  assert.equal(result.body.requestId,result.headers['x-request-id']);
  assert.equal(result.body.stack,undefined);
});
test('readiness returns 503 for a failed dependency', async () => {
  const app = createApp({ ...config(), checkReady: async () => { throw new Error('private database details'); } });
  const result = await request(app).get('/api/health').expect(503);
  assert.deepEqual(result.body,{ status: 'unavailable' });
  assert.equal(result.headers['set-cookie'],undefined);
});
test('API 404 remains JSON while built frontend paths return HTML', async () => {
  const staticDir = fileURLToPath(new URL('./test-public/', import.meta.url));
  const app = createApp({ ...config(), staticDir });
  const api = await request(app).get('/api/missing').set('Accept','text/html').expect(404);
  assert.equal(api.body.code,'NOT_FOUND');
  await request(app).get('/account').set('Accept','text/html').expect(200).expect('Content-Type',/html/);
  await request(app).get('/missing.js').expect(404);
});
