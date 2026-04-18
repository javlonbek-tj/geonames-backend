CREATE TYPE "public"."commission_position" AS ENUM('hokim', 'hokim_deputy', 'economics_head', 'construction_head', 'poverty_head', 'ecology_head', 'culture_head', 'spirituality_head', 'newspaper_head', 'dkp_head', 'historian', 'linguist', 'geographer');--> statement-breakpoint
ALTER TYPE "public"."document_type" ADD VALUE 'attachment';--> statement-breakpoint
CREATE TABLE "commission_approvals" (
	"id" serial PRIMARY KEY NOT NULL,
	"application_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"position" "commission_position" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_commission_approval" UNIQUE("application_id","position")
);
--> statement-breakpoint
ALTER TABLE "geographic_objects" ALTER COLUMN "application_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "position" "commission_position";--> statement-breakpoint
ALTER TABLE "commission_approvals" ADD CONSTRAINT "commission_approvals_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commission_approvals" ADD CONSTRAINT "commission_approvals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;