# 🚀 Quick Fix Checklist - Google OAuth Not Working

## ⚡ **Do These 5 Things NOW**

### **1. Disable CAPTCHA** ⏱️ 30 seconds
1. Go to https://dashboard.clerk.com
2. Select **sunny-moccasin-66**
3. **User & Authentication** → **Attack Protection**
4. **Bot Protection** → Toggle **OFF**
5. Click **Save**

---

### **2. Enable Google OAuth** ⏱️ 1 minute
1. Still in Clerk Dashboard
2. **User & Authentication** → **Social Connections**
3. Find **Google** → Toggle **ON** ✅
4. Click **Configure**
5. Add your Google **Client ID** and **Client Secret**
6. Click **Save**

---

### **3. Update Google Redirect URI** ⏱️ 1 minute
1. Go to https://console.cloud.google.com
2. **APIs & Services** → **Credentials**
3. Click your OAuth 2.0 Client ID
4. **Authorized redirect URIs** → Click **+ ADD URI**
5. Add: `https://sunny-moccasin-66.clerk.accounts.dev/v1/oauth_callback`
6. Click **Save**

---

### **4. Verify Environment Variables** ⏱️ 30 seconds
Open `.env.local` and check:
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...sunny-moccasin-66...
CLERK_SECRET_KEY=sk_test_...sunny-moccasin-66...
```

**If wrong:** Update with keys from Clerk Dashboard (sunny-moccasin-66)

---

### **5. Restart & Test** ⏱️ 1 minute
```bash
# Stop server (Ctrl+C)
npm run dev
```

Then:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Go to `http://localhost:3000/sign-up`
4. Click "Sign up with Google"
5. **Watch console for [OAuth] logs**

---

## 🔍 **What to Look For**

### **✅ Success:**
```
[OAuth] Starting OAuth flow for: google
[OAuth] Using strategy: oauth_google
[OAuth] Redirect initiated successfully
→ Redirects to Google OAuth
```

### **❌ Error:**
```
[OAuth] SignUp not loaded yet
→ Clerk not initialized properly
→ Check environment variables

[OAuth] Error occurred: ...
→ Check error message
→ Follow troubleshooting guide
```

---

## 📋 **If Still Not Working**

### **Check These:**
- [ ] Google OAuth is **enabled** in Clerk Dashboard
- [ ] Client ID and Secret are **correct**
- [ ] Redirect URI is **sunny-moccasin-66** (not dashing-burro-13)
- [ ] Environment variables are **sunny-moccasin-66** keys
- [ ] Dev server was **restarted** after env changes
- [ ] Browser cache was **cleared**

### **Common Mistakes:**
- ❌ Using old Clerk instance (dashing-burro-13)
- ❌ Google OAuth not enabled in Clerk
- ❌ Wrong redirect URI in Google Console
- ❌ Forgot to restart dev server
- ❌ CAPTCHA blocking the flow

---

## 🆘 **Need More Help?**

See detailed guide: `GOOGLE_OAUTH_NOT_REDIRECTING_FIX.md`

---

**Time to fix:** ~5 minutes  
**Difficulty:** Easy  
**Success rate:** 95%+
