import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core';

export const regions = pgTable('regions', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 10 }).notNull().unique(),
  nameUz: varchar('name_uz', { length: 100 }).notNull(),
  nameKrill: varchar('name_krill', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
