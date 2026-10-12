import express from 'express';

import { authRouter } from './features/auth/auth.routes.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';

export const app = express();

app.use(express.json());

app.get('/api/health', (_request, response) => {
  response.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRouter);

app.use(notFound);
app.use(errorHandler);
