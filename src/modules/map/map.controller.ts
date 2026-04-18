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
