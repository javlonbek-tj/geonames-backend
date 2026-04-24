import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import { userRoleEnum } from '../db/schema';

type Role = (typeof userRoleEnum.enumValues)[number];

export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Autentifikatsiya talab qilinadi', 401);
    }

    if (!roles.includes(req.user.role as Role)) {
      throw new AppError('Bu amalni bajarish uchun ruxsat yo\'q', 403);
    }

    next();
  };
}
