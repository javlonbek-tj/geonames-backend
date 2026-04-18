import { Request, Response } from 'express';
import { loginSchema } from './auth.schema';
import * as authService from './auth.service';
import { AppError } from '../../utils/appError';

const COOKIE_NAME = 'refreshToken';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: authService.REFRESH_TOKEN_EXPIRES_MS,
};

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }

  const result = await authService.login(parsed.data);

  res.cookie(COOKIE_NAME, result.refreshToken, COOKIE_OPTIONS);

  res.status(200).json({
    status: 'success',
    data: {
      accessToken: result.accessToken,
      user: result.user,
    },
  });
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    throw new AppError('Refresh token topilmadi', 401);
  }

  const result = await authService.refresh(token);

  res.status(200).json({
    status: 'success',
    data: { accessToken: result.accessToken },
  });
}

export async function logout(req: Request, res: Response) {
  const token = req.cookies?.[COOKIE_NAME];

  if (token) {
    await authService.logout(token);
  }

  res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);

  res.status(200).json({ status: 'success', message: 'Tizimdan chiqildi' });
}

export async function me(req: Request, res: Response) {
  res.status(200).json({
    status: 'success',
    user: req.user,
  });
}
