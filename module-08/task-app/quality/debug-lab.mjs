import assert from 'node:assert/strict';
import { filterTasks } from './task-filter.mjs';
const tasks = [{ title: 'Write test', completed: false }, { title: 'Read requirement', completed: true }];
// Deliberately wrong: it tests truthiness, so the string "open" behaves like "done".
const broken = (items, status) => items.filter(item => status ? item.completed : !item.completed);
const before = broken(tasks, 'open').map(task => task.title);
console.log('Before:', before); // [ 'Read requirement' ] -- wrong task
assert.deepEqual(before, ['Read requirement']); // Confirms reproduction, not correctness.
const after = filterTasks(tasks, 'open').map(task => task.title);
assert.deepEqual(after, ['Write test']);
console.log('After:', after); // [ 'Write test' ] -- required result
console.log('Next: run npm run test:quality to check other statuses and invalid input.');
