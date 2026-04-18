import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../../db/db';
import { users, refreshTokens } from '../../db/schema';
import { ENV } from '../../config';
import { AppError } from '../../utils/appError';
import type { LoginInput } from './auth.schema';

export interface JwtPayload {
  userId: number;
  username: string;
  role: string;
  position: string | null;
  regionId: number | null;
  districtId: number | null;
  iat?: number;
}

const ACCESS_TOKEN_EXPIRES = '15m';
const REFRESH_TOKEN_EXPIRES = '7d';
export const REFRESH_TOKEN_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000;

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, ENV.JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES,
  });
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, ENV.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES,
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, ENV.JWT_ACCESS_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, ENV.JWT_REFRESH_SECRET) as JwtPayload;
}

export async function login(input: LoginInput) {
  const user = await db.query.users.findFirst({
    where: eq(users.username, input.username.toLowerCase()),
  });

  if (!user || !user.isActive) {
    throw new AppError("Login yoki parol noto'g'ri", 401);
  }

  if (user.isBlocked) {
    throw new AppError(
      "Hisobingiz bloklangan. Administrator bilan bog'laning",
      403,
    );
  }

  const passwordMatch = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordMatch) {
    throw new AppError("Login yoki parol noto'g'ri", 401);
  }

  const payload: JwtPayload = {
    userId: user.id,
    username: user.username,
    role: user.role,
    position: user.position ?? null,
    regionId: user.regionId,
    districtId: user.districtId,
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await db.insert(refreshTokens).values({
    userId: user.id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_MS),
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      position: user.position ?? null,
      regionId: user.regionId,
      districtId: user.districtId,
    },
  };
}

export async function refresh(token: string) {
  let payload: JwtPayload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new AppError('Token yaroqsiz yoki muddati tugagan', 401);
  }

  const stored = await db.query.refreshTokens.findFirst({
    where: eq(refreshTokens.token, token),
  });

  if (!stored) {
    throw new AppError('Token topilmadi', 401);
  }

  if (stored.expiresAt < new Date()) {
    await db.delete(refreshTokens).where(eq(refreshTokens.token, token));
    throw new AppError('Token muddati tugagan', 401);
  }

  const accessToken = signAccessToken({
    userId: payload.userId,
    username: payload.username,
    role: payload.role,
    position: payload.position ?? null,
    regionId: payload.regionId,
    districtId: payload.districtId,
  });

  return { accessToken };
}

export async function logout(token: string) {
  await db.delete(refreshTokens).where(eq(refreshTokens.token, token));
}
