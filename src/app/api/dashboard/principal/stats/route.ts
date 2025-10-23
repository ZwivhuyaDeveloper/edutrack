import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { RateLimiters } from '@/lib/rate-limit'
import { secureLog, sanitizeForLog } from '@/lib/secure-logger'

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting (30 requests per minute)
    const rateLimitResult = await RateLimiters.api(request)
    if (!rateLimitResult.success) {
      console.warn('[Principal Stats] Rate limit exceeded')
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

    // Get school statistics (optimize payloads and push aggregation to DB)
    const [
      allStudents,
      teacherCount,
      classCount,
      subjectCount,
      totalAttendanceRecords,
      presentAttendanceRecords,
      upcomingEvents,
      unreadNotifications
    ] = await Promise.all([
      // Students: only minimal fields for stats
      prisma.user.findMany({
        where: { schoolId: user.schoolId, role: 'STUDENT' },
        select: {
          id: true,
          isActive: true,
          enrollments: {
            where: { status: 'ACTIVE' },
            select: { id: true }
          }
        }
      }),
      prisma.user.count({
        where: { schoolId: user.schoolId, role: 'TEACHER', isActive: true }
      }),
      prisma.class.count({
        where: { schoolId: user.schoolId }
      }),
      prisma.subject.count({
        where: { schoolId: user.schoolId }
      }),
      // Attendance counts (last 30 days) - avoid fetching all rows
      prisma.attendance.count({
        where: {
          session: { classSubject: { class: { schoolId: user.schoolId } } },
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      }),
      prisma.attendance.count({
        where: {
          session: { classSubject: { class: { schoolId: user.schoolId } } },
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          status: { in: ['PRESENT', 'LATE'] }
        }
      }),
      // Real upcoming events (next 7 days)
      prisma.event.count({
        where: {
          schoolId: user.schoolId,
          startDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      // Real unread notifications for principal
      prisma.notification.count({
        where: { userId: user.id, isRead: false }
      })
    ])

    // Calculate real attendance rate
    const attendanceRate = totalAttendanceRecords > 0 
      ? Math.round((presentAttendanceRecords / totalAttendanceRecords) * 100 * 10) / 10 
      : 0

    // Get student IDs for pending/paid fees calculation
    const studentIds = allStudents.map(student => student.id)
    
    // Sum pending invoices for school students (DB-side aggregation)
    const pendingInvoicesAgg = await prisma.invoice.aggregate({
      where: {
        status: 'PENDING',
        account: { studentId: { in: studentIds } }
      },
      _sum: { total: true }
    })

    // Calculate student statistics
    const totalStudents = allStudents.length
    const activeStudents = allStudents.filter(student => student.isActive).length
    const enrolledStudents = allStudents.filter(student => student.enrollments.length > 0).length

    // Calculate total pending fees
    const pendingFees = pendingInvoicesAgg._sum.total ?? 0
    
    // Calculate total paid fees (DB-side aggregation)
    const totalPaidAgg = await prisma.fee_records.aggregate({
      where: { paid: true, studentId: { in: studentIds } },
      _sum: { amount: true }
    })
    const totalPaidFees = totalPaidAgg._sum.amount ?? 0
    
    const unreadMessages = unreadNotifications

    // Log the stats for debugging using secure logger (sanitized and dev-only)
    secureLog.info('Principal Dashboard Stats:', sanitizeForLog({
      schoolId: user.schoolId,
      totalStudents,
      activeStudents,
      enrolledStudents,
      totalTeachers: teacherCount,
      totalClasses: classCount,
      totalSubjects: subjectCount,
      attendanceRate,
      pendingFees,
      upcomingEvents,
      unreadMessages
    }))

    return NextResponse.json({
      totalStudents,
      totalTeachers: teacherCount,
      totalClasses: classCount,
      totalSubjects: subjectCount,
      attendanceRate,
      pendingFees,
      totalPaidFees,
      upcomingEvents,
      unreadMessages
    })
  } catch (error) {
    console.error('Error fetching principal stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
