# Artisan Lux - Artisan Portal

**Port:** 3002

## Overview

The Artisan Portal is where creators manage their products, view orders, update production stages, and interact with customers. This is the third application in the Artisan Lux ecosystem.

## Features

- **Product Management** - Create and manage products with provenance passports
- **Order Dashboard** - View and fulfill custom orders
- **Production Timeline** - Update production stages with photos and notes
- **Sales Analytics** - Track sales, commissions, and performance
- **Profile Management** - Update studio info, bio, and portfolio
- **Customer Communication** - Respond to custom order requests
- **Inventory Sync** - Manage stock levels (synced with admin)

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Copy `.env.example` to `.env.local` and fill in your credentials.

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Access the portal:**
   Open [http://localhost:3002](http://localhost:3002)

## Architecture

- **Framework:** Next.js 15.5.6 (App Router)
- **Database:** Shared PostgreSQL with main site and admin
- **Authentication:** bcryptjs + session tokens
- **Media:** Cloudinary integration
- **Email:** Resend for notifications

## Key Routes

- `/` - Dashboard home
- `/login` - Artisan authentication
- `/products` - Product management
- `/orders` - Order fulfillment
- `/custom-orders` - Custom order requests
- `/analytics` - Sales & performance
- `/profile` - Profile settings
