import { pgTable, serial, integer, text, timestamp, unique } from 'drizzle-orm/pg-core';
import { applications } from './applications';
import { geographicObjects } from './geographic-objects';
import { users } from './users';

export const geoObjectFlags = pgTable('geo_object_flags', {
  id: serial('id').primaryKey(),
  applicationId: integer('application_id')
    .references(() => applications.id, { onDelete: 'cascade' })
    .notNull(),
  geoObjectId: integer('geo_object_id')
    .references(() => geographicObjects.id, { onDelete: 'cascade' })
    .notNull(),
  markedBy: integer('marked_by')
    .references(() => users.id)
    .notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  unique('uq_geo_flag').on(t.applicationId, t.geoObjectId),
]);
