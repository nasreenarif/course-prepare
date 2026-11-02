import mongoose from "mongoose";

const checklistItemSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  done: { type: Boolean, default: false }
});

const practiceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  checklist: {
    type: [checklistItemSchema],
    validate: {
      validator: items => items.length <= 20,
      message: "Use at most 20 checklist items."
    }
  }
});

const PracticeTask = mongoose.model("PracticeEmbeddedTask", practiceSchema);
const task = new PracticeTask({
  title: "Prepare project",
  checklist: [{ text: "Read the instructions" }]
});
await task.validate();
console.log(task.checklist[0].text);
task.checklist[0].done = true;
await task.validate();
console.log(task.checklist[0].done);
