ALTER TABLE "application_history" ALTER COLUMN "action_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."action_type";--> statement-breakpoint
CREATE TYPE "public"."action_type" AS ENUM('submit', 'approve', 'reject', 'return');--> statement-breakpoint
ALTER TABLE "application_history" ALTER COLUMN "action_type" SET DATA TYPE "public"."action_type" USING "action_type"::"public"."action_type";