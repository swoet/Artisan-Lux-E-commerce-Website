-- Complete SQL to create all missing tables for artisan-lux-admin
-- Run this in Neon database console or via psql

-- ========================================
-- CORE TABLES
-- ========================================

CREATE TABLE IF NOT EXISTS "artisan_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"artisan_id" integer NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

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

-- ========================================
-- CARE & SERVICE TABLES
-- ========================================

CREATE TABLE IF NOT EXISTS "care_bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"passport_id" integer,
	"service_type" varchar(50) NOT NULL,
	"description" text,
	"status" varchar(20) DEFAULT 'requested' NOT NULL,
	"scheduled_date" timestamp,
	"completed_date" timestamp,
	"cost" numeric(12, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- ========================================
-- CART & WISHLIST TABLES
-- ========================================

CREATE TABLE IF NOT EXISTS "cart_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"cart_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price" numeric(12, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "wishlist_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"wishlist_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- ========================================
-- CONCIERGE & MESSAGING TABLES
-- ========================================

CREATE TABLE IF NOT EXISTS "concierge_conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"assigned_admin_id" integer,
	"subject" varchar(255),
	"status" varchar(20) DEFAULT 'open' NOT NULL,
	"priority" varchar(20) DEFAULT 'medium',
	"channel" varchar(20) DEFAULT 'chat' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "concierge_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"sender_id" integer NOT NULL,
	"sender_type" varchar(20) NOT NULL,
	"message" text NOT NULL,
	"attachment_media_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- ========================================
-- CUSTOM ORDERS & PRODUCTION TABLES
-- ========================================

CREATE TABLE IF NOT EXISTS "custom_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"artisan_id" integer,
	"base_product_id" integer,
	"title" varchar(255),
	"description" text,
	"customer_name" varchar(160),
	"customization_data" text NOT NULL,
	"customer_notes" text,
	"budget_min" numeric(12, 2),
	"budget_max" numeric(12, 2),
	"base_price" numeric(12, 2) NOT NULL,
	"customization_price" numeric(12, 2) DEFAULT '0.00',
	"total_price" numeric(12, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"deposit_required" boolean DEFAULT true,
	"deposit_amount" numeric(12, 2),
	"deposit_paid" boolean DEFAULT false,
	"estimated_lead_time_days" integer,
	"estimated_completion_date" timestamp,
	"actual_completion_date" timestamp,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "production_stages" (
	"id" serial PRIMARY KEY NOT NULL,
	"custom_order_id" integer NOT NULL,
	"stage" varchar(50) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"artisan_notes" text,
	"photo_media_id" integer,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- ========================================
-- VIP & CUSTOMER LOYALTY TABLES
-- ========================================

CREATE TABLE IF NOT EXISTS "vip_tiers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"min_spend" numeric(12, 2) NOT NULL,
	"benefits" text[],
	"discount_percent" numeric(5, 2) DEFAULT '0.00',
	"priority" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "customer_vip_status" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"tier_id" integer NOT NULL,
	"lifetime_spend" numeric(12, 2) DEFAULT '0.00',
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- ========================================
-- DROP & WAITLIST TABLES
-- ========================================

CREATE TABLE IF NOT EXISTS "drops" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"slug" varchar(200) NOT NULL,
	"description" text,
	"product_ids" text[],
	"announcement_date" timestamp,
	"drop_date" timestamp NOT NULL,
	"end_date" timestamp,
	"access_type" varchar(20) DEFAULT 'public' NOT NULL,
	"max_quantity_per_customer" integer DEFAULT 1,
	"status" varchar(20) DEFAULT 'upcoming' NOT NULL,
	"cover_media_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "drop_access_list" (
	"id" serial PRIMARY KEY NOT NULL,
	"drop_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"access_granted_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "waitlists" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"priority" integer DEFAULT 0,
	"notified" boolean DEFAULT false,
	"notified_at" timestamp,
	"converted_to_order" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- ========================================
-- GIFT & STYLING TABLES
-- ========================================

CREATE TABLE IF NOT EXISTS "gift_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_item_id" integer NOT NULL,
	"gift_wrap" boolean DEFAULT false,
	"gift_message" text,
	"recipient_name" varchar(160),
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "styling_boards" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"created_by_admin_id" integer NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"product_ids" text[],
	"cover_media_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- ========================================
-- IMPACT & SOCIAL RESPONSIBILITY TABLES
-- ========================================

CREATE TABLE IF NOT EXISTS "impact_causes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"category" varchar(50) NOT NULL,
	"logo_media_id" integer,
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "impact_contributions" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"order_id" integer NOT NULL,
	"cause_id" integer NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- ========================================
-- INVENTORY TABLES
-- ========================================

CREATE TABLE IF NOT EXISTS "inventory" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"quantity_in_stock" integer DEFAULT 0 NOT NULL,
	"low_stock_threshold" integer DEFAULT 5 NOT NULL,
	"last_restocked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "inventory_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"quantity_change" integer NOT NULL,
	"reason" varchar(50) NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- ========================================
-- ORDER & PAYMENT TABLES
-- ========================================

CREATE TABLE IF NOT EXISTS "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(12, 2) NOT NULL,
	"currency" varchar(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS "payment_proofs" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"url" text NOT NULL,
	"payment_method" varchar(40),
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);

-- ========================================
-- PROVENANCE & OWNERSHIP TABLES
-- ========================================

CREATE TABLE IF NOT EXISTS "provenance_passports" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"serial_number" varchar(50) NOT NULL,
	"nfc_tag_id" varchar(100),
	"materials_origin" text,
	"sustainability_certifications" text[],
	"carbon_footprint" numeric(10, 2),
	"artisan_notes" text,
	"production_date" timestamp,
	"production_time_hours" integer,
	"care_instructions" text,
	"warranty_years" integer DEFAULT 1,
	"warranty_expires_at" timestamp,
	"current_owner_id" integer,
	"original_purchase_date" timestamp,
	"resale_eligible" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "ownership_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"passport_id" integer NOT NULL,
	"from_owner_id" integer,
	"to_owner_id" integer NOT NULL,
	"transfer_type" varchar(20) NOT NULL,
	"transfer_price" numeric(12, 2),
	"transfer_date" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "service_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"passport_id" integer NOT NULL,
	"service_type" varchar(50) NOT NULL,
	"description" text,
	"serviced_by" varchar(200),
	"cost" numeric(12, 2),
	"service_date" timestamp DEFAULT now() NOT NULL
);

-- ========================================
-- PRODUCT & ARTISAN RELATIONSHIP TABLES
-- ========================================

CREATE TABLE IF NOT EXISTS "product_artisans" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"artisan_id" integer NOT NULL,
	"role" varchar(20) DEFAULT 'creator' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"slug" varchar(200) NOT NULL,
	"description_rich" text,
	"price_decimal" numeric(12, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"category_id" integer,
	"cover_image_id" integer,
	"materials" text[],
	"tags" text[],
	"is_featured" boolean DEFAULT false NOT NULL,
	"status" varchar(12) DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- ========================================
-- TRADE-IN TABLES
-- ========================================

CREATE TABLE IF NOT EXISTS "trade_ins" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"product_id" integer,
	"passport_id" integer,
	"customer_name" varchar(160),
	"customer_email" varchar(160),
	"item_description" text NOT NULL,
	"original_price" numeric(12, 2),
	"condition" varchar(20) NOT NULL,
	"photo_media_ids" text[],
	"estimated_value" numeric(12, 2),
	"offered_value" numeric(12, 2),
	"final_value" numeric(12, 2),
	"status" varchar(20) DEFAULT 'submitted' NOT NULL,
	"trade_in_type" varchar(20) NOT NULL,
	"credit_applied_to_order_id" integer,
	"reviewed_by" integer,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- ========================================
-- USER GENERATED CONTENT TABLES
-- ========================================

CREATE TABLE IF NOT EXISTS "user_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"product_id" integer,
	"media_id" integer NOT NULL,
	"caption" text,
	"tags" text[],
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"moderated_by" integer,
	"moderated_at" timestamp,
	"featured" boolean DEFAULT false,
	"likes" integer DEFAULT 0,
	"shoppable" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "ugc_rewards" (
	"id" serial PRIMARY KEY NOT NULL,
	"content_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"reward_type" varchar(50) NOT NULL,
	"reward_value" numeric(12, 2),
	"redeemed" boolean DEFAULT false,
	"redeemed_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- ========================================
-- FOREIGN KEY CONSTRAINTS
-- ========================================

DO $$ BEGIN
 ALTER TABLE "artisan_sessions" ADD CONSTRAINT "artisan_sessions_artisan_id_artisans_id_fk" FOREIGN KEY ("artisan_id") REFERENCES "public"."artisans"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "artisans" ADD CONSTRAINT "artisans_avatar_media_id_media_assets_id_fk" FOREIGN KEY ("avatar_media_id") REFERENCES "public"."media_assets"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "artisans" ADD CONSTRAINT "artisans_cover_media_id_media_assets_id_fk" FOREIGN KEY ("cover_media_id") REFERENCES "public"."media_assets"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "care_bookings" ADD CONSTRAINT "care_bookings_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "care_bookings" ADD CONSTRAINT "care_bookings_passport_id_provenance_passports_id_fk" FOREIGN KEY ("passport_id") REFERENCES "public"."provenance_passports"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_categories_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "concierge_conversations" ADD CONSTRAINT "concierge_conversations_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "concierge_conversations" ADD CONSTRAINT "concierge_conversations_assigned_admin_id_admins_id_fk" FOREIGN KEY ("assigned_admin_id") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "concierge_messages" ADD CONSTRAINT "concierge_messages_conversation_id_concierge_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."concierge_conversations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "concierge_messages" ADD CONSTRAINT "concierge_messages_attachment_media_id_media_assets_id_fk" FOREIGN KEY ("attachment_media_id") REFERENCES "public"."media_assets"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "custom_orders" ADD CONSTRAINT "custom_orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "custom_orders" ADD CONSTRAINT "custom_orders_artisan_id_artisans_id_fk" FOREIGN KEY ("artisan_id") REFERENCES "public"."artisans"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "custom_orders" ADD CONSTRAINT "custom_orders_base_product_id_products_id_fk" FOREIGN KEY ("base_product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "customer_vip_status" ADD CONSTRAINT "customer_vip_status_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "customer_vip_status" ADD CONSTRAINT "customer_vip_status_tier_id_vip_tiers_id_fk" FOREIGN KEY ("tier_id") REFERENCES "public"."vip_tiers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "drop_access_list" ADD CONSTRAINT "drop_access_list_drop_id_drops_id_fk" FOREIGN KEY ("drop_id") REFERENCES "public"."drops"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "drop_access_list" ADD CONSTRAINT "drop_access_list_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "drops" ADD CONSTRAINT "drops_cover_media_id_media_assets_id_fk" FOREIGN KEY ("cover_media_id") REFERENCES "public"."media_assets"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "impact_causes" ADD CONSTRAINT "impact_causes_logo_media_id_media_assets_id_fk" FOREIGN KEY ("logo_media_id") REFERENCES "public"."media_assets"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "impact_contributions" ADD CONSTRAINT "impact_contributions_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "impact_contributions" ADD CONSTRAINT "impact_contributions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "impact_contributions" ADD CONSTRAINT "impact_contributions_cause_id_impact_causes_id_fk" FOREIGN KEY ("cause_id") REFERENCES "public"."impact_causes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "inventory" ADD CONSTRAINT "inventory_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "inventory_history" ADD CONSTRAINT "inventory_history_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_categories_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "ownership_history" ADD CONSTRAINT "ownership_history_passport_id_provenance_passports_id_fk" FOREIGN KEY ("passport_id") REFERENCES "public"."provenance_passports"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "ownership_history" ADD CONSTRAINT "ownership_history_from_owner_id_customers_id_fk" FOREIGN KEY ("from_owner_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "ownership_history" ADD CONSTRAINT "ownership_history_to_owner_id_customers_id_fk" FOREIGN KEY ("to_owner_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "payment_proofs" ADD CONSTRAINT "payment_proofs_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "product_artisans" ADD CONSTRAINT "product_artisans_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "product_artisans" ADD CONSTRAINT "product_artisans_artisan_id_artisans_id_fk" FOREIGN KEY ("artisan_id") REFERENCES "public"."artisans"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "production_stages" ADD CONSTRAINT "production_stages_custom_order_id_custom_orders_id_fk" FOREIGN KEY ("custom_order_id") REFERENCES "public"."custom_orders"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "production_stages" ADD CONSTRAINT "production_stages_photo_media_id_media_assets_id_fk" FOREIGN KEY ("photo_media_id") REFERENCES "public"."media_assets"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "products" ADD CONSTRAINT "products_cover_image_id_media_assets_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media_assets"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "provenance_passports" ADD CONSTRAINT "provenance_passports_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "provenance_passports" ADD CONSTRAINT "provenance_passports_current_owner_id_customers_id_fk" FOREIGN KEY ("current_owner_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "service_history" ADD CONSTRAINT "service_history_passport_id_provenance_passports_id_fk" FOREIGN KEY ("passport_id") REFERENCES "public"."provenance_passports"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "styling_boards" ADD CONSTRAINT "styling_boards_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "styling_boards" ADD CONSTRAINT "styling_boards_created_by_admin_id_admins_id_fk" FOREIGN KEY ("created_by_admin_id") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "styling_boards" ADD CONSTRAINT "styling_boards_cover_media_id_media_assets_id_fk" FOREIGN KEY ("cover_media_id") REFERENCES "public"."media_assets"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "trade_ins" ADD CONSTRAINT "trade_ins_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "trade_ins" ADD CONSTRAINT "trade_ins_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "trade_ins" ADD CONSTRAINT "trade_ins_passport_id_provenance_passports_id_fk" FOREIGN KEY ("passport_id") REFERENCES "public"."provenance_passports"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "trade_ins" ADD CONSTRAINT "trade_ins_credit_applied_to_order_id_orders_id_fk" FOREIGN KEY ("credit_applied_to_order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "trade_ins" ADD CONSTRAINT "trade_ins_reviewed_by_admins_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "ugc_rewards" ADD CONSTRAINT "ugc_rewards_content_id_user_content_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."user_content"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "ugc_rewards" ADD CONSTRAINT "ugc_rewards_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_content" ADD CONSTRAINT "user_content_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_content" ADD CONSTRAINT "user_content_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_content" ADD CONSTRAINT "user_content_media_id_media_assets_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media_assets"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_content" ADD CONSTRAINT "user_content_moderated_by_admins_id_fk" FOREIGN KEY ("moderated_by") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "waitlists" ADD CONSTRAINT "waitlists_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "waitlists" ADD CONSTRAINT "waitlists_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_product_id_categories_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ========================================
-- UNIQUE INDEXES
-- ========================================

CREATE UNIQUE INDEX IF NOT EXISTS "artisan_sessions_token_unique" ON "artisan_sessions" USING btree ("token");
CREATE UNIQUE INDEX IF NOT EXISTS "artisans_email_unique" ON "artisans" USING btree ("email");
CREATE UNIQUE INDEX IF NOT EXISTS "artisans_slug_unique" ON "artisans" USING btree ("slug");
