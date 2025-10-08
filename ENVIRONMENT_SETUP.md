# Environment Variables Setup

## Required Environment Variables for Two-Stage Authentication

To fix the redirect issues in the two-stage authentication flow (Clerk + Prisma), update your `.env` file with the following variables:

```env
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret

# Clerk Redirect URLs - Updated for Two-Stage Auth Flow
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_OUT_URL=/

# Updated Fallback Redirect URLs
# After Clerk authentication, users should continue profile setup on sign-up page
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/sign-up

# Database
DATABASE_URL=your_database_url
```

## Key Changes Made

1. **NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL**: Changed from `/dashboard` to `/sign-up` to ensure users complete the two-stage authentication process.

2. **Sign-up Flow**: After Clerk authentication, users are redirected back to `/sign-up` where the React component detects they're authenticated and shows the role selection step.

3. **Final Redirect**: Only after completing both Clerk authentication AND profile setup do users get redirected to `/dashboard`.

## Authentication Flow

1. User visits `/sign-up`
2. Clerk authentication (email verification, etc.)
3. User redirected back to `/sign-up` (but now authenticated)
4. React component detects authentication and shows role selection
5. User completes profile setup
6. Final redirect to `/dashboard`

This ensures the two-stage authentication process works correctly without redirect loops.
