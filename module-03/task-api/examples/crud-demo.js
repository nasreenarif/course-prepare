import "dotenv/config";
import mongoose from "mongoose";
import { connectDatabase } from "../config/database.js";
import Task from "../models/Task.js";

let createdId;
try {
  await connectDatabase();
  const created = await Task.create({ title: "Practice CRUD" });
  createdId = created._id;
  console.log("Created:", createdId.toString());

  const found = await Task.findById(createdId);
  if (!found) throw new Error("Practice record is missing");
  console.log("Read:", found.title, found.completed);

  found.completed = true;
  await found.save();
  const updated = await Task.findById(createdId);
  console.log("Updated:", updated.completed);

  await Task.findByIdAndDelete(createdId);
  console.log("After deletion:", await Task.findById(createdId));
  createdId = undefined;
} catch (error) {
  console.error("CRUD practice failed:", error.name);
  process.exitCode = 1;
} finally {
  // Cleanup is restricted to the document created by this run.
  try {
    if (createdId) await Task.findByIdAndDelete(createdId);
  } catch {
    console.error("Cleanup could not complete; check the practice record later.");
  } finally {
    await mongoose.disconnect();
  }
}
