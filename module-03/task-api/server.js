import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";
import { connectDatabase } from "./config/database.js";

async function start() {
  const port = Number(process.env.PORT ?? "3000");
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("Invalid PORT");
  }
  await connectDatabase();
  console.log("Database connected.");
  const server = app.listen(port, () => {
    console.log(`API listening at http://localhost:${port}`);
  });
  server.on("error", async () => {
    console.error("Cannot listen. Check the configured port.");
    await mongoose.disconnect();
    process.exitCode = 1;
  });
}

start().catch(async () => {
  console.error("Startup failed. Check environment and database access.");
  await mongoose.disconnect();
  process.exitCode = 1;
});
