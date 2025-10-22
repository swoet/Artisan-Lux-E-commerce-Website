# Artisan Lux - Deployment Guide

## 🚀 Deployment Strategy

Your application consists of two parts:
1. **Frontend** (`artisan-lux`) - Customer-facing site → Deploy to **Netlify**
2. **Backend/Admin** (`artisan-lux-admin`) - Admin panel + API → Deploy to **Render**

## 📋 Pre-Deployment Checklist

### ✅ What's Ready:
- [x] Next.js applications configured
- [x] Database schema defined
- [x] Email verification system (Resend)
- [x] Authentication system
- [x] Environment variables structure

### ⚠️ What Needs Setup:
- [ ] Production database (Vercel Postgres or Neon)
- [ ] Domain name for Resend verification
- [ ] Environment variables on hosting platforms
- [ ] Build configurations

---

## 🗄️ Step 1: Setup Production Database

### Option A: Vercel Postgres (Recommended)

1. Go to https://vercel.com/dashboard
2. Create new project → Storage → Postgres
3. Copy connection string: `postgres://...`
4. You'll use this as `DATABASE_URL`

### Option B: Neon (Alternative)

1. Go to https://neon.tech
2. Create new project
3. Copy connection string
4. Use as `DATABASE_URL`

---

## 🔧 Step 2: Deploy Backend to Render

### 2.1 Create Render Account
1. Go to https://render.com
2. Sign up with GitHub

### 2.2 Deploy Admin Backend

1. **New Web Service** → Connect GitHub repo
2. **Settings:**
   ```
   Name: artisan-lux-admin
   Root Directory: artisan-lux-admin
   Environment: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

3. **Environment Variables:**
   ```env
   DATABASE_URL=your_postgres_connection_string
   RESEND_API_KEY=your_resend_api_key
   NODE_ENV=production
   ```

4. **Deploy** → Wait for build to complete
5. **Copy the URL** (e.g., `https://artisan-lux-admin.onrender.com`)

---

## 🌐 Step 3: Deploy Frontend to Netlify

### 3.1 Create Netlify Account
1. Go to https://netlify.com
2. Sign up with GitHub

### 3.2 Deploy Frontend

1. **New site from Git** → Select your repo
2. **Build settings:**
   ```
   Base directory: artisan-lux
   Build command: npm run build
   Publish directory: artisan-lux/.next
   ```

3. **Environment Variables:**
   ```env
   ADMIN_BASE_URL=https://artisan-lux-admin.onrender.com
   NEXT_PUBLIC_SITE_URL=https://your-site.netlify.app
   ```

4. **Deploy** → Wait for build

### 3.3 Get Your Netlify Domain
- Copy your site URL (e.g., `artisan-lux.netlify.app`)
- Or add custom domain in Netlify settings

---

## 📧 Step 4: Setup Resend with Custom Domain

### Why You Need This:
Currently, Resend only sends to your test email. To send to ALL users, you need to verify a domain.

### 4.1 Get a Domain
**Free Options:**
- Use your Netlify subdomain: `artisan-lux.netlify.app`
- Or buy a domain: Namecheap, GoDaddy ($10-15/year)

### 4.2 Verify Domain in Resend

1. Go to https://resend.com/domains
2. Click **Add Domain**
3. Enter your domain (e.g., `artisan-lux.netlify.app`)
4. Resend will show DNS records to add:
   ```
   Type: TXT
   Name: _resend
   Value: [provided by Resend]
   
   Type: MX
   Name: @
   Value: feedback-smtp.resend.com
   Priority: 10
   ```

### 4.3 Add DNS Records

**If using Netlify domain:**
1. Netlify Dashboard → Domain settings → DNS
2. Add the TXT and MX records from Resend
3. Wait 5-10 minutes for propagation

**If using custom domain:**
1. Go to your domain registrar (Namecheap, GoDaddy, etc.)
2. Find DNS settings
3. Add the records
4. Wait up to 24 hours for propagation

### 4.4 Update Email Sender

Once verified, update the email sender in your code:

```typescript
// artisan-lux-admin/src/lib/verification.ts
from: "Artisan Lux <noreply@your-domain.com>"
// Instead of: "Artisan Lux <onboarding@resend.dev>"
```

---

## 🔐 Step 5: Environment Variables Summary

### Backend (Render)
```env
DATABASE_URL=postgres://user:pass@host:5432/db
RESEND_API_KEY=re_your_key_here
NODE_ENV=production
```

### Frontend (Netlify)
```env
ADMIN_BASE_URL=https://artisan-lux-admin.onrender.com
NEXT_PUBLIC_SITE_URL=https://artisan-lux.netlify.app
```

---

## 🗃️ Step 6: Initialize Database

After deploying backend:

1. **Connect to your production database:**
   ```bash
   # Using the DATABASE_URL from Render
   psql "postgres://..."
   ```

2. **Run migrations:**
   ```bash
   cd artisan-lux-admin
   npm run db:push
   ```

   This will create all tables in production.

---

## ✅ Step 7: Test Everything

### 7.1 Test Backend API
```bash
curl https://artisan-lux-admin.onrender.com/api/public/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### 7.2 Test Frontend
1. Visit your Netlify URL
2. Try to sign up with ANY email
3. Check that email for verification code
4. Complete signup

### 7.3 Test Email Sending
- Should now work for ANY email address (not just your test account)
- If still restricted, check Resend domain verification status

---

## 🐛 Troubleshooting

### Issue: Build fails on Netlify
**Solution:** Check build logs, ensure all dependencies are in `package.json`

### Issue: Backend API not accessible
**Solution:** 
- Check Render logs
- Verify environment variables are set
- Ensure DATABASE_URL is correct

### Issue: Emails still only go to test account
**Solution:**
- Verify domain is fully verified in Resend
- Check DNS records are propagated (use https://dnschecker.org)
- Update `from` email in verification.ts

### Issue: Database connection fails
**Solution:**
- Check DATABASE_URL format
- Ensure database is running
- Verify IP whitelist (some providers require this)

---

## 📊 Deployment Costs

### Free Tier:
- **Netlify:** 100GB bandwidth/month (FREE)
- **Render:** 750 hours/month (FREE, but sleeps after inactivity)
- **Vercel Postgres:** 256MB storage (FREE)
- **Resend:** 100 emails/day (FREE)

### Paid Options (if needed):
- **Render:** $7/month (no sleep)
- **Vercel Postgres:** $20/month (more storage)
- **Resend:** $20/month (50k emails)
- **Custom Domain:** $10-15/year

---

## 🎯 Quick Start Commands

### Deploy Backend:
```bash
cd artisan-lux-admin
npm install
npm run build
npm start
```

### Deploy Frontend:
```bash
cd artisan-lux
npm install
npm run build
npm start
```

---

## 📝 Post-Deployment

1. **Update README** with live URLs
2. **Test all features** in production
3. **Monitor logs** for errors
4. **Setup analytics** (optional)
5. **Add custom domain** (optional)

---

## 🔗 Useful Links

- **Render Dashboard:** https://dashboard.render.com
- **Netlify Dashboard:** https://app.netlify.com
- **Resend Dashboard:** https://resend.com/emails
- **Vercel Postgres:** https://vercel.com/storage/postgres
- **DNS Checker:** https://dnschecker.org

---

## 🆘 Need Help?

If you encounter issues:
1. Check deployment logs
2. Verify environment variables
3. Test API endpoints individually
4. Check Resend domain verification status

Good luck with your deployment! 🚀
