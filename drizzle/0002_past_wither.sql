ALTER TABLE "object_categories" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "object_types" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;