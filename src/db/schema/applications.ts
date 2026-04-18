import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core';
import { applicationStatusEnum } from './enums';
import { users } from './users';

export const applications = pgTable('applications', {
  id: serial('id').primaryKey(),

  applicationNumber: varchar('application_number', { length: 50 })
    .notNull()
    .unique(),

  currentStatus: applicationStatusEnum('current_status')
    .notNull()
    .default('step_1_geometry_uploaded'),

  currentHandlerId: integer('current_handler_id').references(() => users.id),

  createdBy: integer('created_by')
    .references(() => users.id)
    .notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
