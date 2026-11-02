import test from 'node:test';
import assert from 'node:assert/strict';
import { loadOpenTasks } from './async-example.mjs';
test('async reader returns only open tasks', async () => {
  const result = await loadOpenTasks(async () => [
    { title: 'Open', completed: false }, { title: 'Done', completed: true }
  ]);
  assert.deepEqual(result, [{ title: 'Open', completed: false }]);
});
test('async invalid data rejects instead of silently becoming empty', async () => {
  await assert.rejects(() => loadOpenTasks(async () => ({ tasks: [] })), TypeError);
});
test('async dependency failure remains a rejection', async () => {
  const unavailable = new Error('fictional data source unavailable');
  await assert.rejects(() => loadOpenTasks(async () => { throw unavailable; }), error => error === unavailable);
});
