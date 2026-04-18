import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core';

export const objectCategories = pgTable('object_categories', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 20 }).unique(),
  nameUz: varchar('name_uz', { length: 200 }).notNull(),
  nameKrill: varchar('name_krill', { length: 200 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const objectTypes = pgTable('object_types', {
  id: serial('id').primaryKey(),
  nameUz: varchar('name_uz', { length: 200 }).notNull(),
  nameKrill: varchar('name_krill', { length: 200 }),
  categoryId: integer('category_id')
    .references(() => objectCategories.id)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
