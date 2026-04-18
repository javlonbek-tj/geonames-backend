ALTER TABLE "object_categories" ADD COLUMN "code" varchar(20);--> statement-breakpoint
ALTER TABLE "object_categories" ADD CONSTRAINT "object_categories_code_unique" UNIQUE("code");