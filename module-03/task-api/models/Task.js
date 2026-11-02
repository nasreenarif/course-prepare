import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 1000, default: "" },
  completed: { type: Boolean, default: false },
  priority: { type: String, enum: ["low", "normal", "high"], default: "normal" }
}, { timestamps: true });

export default mongoose.model("Task", taskSchema);
