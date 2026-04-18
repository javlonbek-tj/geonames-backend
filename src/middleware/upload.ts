import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { AppError } from '../utils/appError';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const storage = multer.diskStorage({
  destination(_req: Request, _file, cb) {
    const applicationId = Array.isArray(_req.params.applicationId)
      ? _req.params.applicationId[0]
      : _req.params.applicationId;
    const dir = path.join(process.cwd(), 'uploads', 'applications', applicationId);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },

  filename(_req, file, cb) {
    const ext = path.extname(file.originalname);
    const timestamp = Date.now();
    const safeName = file.originalname
      .replace(ext, '')
      .replace(/[^a-zA-Z0-9_\-]/g, '_')
      .slice(0, 50);
    cb(null, `${timestamp}-${safeName}${ext}`);
  },
});

const ALLOWED_EXTS = new Set(['.geojson', '.json', '.pdf', '.png', '.jpg', '.jpeg']);

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXTS.has(ext)) {
    cb(null, true);
  } else {
    cb(new AppError('Faqat GeoJSON, PDF, PNG, JPG fayllari qabul qilinadi', 400));
  }
}

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});
