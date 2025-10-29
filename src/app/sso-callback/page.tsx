"use client"

import { AuthenticateWithRedirectCallback, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

/**
 * SSO Callback Page
 *
 * This page handles the OAuth redirect after a user signs up with Google or LinkedIn.
 * Clerk's AuthenticateWithRedirectCallback component processes the OAuth flow
 * and redirects based on user profile completion status.
 */
export default function SSOCallbackPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    async function handleOAuthCallback() {
      if (isLoaded && user) {
        try {
          // Check if user has a profile in the database
          const response = await fetch('/api/users/me')

          if (response.ok) {
            const data = await response.json()
            const dbUser = data.user

            // User has completed profile, redirect to dashboard
            const dashboardRoute = dbUser.dashboardRoute || '/dashboard'
            router.push(dashboardRoute)
          } else if (response.status === 404) {
            // User doesn't have a profile yet, redirect to sign-up for role selection
            router.push('/sign-up')
          } else {
            // Other error, redirect to sign-up to be safe
            console.error('Error checking user profile:', response.status)
            router.push('/sign-up')
          }
        } catch (error) {
          console.error('Error during OAuth callback:', error)
          router.push('/sign-up')
        }
      }
    }

    // Only run if we have user data loaded
    if (isLoaded) {
      handleOAuthCallback()
    }
  }, [isLoaded, user, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Completing sign in...
        </h2>
        <p className="text-gray-600">
          Please wait while we verify your account.
        </p>
      </div>
    </div>
  )
}
