import { Request, Response } from 'express';
import * as service from './applications.service';
import { performActionSchema } from './applications.schema';
import { AppError } from '../../utils/appError';

export async function getApplications(req: Request, res: Response) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
  const status = req.query.status as string | undefined;
  const tab = req.query.tab as string | undefined;
  const applicationNumber = (req.query.applicationNumber as string | undefined)?.trim() || undefined;
  const regionId = req.query.regionId ? Number(req.query.regionId) : undefined;
  const districtId = req.query.districtId ? Number(req.query.districtId) : undefined;

  const result = await service.getApplications(req.user!, {
    page,
    limit,
    status,
    tab,
    applicationNumber,
    regionId,
    districtId,
  });
  res.status(200).json({ status: 'success', ...result });
}

export async function getApplicationById(req: Request, res: Response) {
  const data = await service.getApplicationById(Number(req.params.id));
  res.status(200).json({ status: 'success', data });
}

export async function performAction(req: Request, res: Response) {
  const parsed = performActionSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(parsed.error.issues[0].message, 400);

  const data = await service.performAction(
    Number(req.params.id),
    parsed.data,
    req.user!,
  );
  res.status(200).json({ status: 'success', data });
}

export async function getAvailableActions(req: Request, res: Response) {
  const app = await service.getApplicationById(Number(req.params.id));
  const firstGeo = app.geographicObjects?.[0];
  const actions = service.getAvailableActionsForUser(
    app.currentStatus,
    req.user!.role,
  );
  res.status(200).json({ status: 'success', data: actions });
}
