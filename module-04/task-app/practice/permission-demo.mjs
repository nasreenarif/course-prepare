// Run from task-app: node practice/permission-demo.mjs
// Learning model only: production identity must come from the server session.
const task = { id: 'task-1', owner: 'alice', title: 'Read chapter' };
function mayRead(user, record) {
  return Boolean(user && record && record.owner === user.id);
}
console.log('guest:', mayRead(null, task));
console.log('owner:', mayRead({ id: 'alice' }, task));
console.log('other account:', mayRead({ id: 'bob' }, task));
