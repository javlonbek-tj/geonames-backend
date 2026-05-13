import { Router } from 'express';
import { authenticate, authorize, readOnly } from '../../middleware';
import * as usersController from './users/users.controller';
import * as objectTypesController from './object-types/object-types.controller';

const router = Router();

router.use(authenticate);
router.use(readOnly);

// GET object types — for all authenticated users
router.get('/object-categories', objectTypesController.getCategories);
router.get('/object-types', objectTypesController.getTypes);

// The rest requires admin or superuser (readOnly blocks mutations for superuser)
router.use(authorize('admin', 'superuser'));

// ─── Users ─────────────────────────────────────────────────────────

router.get('/users', usersController.getUsers);
router.get('/users/:id', usersController.getUser);
router.post('/users', usersController.createUser);
router.patch('/users/:id', usersController.updateUser);
router.patch('/users/:id/reset-password', usersController.resetPassword);
router.delete('/users/:id', usersController.deleteUser);

// ─── Object categories ───────────────────────────────────────────────────

router.post('/object-categories', objectTypesController.createCategory);
router.patch('/object-categories/:id', objectTypesController.updateCategory);
router.delete('/object-categories/:id', objectTypesController.deleteCategory);

// ─── Object types ──────────────────────────────────────────────────────────

router.post('/object-types', objectTypesController.createType);
router.patch('/object-types/:id', objectTypesController.updateType);
router.delete('/object-types/:id', objectTypesController.deleteType);

export default router;
