import dotenv from 'dotenv';

import { getJwtSecret } from './jwt.js';

dotenv.config();

const nodeEnv = process.env.NODE_ENV ?? 'development';
const port = Number(process.env.PORT ?? 3000);
const mongoUri = process.env.MONGODB_URI;
const jwtSecret = getJwtSecret();

if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error('PORT must be an integer between 1 and 65535');
}

if (!mongoUri) {
  throw new Error('MONGODB_URI is required');
}

export const env = {
  nodeEnv,
  port,
  mongoUri,
  jwtSecret,
} as const;
