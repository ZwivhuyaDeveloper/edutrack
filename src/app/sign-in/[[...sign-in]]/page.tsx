"use client"
import { useUser, useSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import banner from '@/assets/bottom_hero.png'
import logo from '@/assets/logo_teal.png'

export default function Page() {
  const { isSignedIn, isLoaded, user } = useUser()
  const { isLoaded: signInLoaded, signIn, setActive } = useSignIn()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Sign-in form state
  const [signInForm, setSignInForm] = useState({
    emailAddress: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [signInError, setSignInError] = useState('')
  const [attemptCount, setAttemptCount] = useState(0)
  const [isRateLimited, setIsRateLimited] = useState(false)

  // Input sanitization helper
  const sanitizeInput = (input: string): string => {
    return input.trim().replace(/[<>"']/g, '')
  }

  // Handle sign-in form submission
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!signInLoaded || !signIn) return

    // Rate limiting check
    if (isRateLimited) {
      toast.error('Too many attempts. Please wait a moment before trying again.')
      return
    }

    if (attemptCount >= 5) {
      setIsRateLimited(true)
      toast.error('Too many sign-in attempts. Please wait 5 minutes.')
      setTimeout(() => {
        setIsRateLimited(false)
        setAttemptCount(0)
      }, 300000) // 5 minutes
      return
    }

    // Input validation
    const emailAddress = signInForm.emailAddress.trim().toLowerCase()

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailAddress)) {
      setSignInError('Please enter a valid email address')
      return
    }

    if (!signInForm.password || signInForm.password.length < 8) {
      setSignInError('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)
    setSignInError('')
    setAttemptCount(prev => prev + 1)

    try {
      // Attempt sign-in
      const result = await signIn.create({
        identifier: emailAddress,
        password: signInForm.password,
      })

      if (result.status === 'complete') {
        // Set the active session
        await setActive({ session: result.createdSessionId })

        // Clear form
        setSignInForm({ emailAddress: '', password: '' })
        setAttemptCount(0)

        toast.success('Signed in successfully!')

        // Redirect will be handled by useEffect
      } else {
        console.error('Sign-in not complete:', result)
        setSignInError('Sign-in incomplete. Please try again.')
      }
    } catch (err: unknown) {
      console.error('Sign-in error:', err)
      const error = err as { errors?: Array<{ message: string; code?: string }> }
      const errorCode = error.errors?.[0]?.code

      // Generic error messages for security
      if (errorCode === 'form_password_incorrect' || errorCode === 'form_identifier_not_found') {
        setSignInError('Invalid email or password. Please try again.')
      } else if (errorCode === 'too_many_attempts') {
        setSignInError('Too many failed attempts. Please try again later.')
        setIsRateLimited(true)
        setTimeout(() => setIsRateLimited(false), 300000)
      } else {
        setSignInError('Unable to sign in. Please check your credentials and try again.')
      }

      toast.error('Sign-in failed')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle OAuth sign-in
  const handleOAuthSignIn = async (provider: 'oauth_google' | 'oauth_linkedin') => {
    if (!signInLoaded || !signIn) return

    try {
      await signIn.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/',  // Let SSO callback handle the redirect logic
      })
    } catch (err: unknown) {
      console.error('OAuth error:', err)
      setSignInError('Failed to connect. Please try again.')
      toast.error('Failed to connect. Please try again.')
    }
  }

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
        {/* Clerk CAPTCHA element for redirecting state */}
        <div id="clerk-captcha"></div>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    )
  }

  // Show sign-in form if user is not authenticated
  if (!user) {
    return (
      <div className="font-sans min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-zinc-100 to-zinc-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 justify-center items-center">

          <div className='w-full hidden md:block lg:block h-full'>
            <div className='w-full bg-primary hidden h-200'/>
            <Image
              src={banner}
              alt="EduTrack AI Logo"
              width={1000}
              height={1000}
              quality={100}
              className="object-cover w-full h-200 rounded-3xl"
            />
          </div>

          <div className="text-center font-sans pb-10 bg-primary backdrop-blur-lg p-5 rounded-3xl left-0 lg:left-60 relative md:absolute lg:absolute justify-center items-center mb-8">
            <div className="mx-auto w-18 h-18 p-2 bg-white rounded-lg flex items-center justify-center mb-4">
              <Image 
                src={logo} 
                alt="EduTrack AI Logo" 
                width={45} 
                height={45} 
                className="object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-100 mb-2">
              Welcome Back to EduTrack AI
            </h1>
            <p className="text-gray-200">
              Sign in to access your personalized dashboard
            </p>
          </div>

          <div className="max-w-md mx-auto flex flex-col justify-center items-center">
            <Card className="w-full shadow-none border bg-white border-zinc-200 rounded-2xl">
              <CardHeader className="px-8 py-3 space-y-0">
                <CardTitle className="text-2xl font-bold text-primary">
                  Sign in to your account
                </CardTitle>
                <CardDescription className="text-gray-600 font-medium text-sm mt-2">
                  Enter your credentials to access your dashboard
                </CardDescription>
              </CardHeader>

              <CardContent className="px-8 py-6 space-y-3">
                {/* Clerk CAPTCHA element for bot protection */}
                <div id="clerk-captcha"></div>
                
                {signInError && (
                  <Alert variant="destructive">
                    <AlertDescription className="text-red-600 text-sm">
                      {signInError}
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSignInSubmit} className="space-y-4 font-sans">
                  {/* OAuth Buttons */}
                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleOAuthSignIn('oauth_google')}
                      className="w-full border-gray-300 hover:bg-gray-50 hover:border-gray-400 rounded-lg transition-all duration-200 font-medium py-2.5"
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Continue with Google
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleOAuthSignIn('oauth_linkedin')}
                      className="w-full border-gray-300 hover:bg-gray-50 hover:border-gray-400 rounded-lg transition-all duration-200 font-medium py-2.5"
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="#0A66C2">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      Continue with LinkedIn
                    </Button>
                  </div>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="absolute hidden left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        required
                        value={signInForm.emailAddress}
                        onChange={(e) => setSignInForm(prev => ({ ...prev, emailAddress: e.target.value }))}
                        className="pl-10 border-gray-300 placeholder:text-gray-400 font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg px-4 py-2.5 transition-all duration-200"
                        placeholder="john.doe@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute hidden left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={8}
                        value={signInForm.password}
                        onChange={(e) => setSignInForm(prev => ({ ...prev, password: e.target.value }))}
                        className="pl-10 pr-10 border-gray-300 placeholder:text-gray-400 font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg px-4 py-2.5 transition-all duration-200"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg py-2.5 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign in'
                    )}
                  </Button>

                  <div className="text-center text-sm mt-4">
                    <span className="text-gray-600">Don&apos;t have an account? </span>
                    <Link href="/sign-up" className="text-primary hover:text-primary/80 font-semibold transition-colors duration-200">
                      Sign up
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm text-primary text-center">
                <strong>Role-Based Access:</strong> Your dashboard and features are customized based on your role.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}