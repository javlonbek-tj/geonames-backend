import { Router } from 'express';
import { authenticate, authorize, readOnly } from '../../middleware';
import * as controller from './geographic-objects.controller';

const router = Router();

router.use(authenticate);
router.use(readOnly);

router.get('/registry', controller.getRegistry);
router.get('/:id', controller.getObjectById);
router.post('/', authorize('dkp_filial'), controller.createGeographicObject);
router.patch(
  '/:id/geometry',
  authorize('dkp_filial', 'admin'),
  controller.updateGeometry,
);
router.patch('/:id', authorize('admin'), controller.updateRegistryObject);
router.delete('/:id', authorize('admin'), controller.deleteRegistryObject);

router.patch(
  '/by-application/:applicationId/names',
  authorize('district_hokimlik'),
  controller.updateObjectNames,
);

export default router;
