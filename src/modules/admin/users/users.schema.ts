import { z } from 'zod';

const roles = [
  'admin',
  'dkp_filial',
  'dkp_regional',
  'dkp_central',
  'district_commission',
  'district_hokimlik',
  'regional_commission',
  'regional_hokimlik',
  'kadastr_agency',
] as const;

const commissionPositions = [
  'hokim',
  'hokim_deputy',
  'economics_head',
  'construction_head',
  'poverty_head',
  'ecology_head',
  'culture_head',
  'spirituality_head',
  'newspaper_head',
  'dkp_head',
  'historian',
  'linguist',
  'geographer',
] as const;

// Regional roles
const regionalRoles = [
  'dkp_regional',
  'regional_commission',
  'regional_hokimlik',
] as const;

// District roles
const districtRoles = [
  'dkp_filial',
  'district_commission',
  'district_hokimlik',
] as const;

export const createUserSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "Username kamida 3 ta belgi bo'lishi kerak")
      .max(50)
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username faqat harf, raqam va _ dan iborat bo'lishi kerak",
      ),
    password: z.string().min(8, "Parol kamida 8 ta belgi bo'lishi kerak"),
    fullName: z.string().trim().min(2, "F.I.O. kamida 2 ta belgi bo'lishi kerak").max(200),
    role: z.enum(roles, { error: "Noto'g'ri rol" }),
    regionId: z.number().int().positive().optional(),
    districtId: z.number().int().positive().optional(),
    position: z.enum(commissionPositions).optional(),
  })
  .refine(
    (data) => {
      if ((regionalRoles as readonly string[]).includes(data.role)) {
        return !!data.regionId;
      }
      return true;
    },
    {
      message: 'Viloyat darajasidagi rol uchun regionId majburiy',
      path: ['regionId'],
    },
  )
  .refine(
    (data) => {
      if ((districtRoles as readonly string[]).includes(data.role)) {
        return !!data.districtId;
      }
      return true;
    },
    {
      message: 'Tuman darajasidagi rol uchun districtId majburiy',
      path: ['districtId'],
    },
  );

export const updateUserSchema = z
  .object({
    fullName: z.string().trim().min(2).max(200).optional(),
    role: z.enum(roles).optional(),
    regionId: z.number().int().positive().nullable().optional(),
    districtId: z.number().int().positive().nullable().optional(),
    position: z.enum(commissionPositions).nullable().optional(),
    isActive: z.boolean().optional(),
    isBlocked: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Kamida bitta maydon o'zgartirilishi kerak",
  });

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, "Parol kamida 8 ta belgi bo'lishi kerak"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
