# Product Requirements Document (PRD) — Artisan Lux E-commerce Platform

## 1. Project Vision & Goals
- Vision: Create the premier online destination for luxury artisan goods, delivering an immersive, elegant, and performance-first shopping experience that mirrors the craftsmanship of the products.
- Primary goals:
  - Aesthetic excellence: elevated visual identity, high-end motion/3D craft, flawless polish.
  - Curatorial agility: admin changes reflect on the live site instantly via on-demand ISR (`revalidateTag`).
  - Performance and SEO: fast, discoverable, Core Web Vitals AA targets even with rich visuals.
  - Accessibility by design: WCAG 2.1 AA with respectful motion and robust keyboard navigation.
  - Scalability: modular architecture supporting future cart/checkout, inventory, multi-currency, and localization.

## 2. Success Metrics (MVP)
- Experience/Brand: ≥80% of pages meet CWV thresholds (LCP ≤2.5s, CLS ≤0.1, INP ≤200ms). Avg. time-on-site > 2.5 min.
- Engagement: ≥35% scroll depth >75% on landing and category pages; ≥25% interaction with 3D/animation elements.
- Operational: Admin “edit → live” propagation ≤5s; CRUD success rate ≥99.9%; median product creation time ≤4 min.
- SEO: Indexed pages within 72h of launch; organic CTR within category benchmarks.
- Reliability: >99.9% uptime (app + DB) during business hours; error rate <0.5% of requests.

## 3. Scope
- In scope (MVP):
  - Two frontends/route groups: user "/" and admin "/admin".
  - Admin auth and content management for categories, subcategories, products, media assets.
  - Instant user-facing updates via `revalidateTag` strategy.
  - User browsing: home/hero, category listing, product listing grid, product detail page.
  - High-end animations: Rotating Parallax, Exploding Composition, Build-Up Category Reveal, Text Mask Brand Story with reduced-motion fallbacks.
- Out of scope (MVP; future): cart/checkout/payments, user accounts, wishlists, inventory tracking, multi-language/currency, search with semantic/ranking (may include basic keyword filter), reviews/UGC.

## 4. User Personas
- The Shopper (User)
  - Goals: Discover unique luxury goods, appreciate craftsmanship via visuals/3D, browse seamlessly across devices, quickly evaluate details (materials, dimensions).
  - Frictions: Heavy sites that stutter; confusing navigation; gimmicky animations without value.
  - Success: Feels the brand’s craft; confidently explores products; engages with motion/3D; shares or inquires.
- The Curator (Admin)
  - Goals: Quickly publish and organize content; maintain brand quality; preview before publish.
  - Frictions: Slow content propagation; clunky asset handling; inconsistent formatting; fragile SEO fields.
  - Success: Adds/edits content in minutes; sees live updates instantly; maintains consistent taxonomy.

## 5. Key User Journeys
- Shopper: Landing → Category → Product Listing (filters/sorts) → PDP (3D, materials, gallery) → Share/inquire (future: add to cart).
- Curator: Login → Dashboard → Create category/subcategory → Create product (copy, price, images, 3D) → Publish → Live verifies within seconds.

## 6. Information Architecture
- User routes:
  - "/" (Home/hero showcase)
  - "/categories" (overview) → "/category/[slug]"
  - "/product/[slug]"
  - "/brand-story", "/craftsmanship", "/contact" (optional MVP)
  - "/sitemap.xml", "/robots.txt", "/api/og" (social cards)
- Admin routes:
  - "/admin/login"
  - "/admin/dashboard"
  - "/admin/categories", "/admin/categories/[id]"
  - "/admin/products", "/admin/products/[id]"
  - "/admin/assets"
  - "/admin/settings"
  - "/admin/preview/[type]/[id]"

