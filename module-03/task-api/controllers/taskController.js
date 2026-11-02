import Task from "../models/Task.js";
import { validateTaskInput, validateListQuery } from "../validation/taskInput.js";
import { toTaskResponse } from "../utils/taskResponse.js";

export async function createTask(req, res, next) {
  try {
    const result = validateTaskInput(req.body);
    if (result.error) return res.status(400).json({ message: result.error });
    const task = await Task.create(result.value);
    return res.status(201).location(`/api/tasks/${task._id}`).json(toTaskResponse(task));
  } catch (error) { return next(error); }
}

export async function listTasks(req, res, next) {
  try {
    const result = validateListQuery(req.query);
    if (result.error) return res.status(400).json({ message: result.error });
    const { filter, page, limit } = result.value;
    const tasks = await Task.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit).limit(limit);
    return res.json({ items: tasks.map(toTaskResponse), page, limit });
  } catch (error) { return next(error); }
}

export async function getTask(req, res, next) {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found." });
    return res.json(toTaskResponse(task));
  } catch (error) { return next(error); }
}

export async function updateTask(req, res, next) {
  try {
    const result = validateTaskInput(req.body, { partial: true });
    if (result.error) return res.status(400).json({ message: result.error });
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found." });
    Object.assign(task, result.value);
    await task.save();
    return res.json(toTaskResponse(task));
  } catch (error) { return next(error); }
}

export async function deleteTask(req, res, next) {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found." });
    return res.status(204).end();
  } catch (error) { return next(error); }
}
