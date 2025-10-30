# Database Migrations

## Overview

The artisan portal uses **separate tables** from the main Artisan Lux e-commerce site to avoid conflicts. This allows the two systems to operate independently while sharing the same database.

## Tables Created

### Artisan Portal Specific Tables:
- `artisan_custom_orders` - Custom order requests managed by artisans
- `artisan_custom_order_messages` - Messages between artisans and customers
- `artisan_production_stages` - Production progress updates

### Shared Tables (from main site):
- `artisans` - Artisan accounts
- `customers` - Customer accounts
- `products` - Product catalog
- `product_artisans` - Links products to artisans
- `categories` - Product categories
- `media_assets` - Images and media

## Running Migrations

To apply the migrations to your database:

```bash
# Using psql
psql $DATABASE_URL -f migrations/001_create_artisan_custom_orders.sql

# Or using the Postgres client
cat migrations/001_create_artisan_custom_orders.sql | psql $DATABASE_URL
```

## Architecture Notes

- The artisan portal has its own `artisan_custom_orders` table separate from the main site's `custom_orders` table
- Products created in the artisan portal are stored in the shared `products` table and can be displayed on the main site
- Both systems use the same `artisans` and `customers` tables for authentication and user management
- This separation allows independent development and deployment of both systems
