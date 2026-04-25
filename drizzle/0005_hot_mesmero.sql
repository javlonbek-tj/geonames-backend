ALTER TABLE "applications" ADD COLUMN "region_id" integer;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "district_id" integer;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_district_id_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE no action ON UPDATE no action;