# OAuth Setup Guide - Google & LinkedIn

This guide explains how to configure Google and LinkedIn OAuth authentication for the EduTrack AI sign-up flow.

## Overview

The sign-up form now supports three authentication methods:
1. **Email/Password** - Traditional sign-up with email verification
2. **Google OAuth** - Sign up with Google account
3. **LinkedIn OAuth** - Sign up with LinkedIn account

## Implementation Details

### Files Modified/Created

1. **`src/app/sign-up/[[...sign-up]]/page.tsx`**
   - Added `handleOAuthSignUp()` function
   - Added Google and LinkedIn OAuth buttons
   - Integrated with Clerk's OAuth flow

2. **`src/app/sso-callback/page.tsx`** (NEW)
   - Handles OAuth redirect after authentication
   - Processes callback and redirects to sign-up page

3. **`SECURITY.md`**
   - Added OAuth security documentation
   - Documented OAuth flow and security measures

## Clerk Configuration Required

### Step 1: Enable OAuth Providers in Clerk Dashboard

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **User & Authentication** → **Social Connections**
4. Enable **Google** and **LinkedIn**

### Step 2: Configure Google OAuth

#### Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen:
   - Application name: `EduTrack AI`
   - User support email: Your email
   - Authorized domains: Your domain
   - Scopes: `email`, `profile`

6. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: `EduTrack AI Web Client`
   - Authorized redirect URIs:
     ```
     https://your-clerk-domain.clerk.accounts.dev/v1/oauth_callback
     ```
     (Get exact URL from Clerk Dashboard)

7. Copy **Client ID** and **Client Secret**

#### Add to Clerk

1. In Clerk Dashboard → **Social Connections** → **Google**
2. Click **Use custom credentials**
3. Paste **Client ID** and **Client Secret**
4. Save changes

### Step 3: Configure LinkedIn OAuth

#### LinkedIn Developer Portal Setup

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers)
2. Click **Create app**
3. Fill in app details:
   - App name: `EduTrack AI`
   - LinkedIn Page: Your company page
   - Privacy policy URL: Your privacy policy
   - App logo: Your logo

4. Navigate to **Auth** tab
5. Add **Authorized redirect URLs**:
   ```
   https://your-clerk-domain.clerk.accounts.dev/v1/oauth_callback
   ```
   (Get exact URL from Clerk Dashboard)

6. Request access to **Sign In with LinkedIn** product
7. Copy **Client ID** and **Client Secret**

#### Add to Clerk

1. In Clerk Dashboard → **Social Connections** → **LinkedIn**
2. Click **Use custom credentials**
3. Paste **Client ID** and **Client Secret**
4. Save changes

## OAuth Flow Diagram

```
User clicks "Continue with Google/LinkedIn"
           ↓
Clerk initiates OAuth flow
           ↓
User authenticates with provider
           ↓
Provider redirects to /sso-callback
           ↓
Callback page processes authentication
           ↓
User redirected to /sign-up
           ↓
User completes profile setup (role selection)
           ↓
User redirected to /dashboard
```

## Security Features

### Built-in Security (via Clerk)

- **OAuth 2.0 Protocol**: Industry-standard authentication
- **State Parameter**: CSRF protection
- **PKCE**: Proof Key for Code Exchange
- **Redirect URI Validation**: Prevents open redirect attacks
- **Secure Token Exchange**: Server-side token handling
- **No Password Storage**: OAuth users don't have passwords

### Additional Security

- **Minimal Scopes**: Only request `email` and `profile`
- **Error Handling**: Generic error messages to prevent information leakage
- **Rate Limiting**: Same rate limits apply to OAuth sign-ups
- **Session Security**: Secure session creation after OAuth

## Testing OAuth Integration

### Local Development

1. **Update Clerk Development Instance**
   - Add `http://localhost:3000` to allowed origins
   - Configure OAuth providers in development instance

2. **Test Google OAuth**
   ```bash
   # Start development server
   npm run dev
   
   # Navigate to http://localhost:3000/sign-up
   # Click "Continue with Google"
   # Sign in with Google account
   # Verify redirect to sign-up page
   # Complete profile setup
   ```

3. **Test LinkedIn OAuth**
   ```bash
   # Same process as Google
   # Click "Continue with LinkedIn"
   # Sign in with LinkedIn account
   ```

### Production Deployment

1. **Update OAuth Redirect URIs**
   - Google Cloud Console: Add production domain
   - LinkedIn Developer Portal: Add production domain
   - Clerk Dashboard: Verify production URLs

2. **Environment Variables**
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
   CLERK_SECRET_KEY=sk_live_...
   ```

3. **Deploy and Test**
   - Deploy to production
   - Test OAuth flow end-to-end
   - Verify user creation in database
   - Check role selection and profile setup

## Troubleshooting

### Common Issues

#### "Redirect URI mismatch"
- **Cause**: OAuth redirect URI not configured correctly
- **Solution**: Ensure redirect URI in provider console matches Clerk's callback URL exactly

#### "OAuth provider not enabled"
- **Cause**: Provider not enabled in Clerk Dashboard
- **Solution**: Enable Google/LinkedIn in Clerk Dashboard → Social Connections

#### "Invalid client credentials"
- **Cause**: Incorrect Client ID or Client Secret
- **Solution**: Verify credentials in provider console and Clerk Dashboard

#### "User stuck on callback page"
- **Cause**: Callback processing error
- **Solution**: Check browser console for errors, verify `/sso-callback` route exists

#### "OAuth works but user not created in database"
- **Cause**: User creation API not called after OAuth
- **Solution**: Verify `/api/users/me` endpoint and user creation flow

### Debug Mode

Enable debug logging in development:

```typescript
// In sign-up page
console.log('OAuth provider:', provider)
console.log('Sign-up loaded:', signUpLoaded)
console.log('Sign-up object:', signUp)
```

## User Experience

### OAuth Sign-Up Flow

1. User lands on `/sign-up`
2. Sees three options:
   - **Continue with Google** (blue button with Google logo)
   - **Continue with LinkedIn** (blue button with LinkedIn logo)
   - **Or continue with email** (divider)
   - Traditional email/password form below

3. User clicks OAuth button
4. Redirected to provider's login page
5. Authenticates with provider
6. Redirected back to app via `/sso-callback`
7. Automatically redirected to `/sign-up`
8. Prompted to select role (Student, Teacher, Parent, Principal)
9. Completes profile setup
10. Redirected to `/dashboard`

### Benefits of OAuth

- **Faster Sign-Up**: No need to create new password
- **Trusted Authentication**: Users trust Google/LinkedIn
- **Auto-Fill Profile**: Name and email pre-populated
- **Better Security**: No password to manage
- **Single Sign-On**: Use existing account

## Maintenance

### Regular Tasks

1. **Monitor OAuth Errors**
   - Check Clerk Dashboard for failed OAuth attempts
   - Review error logs in application

2. **Update Credentials**
   - Rotate OAuth credentials periodically
   - Update in both provider console and Clerk

3. **Review Scopes**
   - Ensure minimal scopes are requested
   - Update if provider changes scope requirements

4. **Test Regularly**
   - Test OAuth flow monthly
   - Verify both Google and LinkedIn work
   - Check on different devices/browsers

## Support

For issues with:
- **Clerk Configuration**: [Clerk Support](https://clerk.com/support)
- **Google OAuth**: [Google Cloud Support](https://cloud.google.com/support)
- **LinkedIn OAuth**: [LinkedIn Developer Support](https://www.linkedin.com/help/linkedin/answer/a1338686)

---

**Last Updated:** 2025-01-22  
**Version:** 1.0.0
