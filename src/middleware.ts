import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'

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
  '/dashboard/learner(.*)',
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

    // Allow /api/schools and /api/users for registration flow
    const isRegistrationAPI = req.nextUrl.pathname === '/api/schools' || 
                              req.nextUrl.pathname === '/api/users' ||
                              req.nextUrl.pathname === '/api/users/me' ||
                              req.nextUrl.pathname === '/api/dashboard/student'
    
    if (isRegistrationAPI) {
      return NextResponse.next()
    }

    // Check role-based access for dashboard routes
    try {
      const user = await (await clerkClient()).users.getUser(userId)
      const userRole = user.publicMetadata?.role as string | undefined

      console.log('[middleware] Checking user role for:', req.nextUrl.pathname)
      console.log('[middleware] User role from metadata:', userRole)

      // If user has no role, check database before redirecting
      if (!userRole && !req.nextUrl.pathname.startsWith('/sign-up') && req.nextUrl.pathname !== '/dashboard') {
        console.log('[middleware] No role in metadata, redirecting to /sign-up')
        return NextResponse.redirect(new URL('/sign-up', req.url))
      }
      
      // Allow /dashboard route even without role metadata (it will check DB)
      if (req.nextUrl.pathname === '/dashboard') {
        console.log('[middleware] Allowing /dashboard access')
        return NextResponse.next()
      }

      // Check role-specific routes
      if (isPrincipalRoute(req) && userRole !== 'PRINCIPAL') {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }

      if (isTeacherRoute(req) && userRole !== 'TEACHER') {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }

      if (isStudentRoute(req) && userRole !== 'STUDENT') {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }

      if (isParentRoute(req) && userRole !== 'PARENT') {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }

      if (isClerkRoute(req) && userRole !== 'CLERK') {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }

      if (isAdminRoute(req) && userRole !== 'ADMIN') {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
    } catch (error) {
      console.error('Error checking user role:', error)
      // Continue on error to avoid blocking access
    }

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