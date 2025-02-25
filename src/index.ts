import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { Task, TaskStatus, TaskCreate, TaskUpdate } from "./models/task";
import { v4 as uuidv4 } from "uuid";

const app = express();
const port = 8000;

app.use(bodyParser.json());
app.use(cors());

let tasks: Task[] = [];

// Helper function to find a task by ID
const findTaskById = (id: string): Task | undefined => {
  return tasks.find((task) => task.id === id);
};

// List all tasks
app.get("/api/tasks", (req, res) => {
  const status = req.query.status as TaskStatus | undefined;
  const filteredTasks = status
    ? tasks.filter((task) => task.status === status)
    : tasks;
  res.json(filteredTasks);
});

// Get a specific task by ID
app.get("/api/tasks/:id", (req, res) => {
  const task = findTaskById(req.params.id);
  if (task) {
    res.json(task);
  } else {
    res.status(404).json({ message: "Task not found" });
  }
});

// Create a new task
app.post("/api/tasks", (req, res) => {
  const taskData: TaskCreate = req.body;
  const newTask: Task = {
    id: uuidv4(),
    ...taskData,
    due_date: taskData.due_date ? new Date(taskData.due_date) : undefined, // Parse ISO string to Date
    status: TaskStatus.TODO,
    created_at: new Date(),
    updated_at: null,
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// Update an existing task
app.put("/api/tasks/:id", (req, res) => {
  const taskId = req.params.id;
  const taskUpdate: TaskUpdate = req.body;
  const task = findTaskById(taskId);

  if (task) {
    Object.assign(task, taskUpdate);
    task.updated_at = new Date();
    res.json(task);
  } else {
    res.status(404).json({ message: "Task not found" });
  }
});

// Delete a task
app.delete("/api/tasks/:id", (req, res) => {
  const taskId = req.params.id;
  const taskIndex = tasks.findIndex((task) => task.id === taskId);

  if (taskIndex !== -1) {
    tasks.splice(taskIndex, 1);
    res.status(204).send();
  } else {
    res.status(404).json({ message: "Task not found" });
  }
});

app.listen(port, () => {
  console.log("====================================");
  console.log(`|||  Server is running on http://localhost:${port}  |||`);
  console.log("====================================");
});
