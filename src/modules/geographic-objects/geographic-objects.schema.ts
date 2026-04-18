import { z } from 'zod';

const geometrySchema = z.looseObject({
  type: z.enum([
    'Point',
    'Polygon',
    'LineString',
    'MultiPolygon',
    'MultiPoint',
    'MultiLineString',
    'GeometryCollection',
    'Feature',
    'FeatureCollection',
  ]),
});

// existsInRegistry=true  →  nameUz, nameKrill, registryNumber are taken from geojson
// existsInRegistry=false →  no name, later in workflow
const objectItemSchema = z.object({
  nameUz: z.string().trim().min(1).max(200).optional(),
  nameKrill: z.string().trim().max(200).optional(),
  registryNumber: z.string().trim().max(50).optional(),
  objectTypeId: z.number().int().positive().optional(),
  geometry: geometrySchema,
});

export const createGeographicObjectSchema = z.object({
  regionId: z.number().int().positive('Viloyat tanlanishi shart'),
  districtId: z.number().int().positive('Tuman tanlanishi shart'),
  existsInRegistry: z.boolean(),
  objects: z
    .array(objectItemSchema)
    .min(1, 'Kamida bitta obyekt kiritilishi shart'),
});

export const updateObjectNamesSchema = z.object({
  objects: z
    .array(
      z.object({
        id: z.number().int().positive(),
        nameUz: z.string().trim().min(1, 'Nomi kiritilishi shart').max(200),
        nameKrill: z.string().trim().max(200).optional(),
        objectTypeId: z.number().int().positive('Obyekt turi tanlanishi shart'),
      }),
    )
    .min(1),
});

export const updateGeometrySchema = z.object({
  geometry: geometrySchema,
});

export const updateRegistryObjectSchema = z.object({
  nameUz: z.string().trim().min(1).max(200).optional(),
  nameKrill: z.string().trim().max(200).optional(),
  objectTypeId: z.number().int().positive().optional().nullable(),
  regionId: z.number().int().positive().optional(),
  districtId: z.number().int().positive().optional(),
  registryNumber: z.string().trim().max(50).optional().nullable(),
  basisDocument: z.string().trim().optional().nullable(),
  affiliation: z.string().trim().max(200).optional().nullable(),
  historicalName: z.string().trim().max(200).optional().nullable(),
  comment: z.string().trim().optional().nullable(),
});

export type CreateGeographicObjectInput = z.infer<
  typeof createGeographicObjectSchema
>;
export type UpdateObjectNamesInput = z.infer<typeof updateObjectNamesSchema>;
export type ObjectItem = z.infer<typeof objectItemSchema>;
export type UpdateGeometryInput = z.infer<typeof updateGeometrySchema>;
export type UpdateRegistryObjectInput = z.infer<
  typeof updateRegistryObjectSchema
>;
