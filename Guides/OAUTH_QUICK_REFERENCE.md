# OAuth Configuration - Quick Reference Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Clerk Dashboard (1 minute)
```
1. Go to https://dashboard.clerk.com
2. Select your app
3. User & Authentication → Social Connections
4. Enable Google ✓
5. Enable LinkedIn ✓
```

### Step 2: Google Setup (2 minutes)
```
1. Go to https://console.cloud.google.com
2. Create project or select existing
3. APIs & Services → Credentials
4. Create Credentials → OAuth 2.0 Client ID
5. Configure consent screen:
   - App name: EduTrack AI
   - Email: your@email.com
   - Scopes: email, profile
6. Create Client ID (Web app):
   - Redirect URI: [Copy from Clerk]
7. Copy Client ID and Secret
8. Go to Clerk → Google → Paste credentials → Save
```

### Step 3: LinkedIn Setup (2 minutes)
```
1. Go to https://www.linkedin.com/developers
2. Create app
3. Fill in: Name, Page, Logo, Privacy Policy
4. Go to Auth tab
5. Add Redirect URL: [Copy from Clerk]
6. Request access to "Sign In with LinkedIn"
7. Copy Client ID and Secret
8. Go to Clerk → LinkedIn → Paste credentials → Save
```

---

## 📋 Checklist

### Before You Start
- [ ] Have a Clerk account
- [ ] Have a Google account
- [ ] Have a LinkedIn account
- [ ] Have a LinkedIn company page
- [ ] Have your privacy policy URL
- [ ] Have your app logo (128x128px)

### Clerk Dashboard
- [ ] Application created in Clerk
- [ ] Google enabled in Social Connections
- [ ] LinkedIn enabled in Social Connections
- [ ] Callback URLs copied

### Google Cloud Console
- [ ] Project created
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 Client ID created
- [ ] Client ID copied
- [ ] Client Secret copied
- [ ] Credentials added to Clerk

### LinkedIn Developer Portal
- [ ] App created
- [ ] Redirect URL added
- [ ] Sign In with LinkedIn access requested
- [ ] Client ID copied
- [ ] Client Secret copied
- [ ] Credentials added to Clerk

### Testing
- [ ] Google OAuth button works
- [ ] LinkedIn OAuth button works
- [ ] Users created in database
- [ ] Role selection works
- [ ] Profile setup works

---

## 🔑 Key URLs

| Service | URL |
|---------|-----|
| Clerk Dashboard | https://dashboard.clerk.com |
| Google Cloud Console | https://console.cloud.google.com |
| LinkedIn Developers | https://www.linkedin.com/developers |
| LinkedIn Company Pages | https://www.linkedin.com/company/ |

---

## 📝 What to Copy Where

### From Google Cloud Console
```
Client ID:     123456789-abc...xyz.apps.googleusercontent.com
Client Secret: GOCSPX-abc...xyz
Redirect URI:  https://your-clerk-domain.clerk.accounts.dev/v1/oauth_callback
```

### To Clerk Dashboard (Google)
```
1. Go to: User & Authentication → Social Connections → Google
2. Click: Use custom credentials
3. Paste Client ID
4. Paste Client Secret
5. Click: Save
```

### From LinkedIn Developer Portal
```
Client ID:     1234567890abcdef
Client Secret: abc...xyz
Redirect URI:  https://your-clerk-domain.clerk.accounts.dev/v1/oauth_callback
```

### To Clerk Dashboard (LinkedIn)
```
1. Go to: User & Authentication → Social Connections → LinkedIn
2. Click: Use custom credentials
3. Paste Client ID
4. Paste Client Secret
5. Click: Save
```

---

## ⚠️ Common Mistakes

| Mistake | Fix |
|---------|-----|
| Redirect URI doesn't match | Copy exact URL from Clerk, including protocol and path |
| Client Secret exposed in code | Use environment variables, never commit to git |
| Wrong redirect URI in provider | Check Clerk's callback URL, copy exactly |
| Credentials not saved in Clerk | Click Save button after pasting credentials |
| OAuth button doesn't work | Clear browser cache, check console for errors |
| LinkedIn app not approved | Request access to "Sign In with LinkedIn" product |
| Can't find redirect URL in Clerk | Go to Social Connections, look for gray box with URL |

---

## 🧪 Testing Commands

### Test Google OAuth
```bash
# 1. Start your app
npm run dev

# 2. Open browser
http://localhost:3000/sign-up

# 3. Click "Continue with Google"

# 4. Sign in with Google account

# 5. Check:
# - Redirected back to app? ✓
# - User created in database? ✓
# - Can select role? ✓
```

### Test LinkedIn OAuth
```bash
# Same as Google, but click "Continue with LinkedIn"
```

---

## 🔒 Security Checklist

- [ ] Client Secret is private (not in code)
- [ ] Using environment variables for credentials
- [ ] HTTPS enabled in production
- [ ] Redirect URIs are exact matches
- [ ] Only requesting `email` and `profile` scopes
- [ ] Credentials rotated regularly
- [ ] No credentials in git history

---

## 📞 Support

### If Something Goes Wrong

**Google OAuth Issues:**
- Check Google Cloud Console for errors
- Verify redirect URI matches exactly
- Regenerate credentials if needed
- Contact: https://cloud.google.com/support

**LinkedIn OAuth Issues:**
- Check LinkedIn Developer Portal for errors
- Verify redirect URI matches exactly
- Ensure "Sign In with LinkedIn" is approved
- Contact: https://www.linkedin.com/help/linkedin

**Clerk Issues:**
- Check Clerk Dashboard for error logs
- Verify credentials are saved (green checkmark)
- Clear browser cache
- Contact: https://clerk.com/support

---

## 📊 OAuth Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    User's Browser                        │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Click OAuth     │
                  │ Button          │
                  └─────────────────┘
                           │
                           ▼
              ┌────────────────────────────┐
              │  Google/LinkedIn           │
              │  Authentication Server     │
              └────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────────┐
              │  User Logs In              │
              │  Grants Permissions        │
              └────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────────┐
              │  Redirect to Callback URL  │
              │  with Authorization Code   │
              └────────────────────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ /sso-callback   │
                  │ Page            │
                  └─────────────────┘
                           │
                           ▼
              ┌────────────────────────────┐
              │  Clerk Exchanges Code      │
              │  for Access Token          │
              └────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────────┐
              │  Get User Info from        │
              │  Google/LinkedIn           │
              └────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────────┐
              │  Create Session in Clerk   │
              │  Create User in Database   │
              └────────────────────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Redirect to     │
                  │ /sign-up        │
                  │ (Role Selection)│
                  └─────────────────┘
```

---

## 🎯 Success Indicators

After completing setup, you should see:

✅ Google OAuth button on sign-up page  
✅ LinkedIn OAuth button on sign-up page  
✅ Clicking buttons redirects to provider login  
✅ After login, redirected back to your app  
✅ New user created in database  
✅ User can select role  
✅ User can complete profile setup  
✅ User redirected to dashboard  

---

## 📚 Additional Resources

- [Clerk OAuth Documentation](https://clerk.com/docs/authentication/oauth)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [LinkedIn OAuth Documentation](https://docs.microsoft.com/en-us/linkedin/shared/authentication/authentication)
- [OAuth 2.0 Specification](https://tools.ietf.org/html/rfc6749)

---

**Last Updated:** 2025-01-22  
**Version:** 1.0.0
