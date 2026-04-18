import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { filterXSS } from 'xss';
import { ENV } from './config';
import { globalErrorHandler } from './middleware';
import authRoutes from './modules/auth/auth.routes';
import adminRoutes from './modules/admin/admin.routes';
import locationsRoutes from './modules/locations/locations.routes';
import geographicObjectsRoutes from './modules/geographic-objects/geographic-objects.routes';
import applicationsRoutes from './modules/applications/applications.routes';
import uploadsRoutes from './modules/uploads/uploads.routes';
import commissionRoutes from './modules/commission/commission.routes';
import publicRoutes from './modules/public/public.routes';
import geoFlagsRoutes from './modules/geo-flags/geo-flags.routes';
import mapRoutes from './modules/map/map.routes';

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: [ENV.FRONTEND_URL, ENV.PUBLIC_FRONTEND_URL],
    credentials: true,
  }),
);

const globalLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Juda ko'p so'rov, 5 daqiqadan keyin urinib ko'ring" },
});

const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Juda ko'p urinish, 5 daqiqadan keyin urinib ko'ring" },
});

app.use(globalLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// XSS sanitize string fields in request body
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    const sanitize = (
      obj: Record<string, unknown>,
    ): Record<string, unknown> => {
      for (const key of Object.keys(obj)) {
        if (typeof obj[key] === 'string') {
          obj[key] = filterXSS(obj[key] as string);
        } else if (obj[key] && typeof obj[key] === 'object') {
          sanitize(obj[key] as Record<string, unknown>);
        }
      }
      return obj;
    };
    sanitize(req.body as Record<string, unknown>);
  }
  next();
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api/geographic-objects', geographicObjectsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api/commission', commissionRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/geo-flags', geoFlagsRoutes);
app.use('/api/map', mapRoutes);

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use(globalErrorHandler);

export default app;
