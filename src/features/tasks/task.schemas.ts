import { z } from 'zod';

import { TASK_STATUSES } from './task.model.js';

const taskFields = {
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2_000).optional(),
  status: z.enum(TASK_STATUSES),
};

export const createTaskSchema = z.object({
  ...taskFields,
  status: taskFields.status.default('pending'),
});

export const updateTaskSchema = z
  .object(taskFields)
  .partial()
  .refine((data) => Object.keys(data).length > 0);

export const taskIdSchema = z.object({
  taskId: z.string().regex(/^[0-9a-fA-F]{24}$/),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
