import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { RateLimiters } from '@/lib/rate-limit'
import { secureLog, sanitizeForLog } from '@/lib/secure-logger'

// Enable Next.js caching with revalidation
export const revalidate = 180 // Revalidate every 3 minutes (assignments change moderately)
export const dynamic = 'force-dynamic' // Ensure fresh data for authenticated users

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting (30 requests per minute)
    const rateLimitResult = await RateLimiters.api(request)
    if (!rateLimitResult.success) {
      console.warn('[Principal Assignments] Rate limit exceeded')
      return rateLimitResult.response
    }
    
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true, schoolId: true }
    })

    if (!user || user.role !== 'PRINCIPAL') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    const now = new Date()
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    // Get all assignments for the school with detailed information
    const assignments = await prisma.assignment.findMany({
      where: {
        class: { schoolId: user.schoolId }
      },
      select: {
        id: true,
        title: true,
        dueDate: true,
        createdAt: true,
        subject: {
          select: {
            name: true
          }
        },
        submissions: {
          select: {
            id: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate statistics
    const totalAssignments = assignments.length
    
    // Count pending assignments (due date in the future, not all students submitted)
    const pendingAssignments = assignments.filter(assignment => {
      const isPending = assignment.dueDate > now
      return isPending
    }).length

    // Count overdue assignments (due date in the past)
    const overdueAssignments = assignments.filter(assignment => {
      const isOverdue = assignment.dueDate < now
      return isOverdue
    }).length

    // Get upcoming assignments (due within next 7 days)
    const upcomingAssignments = assignments
      .filter(assignment => {
        const isDueSoon = assignment.dueDate > now && assignment.dueDate <= sevenDaysFromNow
        return isDueSoon
      })
      .slice(0, 5)
      .map(assignment => ({
        id: assignment.id,
        title: assignment.title,
        dueDate: assignment.dueDate.toISOString(),
        subject: assignment.subject.name,
        submissionCount: assignment.submissions.length
      }))

    // Get recent assignments (last 5 created)
    const recentAssignments = assignments
      .slice(0, 5)
      .map(assignment => ({
        id: assignment.id,
        title: assignment.title,
        dueDate: assignment.dueDate.toISOString(),
        subject: assignment.subject.name,
        submissionCount: assignment.submissions.length
      }))

    // Log the stats for debugging using secure logger (sanitized and dev-only)
    secureLog.info('Principal Assignments Data:', sanitizeForLog({
      schoolId: user.schoolId,
      totalAssignments,
      pendingAssignments,
      overdueAssignments,
      upcomingCount: upcomingAssignments.length,
      recentCount: recentAssignments.length
    }))

    const response = NextResponse.json({
      totalAssignments,
      pendingAssignments,
      overdueAssignments,
      upcomingAssignments,
      recentAssignments
    })
    
    // Add cache headers for client-side caching (3 minutes)
    response.headers.set('Cache-Control', 'private, max-age=180, stale-while-revalidate=360')
    return response
  } catch (error) {
    console.error('Error fetching principal assignments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
