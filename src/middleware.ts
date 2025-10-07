import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/unauthorized'
])

// Protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/setup-school(.*)',
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

// Role-specific route matchers are intentionally removed.
// Role enforcement is handled in route handlers using Prisma.

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()

  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  // Protect all other routes
  if (isProtectedRoute(req)) {
    if (!userId) {
      // For API routes, return JSON 401 to keep responses machine-readable
      if (req.nextUrl.pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      // Redirect to sign-in if not authenticated for non-API routes
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('redirect_url', req.url)
      return NextResponse.redirect(signInUrl)
    }

    // Allow /api/schools and /api/users for registration flow
    const isRegistrationAPI = req.nextUrl.pathname === '/api/schools' || 
                              req.nextUrl.pathname === '/api/users' ||
                              req.nextUrl.pathname === '/api/users/me' ||
                              req.nextUrl.pathname === '/api/dashboard/student'
    
    if (isRegistrationAPI) {
      return NextResponse.next()
    }

    // Defer role-based enforcement to API route handlers and pages using Prisma
    // For API routes, always pass through (handlers will check DB roles)
    if (req.nextUrl.pathname.startsWith('/api')) {
      return NextResponse.next()
    }

    // For non-API routes, allow access; UI/server routes should fetch DB user and handle role gating
    return NextResponse.next()
  }

  // For any other route, allow access
  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}