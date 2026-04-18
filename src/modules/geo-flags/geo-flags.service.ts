import { eq, and } from 'drizzle-orm';
import { db } from '../../db/db';
import { geoObjectFlags } from '../../db/schema';

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

export async function listNonCompliant() {
  const rows = await db.query.geoObjectFlags.findMany({
    with: {
      geoObject: {
        with: {
          region: true,
          district: true,
          objectType: true,
        },
      },
      application: {
        columns: { id: true, applicationNumber: true, currentStatus: true },
      },
      marker: {
        columns: { id: true, fullName: true, username: true },
      },
    },
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  });

  return rows.map((f) => ({
    id: f.id,
    applicationId: f.applicationId,
    applicationNumber: f.application?.applicationNumber ?? '—',
    geoObjectId: f.geoObjectId,
    nameUz: f.geoObject?.nameUz ?? '—',
    objectType: f.geoObject?.objectType?.nameUz ?? '—',
    regionName: f.geoObject?.region?.nameUz ?? null,
    districtName: f.geoObject?.district?.nameUz ?? null,
    comment: f.comment,
    markedBy: f.marker?.fullName ?? f.marker?.username ?? '—',
    createdAt: f.createdAt.toISOString(),
  }));
}
