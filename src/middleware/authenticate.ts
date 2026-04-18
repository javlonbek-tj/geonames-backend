import { Request, Response, NextFunction } from 'express';
import { eq } from 'drizzle-orm';
import { verifyAccessToken, JwtPayload } from '../modules/auth/auth.service';
import { db } from '../db/db';
import { users } from '../db/schema';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res
      .status(401)
      .json({ status: 'fail', message: 'Autentifikatsiya talab qilinadi' });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const decoded = verifyAccessToken(token);

    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.userId));

    if (!currentUser) {
      res
        .status(401)
        .json({ status: 'fail', message: 'Foydalanuvchi topilmadi' });
      return;
    }

    if (!currentUser.isActive) {
      res.status(401).json({ status: 'fail', message: "Hisob o'chirilgan" });
      return;
    }

    if (currentUser.isBlocked) {
      res
        .status(403)
        .json({
          status: 'fail',
          message: "Hisobingiz bloklangan. Administrator bilan bog'laning",
        });
      return;
    }

    if (
      currentUser.passwordChangedAt &&
      decoded.iat != null &&
      decoded.iat < currentUser.passwordChangedAt.getTime() / 1000
    ) {
      res
        .status(401)
        .json({ status: 'fail', message: 'Token eskirgan. Qayta kiring' });
      return;
    }

    req.user = {
      userId: currentUser.id,
      username: currentUser.username,
      role: currentUser.role,
      position: currentUser.position ?? null,
      regionId: currentUser.regionId,
      districtId: currentUser.districtId,
    };

    next();
  } catch {
    res
      .status(401)
      .json({ status: 'fail', message: 'Token yaroqsiz yoki muddati tugagan' });
  }
}
