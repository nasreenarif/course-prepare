import test from 'node:test';
import assert from 'node:assert/strict';
import { readPriority } from './priority.mjs';
test('priority extension preserves accepted values and rejects other types', () => {
  for (const value of ['low', 'normal', 'high']) assert.equal(readPriority(value), value);
  for (const value of ['urgent', '', null, undefined, 1, {}, ['high']]) {
    assert.throws(() => readPriority(value), error => error.status === 400);
  }
});
