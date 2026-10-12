import type { RequestHandler } from 'express';

import { AppError } from '../../errors/app-error.js';
import { readToken } from './token.js';

export const authenticate: RequestHandler = (request, _response, next) => {
  const [scheme, token] = request.header('Authorization')?.split(' ') ?? [];

  if (scheme !== 'Bearer' || !token) {
    next(new AppError(401, 'Authentication required'));
    return;
  }

  request.user = { id: readToken(token) };
  next();
};
