import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(72),
});

export const loginSchema = registerSchema;

export type AuthInput = z.infer<typeof registerSchema>;
