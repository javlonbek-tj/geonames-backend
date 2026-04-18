import { eq, and, isNotNull, inArray } from 'drizzle-orm';
import { db } from '../../db/db';
import { geographicObjects, regions, districts } from '../../db/schema';

// Object type IDs for MFY and streets (fetched once, cached in module scope)
let streetTypeIds: number[] | null = null;
let mfyTypeId: number | null = null;

async function getRelevantTypeIds() {
  if (streetTypeIds && mfyTypeId) return { streetTypeIds, mfyTypeId };

  const types = await db.query.objectTypes.findMany({
    where: (t, { inArray }) =>
      inArray(t.nameUz, ["Ko'cha", "Tor ko'cha", "Berk ko'cha", "Shoh ko'cha", 'Mahalla']),
    columns: { id: true, nameUz: true },
  });

  mfyTypeId = types.find((t) => t.nameUz === 'Mahalla')?.id ?? null;
  streetTypeIds = types
    .filter((t) => ["Ko'cha", "Tor ko'cha", "Berk ko'cha", "Shoh ko'cha"].includes(t.nameUz))
    .map((t) => t.id);

  return { streetTypeIds, mfyTypeId };
}

function toFeatureCollection(
  rows: Array<{
    id: number;
    nameUz: string | null;
    soato: string | null;
    regionId: number;
    districtId: number;
    geometry: unknown;
    extra?: Record<string, unknown>;
  }>,
) {
  return {
    type: 'FeatureCollection' as const,
    features: rows
      .filter((r) => r.geometry)
      .map((r) => ({
        type: 'Feature' as const,
        geometry: r.geometry,
        properties: {
          id: r.id,
          nameUz: r.nameUz,
          soato: r.soato,
          regionId: r.regionId,
          districtId: r.districtId,
          ...r.extra,
        },
      })),
  };
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
    features: rows
      .filter((r) => r.geometry)
      .map((r) => ({
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
    features: rows
      .filter((r) => r.geometry)
      .map((r) => ({
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

/** Level 2 — MFY + streets of a district */
export async function getDistrictObjects(districtId: number) {
  const { streetTypeIds: sIds, mfyTypeId: mId } = await getRelevantTypeIds();
  const allTypeIds = [mId, ...(sIds ?? [])].filter(Boolean) as number[];

  if (allTypeIds.length === 0) return { type: 'FeatureCollection' as const, features: [] };

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
    features: rows
      .filter((r) => r.geometry)
      .map((r) => ({
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
