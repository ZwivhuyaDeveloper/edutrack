import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
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

    // Generate real alerts based on school data
    interface Alert {
      id: string
      type: string
      title: string
      message: string
      priority: string
    }
    
    const alerts: Alert[] = []

    // Check for low attendance classes (last 7 days)
    // Use lightweight selection over attendance records and compute per-class in memory
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const recentAttendances = await prisma.attendance.findMany({
      where: {
        session: {
          classSubject: { class: { schoolId: user.schoolId } },
          createdAt: { gte: sevenDaysAgo }
        }
      },
      select: {
        status: true,
        session: { select: { classSubject: { select: { classId: true } } } }
      }
    })

    // Tally per-class totals and present counts
    const classAttendanceMap = new Map<string, { total: number; present: number }>()
    for (const rec of recentAttendances) {
      const classId = rec.session.classSubject.classId
      const entry = classAttendanceMap.get(classId) || { total: 0, present: 0 }
      entry.total += 1
      if (rec.status === 'PRESENT' || rec.status === 'LATE') entry.present += 1
      classAttendanceMap.set(classId, entry)
    }

    if (classAttendanceMap.size > 0) {
      const classIds = Array.from(classAttendanceMap.keys())
      const classes = await prisma.class.findMany({
        where: { id: { in: classIds } },
        select: { id: true, name: true }
      })
      const classNameById = new Map(classes.map(c => [c.id, c.name]))

      for (const [classId, { total, present }] of classAttendanceMap) {
        if (total > 0) {
          const attendanceRate = (present / total) * 100
          if (attendanceRate < 85) {
            alerts.push({
              id: `attendance-${classId}`,
              type: 'warning',
              title: 'Low Attendance Alert',
              message: `${classNameById.get(classId) || 'Class'} has ${attendanceRate.toFixed(1)}% attendance this week`,
              priority: attendanceRate < 75 ? 'high' : 'medium'
            })
          }
        }
      }
    }

    // Check for pending fees
    const studentIds = await prisma.user.findMany({
      where: { schoolId: user.schoolId, role: 'STUDENT' },
      select: { id: true }
    }).then(users => users.map(u => u.id))

    const pendingInvoicesCount = await prisma.invoice.count({
      where: {
        status: 'PENDING',
        account: {
          studentId: {
            in: studentIds
          }
        }
      }
    })

    if (pendingInvoicesCount > 0) {
      alerts.push({
        id: 'pending-fees',
        type: 'warning',
        title: 'Pending Fees',
        message: `${pendingInvoicesCount} students have pending fee payments`,
        priority: pendingInvoicesCount > 50 ? 'high' : 'medium'
      })
    }

    // Check for upcoming events (next 7 days)
    const upcomingEvents = await prisma.event.findMany({
      where: {
        schoolId: user.schoolId,
        startDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
        }
      },
      orderBy: {
        startDate: 'asc'
      },
      take: 3
    })

    upcomingEvents.forEach(event => {
      const daysUntil = Math.ceil((event.startDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      alerts.push({
        id: `event-${event.id}`,
        type: 'info',
        title: 'Upcoming Event',
        message: `${event.title} scheduled ${daysUntil === 0 ? 'today' : `in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`}`,
        priority: daysUntil <= 1 ? 'high' : 'medium'
      })
    })

    // Check for overdue assignments (assignments past due date with low submission rates)
    // Limit result set and use DB-side counts to avoid loading full arrays
    const overdueAssignments = await prisma.assignment.findMany({
      where: {
        class: { schoolId: user.schoolId },
        dueDate: { lt: new Date() }
      },
      select: {
        id: true,
        title: true,
        classId: true,
        subject: { select: { name: true } },
        _count: { select: { submissions: true } }
      },
      orderBy: { dueDate: 'desc' },
      take: 50
    })

    if (overdueAssignments.length > 0) {
      const classIds = Array.from(new Set(overdueAssignments.map(a => a.classId)))
      const enrollmentCounts = await prisma.enrollment.groupBy({
        by: ['classId'],
        where: { classId: { in: classIds }, status: 'ACTIVE' },
        _count: { _all: true }
      })
      const activeEnrollmentsByClass = new Map(enrollmentCounts.map(ec => [ec.classId, ec._count._all]))

      for (const assignment of overdueAssignments) {
        const totalStudents = activeEnrollmentsByClass.get(assignment.classId) || 0
        const submissions = assignment._count.submissions
        const submissionRate = totalStudents > 0 ? (submissions / totalStudents) * 100 : 0

        if (submissionRate < 70 && totalStudents > 0) {
          alerts.push({
            id: `assignment-${assignment.id}`,
            type: 'warning',
            title: 'Low Assignment Submission',
            message: `${assignment.subject.name} assignment "${assignment.title}" has only ${submissionRate.toFixed(1)}% submission rate`,
            priority: submissionRate < 50 ? 'high' : 'medium'
          })
        }
      }
    }

    // Sort alerts by priority (high first, then medium)
    alerts.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder]
    })

    return NextResponse.json({ alerts: alerts.slice(0, 10) }) // Return top 10 alerts
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
