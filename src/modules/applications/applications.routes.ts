import { Router } from 'express';
import { authenticate } from '../../middleware';
import * as controller from './applications.controller';

const router = Router();

router.use(authenticate);

router.get('/', controller.getApplications);
router.get('/:id', controller.getApplicationById);
router.get('/:id/actions', controller.getAvailableActions);
router.post('/:id/action', controller.performAction);

export default router;
