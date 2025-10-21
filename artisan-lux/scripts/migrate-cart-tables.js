const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function migrate() {
  const pool = new Pool({ 
    host: 'localhost',
    port: 5432,
    database: 'artisan_lux',
    user: 'shawn',
    password: 'Shawn@2202'
  });

  const sql = fs.readFileSync(
    path.join(__dirname, 'add-cart-tables.sql'), 
    'utf8'
  );

  try {
    await pool.query(sql);
    console.log('✓ Cart and order tables created successfully');
  } catch (err) {
    console.error('Migration error:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
