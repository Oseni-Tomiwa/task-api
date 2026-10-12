import jwt from 'jsonwebtoken';

import { getJwtSecret } from '../../config/jwt.js';
import { AppError } from '../../errors/app-error.js';

export const createToken = (userId: string): string =>
  jwt.sign({}, getJwtSecret(), { subject: userId, expiresIn: '1h' });

export const readToken = (token: string): string => {
  try {
    const payload = jwt.verify(token, getJwtSecret());

    if (typeof payload === 'string' || typeof payload.sub !== 'string') {
      throw new Error('Token subject is missing');
    }

    return payload.sub;
  } catch {
    throw new AppError(401, 'Invalid or expired token');
  }
};
