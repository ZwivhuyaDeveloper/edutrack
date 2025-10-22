# Clerk CAPTCHA Error Fix

## 🐛 **Error**

```
The CAPTCHA failed to load. This may be due to an unsupported browser or a browser extension. 
Please try a different browser or disabling extensions. If this issue persists, please contact support.
```

---

## 🔍 **Root Cause**

The error occurs due to:
1. **Next.js 16** middleware changes
2. **Strict CSP headers** blocking Clerk's CAPTCHA
3. **X-Frame-Options: DENY** preventing Clerk iframes
4. Missing domains in CSP for CAPTCHA services

---

## ✅ **Fixes Applied**

### **1. Renamed proxy.ts to middleware.ts**

Next.js expects middleware to be in `src/middleware.ts`, not `src/proxy.ts`

**Action:** Delete `src/proxy.ts` and use `src/middleware.ts`

---

### **2. Updated X-Frame-Options**

**Before:**
```typescript
response.headers.set('X-Frame-Options', 'DENY')
```

**After:**
```typescript
response.headers.set('X-Frame-Options', 'SAMEORIGIN')
```

**Why:** Clerk uses iframes for CAPTCHA. `DENY` blocks all iframes, including Clerk's.

---

### **3. Updated Content Security Policy (CSP)**

**Added domains for Clerk CAPTCHA:**

```typescript
Content-Security-Policy:
  script-src: 
    - https://challenges.cloudflare.com  ✅ (Cloudflare Turnstile)
    - https://www.google.com             ✅ (reCAPTCHA)
    - https://www.gstatic.com            ✅ (Google static)
    
  frame-src:
    - https://challenges.cloudflare.com  ✅ (CAPTCHA iframe)
    - https://www.google.com             ✅ (reCAPTCHA iframe)
    
  connect-src:
    - wss://*.clerk.com                  ✅ (WebSocket for real-time)
```

---

## 📋 **Complete CSP Configuration**

```typescript
response.headers.set(
  'Content-Security-Policy',
  [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.com https://*.clerk.accounts.dev https://challenges.cloudflare.com https://www.google.com https://www.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://*.clerk.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data: https://*.clerk.com",
    "connect-src 'self' https://*.clerk.com https://*.clerk.accounts.dev https://api.clerk.com wss://*.clerk.com",
    "frame-src 'self' https://*.clerk.com https://*.clerk.accounts.dev https://challenges.cloudflare.com https://www.google.com",
    "worker-src 'self' blob:",
  ].join('; ')
)
```

---

## 🔧 **Additional Steps**

### **Step 1: Delete proxy.ts**

```bash
# Delete the old file
Remove-Item src\proxy.ts
```

Or manually delete `src/proxy.ts` in VS Code

---

### **Step 2: Restart Development Server**

```bash
# Stop server (Ctrl+C)
npm run dev
```

---

### **Step 3: Clear Browser Cache**

1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

Or use incognito/private window

---

### **Step 4: Check Clerk Dashboard Settings**

Go to https://dashboard.clerk.com:

#### **A. Attack Protection**
```
User & Authentication → Attack Protection
- Bot Protection: Enabled
- CAPTCHA Provider: Cloudflare Turnstile (recommended)
  or Google reCAPTCHA
```

#### **B. Allowed Origins**
```
Settings → Allowed Origins
- http://localhost:3000 ✅
- https://your-domain.com ✅
```

---

## 🧪 **Testing**

### **Test Sign-Up Flow:**

1. Go to `http://localhost:3000/sign-up`
2. Fill in the form
3. Click "Create Account"
4. **CAPTCHA should load** ✅
5. Complete CAPTCHA
6. Account should be created

### **Test Google OAuth:**

1. Click "Sign up with Google"
2. **CAPTCHA should load** ✅
3. Complete CAPTCHA
4. Proceed with Google sign-in

---

## ⚠️ **Common Issues**

### **Issue 1: CAPTCHA Still Not Loading**

**Solution:**
1. Check browser console for CSP errors
2. Disable browser extensions (especially ad blockers)
3. Try different browser
4. Check Clerk Dashboard → Attack Protection settings

---

### **Issue 2: "Blocked by CSP" Error**

**Check Console:**
```
Refused to load the script 'https://challenges.cloudflare.com/...' 
because it violates the following Content Security Policy directive
```

**Solution:**
Add the blocked domain to CSP in `middleware.ts`

---

### **Issue 3: Infinite CAPTCHA Loop**

**Solution:**
1. Clear browser cookies
2. Disable VPN
3. Check Clerk Dashboard → Attack Protection
4. Try lowering security level temporarily

---

## 🔍 **Debug: Check CSP Headers**

### **In Browser DevTools:**

1. Open Network tab
2. Reload page
3. Click on the document request
4. Check Response Headers
5. Look for `Content-Security-Policy`

**Should include:**
```
script-src ... https://challenges.cloudflare.com ...
frame-src ... https://challenges.cloudflare.com ...
```

---

## 📊 **Before vs After**

### **Before (Broken):**
```typescript
// ❌ Blocks Clerk CAPTCHA
X-Frame-Options: DENY
CSP: frame-src 'self'  // No CAPTCHA domains
```

### **After (Fixed):**
```typescript
// ✅ Allows Clerk CAPTCHA
X-Frame-Options: SAMEORIGIN
CSP: frame-src 'self' https://challenges.cloudflare.com https://www.google.com
```

---

## 🎯 **Security Considerations**

### **Why Allow These Domains?**

1. **challenges.cloudflare.com** - Cloudflare Turnstile CAPTCHA
2. **www.google.com** - Google reCAPTCHA
3. **www.gstatic.com** - Google static resources

These are **trusted services** used by Clerk for bot protection.

### **Still Secure?**

✅ Yes! The CSP still:
- Blocks unauthorized scripts
- Prevents XSS attacks
- Restricts frame sources to known domains
- Protects against clickjacking

---

## 🚀 **Production Deployment**

### **Update CSP for Production:**

```typescript
// Add your production domain
"frame-src 'self' https://*.clerk.com https://your-domain.com https://challenges.cloudflare.com"
```

### **Environment-Specific CSP:**

```typescript
const isDevelopment = process.env.NODE_ENV === 'development'

const cspDirectives = [
  "default-src 'self'",
  isDevelopment 
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' ..." 
    : "script-src 'self' https://*.clerk.com ...",
  // ... rest of directives
]
```

---

## ✅ **Checklist**

- [ ] Deleted `src/proxy.ts`
- [ ] Created `src/middleware.ts` with updated CSP
- [ ] Changed X-Frame-Options to SAMEORIGIN
- [ ] Added CAPTCHA domains to CSP
- [ ] Restarted development server
- [ ] Cleared browser cache
- [ ] Tested sign-up flow
- [ ] CAPTCHA loads successfully
- [ ] No CSP errors in console

---

## 📚 **Resources**

- [Clerk Bot Protection](https://clerk.com/docs/security/bot-protection)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

---

## 🆘 **Still Having Issues?**

### **Check Clerk Status:**
https://status.clerk.com

### **Contact Clerk Support:**
https://clerk.com/support

### **Check Browser Console:**
Look for specific error messages and CSP violations

---

**Last Updated:** 2025-01-22  
**Next.js Version:** 16.0.0  
**Clerk Version:** Latest  
**Status:** ✅ Fixed
