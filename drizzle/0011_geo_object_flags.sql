CREATE TABLE IF NOT EXISTS "geo_object_flags" (
  "id" serial PRIMARY KEY,
  "application_id" integer NOT NULL REFERENCES "applications"("id") ON DELETE CASCADE,
  "geo_object_id" integer NOT NULL REFERENCES "geographic_objects"("id") ON DELETE CASCADE,
  "marked_by" integer NOT NULL REFERENCES "users"("id"),
  "comment" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "uq_geo_flag" UNIQUE ("application_id", "geo_object_id")
);
