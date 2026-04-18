import { eq } from 'drizzle-orm';
import { db } from '../../db/db';
import { districts } from '../../db/schema';

export async function getRegions() {
  return db.query.regions.findMany({
    orderBy: (r, { asc }) => asc(r.nameUz),
  });
}

export async function getDistricts(regionId?: number) {
  return db.query.districts.findMany({
    where: regionId ? eq(districts.regionId, regionId) : undefined,
    orderBy: (d, { asc }) => asc(d.nameUz),
  });
}
