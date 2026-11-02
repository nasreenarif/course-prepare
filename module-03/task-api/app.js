import express from "express";
import taskRoutes from "./routes/taskRoutes.js";
import { notFound, errorHandler } from "./middleware/http.js";

const app = express();
app.use(express.json({ limit: "16kb" }));
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/tasks", taskRoutes);
app.use(notFound);
app.use(errorHandler);
export default app;
