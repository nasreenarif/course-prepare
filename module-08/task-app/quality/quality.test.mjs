import test from 'node:test';
import assert from 'node:assert/strict';
import { filterTasks } from './task-filter.mjs';
import { releaseDecision } from './release-gate.mjs';
const tasks = [{ title: 'A', completed: false }, { title: 'B', completed: true }];
test('filter implements all, open, done and empty collections', () => {
  assert.deepEqual(filterTasks(tasks), tasks);
  assert.deepEqual(filterTasks(tasks, 'open'), [tasks[0]]);
  assert.deepEqual(filterTasks(tasks, 'done'), [tasks[1]]);
  assert.deepEqual(filterTasks([], 'open'), []);
});
test('filter preserves the input and returns a separate array', () => {
  const frozen = Object.freeze(tasks.map(task => Object.freeze({ ...task })));
  const result = filterTasks(frozen, 'all');
  assert.notEqual(result, frozen);
  assert.deepEqual(result, tasks);
});
test('filter rejects wrong types and unknown states', () => {
  assert.throws(() => filterTasks(null), TypeError);
  assert.throws(() => filterTasks(tasks, 'OPEN'), RangeError);
  assert.throws(() => filterTasks([{ title: 'A', completed: 'false' }]), TypeError);
});
test('release needs passing checks with nonblank evidence', () => {
  assert.deepEqual(releaseDecision([{ id: 'unit', status: 'pass', evidence: 'log' }]), { ready: true, blockers: [] });
  assert.deepEqual(releaseDecision([{ id: 'unit', status: 'pass', evidence: ' ' }]), { ready: false, blockers: ['unit'] });
});
test('failed and unrun checks remain blockers', () => {
  const result = releaseDecision([{ id: 'a', status: 'fail', evidence: 'log' }, { id: 'b', status: 'not-run', evidence: '' }]);
  assert.deepEqual(result, { ready: false, blockers: ['a', 'b'] });
});
test('release rejects ambiguous or malformed evidence records', () => {
  assert.throws(() => releaseDecision([]), TypeError);
  assert.throws(() => releaseDecision([{ id: 'a', status: 'skip', evidence: '' }]), TypeError);
  assert.throws(() => releaseDecision([{ id: 'a', status: 'pass', evidence: 'log' }, { id: 'a', status: 'pass', evidence: 'log' }]), TypeError);
});
