import mongoose, { type HydratedDocument, type Model, type Types } from 'mongoose';

const { model, models, Schema } = mongoose;

export const TASK_STATUSES = ['pending', 'in-progress', 'completed'] as const;

export interface TaskFields {
  title: string;
  description?: string;
  status: (typeof TASK_STATUSES)[number];
  createdAt: Date;
  owner: Types.ObjectId;
}

export type TaskDocument = HydratedDocument<TaskFields>;

const taskSchema = new Schema<TaskFields>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: TASK_STATUSES,
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

export const Task =
  (models.Task as Model<TaskFields> | undefined) ?? model<TaskFields>('Task', taskSchema);
