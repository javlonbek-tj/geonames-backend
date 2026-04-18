ALTER TABLE "applications" DROP CONSTRAINT "applications_geographic_object_id_geographic_objects_id_fk";
--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "current_status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "current_status" SET DEFAULT 'step_1_geometry_uploaded'::text;--> statement-breakpoint
ALTER TABLE "application_history" ALTER COLUMN "from_status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "application_history" ALTER COLUMN "to_status" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."application_status";--> statement-breakpoint
CREATE TYPE "public"."application_status" AS ENUM('step_1_geometry_uploaded', 'step_2_district_hokimlik', 'step_2_1_district_commission', 'step_2_2_regional_commission', 'step_3_regional_hokimlik', 'step_4_kadastr_agency', 'step_5_dkp_central', 'step_6_kadastr_agency_final', 'step_7_regional_hokimlik', 'step_8_district_hokimlik', 'step_9_peoples_council', 'completed', 'rejected');--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "current_status" SET DEFAULT 'step_1_geometry_uploaded'::"public"."application_status";--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "current_status" SET DATA TYPE "public"."application_status" USING "current_status"::"public"."application_status";--> statement-breakpoint
ALTER TABLE "application_history" ALTER COLUMN "from_status" SET DATA TYPE "public"."application_status" USING "from_status"::"public"."application_status";--> statement-breakpoint
ALTER TABLE "application_history" ALTER COLUMN "to_status" SET DATA TYPE "public"."application_status" USING "to_status"::"public"."application_status";--> statement-breakpoint
ALTER TABLE "geographic_objects" ALTER COLUMN "name_uz" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "geographic_objects" ALTER COLUMN "object_type_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "geographic_objects" ADD COLUMN "application_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "geographic_objects" ADD CONSTRAINT "geographic_objects_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" DROP COLUMN "geographic_object_id";