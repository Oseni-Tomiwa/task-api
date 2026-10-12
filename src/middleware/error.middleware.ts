import type { ErrorRequestHandler, RequestHandler } from 'express';

import { AppError } from '../errors/app-error.js';

type DuplicateKeyError = Error & { code: number };

const isDuplicateKeyError = (error: unknown): error is DuplicateKeyError =>
  error instanceof Error && 'code' in error && error.code === 11_000;

export const notFound: RequestHandler = (request, _response, next) => {
  next(new AppError(404, `Route not found: ${request.method} ${request.originalUrl}`));
};

export const errorHandler: ErrorRequestHandler = (error, _request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({ error: { message: error.message } });
    return;
  }

  if (isDuplicateKeyError(error)) {
    response.status(409).json({ error: { message: 'Email is already registered' } });
    return;
  }

  console.error(error);
  response.status(500).json({ error: { message: 'Internal server error' } });
};
