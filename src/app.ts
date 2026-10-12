import express from 'express';
import swaggerUi from 'swagger-ui-express';

import { openApiSpec } from './docs/openapi.js';
import { authRouter } from './features/auth/auth.routes.js';
import { taskRouter } from './features/tasks/task.routes.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';

export const app = express();

app.use(express.json());

app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(openApiSpec, { customSiteTitle: 'Task Management API Docs' }),
);

app.get('/api/health', (_request, response) => {
  response.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/tasks', taskRouter);

app.use(notFound);
app.use(errorHandler);
