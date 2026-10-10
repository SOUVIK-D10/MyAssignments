import mongoose, { Schema, Document } from 'mongoose';

export enum TaskPriority {
  LOW = 0,
  MID = 1,
  HIGH = 2,
}

export interface ITask extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  deadline: Date;
  priority: TaskPriority;
  is_completed: boolean;
  is_deleted: boolean;
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
    is_completed: { type: Boolean, default: false },
    is_deleted: { type: Boolean, default: false, index: true },
    completed_at: { type: Date, default: null },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

export default mongoose.model<ITask>('Task', TaskSchema);