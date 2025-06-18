CREATE TABLE "user_config" (
	"user_id" text PRIMARY KEY NOT NULL,
	"settings" json NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_config" ADD CONSTRAINT "user_config_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;