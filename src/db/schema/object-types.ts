import {
  pgTable,
  serial,
  varchar,
  integer,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core';

export const objectCategories = pgTable('object_categories', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 20 }).unique(),
  nameUz: varchar('name_uz', { length: 200 }).notNull(),
  nameKrill: varchar('name_krill', { length: 200 }),
  isActive: boolean('is_active').default(true).notNull(),
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
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
