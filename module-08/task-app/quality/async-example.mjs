// Inject the data operation so tests do not require a database or network.
export async function loadOpenTasks(readTasks) {
  const tasks = await readTasks();
  if (!Array.isArray(tasks) || tasks.some(task => !task || typeof task.completed !== 'boolean')) {
    throw new TypeError('expected tasks with boolean completed');
  }
  return tasks.filter(task => !task.completed);
}
