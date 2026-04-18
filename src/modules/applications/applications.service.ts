import { eq, inArray, and, count, ilike } from 'drizzle-orm';
import { db } from '../../db/db';
import {
  applications,
  applicationHistory,
  geographicObjects,
  commissionApprovals,
  geoObjectFlags,
} from '../../db/schema';
import { REQUIRED_POSITIONS } from '../commission/commission.service';
import { createDiscussion } from '../public/public.service';
import { AppError } from '../../utils/appError';
import { resolveTransition, getAvailableActions } from './workflow';
import { APP_STATUS } from '../../constants/app-status';
import type { JwtPayload } from '../auth/auth.service';
import type { PerformActionInput } from './applications.schema';

// Status for each role
const ROLE_STATUSES: Record<string, string[]> = {
  dkp_filial:          [APP_STATUS.STEP_1_GEOMETRY_UPLOADED],
  dkp_regional:        [APP_STATUS.STEP_1_1_DKP_REGIONAL],
  dkp_central:         [APP_STATUS.STEP_1_2_DKP_COORDINATION, APP_STATUS.STEP_5_DKP_CENTRAL],
  district_hokimlik:   [
    APP_STATUS.STEP_2_DISTRICT_HOKIMLIK,
    APP_STATUS.STEP_2_PUBLIC_DISCUSSION,
    APP_STATUS.STEP_2_1_DISTRICT_COMMISSION,
    APP_STATUS.STEP_8_DISTRICT_HOKIMLIK,
  ],
  district_commission: [APP_STATUS.STEP_2_1_DISTRICT_COMMISSION],
  regional_commission: [APP_STATUS.STEP_2_2_REGIONAL_COMMISSION],
  regional_hokimlik:   [APP_STATUS.STEP_3_REGIONAL_HOKIMLIK, APP_STATUS.STEP_7_REGIONAL_HOKIMLIK],
  kadastr_agency:      [APP_STATUS.STEP_4_KADASTR_AGENCY, APP_STATUS.STEP_6_KADASTR_AGENCY_FINAL],
};

const GEO_WITH = {
  with: {
    region: true,
    district: true,
    objectType: { with: { category: true } },
  },
} as const;

export async function getApplications(
  user: JwtPayload,
  query: {
    page: number;
    limit: number;
    status?: string;
    tab?: string;
    applicationNumber?: string;
    regionId?: number;
    districtId?: number;
  },
) {
  const { page, limit, status, tab, applicationNumber, regionId, districtId } = query;
  const offset = (page - 1) * limit;

  if (tab === 'history' && user.role !== 'admin') {
    return getHistoricalApplications(user, { page, limit, offset, applicationNumber, districtId });
  }

  // Build geo-level filter (districtId / regionId) via subquery
  const isDistrictRole = ['dkp_filial', 'district_commission', 'district_hokimlik'].includes(user.role);
  const isRegionalRole = ['dkp_regional', 'regional_commission', 'regional_hokimlik'].includes(user.role);

  const effectiveDistrictId = isDistrictRole ? (user.districtId ?? undefined) : districtId;
  const effectiveRegionId   = isRegionalRole ? (user.regionId ?? undefined) : regionId;

  let geoSubquery: ReturnType<typeof inArray> | undefined;
  if (effectiveDistrictId || effectiveRegionId) {
    const geoConditions = [];
    if (effectiveDistrictId) geoConditions.push(eq(geographicObjects.districtId, effectiveDistrictId));
    if (effectiveRegionId)   geoConditions.push(eq(geographicObjects.regionId, effectiveRegionId));

    const matchingAppIds = (
      await db
        .select({ id: geographicObjects.applicationId })
        .from(geographicObjects)
        .where(and(...geoConditions))
    ).map((g) => g.id).filter((id): id is number => id !== null);

    if (matchingAppIds.length === 0) {
      return { data: [], meta: { total: 0, page, limit, totalPages: 0 } };
    }
    geoSubquery = inArray(applications.id, matchingAppIds);
  }

  if (user.role === 'admin') {
    const conditions = [];
    if (status)            conditions.push(eq(applications.currentStatus, status as any));
    if (applicationNumber) conditions.push(ilike(applications.applicationNumber, `%${applicationNumber}%`));
    if (geoSubquery)       conditions.push(geoSubquery);
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [data, [{ total }]] = await Promise.all([
      db.query.applications.findMany({
        where,
        with: {
          geographicObjects: GEO_WITH,
          creator: { columns: { id: true, username: true, fullName: true } },
        },
        limit,
        offset,
        orderBy: (a, { desc }) => desc(a.updatedAt),
      }),
      db.select({ total: count() }).from(applications).where(where),
    ]);
    return {
      data,
      meta: { total: Number(total), page, limit, totalPages: Math.ceil(Number(total) / limit) },
    };
  }

  const allowedStatuses = ROLE_STATUSES[user.role] ?? [];
  if (allowedStatuses.length === 0) {
    return { data: [], meta: { total: 0, page, limit, totalPages: 0 } };
  }

  const statusFilter = status && allowedStatuses.includes(status) ? [status] : allowedStatuses;

  const conditions = [inArray(applications.currentStatus, statusFilter as any[])];
  if (applicationNumber) conditions.push(ilike(applications.applicationNumber, `%${applicationNumber}%`));
  if (geoSubquery)       conditions.push(geoSubquery);
  const where = and(...conditions);

  const [data, [{ total }]] = await Promise.all([
    db.query.applications.findMany({
      where,
      with: {
        geographicObjects: GEO_WITH,
        creator: { columns: { id: true, username: true, fullName: true } },
      },
      limit,
      offset,
      orderBy: (a, { desc }) => desc(a.updatedAt),
    }),
    db.select({ total: count() }).from(applications).where(where),
  ]);

  return {
    data,
    meta: { total: Number(total), page, limit, totalPages: Math.ceil(Number(total) / limit) },
  };
}

