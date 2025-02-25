import express, { Request, Response, RequestHandler } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { Task, TaskStatus, TaskCreate, TaskUpdate } from "./models/task";
import { User } from "./models/user";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import connectDB from "../config/db";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

const app = express();
const port = 8000;

app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
dotenv.config();
connectDB();

// Register a new user
app.post("/api/register", (async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Create a new user
    const newUser = new User({ username, password });
    await newUser.save();

    // Generate a JWT token
    const token = jwt.sign({ userId: newUser._id }, "your-secret-key", {
      expiresIn: "1h",
    });

    res.status(201).json({ token });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}) as RequestHandler);

// Login a user
app.post("/api/login", (async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // Compare the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, "your-secret-key", {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}) as RequestHandler);

// List all tasks for a user
app.get("/api/tasks", (async (req: Request, res: Response) => {
  const status = req.query.status as TaskStatus | undefined;
  const userId = req.query.userId as string;

  try {
    const query: any = { userId };
    if (status) {
      query.status = status;
    }

    const tasks = await Task.find(query);

    // Transform each task to rename _id to id
    const transformedTasks = tasks.map(task => {
      const taskObject = task.toObject();
      taskObject.id = taskObject._id;
      delete taskObject._id;
      return taskObject;
    });

    res.json(transformedTasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}) as RequestHandler);

// Get a specific task by ID
app.get("/api/tasks/:id", (async (req: Request, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);
    if (task) {
      // Convert the Mongoose document to a plain object
      const taskObject = task.toObject();

      // Rename _id to id
      taskObject.id = taskObject._id;
      delete taskObject._id;

      res.json(taskObject);
    } else {
      res.status(404).json({ message: "Task not found" });
    }
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}) as RequestHandler);

// Create a new task
app.post("/api/tasks", (async (req: Request, res: Response) => {
  const taskData: TaskCreate = req.body;

  try {
    const newTask = new Task({
      ...taskData,
      due_date: taskData.due_date ? new Date(taskData.due_date) : undefined,
      status: TaskStatus.TODO,
      created_at: new Date(),
      updated_at: null,
    });

    await newTask.save();

    // Convert the Mongoose document to a plain object
    const taskObject = newTask.toObject();

    // Rename _id to id
    taskObject.id = taskObject._id;
    delete taskObject._id;

    res.status(201).json(taskObject);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ message: "Failed to create task" });
  }
}) as RequestHandler);

// Update an existing task
app.put("/api/tasks/:id", (async (req: Request, res: Response) => {
  const taskId = req.params.id;
  const taskUpdate: TaskUpdate = req.body;

  try {
    const task = await Task.findByIdAndUpdate(taskId, taskUpdate, { new: true });
    if (task) {
      task.updated_at = new Date();
      await task.save();

      // Convert the Mongoose document to a plain object
      const taskObject = task.toObject();

      // Rename _id to id
      taskObject.id = taskObject._id;
      delete taskObject._id;

      res.json(taskObject);
    } else {
      res.status(404).json({ message: "Task not found" });
    }
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}) as RequestHandler);

// Delete a task
app.delete("/api/tasks/:id", (async (req: Request, res: Response) => {
  const taskId = req.params.id;
  const task = await Task.findByIdAndDelete(taskId);

  if (task) {
    res.status(204).send();
  } else {
    res.status(404).json({ message: "Task not found" });
  }
}) as RequestHandler);

app.listen(port, () => {
  console.log("====================================");
  console.log(`|||  Server is running on http://localhost:${port}  |||`);
  console.log("====================================");
});
