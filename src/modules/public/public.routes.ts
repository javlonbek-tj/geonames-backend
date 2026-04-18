import { Router } from 'express';
import * as controller from './public.controller';
import { optionalCitizenAuth, requireCitizenAuth } from './citizen.middleware';

const router = Router();

// Auth (no middleware)
router.post('/auth/otp/request', controller.requestOtp);
router.post('/auth/otp/verify', controller.verifyOtp);

// Discussions — optional auth (to include myVote)
router.get('/discussions', optionalCitizenAuth, controller.listDiscussions);
router.get('/discussions/results/:applicationId', controller.getDiscussionResults);
router.get('/discussions/:id', optionalCitizenAuth, controller.getDiscussion);

// Vote — requires auth
router.post('/discussions/vote', requireCitizenAuth, controller.submitVote);

// Public registry & reference data (no auth)
router.get('/registry', controller.getPublicRegistry);
router.get('/registry/:id', controller.getPublicGeoObject);
router.get('/locations/regions', controller.getPublicRegions);
router.get('/locations/districts', controller.getPublicDistricts);
router.get('/categories', controller.getPublicCategories);

export default router;
