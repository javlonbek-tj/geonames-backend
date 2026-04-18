import {
  pgTable,
  serial,
  integer,
  varchar,
  timestamp,
} from 'drizzle-orm/pg-core';
import { documentTypeEnum } from './enums';
import { applications } from './applications';
import { users } from './users';

export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),

  applicationId: integer('application_id')
    .references(() => applications.id, { onDelete: 'cascade' })
    .notNull(),

  documentType: documentTypeEnum('document_type').notNull(),

  originalName: varchar('original_name', { length: 255 }).notNull(),
  filePath: varchar('file_path', { length: 500 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }),
  fileSize: integer('file_size'),

  uploadedBy: integer('uploaded_by')
    .references(() => users.id)
    .notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});