## 7. Core Feature List (User Stories & Acceptance Criteria)
- Admin
  - Secure login to admin dashboard
    - AC: Email+password auth with hashed credentials; optional passkeys/2FA (future); RBAC (Admin role).
    - AC: Sessions stored securely (HttpOnly cookies); brute-force rate-limiting; CSRF protection.
  - Manage categories/subcategories (CRUD)
    - AC: Name, slug (unique), description, hero media, order index; nested subcategories; draft/published status.
    - AC: Reordering via drag-and-drop; validation on duplicate slugs; auto-generated slug with manual override.
    - AC: Publishing triggers `revalidateTag` for category and relevant listing pages.
  - Manage products (CRUD)
    - AC: Fields: title, slug, subtitle, description (rich text), materials, price (numeric + currency), category/subcategory, tags, SEO fields (title, meta, canonical), status (draft/published), sort index, highlight flags.
    - Media: multiple images (cover, gallery), 3D model (glTF/GLB with Draco), poster image/video.
    - AC: Uploads with progress, server-side validation, automatic image optimization.
    - AC: Publish/unpublish and instant revalidation (product, category, home featured).
  - Changes reflected instantly on user site
    - AC: Admin mutations call `revalidateTag` for: "home", "categories", `category:[slug]`, `product:[slug]`, "featured", "search:index".
    - Target propagation ≤5s; admin sees success toast and “View live” link.
- User
  - Browse by categories/subcategories
    - AC: SEO-friendly category pages with banner, curated description, featured carousel, product grid, filters (category/subcategory; future: material/price).
    - AC: Pagination or infinite scroll with consistent performance.
  - Product listing and detail pages
    - AC: Listing grid with hover micro-interactions; PDP with gallery (zoom/pan), materials, dimensions/specs, related items.
    - AC: 3D viewer with orbit controls; fallback static hero image for reduced motion or unsupported devices.
  - Future: Cart/Checkout
    - Placeholder CTA (e.g., “Inquire” or “Join waitlist”); capture email intent.

## 8. Content & Data Model (initial)
- Category
  - id, name, slug (unique), description, heroMediaId, parentCategoryId (nullable), order, status (draft/published), seoTitle, seoDescription, createdAt, updatedAt.
- Product
  - id, title, slug (unique), subtitle, descriptionRich, materials [string], priceDecimal, currency, categoryId, subcategoryId, tags [string], status, isFeatured, order, SEO fields, assets: images [Media], model3D MediaId (nullable), createdAt, updatedAt.
- MediaAsset
  - id, type (image|video|model3d), url, width, height, filesize, format, variants (generated), altText/caption, dominantColor, createdAt.
- Audit
  - Revision/version history (adminId, timestamp, diff summary).
- Notes
  - Slugs immutable post-publish unless redirect created; status supports draft → published; soft-deletes with recovery.

