import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core';

export const citizens = pgTable('citizens', {
  id: serial('id').primaryKey(),
  telegramId: varchar('telegram_id', { length: 50 }).notNull().unique(),
  phone: varchar('phone', { length: 20 }),
  fullName: varchar('full_name', { length: 200 }),
  username: varchar('username', { length: 100 }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// OTP codes, sent by telegram
export const citizenOtps = pgTable('citizen_otps', {
  id: serial('id').primaryKey(),
  sessionId: text('session_id').notNull().unique(),
  telegramId: varchar('telegram_id', { length: 50 }).unique(),
  phone: varchar('phone', { length: 20 }),
  code: varchar('code', { length: 6 }).notNull(),
  used: boolean('used').default(false).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
