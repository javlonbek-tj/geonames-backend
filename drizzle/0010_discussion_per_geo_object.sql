-- public_discussions: applicationId unique olib tashlanadi, geoObjectId qo'shiladi
ALTER TABLE "public_discussions" DROP CONSTRAINT IF EXISTS "public_discussions_application_id_unique";

ALTER TABLE "public_discussions"
  ADD COLUMN IF NOT EXISTS "geo_object_id" integer;

-- Mavjud discussionlar uchun birinchi geo-obyektni topib bog'laymiz
UPDATE "public_discussions" pd
SET "geo_object_id" = (
  SELECT id FROM "geographic_objects"
  WHERE "application_id" = pd.application_id
  ORDER BY id
  LIMIT 1
);

-- NOT NULL qilamiz
ALTER TABLE "public_discussions"
  ALTER COLUMN "geo_object_id" SET NOT NULL;

-- Foreign key
ALTER TABLE "public_discussions"
  ADD CONSTRAINT "public_discussions_geo_object_id_geographic_objects_id_fk"
  FOREIGN KEY ("geo_object_id") REFERENCES "geographic_objects"("id") ON DELETE CASCADE;

-- Yangi unique constraint: (applicationId, geoObjectId)
ALTER TABLE "public_discussions"
  ADD CONSTRAINT "uq_discussion_geo_object"
  UNIQUE ("application_id", "geo_object_id");
