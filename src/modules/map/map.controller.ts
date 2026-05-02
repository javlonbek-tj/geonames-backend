import type { Request, Response } from 'express';
import * as service from './map.service';

export async function getRegions(_req: Request, res: Response) {
  const data = await service.getRegionGeometries();
  res.json({ status: 'success', data });
}

export async function getDistricts(req: Request, res: Response) {
  const regionId = Number(req.params.regionId);
  const data = await service.getDistrictGeometries(regionId);
  res.json({ status: 'success', data });
}

export async function getDistrictObjects(req: Request, res: Response) {
  const districtId = Number(req.params.districtId);
  const data = await service.getDistrictObjects(districtId);
  res.json({ status: 'success', data });
}

export async function getRegistryObjects(req: Request, res: Response) {
  const raw = req.query.typeIds as string | undefined;
  const typeIds = raw ? raw.split(',').map(Number).filter(Boolean) : [];
  const regionId = req.query.regionId ? Number(req.query.regionId) : undefined;
  const districtId = req.query.districtId ? Number(req.query.districtId) : undefined;
  const data = await service.getRegistryObjects({ typeIds, regionId, districtId });
  res.json({ status: 'success', data });
}
