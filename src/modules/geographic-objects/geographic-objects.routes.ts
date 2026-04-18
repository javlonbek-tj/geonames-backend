import { Router } from 'express';
import { authenticate, authorize } from '../../middleware';
import * as controller from './geographic-objects.controller';

const router = Router();

router.use(authenticate);

router.get('/', controller.getMyObjects);
router.get('/registry', controller.getRegistry);
router.get('/:id', controller.getObjectById);
router.post('/', authorize('dkp_filial'), controller.createGeographicObject);
router.patch(
  '/:id/geometry',
  authorize('dkp_filial'),
  controller.updateGeometry,
);
router.patch('/:id', authorize('admin'), controller.updateRegistryObject);
router.delete('/:id', authorize('admin'), controller.deleteRegistryObject);

// Tuman hokimligi: ariza obyektlariga nom va reyestr raqami kiritadi
router.patch(
  '/by-application/:applicationId/names',
  authorize('district_hokimlik'),
  controller.updateObjectNames,
);

export default router;
