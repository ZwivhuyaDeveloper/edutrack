# OAuth Google Sign-Up Troubleshooting Guide

## Issue: Google OAuth Redirects but Doesn't Register User in Clerk

---

## ✅ **Fixes Applied**

### **1. Fixed SSO Callback Handler**

**Problem:** The `/sso-callback` page was using a manual redirect instead of Clerk's OAuth callback handler.

**Before:**
```tsx
// ❌ WRONG - Manual redirect doesn't process OAuth
export default function SSOCallbackPage() {
  const router = useRouter()
  
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/sign-up')
    }, 2000)
    return () => clearTimeout(timer)
  }, [router])
  
  return <LoadingUI />
}
```

**After:**
```tsx
// ✅ CORRECT - Uses Clerk's OAuth handler
import { AuthenticateWithRedirectCallback } from '@clerk/nextjs'

export default function SSOCallbackPage() {
  return (
    <div>
      <LoadingUI />
      <AuthenticateWithRedirectCallback
        signUpForceRedirectUrl="/sign-up"
        signInForceRedirectUrl="/dashboard"
      />
    </div>
  )
}
```

**What This Does:**
- `AuthenticateWithRedirectCallback` processes the OAuth callback from Google
- Completes the authentication with Clerk
- Creates the user session
- Redirects to the appropriate page based on sign-up or sign-in

---

### **2. Added SSO Callback to Public Routes**

**Problem:** Middleware might have been blocking the OAuth callback.

**Fixed in `middleware.ts`:**
```typescript
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',  // ✅ Added this
  '/api/webhooks(.*)',
  '/unauthorized'
])
```

---

## 🔍 **How OAuth Flow Works Now**

### **Complete Flow**

```
1. User clicks "Sign up with Google"
        ↓
2. handleOAuthSignUp() called
        ↓
3. signUp.authenticateWithRedirect({
     strategy: 'oauth_google',
     redirectUrl: '/sso-callback',
     redirectUrlComplete: '/sign-up'
   })
        ↓
4. User redirected to Google OAuth consent screen
        ↓
5. User approves permissions
        ↓
6. Google redirects to: /sso-callback?code=xxx&state=xxx
        ↓
7. AuthenticateWithRedirectCallback processes:
   - Exchanges code for tokens
   - Creates Clerk user
   - Creates session
   - Gets user data from Google
        ↓
8. User redirected to /sign-up (with active session)
        ↓
9. useEffect in sign-up checks user profile
        ↓
10. If no profile → Show role selection
    If profile exists → Redirect to dashboard
```

---

## 🧪 **Testing Steps**

### **1. Clear Browser Data**
```bash
# Clear cookies and cache for localhost:3000
# Or use incognito/private browsing
```

### **2. Test OAuth Flow**
1. Go to `http://localhost:3000/sign-up`
2. Click "Sign up with Google"
3. Select Google account
4. Approve permissions
5. Should redirect to `/sso-callback` (loading screen)
6. Should then redirect to `/sign-up` (role selection)

### **3. Check Clerk Dashboard**
1. Go to https://dashboard.clerk.com
2. Navigate to Users
3. Verify new user appears after OAuth
4. Check user's email and metadata

### **4. Check Browser Console**
```javascript
// Should see these logs in sign-up page:
[sign-up] useEffect triggered - isLoaded: true, user: true
[sign-up] Checking user profile for: user@gmail.com
[sign-up] Response status: 404
[sign-up] User not found in DB (404), showing role selection
```

---

## 🔧 **Clerk Configuration Checklist**

### **In Clerk Dashboard**

#### **1. OAuth Providers Enabled**
- [ ] Go to: User & Authentication → Social Connections
- [ ] Google OAuth enabled ✓
- [ ] LinkedIn OAuth enabled ✓ (if using)

#### **2. Redirect URLs Configured**
- [ ] Authorized redirect URIs include:
  - `http://localhost:3000/sso-callback`
  - `https://your-domain.com/sso-callback`

#### **3. OAuth Settings**
- [ ] Email address required: Yes
- [ ] Email verification: Enabled
- [ ] Profile data: Name, Email, Picture

#### **4. Application URLs**
- [ ] Sign-up URL: `/sign-up`
- [ ] Sign-in URL: `/sign-in`
- [ ] After sign-up URL: `/sign-up` (for role selection)
- [ ] After sign-in URL: `/dashboard`

---

## 🔍 **Debugging Tools**

### **1. Check Clerk Session**
```tsx
// Add to sign-up page
import { useAuth } from '@clerk/nextjs'

const { userId, sessionId, isLoaded } = useAuth()

console.log('Auth State:', {
  userId,
  sessionId,
  isLoaded,
  hasSession: !!sessionId
})
```

### **2. Check User Data**
```tsx
import { useUser } from '@clerk/nextjs'

const { user, isLoaded } = useUser()

console.log('User Data:', {
  id: user?.id,
  email: user?.primaryEmailAddress?.emailAddress,
  firstName: user?.firstName,
  lastName: user?.lastName,
  createdAt: user?.createdAt
})
```

