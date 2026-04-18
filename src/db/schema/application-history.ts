import {
  pgTable,
  serial,
  integer,
  text,
  jsonb,
  timestamp,
} from 'drizzle-orm/pg-core';
import { applicationStatusEnum, actionTypeEnum } from './enums';
import { applications } from './applications';
import { users } from './users';

export const applicationHistory = pgTable('application_history', {
  id: serial('id').primaryKey(),

  applicationId: integer('application_id')
    .references(() => applications.id, { onDelete: 'cascade' })
    .notNull(),

  fromStatus: applicationStatusEnum('from_status'),
  toStatus: applicationStatusEnum('to_status').notNull(),

  actionType: actionTypeEnum('action_type').notNull(),

  performedBy: integer('performed_by')
    .references(() => users.id)
    .notNull(),

  comment: text('comment'),

  attachments: jsonb('attachments').$type<string[]>(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});
