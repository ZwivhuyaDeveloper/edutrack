# OAuth Configuration - Visual Step-by-Step Guide

## Three Main Steps Overview

```
STEP 1: CLERK DASHBOARD    STEP 2: GOOGLE SETUP    STEP 3: LINKEDIN SETUP
Enable Providers       →    Get Credentials    →    Get Credentials
(5 min)                     (10 min)                 (10 min)
```

---

## STEP 1: Clerk Dashboard - Enable OAuth

```
1. Go to https://dashboard.clerk.com
2. Select your application
3. User & Authentication → Social Connections
4. Enable Google ✓
5. Enable LinkedIn ✓
6. Copy Callback URL:
   https://your-app.clerk.accounts.dev/v1/oauth_callback
```

---

## STEP 2: Google Cloud Console - Create Credentials

```
1. Go to https://console.cloud.google.com
2. Create new project: "EduTrack AI OAuth"
3. APIs & Services → Credentials
4. Create Credentials → OAuth 2.0 Client ID
5. Configure OAuth Consent Screen:
   - App name: EduTrack AI
   - Email: your@email.com
   - Scopes: email, profile
6. Create Client ID (Web app):
   - Name: EduTrack AI Web Client
   - Redirect URI: [Paste from Clerk]
7. Copy Client ID and Client Secret
8. Go to Clerk → Google → Paste credentials → Save
```

---

## STEP 3: LinkedIn Developer Portal - Create Credentials

```
1. Go to https://www.linkedin.com/developers
2. Create app:
   - Name: EduTrack AI
   - Page: [Your company page]
   - Logo: [128x128 PNG]
   - Privacy Policy: [Your URL]
3. Go to Auth tab
4. Add Redirect URL: [Paste from Clerk]
5. Request access to "Sign In with LinkedIn"
6. Copy Client ID and Client Secret
7. Go to Clerk → LinkedIn → Paste credentials → Save
```

---

## Data Flow

```
User clicks OAuth button
           ↓
Redirected to Google/LinkedIn login
           ↓
User authenticates
           ↓
User grants permissions
           ↓
Redirected to /sso-callback
           ↓
Clerk processes authentication
           ↓
Redirected to /sign-up
           ↓
User selects role
           ↓
User completes profile
           ↓
Redirected to /dashboard
```

---

## Credential Locations

```
Google Cloud Console
  ↓ (Copy credentials)
Clerk Dashboard
  ↓ (Clerk uses credentials)
Your App OAuth Flow
```

---

## Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Redirect URI mismatch | Copy exact URL from Clerk, paste in provider |
| Invalid credentials | Verify you copied correctly, regenerate if needed |
| OAuth button doesn't work | Check console for errors, verify credentials saved |
| LinkedIn app not approved | Request access to "Sign In with LinkedIn" |
| User not created | Check API routes and database |

---

## Checklist

- [ ] Clerk account created
- [ ] Google account created
- [ ] LinkedIn account created
- [ ] LinkedIn company page created
- [ ] Callback URL copied from Clerk
- [ ] Google OAuth app created
- [ ] Google credentials added to Clerk
- [ ] LinkedIn OAuth app created
- [ ] LinkedIn credentials added to Clerk
- [ ] OAuth buttons tested
- [ ] Users created in database
- [ ] Role selection works
- [ ] Profile setup works

---

**Last Updated:** 2025-01-22