### **3. Network Tab**
Check these requests:
- `POST /v1/client/sign_ups` - Creates sign-up
- `GET /v1/oauth/google/authorize` - Google OAuth
- `POST /v1/oauth/google/callback` - Processes callback
- `POST /v1/client/sessions` - Creates session

---

## ⚠️ **Common Issues & Solutions**

### **Issue 1: "Redirect URI Mismatch"**

**Error:**
```
Error 400: redirect_uri_mismatch
```

**Solution:**
1. Check Google Cloud Console
2. OAuth 2.0 Client ID → Authorized redirect URIs
3. Add: `https://your-clerk-domain.clerk.accounts.dev/v1/oauth_callback`
4. Add: `http://localhost:3000/sso-callback` (for development)

---

### **Issue 2: User Created but No Session**

**Symptoms:**
- User appears in Clerk dashboard
- But not logged in after redirect
- No session cookie

**Solution:**
```tsx
// Ensure AuthenticateWithRedirectCallback is rendered
<AuthenticateWithRedirectCallback
  signUpForceRedirectUrl="/sign-up"
  signInForceRedirectUrl="/dashboard"
/>
```

---

### **Issue 3: Infinite Redirect Loop**

**Symptoms:**
- Keeps redirecting between `/sso-callback` and `/sign-up`

**Solution:**
1. Check middleware allows `/sso-callback`
2. Ensure `AuthenticateWithRedirectCallback` is used
3. Clear browser cookies
4. Check Clerk environment variables

---

### **Issue 4: "User Already Exists"**

**Error:**
```
That email address is taken. Please try another.
```

**Solution:**
- User already exists in Clerk
- Use sign-in instead of sign-up
- Or use different email

---

### **Issue 5: Missing User Data**

**Symptoms:**
- User created but firstName/lastName empty

**Solution:**
1. Check Google OAuth scopes include `profile`
2. In Clerk: Social Connections → Google → Scopes
3. Ensure these are enabled:
   - `email`
   - `profile`
   - `openid`

---

## 🔐 **Security Checklist**

- [ ] HTTPS in production (required for OAuth)
- [ ] Clerk API keys in environment variables
- [ ] Google OAuth credentials secure
- [ ] Redirect URLs whitelist configured
- [ ] CORS settings correct
- [ ] CSP headers allow Clerk domains

---

## 📋 **Environment Variables**

Ensure these are set in `.env.local`:

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/sign-up

# Database
DATABASE_URL=postgresql://...
```

---

## 🧪 **Test Cases**

### **Happy Path**
1. ✅ New user signs up with Google
2. ✅ Redirects to Google consent
3. ✅ Approves permissions
4. ✅ Redirects to `/sso-callback`
5. ✅ User created in Clerk
6. ✅ Session created
7. ✅ Redirects to `/sign-up`
8. ✅ Shows role selection
9. ✅ User completes profile
10. ✅ User record created in database

### **Existing User**
1. ✅ Existing user clicks "Sign up with Google"
2. ✅ Clerk detects existing account
3. ✅ Shows "Email already taken" error
4. ✅ User redirected to sign-in

### **Error Cases**
1. ✅ User denies Google permissions → Error message
2. ✅ Network error → Error message
3. ✅ Invalid OAuth config → Error message

---

## 📊 **Monitoring**

### **Clerk Dashboard**
- Users → Check new OAuth users
- Sessions → Verify active sessions
- Logs → Check OAuth events

### **Application Logs**
```typescript
// Add logging to sign-up page
console.log('[OAuth] Step:', {
  timestamp: new Date().toISOString(),
  userId: user?.id,
  email: user?.primaryEmailAddress?.emailAddress,
  hasProfile: !!profile,
  step: step
})
```

---

## 🚀 **Next Steps After Fix**

1. **Test the flow**
   - Clear browser data
   - Try Google sign-up
   - Verify user in Clerk
   - Complete role selection
   - Check database record

2. **Monitor for issues**
   - Check Clerk logs
   - Monitor error rates
   - Track successful OAuth flows

3. **Document for team**
   - Share OAuth setup guide
   - Document common issues
   - Create troubleshooting runbook

---

## 📞 **Support Resources**

### **Clerk Documentation**
- OAuth Setup: https://clerk.com/docs/authentication/social-connections/google
- Redirect Flows: https://clerk.com/docs/custom-flows/oauth-connections

### **Google OAuth**
- Console: https://console.cloud.google.com
- OAuth 2.0: https://developers.google.com/identity/protocols/oauth2

### **Debugging**
- Clerk Support: https://clerk.com/support
- Community: https://discord.com/invite/clerk

---

## ✅ **Verification Checklist**

After applying fixes, verify:

- [ ] `AuthenticateWithRedirectCallback` imported and used
- [ ] `/sso-callback` in public routes (middleware)
- [ ] Google OAuth enabled in Clerk
- [ ] Redirect URLs configured correctly
- [ ] Environment variables set
- [ ] Browser cookies cleared for testing
- [ ] User created in Clerk after OAuth
- [ ] Session created successfully
- [ ] Redirects to role selection
- [ ] No console errors
- [ ] Network requests successful

---

**Last Updated:** 2025-01-22  
**Version:** 1.0.0  
**Status:** ✅ Fixed
