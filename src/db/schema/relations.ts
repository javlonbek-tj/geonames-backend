import { relations } from 'drizzle-orm';
import { regions } from './regions';
import { districts } from './districts';
import { users, refreshTokens } from './users';
import { objectCategories, objectTypes } from './object-types';
import { geographicObjects } from './geographic-objects';
import { applications } from './applications';
import { applicationHistory } from './application-history';
import { documents } from './documents';
import { commissionApprovals } from './commission-approvals';
import { citizens, citizenOtps } from './citizens';
import { publicDiscussions, publicVotes } from './public-discussions';
import { geoObjectFlags } from './geo-object-flags';

export const objectCategoriesRelations = relations(
  objectCategories,
  ({ many }) => ({
    objectTypes: many(objectTypes),
  }),
);

export const objectTypesRelations = relations(objectTypes, ({ one, many }) => ({
  category: one(objectCategories, {
    fields: [objectTypes.categoryId],
    references: [objectCategories.id],
  }),
  geographicObjects: many(geographicObjects),
}));

export const regionsRelations = relations(regions, ({ many }) => ({
  districts: many(districts),
  users: many(users),
  geographicObjects: many(geographicObjects),
}));

export const districtsRelations = relations(districts, ({ one, many }) => ({
  region: one(regions, {
    fields: [districts.regionId],
    references: [regions.id],
  }),
  users: many(users),
  geographicObjects: many(geographicObjects),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  region: one(regions, {
    fields: [users.regionId],
    references: [regions.id],
  }),
  district: one(districts, {
    fields: [users.districtId],
    references: [districts.id],
  }),
  refreshTokens: many(refreshTokens),
  createdApplications: many(applications, { relationName: 'createdBy' }),
  handlingApplications: many(applications, { relationName: 'currentHandler' }),
  applicationHistories: many(applicationHistory),
  uploadedDocuments: many(documents),
  createdGeographicObjects: many(geographicObjects),
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));

export const geographicObjectsRelations = relations(
  geographicObjects,
  ({ one }) => ({
    application: one(applications, {
      fields: [geographicObjects.applicationId],
      references: [applications.id],
    }),
    objectType: one(objectTypes, {
      fields: [geographicObjects.objectTypeId],
      references: [objectTypes.id],
    }),
    region: one(regions, {
      fields: [geographicObjects.regionId],
      references: [regions.id],
    }),
    district: one(districts, {
      fields: [geographicObjects.districtId],
      references: [districts.id],
    }),
    creator: one(users, {
      fields: [geographicObjects.createdBy],
      references: [users.id],
    }),
  }),
);

export const applicationsRelations = relations(
  applications,
  ({ one, many }) => ({
    geographicObjects: many(geographicObjects),
    creator: one(users, {
      fields: [applications.createdBy],
      references: [users.id],
      relationName: 'createdBy',
    }),
    currentHandler: one(users, {
      fields: [applications.currentHandlerId],
      references: [users.id],
      relationName: 'currentHandler',
    }),
    history: many(applicationHistory),
    documents: many(documents),
    commissionApprovals: many(commissionApprovals),
    publicDiscussion: one(publicDiscussions, {
      fields: [applications.id],
      references: [publicDiscussions.applicationId],
    }),
  }),
);

export const applicationHistoryRelations = relations(
  applicationHistory,
  ({ one }) => ({
    application: one(applications, {
      fields: [applicationHistory.applicationId],
      references: [applications.id],
    }),
    performer: one(users, {
      fields: [applicationHistory.performedBy],
      references: [users.id],
    }),
  }),
);

export const commissionApprovalsRelations = relations(
  commissionApprovals,
  ({ one }) => ({
    application: one(applications, {
      fields: [commissionApprovals.applicationId],
      references: [applications.id],
    }),
    user: one(users, {
      fields: [commissionApprovals.userId],
      references: [users.id],
    }),
  }),
);

export const citizensRelations = relations(citizens, ({ many }) => ({
  otps: many(citizenOtps),
  votes: many(publicVotes),
}));

export const citizenOtpsRelations = relations(citizenOtps, () => ({}));

export const publicDiscussionsRelations = relations(
  publicDiscussions,
  ({ one, many }) => ({
    application: one(applications, {
      fields: [publicDiscussions.applicationId],
      references: [applications.id],
    }),
    geoObject: one(geographicObjects, {
      fields: [publicDiscussions.geoObjectId],
      references: [geographicObjects.id],
    }),
    votes: many(publicVotes),
  }),
);

export const publicVotesRelations = relations(publicVotes, ({ one }) => ({
  discussion: one(publicDiscussions, {
    fields: [publicVotes.discussionId],
    references: [publicDiscussions.id],
  }),
  citizen: one(citizens, {
    fields: [publicVotes.citizenId],
    references: [citizens.id],
  }),
}));

export const geoObjectFlagsRelations = relations(geoObjectFlags, ({ one }) => ({
  geoObject: one(geographicObjects, {
    fields: [geoObjectFlags.geoObjectId],
    references: [geographicObjects.id],
  }),
  application: one(applications, {
    fields: [geoObjectFlags.applicationId],
    references: [applications.id],
  }),
  marker: one(users, {
    fields: [geoObjectFlags.markedBy],
    references: [users.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  application: one(applications, {
    fields: [documents.applicationId],
    references: [applications.id],
  }),
  uploader: one(users, {
    fields: [documents.uploadedBy],
    references: [users.id],
  }),
}));
