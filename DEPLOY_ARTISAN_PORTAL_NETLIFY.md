# 🚀 Deploy Artisan Portal to Netlify (Windows Fix)

## Issue
Windows has a build error with Next.js: `EISDIR: illegal operation on a directory`

## ✅ Solution: Deploy via Git (Recommended)

Netlify will build on Linux servers, avoiding Windows issues.

### Step 1: Push to Git

```bash
cd artisan-lux-artisan

# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial artisan portal"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/artisan-lux-artisan.git

# Push
git push -u origin main
```

### Step 2: Deploy on Netlify

1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** (or your Git provider)
4. Select your `artisan-lux-artisan` repository
5. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - **Base directory:** (leave empty)

6. Click **"Show advanced"** → **"New variable"** and add:

```
DATABASE_URL=your_postgres_url
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_ADMIN_URL=https://admin.yourdomain.com  
NEXT_PUBLIC_ARTISAN_URL=https://artisan.yourdomain.com
RESEND_API_KEY=your_resend_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

7. Click **"Deploy site"**

### Step 3: Add Custom Domain

1. Once deployed, go to **Domain settings**
2. Click **"Add custom domain"**
3. Enter: `artisan.yourdomain.com`
4. Follow DNS instructions
5. SSL certificate will be added automatically

---

## Alternative: Deploy Admin to Vercel (No Build Issues)

If you still have issues, you can deploy the artisan portal to **Vercel** instead:

```bash
cd artisan-lux-artisan
vercel
```

Vercel handles Next.js perfectly and will build on their servers.

---

## 🎯 Quick Summary

**Don't build locally on Windows** - let Netlify or Vercel build on their Linux servers.

1. Push code to GitHub
2. Connect to Netlify/Vercel
3. Add environment variables
4. Deploy!

**The build will work perfectly on their servers.** ✅
