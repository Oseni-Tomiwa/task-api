import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';

import { AppError } from '../errors/app-error.js';

export const validateBody = (schema: ZodType): RequestHandler => (request, _response, next) => {
  const result = schema.safeParse(request.body);

  if (!result.success) {
    next(new AppError(400, 'Invalid request data'));
    return;
  }

  request.body = result.data;
  next();
};
