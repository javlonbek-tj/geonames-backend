ALTER TYPE "public"."application_status" ADD VALUE 'step_1_1_viloyat_dkp' BEFORE 'step_2_district_hokimlik';--> statement-breakpoint
ALTER TYPE "public"."application_status" ADD VALUE 'step_1_2_respublika_dkp' BEFORE 'step_2_district_hokimlik';--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'viloyat_dkp' BEFORE 'district_commission';