# 🚀 Deploy Updates - Quick Guide

## 1️⃣ Deploy Admin Dashboard (Vercel)

The admin dashboard has new features and needs to be redeployed.

### Changes Made:
- ✅ Artisan Portal management page
- ✅ Artisan detail pages with approve/reject
- ✅ Database schema updates (already applied)

### Deploy to Vercel:

```bash
cd artisan-lux-admin
vercel --prod
```

**Or** push to GitHub and Vercel will auto-deploy.

---

## 2️⃣ Deploy Artisan Portal (Netlify)

This is a **brand new Next.js application** for artisans.

### Step 1: Build the App

```bash
cd artisan-lux-artisan
npm run build
```

### Step 2: Deploy to Netlify

**Option A: Netlify CLI**

```bash
# Install Netlify CLI if you haven't
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

When prompted:
- **Publish directory:** `.next`
- **Build command:** `npm run build`

**Option B: Netlify Dashboard**

1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect to your Git repository
4. Configure:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - **Framework:** Next.js

### Step 3: Set Environment Variables

In Netlify dashboard, go to **Site settings** → **Environment variables** and add:

```bash
DATABASE_URL=your_postgres_connection_string
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_ADMIN_URL=https://admin.yourdomain.com
NEXT_PUBLIC_ARTISAN_URL=https://artisan.yourdomain.com
RESEND_API_KEY=re_your_resend_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Step 4: Configure Custom Domain

1. In Netlify dashboard → **Domain settings**
2. Add custom domain: `artisan.yourdomain.com`
3. Update DNS with your domain provider

---

## 3️⃣ Verify Deployments

### Admin Dashboard:
- Visit: `https://admin.yourdomain.com`
- Check: `/dashboard/artisan-portal` page loads
- Check: `/dashboard/artisans` shows email verification column

### Artisan Portal:
- Visit: `https://artisan.yourdomain.com/register`
- Test: Register a new artisan
- Check: Email verification works
- Test: Login after approval

---

## 🎯 Deployment Checklist

### Before Deploying:

- [x] Database migration completed (`npm run db:push` in admin)
- [x] Admin dashboard tested locally
- [x] Artisan portal tested locally
- [ ] Environment variables ready
- [ ] Custom domains configured

### After Deploying:

- [ ] Admin dashboard accessible
- [ ] Artisan portal accessible
- [ ] Test artisan registration
- [ ] Test email verification
- [ ] Test admin approval workflow
- [ ] Test artisan login

---

## 🔧 Troubleshooting

### "Database connection error"
→ Check `DATABASE_URL` in environment variables

### "Email not sending"
→ Check `RESEND_API_KEY` is set correctly

### "Build failed"
→ Make sure all dependencies are in `package.json`

### "404 on routes"
→ Netlify: Make sure you're using Next.js runtime
→ Vercel: Should work automatically

---

## 📦 What Gets Deployed

### Admin Dashboard (Vercel):
- Updated artisan management
- New portal overview page
- Approve/reject functionality
- Email verification tracking

### Artisan Portal (Netlify):
- Registration system
- Email verification
- Login system
- Dashboard (for approved artisans)

---

## 🎉 Success!

Once deployed, you'll have:

1. **Customer Site** - Shopping experience (Netlify)
2. **Admin Dashboard** - Complete control (Vercel)
3. **Artisan Portal** - Creator workspace (Netlify)

**Three applications, one luxury marketplace!** 🏺✨