async function getHistoricalApplications(
  user: JwtPayload,
  {
    page, limit, offset,
    applicationNumber,
    districtId,
  }: {
    page: number;
    limit: number;
    offset: number;
    applicationNumber?: string;
    districtId?: number;
  },
) {
  const activeStatuses = ROLE_STATUSES[user.role] ?? [];

  const isDistrictRole = ['dkp_filial', 'district_commission', 'district_hokimlik'].includes(user.role);
  const isRegionalRole = ['dkp_regional', 'regional_commission', 'regional_hokimlik'].includes(user.role);

  const effectiveDistrictId = isDistrictRole ? (user.districtId ?? undefined) : districtId;
  const effectiveRegionId   = isRegionalRole ? (user.regionId ?? undefined)   : undefined;

  // Get application IDs that passed through this role's statuses
  const historyConditions: ReturnType<typeof eq>[] = [
    inArray(applicationHistory.fromStatus, activeStatuses as any[]) as any,
  ];
  const appIdsFromHistory = (
    await db
      .selectDistinct({ id: applicationHistory.applicationId })
      .from(applicationHistory)
      .where(and(...historyConditions))
  ).map((h) => h.id);

  if (appIdsFromHistory.length === 0) {
    return { data: [], meta: { total: 0, page, limit, totalPages: 0 } };
  }

  // Build conditions on applications table
  const conditions = [
    inArray(applications.id, appIdsFromHistory),
    // Exclude currently active (still at this role's step)
    ...(activeStatuses.length > 0
      ? [inArray(applications.currentStatus, activeStatuses as any[])]
      : []),
  ];

  // We want apps NOT in active statuses — negate by fetching separately
  // Simpler: fetch apps by id and filter out active ones in a targeted way
  const appConditions = [inArray(applications.id, appIdsFromHistory)];
  if (applicationNumber) appConditions.push(ilike(applications.applicationNumber, `%${applicationNumber}%`));

  // Geo filter
  if (effectiveDistrictId || effectiveRegionId) {
    const geoConditions = [];
    if (effectiveDistrictId) geoConditions.push(eq(geographicObjects.districtId, effectiveDistrictId));
    if (effectiveRegionId)   geoConditions.push(eq(geographicObjects.regionId, effectiveRegionId));

    const matchingAppIds = (
      await db
        .select({ id: geographicObjects.applicationId })
        .from(geographicObjects)
        .where(and(...geoConditions))
    ).map((g) => g.id).filter((id): id is number => id !== null);

    if (matchingAppIds.length === 0) {
      return { data: [], meta: { total: 0, page, limit, totalPages: 0 } };
    }
    appConditions.push(inArray(applications.id, matchingAppIds));
  }

  const allApps = await db.query.applications.findMany({
    where: and(...appConditions),
    with: {
      geographicObjects: GEO_WITH,
      creator: { columns: { id: true, username: true, fullName: true } },
    },
    orderBy: (a, { desc }) => desc(a.updatedAt),
  });

  // Exclude apps still active at this role's step
  const filtered = allApps.filter((app) => !activeStatuses.includes(app.currentStatus));

  const total = filtered.length;
  const data = filtered.slice(offset, offset + limit);
  return {
    data,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}

export async function getApplicationById(id: number) {
  const app = await db.query.applications.findFirst({
    where: eq(applications.id, id),
    with: {
      geographicObjects: {
        with: {
          region: true,
          district: true,
          objectType: { with: { category: true } },
        },
      },
      creator: {
        columns: { id: true, username: true, fullName: true, role: true },
      },
      history: {
        with: {
          performer: {
            columns: { id: true, username: true, fullName: true, role: true },
          },
        },
        orderBy: (h, { asc }) => asc(h.createdAt),
      },
    },
  });

  if (!app) throw new AppError('Ariza topilmadi', 404);
  return app;
}

export async function performAction(
  id: number,
  input: PerformActionInput,
  user: JwtPayload,
) {
  const app = await db.query.applications.findFirst({
    where: eq(applications.id, id),
    with: { geographicObjects: true },
  });

  if (!app) throw new AppError('Ariza topilmadi', 404);

  if (app.currentStatus === APP_STATUS.COMPLETED || app.currentStatus === APP_STATUS.REJECTED) {
    throw new AppError('Bu ariza allaqachon yakunlangan', 400);
  }

  let transition;
  try {
    transition = resolveTransition(app.currentStatus, input.action, user.role);
  } catch (err: any) {
    throw new AppError(err.message, 403);
  }

  if (app.currentStatus === APP_STATUS.STEP_2_1_DISTRICT_COMMISSION) {
    const approvals = await db.query.commissionApprovals.findMany({
      where: eq(commissionApprovals.applicationId, id),
      columns: { position: true, approved: true },
    });

    if (input.action === 'submit') {
      const notAllApproved = REQUIRED_POSITIONS.some(
        (p) => !approvals.find((a) => a.position === p && a.approved),
      );
      if (notAllApproved) {
        throw new AppError(
          "Tuman komissiyasi barcha a'zolari hali kelishmagan",
          400,
        );
      }
    }

    if (input.action === 'reject') {
      const hasRejection = approvals.some((a) => !a.approved);
      if (!hasRejection) {
        throw new AppError(
          "Hech bir komissiya a'zosi rad etmagan — rad qilish mumkin emas",
          400,
        );
      }
    }
  }

  const geo = app.geographicObjects?.[0];
  if (!geo) throw new AppError('Arizada geografik obyekt topilmadi', 400);

  const isDistrictRole = [
    'dkp_filial',
    'district_commission',
    'district_hokimlik',
  ].includes(user.role);
  const isRegionalRole = [
    'dkp_regional',
    'regional_commission',
    'regional_hokimlik',
  ].includes(user.role);

  if (isDistrictRole && user.districtId && geo.districtId !== user.districtId) {
    throw new AppError('Bu ariza sizning tumaningizga tegishli emas', 403);
  }
  if (isRegionalRole && user.regionId && geo.regionId !== user.regionId) {
    throw new AppError('Bu ariza sizning viloyatingizga tegishli emas', 403);
  }

  const fromStatus = app.currentStatus;
  const toStatus = transition.nextStatus;

  await db.transaction(async (tx) => {
    await tx
      .update(applications)
      .set({ currentStatus: toStatus as any, updatedAt: new Date() })
      .where(eq(applications.id, id));

    await tx.insert(applicationHistory).values({
      applicationId: id,
      fromStatus: fromStatus as any,
      toStatus: toStatus as any,
      actionType: transition.actionType as any,
      performedBy: user.userId,
      comment: input.comment,
      attachments: input.attachments ?? [],
    });
  });

  // When moving to the first step of the public discussion, create a public discussion
  if (toStatus === APP_STATUS.STEP_2_PUBLIC_DISCUSSION) {
    await createDiscussion(id);
  }

  // Finished: add new objects to registry automatically
  if (toStatus === APP_STATUS.COMPLETED) {
    const flags = await db.query.geoObjectFlags.findMany({
      where: eq(geoObjectFlags.applicationId, id),
      columns: { geoObjectId: true },
    });
    const flaggedIds = new Set(flags.map((f) => f.geoObjectId));

    const newObjects = app.geographicObjects.filter(
      (o) => o.existsInRegistry === false && !flaggedIds.has(o.id),
    );

    if (newObjects.length > 0) {
      await db
        .update(geographicObjects)
        .set({ existsInRegistry: true, updatedAt: new Date() })
        .where(
          inArray(
            geographicObjects.id,
            newObjects.map((o) => o.id),
          ),
        );
    }
  }

  return getApplicationById(id);
}

export function getAvailableActionsForUser(status: string, userRole: string) {
  const transitions = getAvailableActions(status);

  return Object.entries(transitions)
    .filter(([, t]) => t.allowedRole === userRole)
    .map(([action, t]) => ({
      action,
      label: t.label,
      nextStatus: t.nextStatus,
    }));
}
