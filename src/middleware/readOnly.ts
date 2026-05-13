import { Request, Response, NextFunction } from 'express';

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function readOnly(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role === 'superuser' && MUTATION_METHODS.has(req.method)) {
    res.status(403).json({
      status: 'fail',
      message: 'Sizga ushbu amalni bajarishga ruxsat berilmaydi',
    });
    return;
  }
  next();
}
