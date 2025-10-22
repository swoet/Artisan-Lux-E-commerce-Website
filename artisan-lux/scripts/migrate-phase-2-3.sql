-- Migration script for Phase 2 & 3 features
-- Adds wishlists, wishlist_items, inventory, and inventory_history tables
-- Safe to run - does not drop any existing tables

-- Create wishlists table
CREATE TABLE IF NOT EXISTS "wishlists" (
  "id" SERIAL PRIMARY KEY,
  "session_token" VARCHAR(255) NOT NULL,
  "email" VARCHAR(160),
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create unique index on session_token
CREATE UNIQUE INDEX IF NOT EXISTS "wishlists_session_unique" ON "wishlists" ("session_token");

-- Create wishlist_items table
CREATE TABLE IF NOT EXISTS "wishlist_items" (
  "id" SERIAL PRIMARY KEY,
  "wishlist_id" INTEGER NOT NULL REFERENCES "wishlists"("id"),
  "product_id" INTEGER NOT NULL REFERENCES "products"("id"),
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create inventory table
CREATE TABLE IF NOT EXISTS "inventory" (
  "id" SERIAL PRIMARY KEY,
  "product_id" INTEGER NOT NULL REFERENCES "products"("id"),
  "quantity_in_stock" INTEGER NOT NULL DEFAULT 0,
  "low_stock_threshold" INTEGER NOT NULL DEFAULT 5,
  "last_restocked_at" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create inventory_history table
CREATE TABLE IF NOT EXISTS "inventory_history" (
  "id" SERIAL PRIMARY KEY,
  "product_id" INTEGER NOT NULL REFERENCES "products"("id"),
  "quantity_change" INTEGER NOT NULL,
  "reason" VARCHAR(50) NOT NULL,
  "notes" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Add model3d_asset_id to products if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'model3d_asset_id'
  ) THEN
    ALTER TABLE "products" ADD COLUMN "model3d_asset_id" INTEGER REFERENCES "media_assets"("id");
  END IF;
END $$;

-- Success message
SELECT 'Phase 2 & 3 migration completed successfully!' as status;
