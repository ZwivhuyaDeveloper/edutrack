"use client"

import { SignIn, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import logo from '@/assets/logo_teal.png'

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
            const user = data.user
            
            // Check if user has completed profile setup
            if (!user.school) {
              // User hasn't selected a school yet, redirect to sign-up to complete profile
              router.push('/sign-up')
              return
            }
            
            // User has completed profile, redirect to role-based dashboard
            const dashboardRoute = user.dashboardRoute || '/dashboard'
            router.push(dashboardRoute)
          } else if (response.status === 404) {
            // User not found in database, needs to complete registration
            router.push('/sign-up')
          } else {
            // Other error, redirect to sign-up to be safe
            router.push('/sign-up')
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
          // On error, redirect to sign-up to complete profile
          router.push('/sign-up')
        }
      }
    }

    handleRedirect()
  }, [isLoaded, isSignedIn, router, isRedirecting])

  if (isRedirecting) {
    return (
      <div className="font-sans min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="font-sans min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 h-full justify-center items-center">
        
        <Card className="text-center h-full w-full font-sans border border-primary bg-primary p-7 rounded-3xl  justify-center items-center">
          <div className="flex flex-col justify-center items-center">
            <div className="mx-auto w-18 h-18 p-3 bg-white rounded-xl flex items-center justify-center mb-4">
              <Image 
                src={logo} 
                alt="EduTrack AI Logo" 
                width={45} 
                height={45} 
                className="object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-100 mb-2">
              Welcome back to EduTrack AI Software
            </h1>
            <p className="text-gray-200">
              Sign in to access your personalized dashboard
            </p>

            <div className="mt-6 p-4 bg-white/20   rounded-lg border border-white/20">
              <p className="text-sm text-white text-center">
                <strong>Next Steps:</strong> After signing in, you&apos;ll select your role and complete your profile.
              </p>
            </div>
          </div>

        </Card>
        {/* Sign In Component */}

        <div className="max-w-md mx-auto flex h-full flex-col justify-center items-center">
          <SignIn 
            appearance={{
              elements: {
                // Root card styling
                rootBox: {
                  width: 'w-full',
                  height: 'h-full',
                  border: 'none',
                },

                // Card styling
                card: {
                  shadow: 'shadow-sm',
                  border: 'border',
                  spaceY: 'space-y-1',
                  borderColor: 'border-zinc-200',
                  borderRadiusBottom: '0',
                  backgroundColor: 'bg-white',
                },

                // Header styling
                headerTitle: {
                  fontSize: '2xl',
                  fontWeight: 'bold',
                  color: '#006372',
                },
                headerSubtitle: 'text-gray-600 text-sm mt-2',
                
                // Form container
                formContainer: 'space-y-2',

                // Form fields
                formFieldLabel: 'text-sm font-medium text-gray-700',
                formFieldInput: 'border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg px-4 py-2.5 transition-all duration-200',
                formFieldInputShowPasswordButton: 'text-gray-500 hover:text-gray-700',

                // Primary button (Sign In)
                formButtonPrimary: {
                  borderBlockWidth: '0px',
                  backgroundColor: '#006372',
                  "&:hover": {
                    backgroundColor: '#006372',
                    opacity: 0.8,
                  },
                  color: '#FFFFFF',
                },

                // Social buttons
                socialButtonsBlockButton: 
                  {
                    flexDirection: 'row',
                    borderBlockWidth: '0px',
                    backgroundColor: '#fff',
                    "&:hover": {
                      backgroundColor: '#fff',
                      opacity: 0.8,
                    },
                    color: '#006372',
                  },
                socialButtonsBlockButtonText: 'text-gray-700 font-medium',
                socialButtonsProviderIcon: 'w-5 h-5',
                
                footerActionLink: 'text-primary hover:text-primary/80',
              },
                layout: {
                  socialButtonsPlacement: 'top',
                  socialButtonsVariant: 'blockButton',
                  termsPageUrl: '/terms',
                  privacyPageUrl: '/privacy',
                  unsafe_disableDevelopmentModeWarnings: true,
                },
            }}
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            forceRedirectUrl="/dashboard"
          />
        </div>
        

      </div>
    </div>
  )
}