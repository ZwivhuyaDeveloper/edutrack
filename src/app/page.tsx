"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import AboutUs from "@/components/About-us";
import DashboardShowcase from "@/components/DashboardShowcase";
import EducationComparison from "@/components/Education-Comparison";
import HeroSection from "@/components/Hero-Section";
import PricingSection from "@/components/Pricing-Section";
import ContactForm from "@/components/Contact-Form";
import Footer from "@/layout/Footer";
import NavMenu from "@/layout/NavMenu";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, LogIn, UserPlus } from 'lucide-react'

export default function Home() {
  const [showAuthOptions, setShowAuthOptions] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const { isSignedIn, isLoaded, user } = useUser()
  const router = useRouter()

  // Handle redirect for authenticated users
  useEffect(() => {
    async function handleAuthenticatedUser() {
      if (isLoaded && isSignedIn && user && !isRedirecting) {
        console.log('[Home] User authenticated, checking profile:', {
          userId: user.id,
          email: user.primaryEmailAddress?.emailAddress
        })
        setIsRedirecting(true)

        try {
          // Check if user exists in database and get their dashboard route
          console.log('[Home] Fetching user profile from /api/users/me')
          const response = await fetch('/api/users/me')

          if (response.ok) {
            const data = await response.json()
            const dbUser = data.user
            console.log('[Home] User profile found:', {
              userId: dbUser.id,
              school: dbUser.school,
              dashboardRoute: dbUser.dashboardRoute
            })

            // Check if user has completed profile setup
            if (!dbUser.school) {
              console.log('[Home] User needs to complete profile, redirecting to /sign-up')
              // User hasn't selected a school yet, redirect to sign-up to complete profile
              router.push('/sign-up')
              return
            }

            // User has completed profile, redirect to role-based dashboard
            const dashboardRoute = dbUser.dashboardRoute || '/dashboard'
            console.log('[Home] Redirecting to dashboard:', dashboardRoute)
            router.push(dashboardRoute)
          } else if (response.status === 404) {
            console.log('[Home] User not found in database, redirecting to /sign-up')
            // User not found in database, needs to complete registration
            router.push('/sign-up')
          } else {
            console.error('[Home] Error fetching user data:', response.status, response.statusText)
            // Other error, redirect to sign-up to be safe
            router.push('/sign-up')
          }
        } catch (error) {
          console.error('[Home] Error during redirect:', error)
          // On error, redirect to sign-up to complete profile
          router.push('/sign-up')
        }
      } else if (isLoaded && !isSignedIn) {
        console.log('[Home] User not authenticated, showing landing page')
      } else if (isLoaded && isSignedIn && !user) {
        console.log('[Home] User signed in but user object not loaded yet')
      }
    }

    // Add a small delay to ensure Clerk has fully processed the JWT
    const timer = setTimeout(() => {
      handleAuthenticatedUser()
    }, 100)

    return () => clearTimeout(timer)
  }, [isLoaded, isSignedIn, user, router, isRedirecting])

  const handleGetStarted = () => {
    if (isSignedIn) {
      router.push('/dashboard')
    } else {
      router.push('/sign-up')
    }
  }

  const handleLogin = () => {
    router.push('/sign-in')
  }

  const handleSignUp = () => {
    router.push('/sign-up')
  }

  const handleContinueAsGuest = () => {
    setShowAuthOptions(false)
  }

  if (!isLoaded || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">
            {isRedirecting ? 'Redirecting to your dashboard...' : 'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  if (showAuthOptions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Welcome to EduTrack</CardTitle>
            <CardDescription>
              Choose how you would like to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleSignUp} className="w-full" size="lg">
              <UserPlus className="mr-2 h-5 w-5" />
              Create Account
            </Button>
            <Button variant="outline" onClick={handleLogin} className="w-full" size="lg">
              <LogIn className="mr-2 h-5 w-5" />
              Sign In
            </Button>
            <Button variant="ghost" onClick={handleContinueAsGuest} className="w-full" size="lg">
              Continue as Guest
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-h-screen max-w-screen">
      {/* Hero Section with Get Started Button */}
      <div className="relative">
        <NavMenu />
        <HeroSection />

        {/* Custom Get Started Section */}
        <div className="bg-primary hidden text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl mb-8 text-blue-100">
              Join thousands of educators, students, and parents using EduTrack
            </p>
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-white text-primary hover:bg-gray-100 text-lg px-8 py-3"
            >
              {isSignedIn ? 'Go to Dashboard' : 'Get Started Now'}
            </Button>
          </div>
        </div>
      </div>

      <div id="about">
        <AboutUs />
      </div>
      <div id="products">
        <DashboardShowcase />
      </div>
      <div id="features">
        <EducationComparison />
      </div>
      <div id="pricing">
        <PricingSection />
      </div>
      <div id="contact">
        <ContactForm />
      </div>
      <Footer />
    </div>
  );
}
