export function toTaskResponse(task) {
  return {
    id: task._id.toString(),
    title: task.title,
    description: task.description,
    completed: task.completed,
    priority: task.priority,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString()
  };
}
