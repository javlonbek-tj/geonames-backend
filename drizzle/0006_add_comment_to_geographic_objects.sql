ALTER TABLE "geographic_objects" ADD COLUMN "basis_document" text;--> statement-breakpoint
ALTER TABLE "geographic_objects" ADD COLUMN "affiliation" varchar(200);--> statement-breakpoint
ALTER TABLE "geographic_objects" ADD COLUMN "historical_name" varchar(200);--> statement-breakpoint
ALTER TABLE "geographic_objects" ADD COLUMN "comment" text;