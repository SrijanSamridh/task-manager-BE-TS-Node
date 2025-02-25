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