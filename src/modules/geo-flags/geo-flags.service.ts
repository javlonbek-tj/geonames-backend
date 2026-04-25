import { eq, and, ilike, or, desc, count, SQL } from 'drizzle-orm';
import { db } from '../../db/db';
import {
  geoObjectFlags,
  geographicObjects,
  applications,
  users,
  objectTypes,
  regions,
  districts,
} from '../../db/schema';

export async function toggleFlag(
  applicationId: number,
  geoObjectId: number,
  userId: number,
  comment?: string,
): Promise<{ flagged: boolean }> {
  const existing = await db.query.geoObjectFlags.findFirst({
    where: and(
      eq(geoObjectFlags.applicationId, applicationId),
      eq(geoObjectFlags.geoObjectId, geoObjectId),
    ),
  });

  if (existing) {
    await db.delete(geoObjectFlags).where(eq(geoObjectFlags.id, existing.id));
    return { flagged: false };
  }

  await db.insert(geoObjectFlags).values({
    applicationId,
    geoObjectId,
    markedBy: userId,
    comment: comment?.trim() || null,
  });
  return { flagged: true };
}

export async function getApplicationFlags(applicationId: number) {
  return db.query.geoObjectFlags.findMany({
    where: eq(geoObjectFlags.applicationId, applicationId),
    columns: { geoObjectId: true, comment: true, createdAt: true },
  });
}

export async function listNonCompliant(filters: {
  regionId?: number;
  districtId?: number;
  search?: string;
  page?: number;
  limit?: number;
} = {}) {
  const page = filters.page ?? 1;
  const limit = Math.min(filters.limit ?? 20, 100);
  const offset = (page - 1) * limit;
  const conditions: SQL[] = [];

  if (filters.districtId) {
    conditions.push(eq(geographicObjects.districtId, filters.districtId));
  } else if (filters.regionId) {
    conditions.push(eq(geographicObjects.regionId, filters.regionId));
  }

  if (filters.search) {
    const q = `%${filters.search}%`;
    conditions.push(
      or(
        ilike(geographicObjects.nameUz, q),
        ilike(applications.applicationNumber, q),
      )!,
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const baseQuery = db
    .select({
      id: geoObjectFlags.id,
      applicationId: geoObjectFlags.applicationId,
      applicationNumber: applications.applicationNumber,
      geoObjectId: geoObjectFlags.geoObjectId,
      nameUz: geographicObjects.nameUz,
      objectType: objectTypes.nameUz,
      regionName: regions.nameUz,
      districtName: districts.nameUz,
      comment: geoObjectFlags.comment,
      markedBy: users.fullName,
      markedByUsername: users.username,
      createdAt: geoObjectFlags.createdAt,
    })
    .from(geoObjectFlags)
    .leftJoin(geographicObjects, eq(geoObjectFlags.geoObjectId, geographicObjects.id))
    .leftJoin(objectTypes, eq(geographicObjects.objectTypeId, objectTypes.id))
    .leftJoin(regions, eq(geographicObjects.regionId, regions.id))
    .leftJoin(districts, eq(geographicObjects.districtId, districts.id))
    .leftJoin(applications, eq(geoObjectFlags.applicationId, applications.id))
    .leftJoin(users, eq(geoObjectFlags.markedBy, users.id));

  const [rows, [{ total }]] = await Promise.all([
    baseQuery.where(where).orderBy(desc(geoObjectFlags.createdAt)).limit(limit).offset(offset),
    db.select({ total: count() }).from(geoObjectFlags)
      .leftJoin(geographicObjects, eq(geoObjectFlags.geoObjectId, geographicObjects.id))
      .leftJoin(applications, eq(geoObjectFlags.applicationId, applications.id))
      .where(where),
  ]);

  return {
    data: rows.map((f) => ({
      id: f.id,
      applicationId: f.applicationId,
      applicationNumber: f.applicationNumber ?? '—',
      geoObjectId: f.geoObjectId,
      nameUz: f.nameUz ?? '—',
      objectType: f.objectType ?? '—',
      regionName: f.regionName ?? null,
      districtName: f.districtName ?? null,
      comment: f.comment,
      markedBy: f.markedBy ?? f.markedByUsername ?? '—',
      createdAt: f.createdAt.toISOString(),
    })),
    meta: { total: Number(total), page, limit, totalPages: Math.ceil(Number(total) / limit) },
  };
}
