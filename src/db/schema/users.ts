import {
  pgTable,
  serial,
  varchar,
  integer,
  boolean,
  timestamp,
  text,
} from 'drizzle-orm/pg-core';
import { userRoleEnum, commissionPositionEnum } from './enums';
import { regions } from './regions';
import { districts } from './districts';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  fullName: varchar('full_name', { length: 200 }),
  role: userRoleEnum('role').notNull(),
  position: commissionPositionEnum('position'),
  regionId: integer('region_id').references(() => regions.id),
  districtId: integer('district_id').references(() => districts.id),
  isActive: boolean('is_active').default(true).notNull(),
  isBlocked: boolean('is_blocked').default(false).notNull(),
  passwordChangedAt: timestamp('password_changed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const refreshTokens = pgTable('refresh_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
