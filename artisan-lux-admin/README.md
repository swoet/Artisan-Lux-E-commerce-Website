This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

Added in this fork:
- Shared theme tokens at `src/theme/tokens.css` (import into storefront for unified theming)
- Admin auth with sessions and superadmin seeding via env
- Users and Analytics (map) pages, public register/login endpoints
- Lightweight analytics script at `public/analytics.js`
- Stripe checkout endpoint (optional)

Env (.env):
- DATABASE_URL=postgres://...
- SEED_ADMIN_EMAIL=you@example.com
- SEED_ADMIN_PASSWORD=strong-password
- STRIPE_SECRET_KEY=sk_test_...
- NEXT_PUBLIC_ADMIN_ORIGIN=http://localhost:3001
- NEXT_PUBLIC_SITE_ORIGIN=http://localhost:3000

To create the super admin: set SEED_* vars, then login once at /login.
To track page views on any site: include `<script src="http://localhost:3001/analytics.js" async></script>`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
