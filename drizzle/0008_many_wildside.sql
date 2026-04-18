CREATE TYPE "public"."vote_type" AS ENUM('support', 'oppose');--> statement-breakpoint
ALTER TYPE "public"."application_status" ADD VALUE 'step_2_public_discussion' BEFORE 'step_2_1_district_commission';--> statement-breakpoint
CREATE TABLE "citizen_otps" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"phone" varchar(20) NOT NULL,
	"code" varchar(6) NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "citizen_otps_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "citizens" (
	"id" serial PRIMARY KEY NOT NULL,
	"telegram_id" varchar(50) NOT NULL,
	"phone" varchar(20),
	"full_name" varchar(200),
	"username" varchar(100),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "citizens_telegram_id_unique" UNIQUE("telegram_id")
);
--> statement-breakpoint
CREATE TABLE "public_discussions" (
	"id" serial PRIMARY KEY NOT NULL,
	"application_id" integer NOT NULL,
	"ends_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "public_discussions_application_id_unique" UNIQUE("application_id")
);
--> statement-breakpoint
CREATE TABLE "public_votes" (
	"id" serial PRIMARY KEY NOT NULL,
	"discussion_id" integer NOT NULL,
	"citizen_id" integer NOT NULL,
	"vote" "vote_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_discussion_citizen_vote" UNIQUE("discussion_id","citizen_id")
);
--> statement-breakpoint
ALTER TABLE "commission_approvals" ADD COLUMN "approved" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "commission_approvals" ADD COLUMN "comment" text;--> statement-breakpoint
ALTER TABLE "public_discussions" ADD CONSTRAINT "public_discussions_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public_votes" ADD CONSTRAINT "public_votes_discussion_id_public_discussions_id_fk" FOREIGN KEY ("discussion_id") REFERENCES "public"."public_discussions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public_votes" ADD CONSTRAINT "public_votes_citizen_id_citizens_id_fk" FOREIGN KEY ("citizen_id") REFERENCES "public"."citizens"("id") ON DELETE no action ON UPDATE no action;