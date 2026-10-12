import bcrypt from 'bcrypt';
import { Router } from 'express';

import { AppError } from '../../errors/app-error.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { User } from '../../models/user.model.js';
import { loginSchema, registerSchema, type AuthInput } from './auth.schemas.js';
import { createToken } from './token.js';

export const authRouter = Router();

const authenticationResponse = (user: { _id: unknown; email: string }) => ({
  token: createToken(String(user._id)),
  user: {
    id: String(user._id),
    email: user.email,
  },
});

authRouter.post('/register', validateBody(registerSchema), async (request, response) => {
  const { email, password } = request.body as AuthInput;
  const existingUser = await User.exists({ email });

  if (existingUser) {
    throw new AppError(409, 'Email is already registered');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash });

  response.status(201).json(authenticationResponse(user));
});

authRouter.post('/login', validateBody(loginSchema), async (request, response) => {
  const { email, password } = request.body as AuthInput;
  const user = await User.findOne({ email }).select('+passwordHash');

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError(401, 'Invalid email or password');
  }

  response.status(200).json(authenticationResponse(user));
});
