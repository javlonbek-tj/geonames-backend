import { Request, Response } from 'express';
import * as service from './public.service';
import { getRegistry, getObjectById } from '../geographic-objects/geographic-objects.service';
import { getRegions, getDistricts } from '../locations/locations.service';
import { getCategories } from '../admin/object-types/object-types.service';

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function requestOtp(req: Request, res: Response) {
  const { phone } = req.body as { phone?: string };
  if (!phone?.trim()) {
    res.status(400).json({ status: 'error', message: 'Telefon raqam kiriting' });
    return;
  }
  const data = await service.requestOtp(phone.trim());
  res.json({ status: 'success', data });
}

export async function verifyOtp(req: Request, res: Response) {
  const { sessionId, code } = req.body as { sessionId?: string; code?: string };
  if (!sessionId || !code) {
    res.status(400).json({ status: 'error', message: 'sessionId va code talab etiladi' });
    return;
  }
  const data = await service.verifyOtp(sessionId, code);
  res.json({ status: 'success', data });
}

// ─── Discussions ─────────────────────────────────────────────────────────────

export async function listDiscussions(req: Request, res: Response) {
  const citizenId = (req as Request & { citizenId?: number }).citizenId ?? null;
  const { regionId, districtId } = req.query as Record<string, string>;
  const data = await service.listDiscussions(citizenId, {
    regionId: regionId ? Number(regionId) : undefined,
    districtId: districtId ? Number(districtId) : undefined,
  });
  res.json({ status: 'success', data });
}

export async function getDiscussion(req: Request, res: Response) {
  const id = Number(req.params.id);
  const citizenId = (req as Request & { citizenId?: number }).citizenId ?? null;
  const data = await service.getDiscussion(id, citizenId);
  res.json({ status: 'success', data });
}

export async function getDiscussionResults(req: Request, res: Response) {
  const applicationId = Number(req.params.applicationId);
  const data = await service.getDiscussionResults(applicationId);
  res.json({ status: 'success', data });
}

export async function submitVote(req: Request, res: Response) {
  const citizenId = (req as Request & { citizenId?: number }).citizenId;
  if (!citizenId) {
    res.status(401).json({ status: 'error', message: 'Tizimga kirishingiz kerak' });
    return;
  }
  const { discussionId, vote } = req.body as { discussionId?: number; vote?: string };
  if (!discussionId || !vote) {
    res.status(400).json({ status: 'error', message: 'discussionId va vote talab etiladi' });
    return;
  }
  if (vote !== 'support' && vote !== 'oppose') {
    res.status(400).json({ status: 'error', message: 'vote: support yoki oppose' });
    return;
  }
  await service.submitVote(discussionId, citizenId, vote);
  res.json({ status: 'success' });
}

// ─── Public registry & reference data ────────────────────────────────────────

export async function getPublicRegistry(req: Request, res: Response) {
  const { page = '1', limit = '10', search, regionId, districtId, objectTypeId, categoryId } =
    req.query as Record<string, string>;
  const data = await getRegistry({
    page: Number(page),
    limit: Number(limit),
    search: search || undefined,
    regionId: regionId ? Number(regionId) : undefined,
    districtId: districtId ? Number(districtId) : undefined,
    objectTypeId: objectTypeId ? Number(objectTypeId) : undefined,
    categoryId: categoryId ? Number(categoryId) : undefined,
  });
  res.json({ status: 'success', ...data });
}

export async function getPublicRegions(_req: Request, res: Response) {
  const data = await getRegions();
  res.json({ status: 'success', data });
}

export async function getPublicDistricts(req: Request, res: Response) {
  const regionId = req.query.regionId ? Number(req.query.regionId) : undefined;
  const data = await getDistricts(regionId);
  res.json({ status: 'success', data });
}

export async function getPublicCategories(_req: Request, res: Response) {
  const data = await getCategories();
  res.json({ status: 'success', data });
}

export async function getPublicGeoObject(req: Request, res: Response) {
  const data = await getObjectById(Number(req.params.id));
  res.json({ status: 'success', data });
}
