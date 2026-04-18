import { Request, Response } from 'express';
import * as service from './geo-flags.service';

export async function toggleFlag(req: Request, res: Response) {
  const applicationId = Number(req.params.id);
  const geoObjectId = Number(req.params.geoId);
  const { comment } = req.body;

  const result = await service.toggleFlag(applicationId, geoObjectId, req.user!.userId, comment);
  res.status(200).json({ status: 'success', data: result });
}

export async function getApplicationFlags(req: Request, res: Response) {
  const applicationId = Number(req.params.id);
  const data = await service.getApplicationFlags(applicationId);
  res.status(200).json({ status: 'success', data });
}

export async function listNonCompliant(req: Request, res: Response) {
  const data = await service.listNonCompliant();
  res.status(200).json({ status: 'success', data });
}
