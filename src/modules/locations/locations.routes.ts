import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware';
import * as service from './locations.service';

const router = Router();

router.use(authenticate);

// GET /api/locations/regions
router.get('/regions', async (_req: Request, res: Response) => {
  const data = await service.getRegions();
  res.status(200).json({ status: 'success', data });
});

// GET /api/locations/districts?regionId=1
router.get('/districts', async (req: Request, res: Response) => {
  const regionId = req.query.regionId ? Number(req.query.regionId) : undefined;
  const data = await service.getDistricts(regionId);
  res.status(200).json({ status: 'success', data });
});

export default router;
