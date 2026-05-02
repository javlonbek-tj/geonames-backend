import { eq, and, isNotNull, inArray } from 'drizzle-orm';
import { db } from '../../db/db';
import { geographicObjects, regions, districts } from '../../db/schema';

export interface RegistryObjectsParams {
  typeIds: number[];
  regionId?: number;
  districtId?: number;
}

async function getRelevantTypeIds() {
  const types = await db.query.objectTypes.findMany({
    where: (t, { inArray }) =>
      inArray(t.nameUz, [
        "Ko'cha",
        "Tor ko'cha",
        "Berk ko'cha",
        "Shoh ko'cha",
        'Mahalla',
      ]),
    columns: { id: true, nameUz: true },
  });

  const mfyTypeId = types.find((t) => t.nameUz === 'Mahalla')?.id ?? null;
  const streetTypeIds = types
    .filter((t) =>
      ["Ko'cha", "Tor ko'cha", "Berk ko'cha", "Shoh ko'cha"].includes(t.nameUz),
    )
    .map((t) => t.id);

  return { streetTypeIds, mfyTypeId };
}

/** Level 0 — all 14 regions */
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

/** Level 1 — districts of a region */
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

/** Filtered registry objects by typeIds (+ optional region/district scope) */
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
        isMfy: r.objectType?.nameUz === 'Mahalla',
        isStreet: ["Ko'cha", "Tor ko'cha", "Berk ko'cha", "Shoh ko'cha"].includes(
          r.objectType?.nameUz ?? '',
        ),
      },
    })),
  };
}

/** Level 2 — MFY + streets of a district */
export async function getDistrictObjects(districtId: number) {
  const { streetTypeIds: sIds, mfyTypeId: mId } = await getRelevantTypeIds();
  const allTypeIds = [mId, ...(sIds ?? [])].filter(Boolean) as number[];

  if (allTypeIds.length === 0)
    return { type: 'FeatureCollection' as const, features: [] };

  const rows = await db.query.geographicObjects.findMany({
    where: and(
      eq(geographicObjects.districtId, districtId),
      isNotNull(geographicObjects.geometry),
      inArray(geographicObjects.objectTypeId, allTypeIds),
    ),
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

  const isMfy = (typeId: number | null) => typeId === mId;

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
          isMfy: isMfy(r.objectTypeId),
        },
      })),
  };
}
