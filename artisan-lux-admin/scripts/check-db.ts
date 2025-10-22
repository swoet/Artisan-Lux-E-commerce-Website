import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function checkDatabase() {
  console.log("\n🔍 Checking Database Connection\n");
  console.log("=".repeat(60));
  
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error("❌ DATABASE_URL is not set!");
    process.exit(1);
  }
  
  console.log("✅ DATABASE_URL is set");
  console.log(`📊 Connecting to database...\n`);
  
  const pool = new Pool({ connectionString });
  
  try {
    // Test connection
    const client = await pool.connect();
    console.log("✅ Database connection successful!\n");
    
    // Check if verification_codes table exists
    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'verification_codes'
      );
    `);
    
    const tableExists = result.rows[0].exists;
    console.log(`verification_codes table: ${tableExists ? "✅ EXISTS" : "❌ DOES NOT EXIST"}\n`);
    
    if (!tableExists) {
      console.log("❌ The verification_codes table is missing!");
      console.log("\n🔧 To fix this, run:");
      console.log("   npm run db:push\n");
    } else {
      // Count records
      const countResult = await client.query("SELECT COUNT(*) FROM verification_codes");
      console.log(`📊 Records in verification_codes: ${countResult.rows[0].count}\n`);
    }
    
    // List all tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log("📋 All tables in database:");
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    client.release();
    await pool.end();
    
    console.log("\n" + "=".repeat(60) + "\n");
    
  } catch (error) {
    console.error("\n❌ Database error:");
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    }
    await pool.end();
    process.exit(1);
  }
}

checkDatabase();
