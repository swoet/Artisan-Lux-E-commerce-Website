/**
 * Migration script to add email verification fields to artisans table
 * Run with: npx tsx scripts/migrate-artisan-fields.ts
 */

import { db } from "../src/db";
import { sql } from "drizzle-orm";

async function migrate() {
  console.log("🔄 Starting migration...");

  try {
    // Add email_verified column
    console.log("Adding email_verified column...");
    await db.execute(sql`
      ALTER TABLE artisans
      ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE NOT NULL
    `);

    // Add verification_code column
    console.log("Adding verification_code column...");
    await db.execute(sql`
      ALTER TABLE artisans
      ADD COLUMN IF NOT EXISTS verification_code VARCHAR(6)
    `);

    // Add verification_code_expires_at column
    console.log("Adding verification_code_expires_at column...");
    await db.execute(sql`
      ALTER TABLE artisans
      ADD COLUMN IF NOT EXISTS verification_code_expires_at TIMESTAMP
    `);

    // Update existing artisans to have verified emails
    console.log("Updating existing artisans...");
    await db.execute(sql`
      UPDATE artisans
      SET email_verified = TRUE
      WHERE email_verified IS NULL OR email_verified = FALSE
    `);

    console.log("✅ Migration completed successfully!");
    console.log("\nNew columns added:");
    console.log("  - email_verified (BOOLEAN)");
    console.log("  - verification_code (VARCHAR(6))");
    console.log("  - verification_code_expires_at (TIMESTAMP)");
    console.log("\nExisting artisans marked as email verified.");

  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }

  process.exit(0);
}

migrate();
