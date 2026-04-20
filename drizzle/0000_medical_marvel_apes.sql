CREATE TYPE "public"."action_type" AS ENUM('submit', 'approve', 'reject', 'return');--> statement-breakpoint
CREATE TYPE "public"."application_status" AS ENUM('step_1_geometry_uploaded', 'step_1_1_dkp_regional', 'step_1_2_dkp_coordination', 'step_2_district_hokimlik', 'step_2_public_discussion', 'step_2_1_district_commission', 'step_2_2_regional_commission', 'step_3_regional_hokimlik', 'step_4_kadastr_agency', 'step_5_dkp_central', 'step_6_kadastr_agency_final', 'step_7_regional_hokimlik', 'step_8_district_hokimlik', 'completed', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."commission_position" AS ENUM('hokim', 'hokim_deputy', 'economics_head', 'construction_head', 'poverty_head', 'ecology_head', 'culture_head', 'spirituality_head', 'newspaper_head', 'dkp_head', 'historian', 'linguist', 'geographer');--> statement-breakpoint
CREATE TYPE "public"."document_type" AS ENUM('geometry_file', 'attachment');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'dkp_filial', 'dkp_regional', 'dkp_central', 'district_commission', 'district_hokimlik', 'regional_commission', 'regional_hokimlik', 'kadastr_agency');--> statement-breakpoint
CREATE TYPE "public"."vote_type" AS ENUM('support', 'oppose');--> statement-breakpoint
CREATE TABLE "regions" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(10) NOT NULL,
	"name_uz" varchar(100) NOT NULL,
	"name_krill" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "regions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "districts" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(10) NOT NULL,
	"name_uz" varchar(100) NOT NULL,
	"name_krill" varchar(100),
	"region_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "districts_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "refresh_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(100) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"full_name" varchar(200),
	"role" "user_role" NOT NULL,
	"position" "commission_position",
	"region_id" integer,
	"district_id" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_blocked" boolean DEFAULT false NOT NULL,
	"password_changed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "object_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(20),
	"name_uz" varchar(200) NOT NULL,
	"name_krill" varchar(200),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "object_categories_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "object_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name_uz" varchar(200) NOT NULL,
	"name_krill" varchar(200),
	"category_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "geographic_objects" (
	"id" serial PRIMARY KEY NOT NULL,
	"application_id" integer,
	"name_uz" varchar(200),
	"name_krill" varchar(200),
	"object_type_id" integer,
	"region_id" integer NOT NULL,
	"district_id" integer NOT NULL,
	"geometry" jsonb,
	"registry_number" varchar(50),
	"soato" varchar(20),
	"basis_document" text,
	"affiliation" text,
	"historical_name" varchar(200),
	"comment" text,
	"exists_in_registry" boolean,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "geographic_objects_registry_number_unique" UNIQUE("registry_number")
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"application_number" varchar(50) NOT NULL,
	"current_status" "application_status" DEFAULT 'step_1_geometry_uploaded' NOT NULL,
	"current_handler_id" integer,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "applications_application_number_unique" UNIQUE("application_number")
);
--> statement-breakpoint
CREATE TABLE "application_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"application_id" integer NOT NULL,
	"from_status" "application_status",
	"to_status" "application_status" NOT NULL,
	"action_type" "action_type" NOT NULL,
	"performed_by" integer NOT NULL,
	"comment" text,
	"attachments" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"application_id" integer NOT NULL,
	"document_type" "document_type" NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"file_path" varchar(500) NOT NULL,
	"mime_type" varchar(100),
	"file_size" integer,
	"uploaded_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commission_approvals" (
	"id" serial PRIMARY KEY NOT NULL,
	"application_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"position" "commission_position" NOT NULL,
	"approved" boolean DEFAULT true NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_commission_approval" UNIQUE("application_id","position")
);
--> statement-breakpoint
CREATE TABLE "citizen_otps" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"telegram_id" varchar(50),
	"phone" varchar(20),
	"code" varchar(6) NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "citizen_otps_session_id_unique" UNIQUE("session_id"),
	CONSTRAINT "citizen_otps_telegram_id_unique" UNIQUE("telegram_id")
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
	"geo_object_id" integer NOT NULL,
	"ends_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_discussion_geo_object" UNIQUE("application_id","geo_object_id")
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
CREATE TABLE "geo_object_flags" (
	"id" serial PRIMARY KEY NOT NULL,
	"application_id" integer NOT NULL,
	"geo_object_id" integer NOT NULL,
	"marked_by" integer NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_geo_flag" UNIQUE("application_id","geo_object_id")
);
--> statement-breakpoint
ALTER TABLE "districts" ADD CONSTRAINT "districts_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_district_id_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "object_types" ADD CONSTRAINT "object_types_category_id_object_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."object_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "geographic_objects" ADD CONSTRAINT "geographic_objects_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "geographic_objects" ADD CONSTRAINT "geographic_objects_object_type_id_object_types_id_fk" FOREIGN KEY ("object_type_id") REFERENCES "public"."object_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "geographic_objects" ADD CONSTRAINT "geographic_objects_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "geographic_objects" ADD CONSTRAINT "geographic_objects_district_id_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "geographic_objects" ADD CONSTRAINT "geographic_objects_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_current_handler_id_users_id_fk" FOREIGN KEY ("current_handler_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_history" ADD CONSTRAINT "application_history_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_history" ADD CONSTRAINT "application_history_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commission_approvals" ADD CONSTRAINT "commission_approvals_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commission_approvals" ADD CONSTRAINT "commission_approvals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public_discussions" ADD CONSTRAINT "public_discussions_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public_discussions" ADD CONSTRAINT "public_discussions_geo_object_id_geographic_objects_id_fk" FOREIGN KEY ("geo_object_id") REFERENCES "public"."geographic_objects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public_votes" ADD CONSTRAINT "public_votes_discussion_id_public_discussions_id_fk" FOREIGN KEY ("discussion_id") REFERENCES "public"."public_discussions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public_votes" ADD CONSTRAINT "public_votes_citizen_id_citizens_id_fk" FOREIGN KEY ("citizen_id") REFERENCES "public"."citizens"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "geo_object_flags" ADD CONSTRAINT "geo_object_flags_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "geo_object_flags" ADD CONSTRAINT "geo_object_flags_geo_object_id_geographic_objects_id_fk" FOREIGN KEY ("geo_object_id") REFERENCES "public"."geographic_objects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "geo_object_flags" ADD CONSTRAINT "geo_object_flags_marked_by_users_id_fk" FOREIGN KEY ("marked_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;