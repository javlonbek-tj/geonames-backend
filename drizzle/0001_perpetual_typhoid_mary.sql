ALTER TABLE "documents" ALTER COLUMN "document_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."document_type";--> statement-breakpoint
CREATE TYPE "public"."document_type" AS ENUM('geometry_file');--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "document_type" SET DATA TYPE "public"."document_type" USING "document_type"::"public"."document_type";