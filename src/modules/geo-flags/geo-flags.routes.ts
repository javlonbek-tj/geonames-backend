import { Router } from 'express';
import { authenticate, readOnly } from '../../middleware';
import * as controller from './geo-flags.controller';

const router = Router();

router.use(authenticate);
router.use(readOnly);

// POST /api/geo-flags/applications/:id/geo-objects/:geoId/flag — Toggle nomuvofiq belgisi
// GET  /api/geo-flags/applications/:id/flags                   — Ariza uchun barcha flaglar
// GET  /api/geo-flags/non-compliant                            — Barcha nomuvofiq obyektlar

router.post('/applications/:id/geo-objects/:geoId/flag', controller.toggleFlag);
router.get('/applications/:id/flags', controller.getApplicationFlags);
router.get('/non-compliant', controller.listNonCompliant);

export default router;
