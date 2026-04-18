ALTER TABLE "applications" ALTER COLUMN "current_status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "current_status" SET DEFAULT 'step_1_geometry_uploaded'::text;--> statement-breakpoint
ALTER TABLE "application_history" ALTER COLUMN "from_status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "application_history" ALTER COLUMN "to_status" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."application_status";--> statement-breakpoint
CREATE TYPE "public"."application_status" AS ENUM('step_1_geometry_uploaded', 'step_1_1_dkp_regional', 'step_1_2_dkp_coordination', 'step_2_district_hokimlik', 'step_2_1_district_commission', 'step_2_2_regional_commission', 'step_3_regional_hokimlik', 'step_4_kadastr_agency', 'step_5_dkp_central', 'step_6_kadastr_agency_final', 'step_7_regional_hokimlik', 'step_8_district_hokimlik', 'step_9_peoples_council', 'completed', 'rejected');--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "current_status" SET DEFAULT 'step_1_geometry_uploaded'::"public"."application_status";--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "current_status" SET DATA TYPE "public"."application_status" USING "current_status"::"public"."application_status";--> statement-breakpoint
ALTER TABLE "application_history" ALTER COLUMN "from_status" SET DATA TYPE "public"."application_status" USING "from_status"::"public"."application_status";--> statement-breakpoint
ALTER TABLE "application_history" ALTER COLUMN "to_status" SET DATA TYPE "public"."application_status" USING "to_status"::"public"."application_status";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."user_role";--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'dkp_filial', 'dkp_regional', 'dkp_central', 'district_commission', 'district_hokimlik', 'regional_commission', 'regional_hokimlik', 'kadastr_agency', 'peoples_council');--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."user_role" USING "role"::"public"."user_role";