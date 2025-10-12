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
    const classAttendanceData = await prisma.class.findMany({
      where: {
        schoolId: user.schoolId
      },
      include: {
        subjects: {
          include: {
            attendanceSessions: {
              where: {
                createdAt: {
                  gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                }
              },
              include: {
                records: true
              }
            }
          }
        }
      }
    })

    // Calculate attendance rates for each class
    classAttendanceData.forEach(classData => {
      let totalRecords = 0
      let presentRecords = 0

      classData.subjects.forEach(subject => {
        subject.attendanceSessions.forEach(session => {
          totalRecords += session.records.length
          presentRecords += session.records.filter(record => 
            record.status === 'PRESENT' || record.status === 'LATE'
          ).length
        })
      })

      if (totalRecords > 0) {
        const attendanceRate = (presentRecords / totalRecords) * 100
        if (attendanceRate < 85) {
          alerts.push({
            id: `attendance-${classData.id}`,
            type: 'warning',
            title: 'Low Attendance Alert',
            message: `${classData.name} has ${attendanceRate.toFixed(1)}% attendance this week`,
            priority: attendanceRate < 75 ? 'high' : 'medium'
          })
        }
      }
    })

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
    const overdueAssignments = await prisma.assignment.findMany({
      where: {
        class: {
          schoolId: user.schoolId
        },
        dueDate: {
          lt: new Date() // Past due date
        }
      },
      include: {
        submissions: true,
        class: {
          include: {
            enrollments: {
              where: {
                status: 'ACTIVE'
              }
            }
          }
        },
        subject: {
          select: {
            name: true
          }
        }
      }
    })

    overdueAssignments.forEach(assignment => {
      const totalStudents = assignment.class.enrollments.length
      const submissions = assignment.submissions.length
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
    })

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
