import { Request, Response } from 'express';
import * as service from './commission.service';
import { AppError } from '../../utils/appError';

export async function getApprovals(req: Request, res: Response) {
  const applicationId = Number(req.params.applicationId);
  const data = await service.getApprovals(applicationId);
  res.json({ status: 'success', data });
}

export async function approve(req: Request, res: Response) {
  const applicationId = Number(req.params.applicationId);
  const result = await service.approve(applicationId, req.user!);
  res.json({ status: 'success', data: result });
}

export async function reject(req: Request, res: Response) {
  const applicationId = Number(req.params.applicationId);
  const { comment } = req.body as { comment?: string };
  if (!comment?.trim()) throw new AppError("Rad etish sababi kiritilishi shart", 400);
  const result = await service.reject(applicationId, req.user!, comment);
  res.json({ status: 'success', data: result });
}

export async function revokeApproval(req: Request, res: Response) {
  const applicationId = Number(req.params.applicationId);
  await service.revokeApproval(applicationId, req.user!);
  res.status(204).send();
}
