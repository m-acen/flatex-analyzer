CREATE TABLE "raw_account_data_set" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"data" text NOT NULL,
	"file_name" text NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "raw_depot_data_set" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"data" text NOT NULL,
	"file_name" text NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "raw_account_data_set" ADD CONSTRAINT "raw_account_data_set_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "raw_depot_data_set" ADD CONSTRAINT "raw_depot_data_set_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;