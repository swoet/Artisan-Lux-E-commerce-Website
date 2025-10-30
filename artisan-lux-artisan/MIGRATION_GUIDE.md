# Database Migration Guide

## What Changed?

The artisan portal now has its own separate custom orders tables:
- `artisan_custom_orders` (instead of shared `custom_orders`)
- `artisan_custom_order_messages`
- `artisan_production_stages`

This separation allows the artisan portal and main e-commerce site to operate independently without conflicts.

## Running the Migration

### Option 1: Using Vercel Postgres Dashboard
1. Go to your Vercel project dashboard
2. Navigate to Storage → Your Postgres database
3. Click on "Query" tab
4. Copy and paste the contents of `migrations/001_create_artisan_custom_orders.sql`
5. Click "Run Query"

### Option 2: Using psql Command Line
```bash
# Set your database URL (get from Vercel/environment)
export DATABASE_URL="your_postgres_connection_string"

# Run the migration
psql $DATABASE_URL -f migrations/001_create_artisan_custom_orders.sql
```

### Option 3: Using Node.js Script
Create a file `run-migration.js`:
```javascript
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  const sql = fs.readFileSync(
    path.join(__dirname, 'migrations/001_create_artisan_custom_orders.sql'),
    'utf8'
  );
  
  try {
    await pool.query(sql);
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await pool.end();
  }
}

runMigration();
```

Then run: `node run-migration.js`

## Verifying the Migration

After running the migration, verify the tables were created:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'artisan_%';

-- Expected output:
-- artisan_custom_orders
-- artisan_custom_order_messages
-- artisan_production_stages
```

## Next Steps

After the migration:
1. Deploy the updated code to Netlify
2. Test the custom orders functionality in the artisan portal
3. Products created in the portal will still sync to the main site via the shared `products` table
