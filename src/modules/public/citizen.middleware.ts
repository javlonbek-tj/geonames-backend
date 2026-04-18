import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../../config';

interface CitizenPayload {
  citizenId: number;
  telegramId: string;
}

// Optional auth — attaches citizenId if valid token present, does not block
export function optionalCitizenAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const payload = jwt.verify(token, ENV.JWT_CITIZEN_SECRET) as CitizenPayload;
      (req as Request & { citizenId?: number }).citizenId = payload.citizenId;
    } catch {
      // invalid token — just ignore
    }
  }
  next();
}

// Required auth — 401 if no valid token
export function requireCitizenAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ status: 'error', message: 'Tizimga kirishingiz kerak' });
    return;
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, ENV.JWT_CITIZEN_SECRET) as CitizenPayload;
    (req as Request & { citizenId?: number }).citizenId = payload.citizenId;
    next();
  } catch {
    res.status(401).json({ status: 'error', message: 'Token muddati o\'tgan yoki noto\'g\'ri' });
  }
}
