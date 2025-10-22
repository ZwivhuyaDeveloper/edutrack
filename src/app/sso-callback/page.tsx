"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

/**
 * SSO Callback Page
 * 
 * This page handles the OAuth redirect after a user signs up with Google or LinkedIn.
 * It processes the OAuth flow and redirects the user back to the sign-up page
 * to complete their profile setup.
 */
export default function SSOCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // Small delay to ensure Clerk processes the callback
    const timer = setTimeout(() => {
      router.push('/sign-up')
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

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
    </div>
  )
}
