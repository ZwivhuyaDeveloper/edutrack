import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { RateLimiters } from '@/lib/rate-limit'
import { secureLog, sanitizeForLog } from '@/lib/secure-logger'

// Enable Next.js caching with revalidation
export const revalidate = 300 // Revalidate every 5 minutes (subjects change less frequently)
export const dynamic = 'force-dynamic' // Ensure fresh data for authenticated users

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting (30 requests per minute)
    const rateLimitResult = await RateLimiters.api(request)
    if (!rateLimitResult.success) {
      console.warn('[Principal Subjects] Rate limit exceeded')
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

    // Get all subjects for the school with detailed information
    const subjects = await prisma.subject.findMany({
      where: { schoolId: user.schoolId },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        createdAt: true,
        classSubjects: {
          select: {
            id: true,
            teacher: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                teacherProfile: {
                  select: {
                    department: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate statistics
    const totalSubjects = subjects.length
    // All subjects are considered active (no isActive field in schema)
    const activeSubjects = subjects.filter(subject => subject.classSubjects.length > 0).length

    // Group subjects by department (from teacher's department)
    const departmentMap = new Map<string, number>()
    subjects.forEach(subject => {
      // Get departments from teachers teaching this subject
      const departments = subject.classSubjects
        .map(cs => cs.teacher?.teacherProfile?.department)
        .filter(Boolean) as string[]
      
      if (departments.length > 0) {
        // Use the most common department for this subject
        const dept = departments[0] || 'General'
        departmentMap.set(dept, (departmentMap.get(dept) || 0) + 1)
      } else {
        departmentMap.set('General', (departmentMap.get('General') || 0) + 1)
      }
    })

    const subjectsByDepartment = Array.from(departmentMap.entries())
      .map(([department, count]) => ({ department, count }))
      .sort((a, b) => b.count - a.count) // Sort by count descending

    // Get recent subjects (last 5) with teacher count
    const recentSubjects = subjects.slice(0, 5).map(subject => {
      // Get unique teachers for this subject
      const uniqueTeachers = new Set(
        subject.classSubjects
          .filter(cs => cs.teacher)
          .map(cs => cs.teacher.id)
      )

      // Get primary department from first teacher
      const primaryDepartment = subject.classSubjects[0]?.teacher?.teacherProfile?.department

      return {
        id: subject.id,
        name: subject.name,
        code: subject.code || undefined,
        department: primaryDepartment || undefined,
        teacherCount: uniqueTeachers.size
      }
    })

    // Log the stats for debugging using secure logger (sanitized and dev-only)
    secureLog.info('Principal Subjects Data:', sanitizeForLog({
      schoolId: user.schoolId,
      totalSubjects,
      activeSubjects,
      departmentCount: subjectsByDepartment.length,
      recentSubjectsCount: recentSubjects.length
    }))

    const response = NextResponse.json({
      totalSubjects,
      activeSubjects,
      subjectsByDepartment,
      recentSubjects
    })
    
    // Add cache headers for client-side caching (5 minutes)
    response.headers.set('Cache-Control', 'private, max-age=300, stale-while-revalidate=600')
    return response
  } catch (error) {
    console.error('Error fetching principal subjects:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
