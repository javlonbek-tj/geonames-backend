import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import * as controller from './map.controller';

const router = Router();

router.use(authenticate);

router.get('/regions', controller.getRegions);
router.get('/regions/:regionId/districts', controller.getDistricts);
router.get('/districts/:districtId/objects', controller.getDistrictObjects);

export default router;
