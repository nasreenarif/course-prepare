import Task from "../models/Task.js";
const task = new Task({ title: "  Read Module 3  " });
await task.validate();
console.log(task.title, task.completed, task.priority);
// No database connection or save: this does not persist a record.
