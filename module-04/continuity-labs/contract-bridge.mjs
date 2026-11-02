// Explicit examples of the observed Module 3 and Module 4+ list contracts.
export function readList(body, moduleNumber) {
  const field = moduleNumber === 3 ? 'items' : moduleNumber >= 4 && moduleNumber <= 8 ? 'tasks' : null;
  if (!field) throw new RangeError('choose module 3 through 8');
  if (!body || !Array.isArray(body[field])) throw new TypeError(`expected ${field} array`);
  if (body[field].some(task => !task || typeof task.id !== 'string' || typeof task.title !== 'string' || typeof task.completed !== 'boolean')) {
    throw new TypeError('expected public task records');
  }
  return body[field];
}
export function titleAccepted(title, moduleNumber) {
  if (![3,4,5,6,7,8].includes(moduleNumber)) throw new RangeError('unknown module');
  if (typeof title !== 'string') return false;
  const length = title.trim().length;
  return moduleNumber === 3 ? length >= 3 && length <= 100 : length >= 1 && length <= 200;
}
