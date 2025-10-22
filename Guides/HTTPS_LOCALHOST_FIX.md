# Fix: HTTPS Localhost Error

## 🐛 **Error**
```
This site can't provide a secure connection
localhost sent an invalid response.
ERR_SSL_PROTOCOL_ERROR
```

**URL:** `https://localhost:3000/?__clerk_db_jwt=...`

---

## 🔍 **Root Cause**

Your app is redirecting to **HTTPS** (`https://localhost:3000`) but your dev server runs on **HTTP** (`http://localhost:3000`).

The `__clerk_db_jwt` parameter shows Clerk is trying to complete authentication, but can't because of the protocol mismatch.

---

## ✅ **Fix 1: Update Environment Variables**

### **Open `.env.local` and change:**

```bash
# ❌ WRONG
NEXT_PUBLIC_APP_URL=https://localhost:3000

# ✅ CORRECT
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **Verify all Clerk URLs are relative paths:**

```bash
# ✅ CORRECT - Use relative paths
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/sign-up

# ❌ WRONG - Don't use full URLs
# NEXT_PUBLIC_CLERK_SIGN_UP_URL=https://localhost:3000/sign-up
```

---

## ✅ **Fix 2: Update Clerk Dashboard**

1. Go to https://dashboard.clerk.com
2. Select **sunny-moccasin-66** application
3. Go to **Settings** → **Paths**
4. Update all URLs to **relative paths**:

```
Sign-in URL: /sign-in
Sign-up URL: /sign-up
After sign-in URL: /dashboard
After sign-up URL: /sign-up
Home URL: /
```

**Important:** Use `/sign-up` not `https://localhost:3000/sign-up`

---

## ✅ **Fix 3: Restart Dev Server**

After updating `.env.local`:

```bash
# Stop server (Ctrl+C)
npm run dev
```

**Environment variables only load on server start!**

---

## ✅ **Fix 4: Clear Browser Data**

1. Open DevTools (F12)
2. Application tab → Storage
3. Click "Clear site data"
4. Or use incognito window

---

## 🔍 **Why This Happens**

### **Development (HTTP):**
```
http://localhost:3000  ✅ Works
https://localhost:3000 ❌ SSL error (no certificate)
```

### **Production (HTTPS):**
```
https://your-domain.com ✅ Works (has SSL certificate)
http://your-domain.com  ⚠️ Redirects to HTTPS
```

**For localhost development, always use HTTP!**

---

## 🧪 **Test After Fix**

1. Restart dev server
2. Clear browser cache
3. Go to `http://localhost:3000/sign-up` (HTTP, not HTTPS)
4. Complete sign-up
5. Should redirect to role selection at `http://localhost:3000/sign-up`

---

## 🎯 **Expected Auth Flow**

```
1. User signs up
   → http://localhost:3000/sign-up
   
2. Clerk processes authentication
   → Adds __clerk_db_jwt parameter
   
3. Redirects to role selection
   → http://localhost:3000/sign-up (with auth)
   
4. User selects role
   → Completes profile
   
5. Redirects to dashboard
   → http://localhost:3000/dashboard
```

**All URLs should use HTTP for localhost!**

---

## ⚠️ **Common Mistakes**

### **Mistake 1: HTTPS in .env.local**
```bash
❌ NEXT_PUBLIC_APP_URL=https://localhost:3000
✅ NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **Mistake 2: Full URLs in Clerk paths**
```bash
❌ NEXT_PUBLIC_CLERK_SIGN_UP_URL=http://localhost:3000/sign-up
✅ NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

### **Mistake 3: Not restarting server**
```bash
# After changing .env.local, MUST restart:
npm run dev
```

### **Mistake 4: Browser cached old redirect**
```bash
# Clear browser cache or use incognito
```

---

## 🔍 **Verify Configuration**

### **Check .env.local:**
```bash
cat .env.local | grep CLERK
```

Should show:
```bash
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **Check Clerk Dashboard:**
- All paths should be relative (`/sign-up`)
- No full URLs
- No HTTPS for localhost

---

## 📚 **For Production Deployment**

When deploying to production, you WILL use HTTPS:

```bash
# Production .env
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/sign-up
```

But for **local development**, always use HTTP!

---

## ✅ **Summary**

**Problem:** Redirecting to HTTPS localhost (no SSL certificate)  
**Solution:** Use HTTP for localhost in all configs  
**Action:** Update `.env.local`, restart server, clear cache

**Steps:**
1. Change `https://localhost` → `http://localhost` in `.env.local`
2. Use relative paths (`/sign-up`) not full URLs
3. Restart dev server
4. Clear browser cache
5. Test at `http://localhost:3000/sign-up`

---

**Last Updated:** 2025-01-22  
**Status:** ✅ Fix Available  
**Difficulty:** Easy (2 minutes)
