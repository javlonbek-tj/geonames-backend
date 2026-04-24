import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username kiritilishi shart'),
  password: z.string().min(1, 'Parol kiritilishi shart'),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Eski parol kiritilishi shart'),
  newPassword: z.string().min(8, "Yangi parol kamida 8 ta belgi bo'lishi kerak"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