## 9. Proposed Technology Stack
- Framework: Next.js 14+ (App Router, React Server Components)
- Language: TypeScript
- Styling: Tailwind CSS with custom tokens; CSS variables for themes.
- Animation: GSAP + ScrollTrigger; micro-interactions with GSAP timelines; requestAnimationFrame orchestration.
- 3D: Three.js + React Three Fiber (@react-three/fiber, @react-three/drei); glTF/GLB with Draco compression; KTX2 for textures.
- Backend API: Next.js Route Handlers (app/api/*), RSC data fetching with fetch cache tags.
- Database: PostgreSQL (Vercel Postgres or Supabase).
- ORM: Prisma or Drizzle ORM (recommend Drizzle for lightweight schema + SQL clarity).
- File storage: Supabase Storage or S3-compatible (image/model uploads).
- Data revalidation: Next.js on-demand ISR (`revalidateTag`).
- Image optimization: next/image + remote patterns; optional Cloudinary for transforms.
- Auth: NextAuth.js (credentials/provider), passkeys (future).
- Analytics/Monitoring: GA4 or Plausible; Sentry/Logtail for errors/logs.
- Deployment: Vercel; DB managed service; Edge CDN for static/media where applicable.

## 10. Caching & Revalidation Strategy
- Fetch tags: "home", "categories", `category:[slug]`, `product:[slug]`, "featured", "search:index`".
- On admin mutations:
  - Category CRUD → revalidate "categories", `category:[slug]`, and "home/featured" if flagged.
  - Product CRUD → revalidate `product:[slug]`, `category:[categorySlug]`, "featured", "home".
- TTL: default 0 for ISR with tags; rely on tag invalidation for freshness.
- Preview mode: bypass cache with draft content for admin preview routes.

## 11. Admin UX Requirements
- Dashboard: recent edits, quick links, pending drafts.
- Tables: sortable columns, search, filters (status/category).
- Forms: sectioned layout, inline validation, auto-save drafts.
- Media manager: drag-and-drop uploads, crop/resize presets, alt text required, 3D file validation (max size, triangle count).
- Publishing workflow: draft → preview → publish; publish confirmation with affected pages list.

## 12. Animations & 3D Requirements
- Rotating Parallax Product Showcase (hero)
  - R3F scene: central model; GSAP-driven camera dolly/zoom on scroll; parallax background layers; max GPU frame budget ~8ms on mid-tier devices.
  - Fallback: static hero with subtle CSS parallax; respects prefers-reduced-motion.
- “Exploding” Product Composition (PDP)
  - R3F group parts with named nodes; GSAP timeline to translate/rotate components outward; scrubbed to scroll.
  - Fallback: step-based image sequence with reduced frames; disable on low-power.
- “Build-Up” Category Reveal
  - Clip-path reveal of banner on scroll; GPU-accelerated transforms; avoids layout thrash; throttle to RAF.
- “Text Mask” Brand Story
  - Large serif text masking background video/image; mix-blend-mode with careful contrast; letter-spacing animation on scroll.
- General
  - Pause offscreen; IntersectionObserver gating; memory cap for textures; KTX2 + Draco; device capability detection.
  - Accessibility: reduced-motion disables timelines; alt text/captions; keyboard-traversable content.

## 13. Accessibility
- WCAG 2.1 AA: color contrast ≥4.5:1; focus visible; semantic landmarks; headings hierarchy.
- Keyboard support: all interactive elements; skip links; trap focus in modals.
- Motion: respect prefers-reduced-motion; provide toggles; avoid parallax on reduced motion.
- Images/3D: required alt text or aria-hidden for decorative; captions/transcripts for videos.

## 14. SEO & Social
- Structured data: BreadcrumbList; Product (name, description, brand, images, offers if applicable); Organization.
- Metadata: per-page dynamic title/description; canonical; OG/Twitter images; JSON-LD.
- Sitemaps: dynamic; robots.txt; clean URLs with slugs; 301 on slug changes.
- Performance: prefetch critical routes; code-split 3D scenes; lazy-load below-the-fold assets.

## 15. Security & Compliance
- Auth: salted hashing (bcrypt/argon2), session rotation, short session TTL; 2FA/passkeys (future).
- CSRF protection for mutations; rate limiting on login/api; input validation with zod.
- RBAC: Admin role only in MVP; audit log of changes.
- Secrets: environment variables; no secrets in client bundles.
- Data protection: backups daily; retention ≥14 days.

## 16. Performance & Reliability Targets
- CWV: LCP ≤2.5s (p75), CLS ≤0.1, INP ≤200ms; TTFB at edge ≤200ms for cached pages.
- Images: ≤200KB hero poster on mobile; WebP/AVIF; responsive sizes; lazy-loading.
- 3D: initial geometry ≤2MB gz; texture budget ≤4MB; shader complexity minimal.
- Error handling: graceful fallbacks; error boundaries; retry with backoff for media loads.

## 17. Environments & DevOps
- Envs: Development, Staging (preview), Production.
- CI: typecheck, lint, unit/integration tests, build, Lighthouse CI threshold gates.
- Schema migrations: Prisma/Drizzle migrations with rollback; seeded fixtures on staging.
- Observability: Sentry for FE/BE; DB monitoring; 95th percentile latency dashboards.

## 18. Testing & QA
- Unit: utils, model validation (zod), UI components (critical).
- Integration: route handlers (CRUD + auth + revalidation).
- E2E: Playwright flows (browse categories, PDP load, admin CRUD + live reflection).
- Performance: scripted Lighthouse checks on key pages (mobile + desktop).
- Accessibility: axe-core CI; manual screen reader checks on core flows.
- Visual regression: key pages and admin forms.

## 19. Design System & Visual Identity
- Theme: Luxury artisan.
- Colors: Primary dark wood (#2a1a10); metallic gradient accent (#b87333 → #cd7f32); warm neutrals for backgrounds.
- Typography: Headings — elegant serif (Playfair Display/Cormorant Garamond). Body — clean sans (Inter/Lato).
- UI elements: subtle embossed shadows, refined radii, micro-gloss highlights on buttons; tactile hover states.
- Components: Buttons (primary/secondary/ghost), Cards, Banners, Nav, Breadcrumbs, Tables, Forms, Modals, Media viewer, 3D viewer frame.
- Tokenization: spacing, radii, shadows, typography scales as CSS variables; dark vs deep theme variants.

## 20. Analytics & Events (MVP)
- Page views; scroll depth quartiles; 3D viewer interactions (open, rotate, zoom time).
- Product engagement: gallery interactions; time on PDP; CTA clicks.
- Admin ops: publish events, time-to-live update.

## 21. Rollout Plan
- Week 1: IA, schema, design tokens, admin scaffolding, category CRUD with revalidation.
- Week 2: product CRUD, media pipeline, basic user routes (home, category, PDP).
- Week 3: animations v1 (hero + category reveal), 3D viewer, SEO/meta, accessibility pass.
- Week 4: polish, QA/E2E, performance tuning, content load, staging sign-off, production launch.
- Content migration window: 2–3 days for initial catalog.

## 22. Risks & Mitigations
- Heavy assets degrade performance → asset budgets, compression (Draco/KTX2), adaptive/fallbacks.
- Revalidation delays on cold edges → warm critical pages post-publish; tag strategy validated; monitor ISR logs.
- SEO vs heavy animations → server-rendered content first, progressive enhancement, ensure crawlable DOM.
- Admin UX complexity → iterations with quick feedback; templates for SEO/media; guardrails in forms.

## 23. Open Questions
- Payment/checkout provider preference for future (Stripe, Adyen)?
- DAM strategy: stick to Supabase/S3 or integrate Cloudinary for transforms?
- Search requirements (basic vs semantic, synonyms, brand filters)?
- Internationalization and multi-currency roadmap?
- Legal: privacy policy, cookie consent, font licensing.
- 3D asset pipeline ownership and source files (CAD -> glTF), who prepares and compresses?

## 24. Acceptance Criteria Summary (MVP)
- Admin can login and perform category/product CRUD; publishing updates reflect on user site ≤5s via `revalidateTag`.
- User can browse categories/subcategories, view product listings and PDPs with optimized media and a working 3D viewer.
- Implement four named animation patterns with reduced-motion fallbacks and no CWV regressions beyond targets.
- Site passes baseline SEO (meta, structured data), accessibility (WCAG AA checks), and performance budgets on key pages.
- CI pipeline green on lint/typecheck/tests; staging sign-off completed with production parity.

## 25. Future Roadmap (Post-MVP)
- Cart/checkout, inventory, orders, customer accounts.
- Advanced search and merchandising; collections and editorial stories.
- Localization, multi-currency, tax/VAT.
- Live curation: real-time previews (WebSockets) alongside `revalidateTag` for admin.
- Editorial CMS blocks and page builder.
- 3D enhancements: AR previews, materials configurator.
