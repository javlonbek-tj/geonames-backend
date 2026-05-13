import { Router } from 'express';
import { authenticate, readOnly } from '../../middleware';
import { uploadMiddleware } from '../../middleware/upload';
import * as controller from './uploads.controller';

const router = Router();

router.use(authenticate);
router.use(readOnly);

router.post(
  '/applications/:applicationId',
  uploadMiddleware.single('file'),
  controller.uploadDocument,
);

router.get('/applications/:applicationId', controller.getDocuments);

router.delete('/documents/:documentId', controller.deleteDocument);

export default router;
