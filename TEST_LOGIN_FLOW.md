# Test Login Flow - Step by Step

## 🧪 Testing Instructions

### Step 1: Clear All Cookies
1. Open browser DevTools (F12)
2. Go to Application tab → Cookies
3. Delete all cookies for localhost:3000
4. Close DevTools

### Step 2: Sign In
1. Go to http://localhost:3000/signin
2. Enter email: **shawnmutogo5@gmail.com**
3. Click "Sign in"
4. Check your email for the verification code
5. Enter the 6-digit code
6. Click "Verify & Continue"

### Step 3: Check Cookies Were Set
1. After "Verified! Redirecting..." message
2. Open DevTools (F12) → Application → Cookies
3. You should see these cookies:
   - ✅ `customer_session` (httpOnly: true)
   - ✅ `customer_auth` (value: "true")
   - ✅ `customer_email` (value: your email)

### Step 4: Verify You're Logged In
1. Go to http://localhost:3000/debug-auth
2. Should show:
   - ✅ Authenticated
   - Email: shawnmutogo5@gmail.com
   - All cookies listed

### Step 5: Test Persistent Login
1. Go to http://localhost:3000/profile
2. Should see "✅ You are logged in!"
3. Close browser completely
4. Reopen browser
5. Go to http://localhost:3000/profile
6. Should STILL be logged in (no verification needed)

### Step 6: Test Auto-Redirect When Logged In
1. While logged in, go to http://localhost:3000/signin
2. Should automatically redirect to home page
3. Same for http://localhost:3000/signup

## 🐛 If It's Not Working

### Check 1: Are cookies being set?
```
1. After verification, open DevTools → Application → Cookies
2. Look for customer_auth and customer_email
3. If missing, the API isn't setting cookies properly
```

### Check 2: Check browser console
```
1. Open DevTools → Console
2. Look for any errors
3. Check Network tab → verify request → Response Headers
4. Should see Set-Cookie headers
```

### Check 3: Check server logs
```
Look at the artisan-lux terminal for:
- POST /api/public/verify
- Response status should be 200
```

## 🔧 Manual Cookie Test

If automatic cookies aren't working, test manually:

1. Open DevTools → Console
2. Run:
   ```javascript
   document.cookie = "customer_auth=true; path=/; max-age=604800"
   document.cookie = "customer_email=test@example.com; path=/; max-age=604800"
   ```
3. Refresh page
4. Go to http://localhost:3000/debug-auth
5. Should show authenticated

If this works, the issue is with the API not setting cookies.

## 📝 Expected Behavior

**After successful verification:**
- Cookies are set automatically
- Page redirects to home
- User is logged in
- Can access /profile without signing in again
- Stays logged in for 7 days
- Can log out from /profile page

**If not logged in:**
- /profile redirects to /signin
- /signin shows email input
- After verification, logged in

**If already logged in:**
- /signin redirects to home
- /signup redirects to home
- /profile shows user info
