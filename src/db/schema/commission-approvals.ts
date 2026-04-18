import {
  pgTable,
  serial,
  integer,
  timestamp,
  unique,
  boolean,
  text,
} from 'drizzle-orm/pg-core';
import { commissionPositionEnum } from './enums';
import { applications } from './applications';
import { users } from './users';

export const commissionApprovals = pgTable(
  'commission_approvals',
  {
    id: serial('id').primaryKey(),
    applicationId: integer('application_id')
      .references(() => applications.id, { onDelete: 'cascade' })
      .notNull(),
    userId: integer('user_id')
      .references(() => users.id)
      .notNull(),
    position: commissionPositionEnum('position').notNull(),
    approved: boolean('approved').notNull().default(true),
    comment: text('comment'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [unique('uq_commission_approval').on(t.applicationId, t.position)],
);
