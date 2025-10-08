import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the teacher user
    const teacher = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!teacher || teacher.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    const alerts = []

    // 1. Check for missing attendance records (last 3 days)
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

    const teacherClassSubjects = await prisma.classSubject.findMany({
      where: { teacherId: teacher.id },
      include: {
        classMeetings: true
      }
    })

    let missingAttendanceCount = 0
    for (const classSubject of teacherClassSubjects) {
      for (const meeting of classSubject.classMeetings) {
        const dayOfWeek = meeting.dayOfWeek
        const today = new Date()
        
        // Check last 3 days for missing attendance
        for (let i = 1; i <= 3; i++) {
          const checkDate = new Date()
          checkDate.setDate(today.getDate() - i)
          const checkDayOfWeek = checkDate.getDay() === 0 ? 7 : checkDate.getDay()
          
          if (checkDayOfWeek === dayOfWeek) {
            const attendanceSession = await prisma.attendanceSession.findFirst({
              where: {
                classSubjectId: classSubject.id,
                date: {
                  gte: new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate()),
                  lt: new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate() + 1)
                }
              }
            })

            if (!attendanceSession) {
              missingAttendanceCount++
            }
          }
        }
      }
    }

    if (missingAttendanceCount > 0) {
      alerts.push({
        type: 'warning',
        title: 'Missing Attendance Records',
        message: `You have ${missingAttendanceCount} class${missingAttendanceCount === 1 ? '' : 'es'} from the last 3 days without attendance records.`
      })
    }

    // 2. Check for overdue grading
    const overdueSubmissions = await prisma.assignmentSubmission.findMany({
      where: {
        assignment: {
          classSubject: {
            teacherId: teacher.id
          },
          dueDate: {
            lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // More than 7 days ago
          }
        },
        grade: null
      },
      include: {
        assignment: {
          include: {
            subject: true
          }
        }
      }
    })

    if (overdueSubmissions.length > 0) {
      alerts.push({
        type: 'error',
        title: 'Overdue Grading',
        message: `${overdueSubmissions.length} assignment submission${overdueSubmissions.length === 1 ? '' : 's'} are overdue for grading (more than 7 days old).`
      })
    }

    // 3. Check for upcoming events
    const upcomingEvents = await prisma.event.findMany({
      where: {
        schoolId: teacher.schoolId,
        startDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
        },
        eventAudiences: {
          some: {
            OR: [
              { scope: 'SCHOOL' },
              { scope: 'TEACHERS' }
            ]
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      },
      take: 3
    })

    if (upcomingEvents.length > 0) {
      const nextEvent = upcomingEvents[0]
      const eventDate = new Date(nextEvent.startDate)
      const daysUntil = Math.ceil((eventDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      
      let timeText = ''
      if (daysUntil === 0) timeText = 'today'
      else if (daysUntil === 1) timeText = 'tomorrow'
      else timeText = `in ${daysUntil} days`

      alerts.push({
        type: 'info',
        title: 'Upcoming School Event',
        message: `${nextEvent.title} is scheduled ${timeText}. ${upcomingEvents.length > 1 ? `${upcomingEvents.length - 1} more event${upcomingEvents.length > 2 ? 's' : ''} this week.` : ''}`
      })
    }

    // 4. Check for high priority unread messages
    const urgentMessages = await prisma.message.count({
      where: {
        recipientId: teacher.id,
        isRead: false,
        sentAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    })

    if (urgentMessages > 5) {
      alerts.push({
        type: 'warning',
        title: 'Many Unread Messages',
        message: `You have ${urgentMessages} unread messages from the last 24 hours. Some may require urgent attention.`
      })
    }

    // 5. Check for assignments due soon without grades
    const assignmentsDueSoon = await prisma.assignment.findMany({
      where: {
        classSubject: {
          teacherId: teacher.id
        },
        dueDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // Next 3 days
        }
      },
      include: {
        submissions: {
          where: {
            grade: null
          }
        },
        subject: true
      }
    })

    const assignmentsWithPendingGrades = assignmentsDueSoon.filter(a => a.submissions.length > 0)
    if (assignmentsWithPendingGrades.length > 0) {
      alerts.push({
        type: 'info',
        title: 'Assignments Due Soon',
        message: `${assignmentsWithPendingGrades.length} assignment${assignmentsWithPendingGrades.length === 1 ? '' : 's'} due in the next 3 days have ungraded submissions.`
      })
    }

    // 6. Check for low attendance rates
    const recentAttendanceSessions = await prisma.attendanceSession.findMany({
      where: {
        classSubject: {
          teacherId: teacher.id
        },
        date: {
          gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) // Last 14 days
        }
      },
      include: {
        attendances: true,
        classSubject: {
          include: {
            class: true,
            subject: true
          }
        }
      }
    })

    const classesWithLowAttendance = recentAttendanceSessions
      .map(session => {
        const presentCount = session.attendances.filter(a => a.status === 'PRESENT').length
        const totalCount = session.attendances.length
        const attendanceRate = totalCount > 0 ? (presentCount / totalCount) * 100 : 100
        
        return {
          session,
          attendanceRate
        }
      })
      .filter(({ attendanceRate }) => attendanceRate < 70) // Less than 70% attendance

    if (classesWithLowAttendance.length > 0) {
      alerts.push({
        type: 'warning',
        title: 'Low Attendance Alert',
        message: `${classesWithLowAttendance.length} recent class session${classesWithLowAttendance.length === 1 ? '' : 's'} had attendance below 70%. Consider following up with absent students.`
      })
    }

    return NextResponse.json({ alerts })

  } catch (error) {
    console.error('Error fetching teacher alerts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
