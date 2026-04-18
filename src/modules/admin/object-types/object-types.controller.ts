import { Request, Response } from 'express';
import * as service from './object-types.service';
import {
  createCategorySchema,
  updateCategorySchema,
  createTypeSchema,
  updateTypeSchema,
} from './object-types.schema';
import { AppError } from '../../../utils/appError';

// ─── Categoies ────────────────────────────────────────────────────────────

export async function getCategories(_req: Request, res: Response) {
  const data = await service.getCategories();
  res.status(200).json({ status: 'success', data });
}

export async function createCategory(req: Request, res: Response) {
  const parsed = createCategorySchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(parsed.error.issues[0].message, 400);

  const data = await service.createCategory(parsed.data);
  res.status(201).json({ status: 'success', data });
}

export async function updateCategory(req: Request, res: Response) {
  const parsed = updateCategorySchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(parsed.error.issues[0].message, 400);

  const data = await service.updateCategory(Number(req.params.id), parsed.data);
  res.status(200).json({ status: 'success', data });
}

export async function deleteCategory(req: Request, res: Response) {
  await service.deleteCategory(Number(req.params.id));
  res.status(204).send();
}

// ─── Types ───────────────────────────────────────────────────────────────────

export async function getTypes(req: Request, res: Response) {
  const categoryId = req.query.categoryId
    ? Number(req.query.categoryId)
    : undefined;

  const data = await service.getTypes(categoryId);
  res.status(200).json({ status: 'success', data });
}

export async function createType(req: Request, res: Response) {
  const parsed = createTypeSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(parsed.error.issues[0].message, 400);

  const data = await service.createType(parsed.data);
  res.status(201).json({ status: 'success', data });
}

export async function updateType(req: Request, res: Response) {
  const parsed = updateTypeSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(parsed.error.issues[0].message, 400);

  const data = await service.updateType(Number(req.params.id), parsed.data);
  res.status(200).json({ status: 'success', data });
}

export async function deleteType(req: Request, res: Response) {
  await service.deleteType(Number(req.params.id));
  res.status(204).send();
}
