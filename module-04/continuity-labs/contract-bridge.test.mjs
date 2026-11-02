import test from 'node:test';
import assert from 'node:assert/strict';
import { readList, titleAccepted } from './contract-bridge.mjs';
const task = { id: 'fictional-id', title: 'Study', completed: false };
test('Module 3 items envelope is explicit', () => {
  assert.deepEqual(readList({ items: [task], page: 1, limit: 10 }, 3), [task]);
  assert.throws(() => readList({ tasks: [task] }, 3), TypeError);
});
test('Module 4+ tasks envelope must match its caller', () => {
  assert.deepEqual(readList({ tasks: [task] }, 4), [task]);
  assert.throws(() => readList({ items: [task] }, 4), TypeError);
});
test('title boundaries changed intentionally between teaching baselines', () => {
  assert.equal(titleAccepted('A', 3), false);
  assert.equal(titleAccepted('A', 4), true);
  assert.equal(titleAccepted('x'.repeat(101), 3), false);
  assert.equal(titleAccepted('x'.repeat(101), 4), true);
});
test('wrong fields or types fail rather than looking like an empty list', () => {
  assert.throws(() => readList({ tasks: [{ ...task, completed: 'false' }] }, 8), TypeError);
  assert.throws(() => readList({ tasks: [task] }, 2), RangeError);
  assert.equal(titleAccepted(' ', 8), false);
});
