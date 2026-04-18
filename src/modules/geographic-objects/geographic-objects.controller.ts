import { Request, Response } from 'express';
import * as service from './geographic-objects.service';
import {
  createGeographicObjectSchema,
  updateGeometrySchema,
  updateObjectNamesSchema,
  updateRegistryObjectSchema,
} from './geographic-objects.schema';
import { AppError } from '../../utils/appError';

export async function getMyObjects(req: Request, res: Response) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

  const result = await service.getMyObjects(req.user!, { page, limit });
  res.status(200).json({ status: 'success', ...result });
}

export async function getObjectById(req: Request, res: Response) {
  const data = await service.getObjectById(Number(req.params.id));
  res.status(200).json({ status: 'success', data });
}

export async function createGeographicObject(req: Request, res: Response) {
  const parsed = createGeographicObjectSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(parsed.error.issues[0].message, 400);

  const data = await service.createGeographicObjects(parsed.data, req.user!);
  res.status(201).json({ status: 'success', data });
}

export async function updateObjectNames(req: Request, res: Response) {
  const parsed = updateObjectNamesSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(parsed.error.issues[0].message, 400);

  await service.updateObjectNames(
    Number(req.params.applicationId),
    parsed.data,
  );
  res
    .status(200)
    .json({ status: 'success', message: 'Nomlar muvaffaqiyatli saqlandi' });
}

export async function getRegistry(req: Request, res: Response) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const search = req.query.search ? String(req.query.search) : undefined;
  const regionId = req.query.regionId ? Number(req.query.regionId) : undefined;
  const districtId = req.query.districtId
    ? Number(req.query.districtId)
    : undefined;
  const objectTypeId = req.query.objectTypeId
    ? Number(req.query.objectTypeId)
    : undefined;
  const categoryId = req.query.categoryId
    ? Number(req.query.categoryId)
    : undefined;

  const result = await service.getRegistry({
    page,
    limit,
    search,
    regionId,
    districtId,
    objectTypeId,
    categoryId,
  });
  res.status(200).json({ status: 'success', ...result });
}

export async function updateRegistryObject(req: Request, res: Response) {
  const parsed = updateRegistryObjectSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(parsed.error.issues[0].message, 400);

  const data = await service.updateRegistryObject(
    Number(req.params.id),
    parsed.data,
  );
  res.status(200).json({ status: 'success', data });
}

export async function deleteRegistryObject(req: Request, res: Response) {
  await service.deleteRegistryObject(Number(req.params.id));
  res.status(200).json({ status: 'success', message: "Obyekt o'chirildi" });
}

export async function updateGeometry(req: Request, res: Response) {
  const parsed = updateGeometrySchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(parsed.error.issues[0].message, 400);

  const data = await service.updateGeometry(
    Number(req.params.id),
    parsed.data,
    req.user!,
  );
  res.status(200).json({ status: 'success', data });
}
