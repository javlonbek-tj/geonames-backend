import {
  pgTable,
  serial,
  integer,
  timestamp,
  unique,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { applications } from './applications';
import { citizens } from './citizens';
import { geographicObjects } from './geographic-objects';

export const voteTypeEnum = pgEnum('vote_type', ['support', 'oppose']);

export const publicDiscussions = pgTable(
  'public_discussions',
  {
    id: serial('id').primaryKey(),
    applicationId: integer('application_id')
      .references(() => applications.id, { onDelete: 'cascade' })
      .notNull(),
    geoObjectId: integer('geo_object_id')
      .references(() => geographicObjects.id, { onDelete: 'cascade' })
      .notNull(),
    endsAt: timestamp('ends_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [
    unique('uq_discussion_geo_object').on(t.applicationId, t.geoObjectId),
  ],
);

export const publicVotes = pgTable(
  'public_votes',
  {
    id: serial('id').primaryKey(),
    discussionId: integer('discussion_id')
      .references(() => publicDiscussions.id, { onDelete: 'cascade' })
      .notNull(),
    citizenId: integer('citizen_id')
      .references(() => citizens.id)
      .notNull(),
    vote: voteTypeEnum('vote').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [unique('uq_discussion_citizen_vote').on(t.discussionId, t.citizenId)],
);
