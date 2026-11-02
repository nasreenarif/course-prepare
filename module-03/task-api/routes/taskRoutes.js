import express from "express";
import { createTask, listTasks, getTask, updateTask, deleteTask } from "../controllers/taskController.js";
import { requireJson, validateId } from "../middleware/http.js";

const router = express.Router();
router.get("/", listTasks);
router.post("/", requireJson, createTask);
router.get("/:id", validateId, getTask);
router.patch("/:id", validateId, requireJson, updateTask);
router.delete("/:id", validateId, deleteTask);
export default router;
