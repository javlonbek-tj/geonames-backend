CREATE TYPE "public"."action_type" AS ENUM('submit', 'approve', 'reject', 'return', 'attach_document', 'assign_registry_number', 'confirm_geometry');--> statement-breakpoint
CREATE TYPE "public"."application_status" AS ENUM('step_1_geometry_uploaded', 'step_1_1_district_commission', 'step_1_2_dkp_filial_proposal', 'step_2_district_hokimlik', 'step_2_1_district_commission', 'step_2_2_regional_commission', 'step_3_regional_hokimlik', 'step_4_kadastr_agency', 'step_5_dkp_central', 'step_6_kadastr_agency_final', 'step_7_regional_hokimlik', 'step_8_district_hokimlik', 'step_9_peoples_council', 'completed', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."document_type" AS ENUM('dalolatnoma', 'district_commission_conclusion', 'regional_commission_conclusion', 'official_letter', 'decision_draft', 'expertise_conclusion', 'other');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'dkp_filial', 'district_commission', 'district_hokimlik', 'regional_commission', 'regional_hokimlik', 'kadastr_agency', 'dkp_central', 'peoples_council');--> statement-breakpoint
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
	"region_id" integer,
	"district_id" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_blocked" boolean DEFAULT false NOT NULL,
	"password_changed_at" timestamp,
	"password_reset_token" text,
	"password_reset_expires" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "object_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name_uz" varchar(200) NOT NULL,
	"name_krill" varchar(200),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
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
	"name_uz" varchar(200) NOT NULL,
	"name_krill" varchar(200),
	"object_type_id" integer NOT NULL,
	"region_id" integer NOT NULL,
	"district_id" integer NOT NULL,
	"geometry" jsonb,
	"registry_number" varchar(50),
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
	"geographic_object_id" integer NOT NULL,
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
ALTER TABLE "districts" ADD CONSTRAINT "districts_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_district_id_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "object_types" ADD CONSTRAINT "object_types_category_id_object_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."object_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "geographic_objects" ADD CONSTRAINT "geographic_objects_object_type_id_object_types_id_fk" FOREIGN KEY ("object_type_id") REFERENCES "public"."object_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "geographic_objects" ADD CONSTRAINT "geographic_objects_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "geographic_objects" ADD CONSTRAINT "geographic_objects_district_id_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "geographic_objects" ADD CONSTRAINT "geographic_objects_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_geographic_object_id_geographic_objects_id_fk" FOREIGN KEY ("geographic_object_id") REFERENCES "public"."geographic_objects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_current_handler_id_users_id_fk" FOREIGN KEY ("current_handler_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_history" ADD CONSTRAINT "application_history_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_history" ADD CONSTRAINT "application_history_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;