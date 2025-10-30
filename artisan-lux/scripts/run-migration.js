/**
 * Run the Phase 2 & 3 migration script on production database
 * This script reads the SQL file and executes it against the production database
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  // Check for DATABASE_URL environment variable
  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL environment variable is not set');
    console.error('Please set your production database URL:');
    console.error('  export DATABASE_URL="postgresql://user:password@host:port/database"');
    process.exit(1);
  }

  console.log('🔄 Connecting to production database...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost') ? false : {
      rejectUnauthorized: false
    }
  });

  try {
    // Test connection
    const client = await pool.connect();
    console.log('✅ Connected to database successfully');

    // Read the migration SQL file
    const sqlPath = path.join(__dirname, 'migrate-phase-2-3.sql');
    console.log(`📄 Reading migration file: ${sqlPath}`);
    
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('🚀 Executing migration...');
    console.log('---');
    
    // Execute the migration
    const result = await client.query(sql);
    
    console.log('---');
    console.log('✅ Migration completed successfully!');
    
    // Show the success message from the SQL
    if (result.rows && result.rows.length > 0) {
      console.log(`📊 Result: ${result.rows[0].status}`);
    }

    // Verify the column was added
    console.log('\n🔍 Verifying model3d_asset_id column...');
    const verifyResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'products' AND column_name = 'model3d_asset_id'
    `);

    if (verifyResult.rows.length > 0) {
      console.log('✅ Column model3d_asset_id exists in products table');
      console.log(`   Type: ${verifyResult.rows[0].data_type}`);
    } else {
      console.log('⚠️  Warning: Column model3d_asset_id not found');
    }

    client.release();
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.detail) {
      console.error('Details:', error.detail);
    }
    process.exit(1);
  } finally {
    await pool.end();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the migration
runMigration().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
