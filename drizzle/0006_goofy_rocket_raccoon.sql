CREATE TABLE "citizen_refresh_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"citizen_id" integer NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "citizen_refresh_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "citizen_refresh_tokens" ADD CONSTRAINT "citizen_refresh_tokens_citizen_id_citizens_id_fk" FOREIGN KEY ("citizen_id") REFERENCES "public"."citizens"("id") ON DELETE cascade ON UPDATE no action;