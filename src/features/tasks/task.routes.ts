import { Router } from 'express';

import { AppError } from '../../errors/app-error.js';
import { authenticate } from '../auth/auth.middleware.js';
import { validateBody, validateParams } from '../../middleware/validate.middleware.js';
import { Task, type TaskDocument } from './task.model.js';
import {
  createTaskSchema,
  taskIdSchema,
  updateTaskSchema,
  type CreateTaskInput,
  type UpdateTaskInput,
} from './task.schemas.js';

export const taskRouter = Router();

taskRouter.use(authenticate);

const taskResponse = (task: TaskDocument) => ({
  id: String(task._id),
  title: task.title,
  ...(task.description === undefined ? {} : { description: task.description }),
  status: task.status,
  createdAt: task.createdAt.toISOString(),
});

const requireTask = (task: TaskDocument | null): TaskDocument => {
  if (!task) {
    throw new AppError(404, 'Task not found');
  }

  return task;
};

taskRouter.post('/', validateBody(createTaskSchema), async (request, response) => {
  const input = request.body as CreateTaskInput;
  const task = await Task.create({ ...input, owner: request.user!.id });

  response.status(201).json(taskResponse(task));
});

taskRouter.get('/', async (request, response) => {
  const tasks = await Task.find({ owner: request.user!.id });

  response.status(200).json(tasks.map(taskResponse));
});

taskRouter.get('/:taskId', validateParams(taskIdSchema), async (request, response) => {
  const task = requireTask(
    await Task.findOne({ _id: request.params.taskId, owner: request.user!.id }),
  );

  response.status(200).json(taskResponse(task));
});

taskRouter.patch(
  '/:taskId',
  validateParams(taskIdSchema),
  validateBody(updateTaskSchema),
  async (request, response) => {
    const task = requireTask(
      await Task.findOneAndUpdate(
        { _id: request.params.taskId, owner: request.user!.id },
        request.body as UpdateTaskInput,
        { new: true, runValidators: true },
      ),
    );

    response.status(200).json(taskResponse(task));
  },
);

taskRouter.delete('/:taskId', validateParams(taskIdSchema), async (request, response) => {
  requireTask(await Task.findOneAndDelete({ _id: request.params.taskId, owner: request.user!.id }));

  response.status(204).send();
});
