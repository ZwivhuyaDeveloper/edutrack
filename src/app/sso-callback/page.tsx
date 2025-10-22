"use client"

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs'
import { Loader2 } from 'lucide-react'

/**
 * SSO Callback Page
 * 
 * This page handles the OAuth redirect after a user signs up with Google or LinkedIn.
 * Clerk's AuthenticateWithRedirectCallback component processes the OAuth flow
 * and automatically redirects to the sign-up page to complete profile setup.
 */
export default function SSOCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Completing sign up...
        </h2>
        <p className="text-gray-600">
          Please wait while we set up your account.
        </p>
      </div>
      
      {/* Clerk handles the OAuth callback and redirects */}
      <AuthenticateWithRedirectCallback
        signUpForceRedirectUrl="/sign-up"
        signInForceRedirectUrl="/dashboard"
      />
    </div>
  )
}
