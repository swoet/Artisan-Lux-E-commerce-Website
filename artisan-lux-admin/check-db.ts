import { sql } from "drizzle-orm";
import { db } from "./src/db/index";

async function checkTables() {
  try {
    console.log("Checking database tables...");
    console.log("DATABASE_URL:", process.env.DATABASE_URL?.substring(0, 50) + "...");
    
    const result = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log("\n✅ Tables in database:");
    result.rows.forEach((row: any) => {
      console.log(`  - ${row.table_name}`);
    });
    
    console.log(`\nTotal tables: ${result.rows.length}`);
  } catch (error) {
    console.error("❌ Error:", error);
  }
  process.exit(0);
}

checkTables();
