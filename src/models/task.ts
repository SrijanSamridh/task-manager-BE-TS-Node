// models/Task.ts
import mongoose, { Document } from 'mongoose';
import { TaskPriority } from '../enums/TaskPriority';
import { v4 as uuidv4 } from 'uuid';

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done'
}

export interface TaskCreate {
  title: string;
  description?: string;
  due_date?: Date;
  priority?: number;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  due_date?: Date;
  priority?: number;
  status?: TaskStatus;
}

export interface Task extends TaskCreate {
  id: string;
  status: TaskStatus;
  created_at: Date;
  updated_at: Date | null;
}


export interface ITask extends Document {
  title: string;
  description?: string;
  due_date?: Date;
  priority: TaskPriority;
  tags?: string[];
  userId: mongoose.Schema.Types.ObjectId;
  status: TaskStatus;
  created_at: Date;
  updated_at?: Date;
}

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  due_date: { type: Date },
  priority: { type: String, enum: Object.values(TaskPriority), default: TaskPriority.MEDIUM },
  tags: { type: [String], default: [] },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: Object.values(TaskStatus), default: TaskStatus.TODO },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date },
});

export const Task = mongoose.model<ITask>("Task", TaskSchema);