# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Overview
- Three independent Next.js apps share one PostgreSQL database (via Drizzle ORM):
  - artisan-lux (Customer site, port 3000)
  - artisan-lux-admin (Admin dashboard, port 3001)
  - artisan-lux-artisan (Artisan portal, port 3002)
- No root workspace; operate inside each app directory. See README.md for full product docs; use the commands below for day-to-day dev.

## Common commands

### artisan-lux (Customer site)
- Install: `cd artisan-lux && npm install`
- Dev: `npm run dev`
- Build/Start: `npm run build && npm run start`
- Lint/Typecheck: `npm run lint` • `npm run typecheck`
- Drizzle (DB): `npm run db:generate` • `npm run db:push` • `npm run db:studio`

### artisan-lux-admin (Admin dashboard)
- Install: `cd artisan-lux-admin && npm install`
- Dev: `npm run dev` (turbopack, :3001)
- Build/Start: `npm run build && npm run start`
- Lint/Typecheck: `npm run lint` • `npm run typecheck`
- Drizzle (DB): `npm run db:generate` • `npm run db:push` • `npm run db:studio`
- Migrations util: `npm run migrate:artisan`
- Scripted checks (run individually; useful as “single tests”):
  - Env check: `node scripts/check-env.js`
  - DB check: `npx tsx scripts/check-db.ts`
  - Resend email: `npx tsx scripts/test-email.ts you@example.com`
  - Full verification flow: `npx tsx scripts/test-full-flow.ts you@example.com`
  - Algolia connectivity: `node scripts/test-algolia.js`

### artisan-lux-artisan (Artisan portal)
- Install: `cd artisan-lux-artisan && npm install`
- Dev: `npm run dev` (:3002)
- Build/Start: `npm run build && npm run start`
- Lint/Typecheck: `npm run lint` • `npm run typecheck`
- Drizzle (DB): `npm run db:generate` • `npm run db:push` • `npm run db:studio`

### Run all apps locally
Open 3 terminals and run, respectively:
- `cd artisan-lux && npm run dev`
- `cd artisan-lux-admin && npm run dev`
- `cd artisan-lux-artisan && npm run dev`

## Environment
Create `.env.local` in each app. Critical keys (app-specific):
- Shared: `DATABASE_URL`
- Site/Admin revalidation: `REVALIDATE_TOKEN` (same value in site and admin)
- URLs: `NEXT_PUBLIC_SITE_URL|ORIGIN`, `NEXT_PUBLIC_ADMIN_URL|ORIGIN`, `NEXT_PUBLIC_ARTISAN_URL`
- Email (Resend): `RESEND_API_KEY`
- Search (Admin): `NEXT_PUBLIC_ALGOLIA_APP_ID`, `ALGOLIA_ADMIN_KEY`
- Media (Admin/Artisan): `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
See README.md and QUICK_DEPLOY.md for full examples.

## Architecture (big picture)
- Next.js App Router across all apps; TypeScript, ESLint flat config per app.
- Database: Drizzle ORM with per-app schemas under `src/db/schema.ts`; single Postgres instance shared by all apps. Use `db:push` to apply schema.
- ISR/Live content:
  - Admin triggers remote revalidation of the site via `src/lib/revalidate.ts` (fetches site `/api/revalidate` with `REVALIDATE_TOKEN`).
  - Site endpoint `src/app/api/revalidate/route.ts` revalidates tags/paths and bumps a live version via `src/lib/version.ts`.
  - Site UI auto-refresh uses `src/components/site/LiveCatalogRefresh.tsx` polling `/api/catalog-version`.
  - Common cache tags in `src/lib/cache-tags.ts` (site and admin).
- Email: Resend integration for transactional emails (e.g., site `src/lib/email.ts`) and admin verification/testing scripts.
- Search: Admin provides Algolia indexing endpoints/scripts; site consumes Algolia for instant search.
- Media: Cloudinary SDK used in admin/artisan libs for uploads.
- Payments: Customer site implements manual payments with proof uploads; admin reviews/updates order status. Details in `artisan-lux/PAYMENT_SETUP.md`.

## Database operations
- Generate/Push migrations per app with Drizzle (see commands above).
- Inspect data: `npm run db:studio` inside the target app.

## Linting/Typechecking
Run per app: `npm run lint` and `npm run typecheck`. Admin and Artisan lint only `src/` (and admin includes `public/analytics.js`).

## Deployment (summary)
- Admin (Vercel): `cd artisan-lux-admin && vercel --prod` (or push to GitHub for auto-deploy).
- Artisan portal (Netlify): `cd artisan-lux-artisan && npm run build && netlify deploy --prod --dir=.next`.
- Customer site supports Netlify/Vercel; see project configs and QUICK_DEPLOY.md.
- Ensure environment variables are set in hosting dashboards (see QUICK_DEPLOY.md, DEPLOY_UPDATES.md).

## Pointers to important docs
- Top-level `README.md`: overall system, ports, setup, and architecture diagrams.
- `QUICK_DEPLOY.md`, `DEPLOY_UPDATES.md`: deploy commands, environment, and checklists.
- `artisan-lux/PAYMENT_SETUP.md`: manual payments flow and admin review.
