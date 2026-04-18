import { Request, Response } from 'express';
import * as usersService from './users.service';
import {
  createUserSchema,
  updateUserSchema,
  resetPasswordSchema,
} from './users.schema';
import { AppError } from '../../../utils/appError';

export async function getUsers(req: Request, res: Response) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const role = req.query.role as string | undefined;
  const search = req.query.search as string | undefined;

  const result = await usersService.getUsers({ page, limit, role, search });

  res.status(200).json({ status: 'success', ...result });
}

export async function getUser(req: Request, res: Response) {
  const user = await usersService.getUserById(Number(req.params.id));
  res.status(200).json({ status: 'success', data: user });
}

export async function createUser(req: Request, res: Response) {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }

  const user = await usersService.createUser(parsed.data);
  res.status(201).json({ status: 'success', data: user });
}

export async function updateUser(req: Request, res: Response) {
  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }

  const user = await usersService.updateUser(Number(req.params.id), parsed.data);
  res.status(200).json({ status: 'success', data: user });
}

export async function resetPassword(req: Request, res: Response) {
  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }

  await usersService.resetPassword(Number(req.params.id), parsed.data);
  res.status(200).json({ status: 'success', message: 'Parol yangilandi' });
}

export async function deleteUser(req: Request, res: Response) {
  await usersService.deleteUser(Number(req.params.id));
  res.status(204).send();
}
