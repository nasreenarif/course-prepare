// Pure function: no network, DOM or mutation of the input array.
export function filterTasks(tasks, status = 'all') {
  if (!Array.isArray(tasks)) throw new TypeError('tasks must be an array');
  if (!['all', 'open', 'done'].includes(status)) throw new RangeError('unknown status');
  if (tasks.some(task => !task || typeof task.title !== 'string' || typeof task.completed !== 'boolean')) {
    throw new TypeError('each task needs a title and boolean completed');
  }
  return tasks.filter(task => status === 'all' || task.completed === (status === 'done'));
}
