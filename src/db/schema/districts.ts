import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core';
import { regions } from './regions';

export const districts = pgTable('districts', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 10 }).notNull().unique(),
  nameUz: varchar('name_uz', { length: 100 }).notNull(),
  nameKrill: varchar('name_krill', { length: 100 }),
  regionId: integer('region_id')
    .references(() => regions.id)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
