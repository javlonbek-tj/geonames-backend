import { z } from 'zod';

export const performActionSchema = z.object({
  action: z.enum(['submit', 'approve', 'return', 'reject'], {
    error: "Noto'g'ri harakat turi",
  }),
  comment: z.string().trim().max(2000).optional(),
  attachments: z.array(z.string()).optional(),
});

export type PerformActionInput = z.infer<typeof performActionSchema>;
