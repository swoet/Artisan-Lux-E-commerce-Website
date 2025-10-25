const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
function loadEnv() {
  try {
    const envPath = path.join(__dirname, '../.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    for (const line of lines) {
      const match = line.match(/^DATABASE_URL=(.+)$/);
      if (match) {
        return match[1].trim().replace(/^["']|["']$/g, '');
      }
    }
  } catch (err) {
    // Try .env if .env.local doesn't exist
    try {
      const envPath = path.join(__dirname, '../.env');
      const envContent = fs.readFileSync(envPath, 'utf8');
      const lines = envContent.split('\n');
      for (const line of lines) {
        const match = line.match(/^DATABASE_URL=(.+)$/);
        if (match) {
          return match[1].trim().replace(/^["']|["']$/g, '');
        }
      }
    } catch {}
  }
  return null;
}

async function migrate() {
  const connectionString = loadEnv();
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL not found in .env.local or .env');
    console.log('Please set DATABASE_URL in your .env.local file');
    process.exit(1);
  }

  console.log('🔄 Connecting to database...');
  const pool = new Pool({ connectionString });

  const sql = fs.readFileSync(
    path.join(__dirname, 'add-cart-tables.sql'), 
    'utf8'
  );

  try {
    await pool.query(sql);
    console.log('✅ Cart and order tables created successfully!');
    console.log('📦 Tables created: carts, cart_items, orders, order_items, payments');
  } catch (err) {
    console.error('❌ Migration error:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
