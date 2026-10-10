import mongoose, { Schema, Document } from 'mongoose';

export enum TaskPriority {
  LOW = 0,
  MID = 1,
  HIGH = 2,
}

export enum TaskCategory {
  WORK = 'WORK',
  PERSONAL = 'PERSONAL',
  ACADEMIC = 'ACADEMIC',
  HEALTH = 'HEALTH',
  SYSTEM = 'SYSTEM',
}

export interface ITask extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  deadline: Date;
  priority: TaskPriority;
  category: TaskCategory;
  is_completed: boolean;
  is_deleted: boolean;
  notification_sent: boolean;
  completed_at?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    deadline: { type: Date, required: true },
    priority: {
      type: Number,
      enum: [TaskPriority.LOW, TaskPriority.MID, TaskPriority.HIGH],
      default: TaskPriority.MID,
    },
    category: {
      type: String,
      enum: Object.values(TaskCategory),
      default: TaskCategory.PERSONAL,
      index: true,
    },
    is_completed: { type: Boolean, default: false },
    is_deleted: { type: Boolean, default: false, index: true },
    completed_at: { type: Date, default: null },
    notification_sent: { 
      type: Boolean,
      default: false 
    }
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

export default mongoose.model<ITask>('Task', TaskSchema);