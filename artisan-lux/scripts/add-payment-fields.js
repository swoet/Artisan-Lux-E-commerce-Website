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
    path.join(__dirname, '../drizzle/0004_pale_lockjaw.sql'), 
    'utf8'
  );

  try {
    await pool.query(sql);
    console.log('✓ Payment proof fields added to orders table');
  } catch (err) {
    if (err.message.includes('already exists')) {
      console.log('✓ Payment fields already exist');
    } else {
      console.error('Migration error:', err.message);
      process.exit(1);
    }
  } finally {
    await pool.end();
  }
}

migrate();
