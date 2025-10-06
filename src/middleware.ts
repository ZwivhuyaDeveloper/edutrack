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

// Role-specific route matchers
const isPrincipalRoute = createRouteMatcher([
  '/dashboard/principal(.*)',
  '/setup-school(.*)'
])

const isTeacherRoute = createRouteMatcher([
  '/dashboard/teacher(.*)'
])

const isStudentRoute = createRouteMatcher([
  '/dashboard/student(.*)'
])

const isParentRoute = createRouteMatcher([
  '/dashboard/parent(.*)'
])

const isClerkRoute = createRouteMatcher([
  '/dashboard/clerk(.*)'
])

const isAdminRoute = createRouteMatcher([
  '/dashboard/admin(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()

  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  // Protect all other routes
  if (isProtectedRoute(req)) {
    if (!userId) {
      // Redirect to sign-in if not authenticated
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('redirect_url', req.url)
      return NextResponse.redirect(signInUrl)
    }

    // For role-specific routes, we'll let the page/API handle authorization
    // This middleware only handles authentication
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