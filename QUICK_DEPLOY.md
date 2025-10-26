# ⚡ Quick Deploy Commands

## Push to Git (Both Apps)

```bash
# Navigate to root
cd "d:\Phethan Marketing"

# Admin Dashboard
cd artisan-lux-admin
git add .
git commit -m "Add artisan portal management and approval system"
git push origin main

# Artisan Portal
cd ../artisan-lux-artisan
git add .
git commit -m "Initial artisan portal with registration and email verification"
git push origin main
```

---

## Deploy Admin Dashboard (Vercel)

**If connected to Git:**
- Vercel will auto-deploy when you push to GitHub

**Manual deploy:**
```bash
cd artisan-lux-admin
vercel --prod
```

---

## Deploy Artisan Portal (Netlify)

### Option 1: Netlify CLI (Fastest)

```bash
cd artisan-lux-artisan

# First time setup
netlify init

# Deploy
netlify deploy --prod --dir=.next
```

### Option 2: Git Auto-Deploy

1. Push to GitHub (see above)
2. Go to https://app.netlify.com
3. Click "Add new site" → "Import from Git"
4. Select your repository
5. Configure:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
6. Add environment variables (see below)
7. Deploy!

---

## Environment Variables for Netlify

Add these in **Netlify Dashboard** → **Site settings** → **Environment variables**:

```
DATABASE_URL=postgres://default:xxxxx@xxxxx.postgres.vercel-storage.com/verceldb
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_ADMIN_URL=https://admin.yourdomain.com
NEXT_PUBLIC_ARTISAN_URL=https://artisan.yourdomain.com
RESEND_API_KEY=re_xxxxx
CLOUDINARY_CLOUD_NAME=xxxxx
CLOUDINARY_API_KEY=xxxxx
CLOUDINARY_API_SECRET=xxxxx
```

---

## Custom Domain Setup

### For Artisan Portal on Netlify:

1. Go to **Domain settings** in Netlify
2. Click **Add custom domain**
3. Enter: `artisan.yourdomain.com`
4. Follow DNS instructions
5. Wait for SSL certificate (automatic)

---

## Test After Deployment

### Admin Dashboard:
```
https://admin.yourdomain.com/dashboard/artisan-portal
```

### Artisan Portal:
```
https://artisan.yourdomain.com/register
https://artisan.yourdomain.com/login
```

---

## 🎉 Done!

Your three-tier luxury marketplace is now live:

1. ✅ Customer Site (Netlify)
2. ✅ Admin Dashboard (Vercel)
3. ✅ Artisan Portal (Netlify)
