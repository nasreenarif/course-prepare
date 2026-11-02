import mongoose from "mongoose";

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (typeof uri !== "string" || uri.trim() === "") {
    throw new Error("Missing MONGODB_URI");
  }
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
}
