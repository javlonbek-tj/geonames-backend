import { Router } from 'express';
import { authenticate, authorize } from '../../middleware';
import * as controller from './commission.controller';

const router = Router();

router.use(authenticate);

// GET  /api/commission/:applicationId  — kelishuvlar ro'yxati
// POST /api/commission/:applicationId  — kelishish
// DELETE /api/commission/:applicationId — kelishuvni qaytarish

router.get('/:applicationId', controller.getApprovals);
router.post('/:applicationId/approve', authorize('district_commission'), controller.approve);
router.post('/:applicationId/reject', authorize('district_commission'), controller.reject);
router.delete('/:applicationId', authorize('district_commission'), controller.revokeApproval);

export default router;
