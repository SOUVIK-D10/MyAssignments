import { ITask, TaskPriority, TaskCategory } from '../modules/Task';

// Light DTO for List Views
export interface LightTaskDTO {
  id: string;
  title: string;
  deadline: Date;
  priority: TaskPriority;
  category: TaskCategory;
  is_completed: boolean;
  is_deleted: boolean;
}

// Heavy DTO for Detailed Views
export interface HeavyTaskDTO {
  id: string;
  title: string;
  description: string;
  deadline: Date;
  priority: TaskPriority;
  category: TaskCategory;
  is_completed: boolean;
  is_deleted: boolean;
  completed_at?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// MAP TO Light DTO
export const toLightTaskDTO = (task: ITask): LightTaskDTO => ({
  id: task._id.toString(),
  title: task.title,
  deadline: task.deadline,
  priority: task.priority,
  category: task.category,
  is_completed: task.is_completed,
  is_deleted: task.is_deleted,
});

// MAP to Heavy DTO
export const toHeavyTaskDTO = (task: ITask): HeavyTaskDTO => ({
  id: task._id.toString(),
  title: task.title,
  description: task.description,
  deadline: task.deadline,
  priority: task.priority,
  category: task.category,
  is_completed: task.is_completed,
  is_deleted: task.is_deleted,
  completed_at: task.completed_at,
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
});