import path from 'path';
import fs from 'fs';
import { eq } from 'drizzle-orm';
import { db } from '../../db/db';
import { documents, applications } from '../../db/schema';
import { AppError } from '../../utils/appError';
import type { JwtPayload } from '../auth/auth.service';

type DocumentType = 'geometry_file' | 'attachment';

export async function saveDocument(
  applicationId: number,
  file: Express.Multer.File,
  documentType: DocumentType,
  user: JwtPayload,
) {
  const app = await db.query.applications.findFirst({
    where: eq(applications.id, applicationId),
  });

  if (!app) {
    fs.unlinkSync(file.path);
    throw new AppError('Ariza topilmadi', 404);
  }

  const relativePath = `/uploads/applications/${applicationId}/${file.filename}`;

  const [doc] = await db
    .insert(documents)
    .values({
      applicationId,
      documentType,
      originalName: file.originalname,
      filePath: relativePath,
      mimeType: file.mimetype,
      fileSize: file.size,
      uploadedBy: user.userId,
    })
    .returning();

  return doc;
}

export async function getDocuments(applicationId: number) {
  return db.query.documents.findMany({
    where: eq(documents.applicationId, applicationId),
    with: {
      uploader: { columns: { id: true, username: true, fullName: true } },
    },
    orderBy: (d, { desc }) => desc(d.createdAt),
  });
}

export async function deleteDocument(documentId: number, user: JwtPayload) {
  const doc = await db.query.documents.findFirst({
    where: eq(documents.id, documentId),
  });
  if (!doc) throw new AppError('Hujjat topilmadi', 404);

  if (doc.uploadedBy !== user.userId && user.role !== 'admin') {
    throw new AppError(
      "Siz faqat o'zingiz yuklagan hujjatlarni o'chira olasiz",
      403,
    );
  }

  const absolutePath = path.join(process.cwd(), doc.filePath);
  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }

  await db.delete(documents).where(eq(documents.id, documentId));
}
