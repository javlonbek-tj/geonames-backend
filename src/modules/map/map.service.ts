import { eq, and, isNotNull, inArray } from 'drizzle-orm';
import { db } from '../../db/db';
import { geographicObjects, regions, districts } from '../../db/schema';

export interface RegistryObjectsParams {
  typeIds: number[];
  regionId?: number;
  districtId?: number;
}

export const MFY_TYPE_NAMES = ['Mahalla'] as const;
export const STREET_TYPE_NAMES = [
  "Ko'cha",
  "Tor ko'cha",
  "Berk ko'cha",
  "Shoh ko'cha",
] as const;

const isMfyType = (name: string | null | undefined) =>
  MFY_TYPE_NAMES.includes(name as never);
const isStreetType = (name: string | null | undefined) =>
  (STREET_TYPE_NAMES as readonly string[]).includes(name ?? '');

export async function getRegionGeometries() {
  const rows = await db
    .select({
      id: geographicObjects.id,
      nameUz: geographicObjects.nameUz,
      soato: geographicObjects.soato,
      regionId: geographicObjects.regionId,
      districtId: geographicObjects.districtId,
      geometry: geographicObjects.geometry,
      regionDbId: regions.id,
      regionName: regions.nameUz,
    })
    .from(geographicObjects)
    .innerJoin(regions, eq(geographicObjects.soato, regions.code))
    .where(isNotNull(geographicObjects.geometry));

  return {
    type: 'FeatureCollection' as const,
    features: rows.map((r) => ({
      type: 'Feature' as const,
      geometry: r.geometry,
      properties: {
        id: r.id,
        nameUz: r.regionName ?? r.nameUz,
        soato: r.soato,
        regionId: r.regionId,
        districtId: r.districtId,
        regionDbId: r.regionDbId,
      },
    })),
  };
}

export async function getDistrictGeometries(regionId: number) {
  const rows = await db
    .select({
      id: geographicObjects.id,
      nameUz: geographicObjects.nameUz,
      soato: geographicObjects.soato,
      regionId: geographicObjects.regionId,
      districtId: geographicObjects.districtId,
      geometry: geographicObjects.geometry,
      districtDbId: districts.id,
      districtName: districts.nameUz,
    })
    .from(geographicObjects)
    .innerJoin(
      districts,
      and(
        eq(geographicObjects.soato, districts.code),
        eq(districts.regionId, regionId),
      ),
    )
    .where(
      and(
        isNotNull(geographicObjects.geometry),
        eq(geographicObjects.regionId, regionId),
      ),
    );

  return {
    type: 'FeatureCollection' as const,
    features: rows.map((r) => ({
      type: 'Feature' as const,
      geometry: r.geometry,
      properties: {
        id: r.id,
        nameUz: r.districtName ?? r.nameUz,
        soato: r.soato,
        regionId: r.regionId,
        districtId: r.districtId,
        districtDbId: r.districtDbId,
      },
    })),
  };
}

export async function getRegistryObjects(params: RegistryObjectsParams) {
  if (params.typeIds.length === 0)
    return { type: 'FeatureCollection' as const, features: [] };

  const conditions = [
    isNotNull(geographicObjects.geometry),
    inArray(geographicObjects.objectTypeId, params.typeIds),
    ...(params.regionId !== undefined
      ? [eq(geographicObjects.regionId, params.regionId)]
      : []),
    ...(params.districtId !== undefined
      ? [eq(geographicObjects.districtId, params.districtId)]
      : []),
  ];

  const rows = await db.query.geographicObjects.findMany({
    where: and(...conditions),
    columns: {
      id: true,
      nameUz: true,
      soato: true,
      regionId: true,
      districtId: true,
      objectTypeId: true,
      geometry: true,
    },
    with: {
      objectType: { columns: { nameUz: true } },
    },
  });

  return {
    type: 'FeatureCollection' as const,
    features: rows.map((r) => ({
      type: 'Feature' as const,
      geometry: r.geometry,
      properties: {
        id: r.id,
        nameUz: r.nameUz,
        soato: r.soato,
        regionId: r.regionId,
        districtId: r.districtId,
        objectType: r.objectType?.nameUz ?? null,
        objectTypeId: r.objectTypeId,
        isMfy: isMfyType(r.objectType?.nameUz),
        isStreet: isStreetType(r.objectType?.nameUz),
      },
    })),
  };
}
