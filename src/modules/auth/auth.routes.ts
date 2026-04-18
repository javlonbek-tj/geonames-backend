import { Router } from 'express';
import * as authController from './auth.controller';
import { authenticate } from '../../middleware';

const router = Router();

// POST /api/auth/login
router.post('/login', authController.login);

// POST /api/auth/refresh
router.post('/refresh', authController.refresh);

// POST /api/auth/logout
router.post('/logout', authController.logout);

// GET /api/auth/me  — protected
router.get('/me', authenticate, authController.me);

export default router;
