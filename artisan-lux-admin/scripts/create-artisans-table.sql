-- Create artisans table if it doesn't exist
CREATE TABLE IF NOT EXISTS "artisans" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(160) NOT NULL,
	"password_hash" text NOT NULL,
	"name" varchar(160) NOT NULL,
	"slug" varchar(200) NOT NULL,
	"bio" text,
	"bio_rich" text,
	"studio_name" varchar(200),
	"studio_location" varchar(200),
	"specialties" text[],
	"avatar_media_id" integer,
	"cover_media_id" integer,
	"website" varchar(255),
	"instagram" varchar(100),
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"verification_code" varchar(6),
	"verification_code_expires_at" timestamp,
	"commission_rate" numeric(5, 2) DEFAULT '15.00',
	"total_sales" numeric(12, 2) DEFAULT '0.00',
	"rating" numeric(3, 2),
	"review_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "artisans" ADD CONSTRAINT "artisans_avatar_media_id_media_assets_id_fk" FOREIGN KEY ("avatar_media_id") REFERENCES "public"."media_assets"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "artisans" ADD CONSTRAINT "artisans_cover_media_id_media_assets_id_fk" FOREIGN KEY ("cover_media_id") REFERENCES "public"."media_assets"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create unique indexes
CREATE UNIQUE INDEX IF NOT EXISTS "artisans_email_unique" ON "artisans" USING btree ("email");
CREATE UNIQUE INDEX IF NOT EXISTS "artisans_slug_unique" ON "artisans" USING btree ("slug");
