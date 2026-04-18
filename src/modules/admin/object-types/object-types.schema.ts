import { z } from 'zod';

export const createCategorySchema = z.object({
  code: z.string().trim().min(1, 'Kod kiritilishi shart').max(20),
  nameUz: z.string().trim().min(1, 'Nomi kiritilishi shart').max(200),
  nameKrill: z.string().trim().max(200).optional(),
});

export const updateCategorySchema = z.object({
  code: z.string().trim().min(1).max(20).nullable().optional(),
  nameUz: z.string().trim().min(1).max(200).optional(),
  nameKrill: z.string().trim().max(200).nullable().optional(),
});

export const createTypeSchema = z.object({
  nameUz: z.string().trim().min(1, 'Nomi kiritilishi shart').max(200),
  nameKrill: z.string().trim().max(200).optional(),
  categoryId: z.number().int().positive('categoryId majburiy'),
});

export const updateTypeSchema = z.object({
  nameUz: z.string().trim().min(1).max(200).optional(),
  nameKrill: z.string().trim().max(200).nullable().optional(),
  categoryId: z.number().int().positive().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateTypeInput = z.infer<typeof createTypeSchema>;
export type UpdateTypeInput = z.infer<typeof updateTypeSchema>;
