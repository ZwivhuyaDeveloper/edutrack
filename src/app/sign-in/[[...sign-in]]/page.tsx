"use client"

import { SignIn, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Loader2, GraduationCap } from 'lucide-react'

export default function Page() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    async function handleRedirect() {
      if (isLoaded && isSignedIn && !isRedirecting) {
        setIsRedirecting(true)
        
        try {
          // Fetch user data to determine role-based redirect
          const response = await fetch('/api/users/me')
          
          if (response.ok) {
            const data = await response.json()
            const dashboardRoute = data.user?.dashboardRoute || '/dashboard'
            router.push(dashboardRoute)
          } else {
            // Fallback to default dashboard
            router.push('/dashboard')
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
          router.push('/dashboard')
        }
      }
    }

    handleRedirect()
  }, [isLoaded, isSignedIn, router, isRedirecting])

  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <GraduationCap className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back to EduTrack
          </h1>
          <p className="text-gray-600">
            Sign in to access your personalized dashboard
          </p>
        </div>

        {/* Sign In Component */}
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: 
                'bg-primary hover:bg-primary/90 text-white normal-case',
              card: 'shadow-xl border border-gray-200',
              headerTitle: 'text-2xl font-bold',
              headerSubtitle: 'text-gray-600',
              socialButtonsBlockButton: 
                'border-gray-300 hover:bg-gray-50',
              formFieldInput: 
                'border-gray-300 focus:border-primary focus:ring-primary',
              footerActionLink: 'text-primary hover:text-primary/80',
            },
          }}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
        />

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Don&apos;t have an account?{' '}
            <Link href="/sign-up" className="font-medium text-primary hover:text-primary/80">
              Sign up here
            </Link>
          </p>
        </div>

        {/* Role Information */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 text-center">
            <strong>Role-Based Access:</strong> Your dashboard and features are customized based on your role (Student, Teacher, Parent, Principal, Clerk, or Admin).
          </p>
        </div>
      </div>
    </div>
  )
}