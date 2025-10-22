import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',
  '/api/webhooks(.*)',
  '/unauthorized'
])

// Protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/setup-school(.*)',
  '/profile(.*)',
  '/api/schools(.*)',
  '/api/users(.*)',
  '/api/profile(.*)',
  '/api/classes(.*)',
  '/api/subjects(.*)',
  '/api/assignments(.*)',
  '/api/enrollments(.*)',
  '/api/grades(.*)',
  '/api/attendance(.*)',
  '/api/messages(.*)',
  '/api/resources(.*)',
  '/api/events(.*)',
  '/api/fees(.*)',
  '/api/payments(.*)',
  '/api/notifications(.*)',
  '/api/announcements(.*)',
  '/api/lesson-plans(.*)',
  '/api/reports(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()

  // Create response with security headers
  const response = NextResponse.next()
  
  // Security Headers (Updated for Clerk CAPTCHA compatibility)
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // Updated CSP to allow Clerk CAPTCHA and services
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.com https://*.clerk.accounts.dev https://challenges.cloudflare.com https://www.google.com https://www.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://*.clerk.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data: https://*.clerk.com",
      "connect-src 'self' https://*.clerk.com https://*.clerk.accounts.dev https://api.clerk.com wss://*.clerk.com",
      "frame-src 'self' https://*.clerk.com https://*.clerk.accounts.dev https://challenges.cloudflare.com https://www.google.com",
      "worker-src 'self' blob:",
    ].join('; ')
  )

  // Allow public routes
  if (isPublicRoute(req)) {
    return response
  }

  // Protect all other routes
  if (isProtectedRoute(req)) {
    if (!userId) {
      // For API routes, return JSON 401
      if (req.nextUrl.pathname.startsWith('/api')) {
        const errorResponse = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        // Copy security headers to error response
        response.headers.forEach((value, key) => {
          errorResponse.headers.set(key, value)
        })
        return errorResponse
      }
      // Redirect to sign-in if not authenticated
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('redirect_url', req.url)
      return NextResponse.redirect(signInUrl)
    }

    // Allow registration API routes
    const isRegistrationAPI = req.nextUrl.pathname === '/api/schools' || 
                              req.nextUrl.pathname === '/api/users' ||
                              req.nextUrl.pathname === '/api/users/me' ||
                              req.nextUrl.pathname === '/api/dashboard/student'
    
    if (isRegistrationAPI) {
      return response
    }

    // Allow API routes (handlers will check roles)
    if (req.nextUrl.pathname.startsWith('/api')) {
      return response
    }

    return response
  }

  return response
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
