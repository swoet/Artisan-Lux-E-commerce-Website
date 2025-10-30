# Database Migration Guide

## Running the Phase 2 & 3 Migration on Production

This migration adds the following to your production database:
- `wishlists` table
- `wishlist_items` table
- `inventory` table
- `inventory_history` table
- `model3d_asset_id` column to the `products` table

### Prerequisites

1. You need your production database connection string
2. Node.js and npm installed locally

### Steps to Run Migration

#### Option 1: Using npm script (Recommended)

```bash
# Set your production database URL
export DATABASE_URL="your-production-database-url"

# Run the migration
npm run db:migrate
```

#### Option 2: Direct execution

```bash
# Set your production database URL
export DATABASE_URL="your-production-database-url"

# Run the migration script directly
node scripts/run-migration.js
```

### For Windows PowerShell

```powershell
# Set environment variable
$env:DATABASE_URL="your-production-database-url"

# Run the migration
npm run db:migrate
```

### For Windows Command Prompt

```cmd
# Set environment variable
set DATABASE_URL=your-production-database-url

# Run the migration
npm run db:migrate
```

### Getting Your Production Database URL

Your production database URL should be in one of these formats:

**Vercel Postgres:**
```
postgres://default:password@host.postgres.vercel-storage.com:5432/verceldb
```

**Neon:**
```
postgresql://user:password@host.neon.tech/dbname
```

**Supabase:**
```
postgresql://postgres:password@db.project.supabase.co:5432/postgres
```

You can find this in:
- Netlify: Site settings → Environment variables → `DATABASE_URL`
- Vercel: Project settings → Environment Variables → `DATABASE_URL`
- Your database provider's dashboard

### What the Migration Does

1. Creates new tables with `IF NOT EXISTS` (safe to run multiple times)
2. Adds `model3d_asset_id` column to products table if it doesn't exist
3. Verifies the column was added successfully

### After Migration

Once the migration is complete:

1. The production errors related to `model3d_asset_id` will be resolved
2. You can uncomment the `model3dAssetId` references in your code:
   - `src/components/site/ArtisanProductBadge.tsx`
   - `src/app/(site)/artisan/[slug]/page.tsx`

### Troubleshooting

**Error: DATABASE_URL not set**
- Make sure you've exported the environment variable in your terminal

**Connection timeout**
- Check your database URL is correct
- Ensure your IP is whitelisted in your database provider's settings

**Permission denied**
- Ensure your database user has permission to create tables and alter schemas

### Safety

This migration is safe to run because:
- Uses `CREATE TABLE IF NOT EXISTS` - won't fail if tables already exist
- Uses conditional logic to add column only if it doesn't exist
- Doesn't drop or modify existing data
- Can be run multiple times without issues
