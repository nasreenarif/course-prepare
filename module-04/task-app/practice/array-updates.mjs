// Run from task-app: node practice/array-updates.mjs
const before = [{ id: 'a', title: 'Read', completed: false }];
const saved = { id: 'a', title: 'Read', completed: true };
const updated = before.map(task => task.id === saved.id ? saved : task);
const removed = updated.filter(task => task.id !== saved.id);
console.log('Original still incomplete:', before[0].completed === false);
console.log('Updated is complete:', updated[0].completed === true);
console.log('New array:', before !== updated);
console.log('After deletion:', removed.length);
