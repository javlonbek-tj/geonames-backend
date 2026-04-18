import { Request, Response } from 'express';
import * as service from './uploads.service';
import { AppError } from '../../utils/appError';

export async function uploadDocument(req: Request, res: Response) {
  if (!req.file) {
    throw new AppError('Fayl yuklanmadi', 400);
  }

  const applicationId = Number(req.params.applicationId);
  if (isNaN(applicationId)) {
    throw new AppError("Noto'g'ri ariza ID", 400);
  }

  const ext = req.file.originalname.split('.').pop()?.toLowerCase() ?? '';
  const documentType =
    ext === 'geojson' || ext === 'json' ? 'geometry_file' : 'attachment';

  const doc = await service.saveDocument(
    applicationId,
    req.file,
    documentType,
    req.user!,
  );

  res.status(201).json({
    status: 'success',
    data: doc,
    filePath: doc.filePath,
  });
}

export async function getDocuments(req: Request, res: Response) {
  const applicationId = Number(req.params.applicationId);
  const data = await service.getDocuments(applicationId);
  res.status(200).json({ status: 'success', data });
}

export async function deleteDocument(req: Request, res: Response) {
  await service.deleteDocument(Number(req.params.documentId), req.user!);
  res.status(204).send();
}
