import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username kiritilishi shart'),
  password: z.string().min(1, 'Parol kiritilishi shart'),
});

export type LoginInput = z.infer<typeof loginSchema>;
