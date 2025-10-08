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

    const tasks = []

    // 1. Pending grading tasks
    const pendingSubmissions = await prisma.assignmentSubmission.findMany({
      where: {
        assignment: {
          classSubject: {
            teacherId: teacher.id
          }
        },
        grade: null // Not graded yet
      },
      include: {
        assignment: {
          include: {
            subject: true,
            class: true
          }
        }
      }
    })

    // Group submissions by assignment
    const submissionsByAssignment = pendingSubmissions.reduce((acc, submission) => {
      const assignmentId = submission.assignmentId
      if (!acc[assignmentId]) {
        acc[assignmentId] = {
          assignment: submission.assignment,
          count: 0
        }
      }
      acc[assignmentId].count++
      return acc
    }, {} as Record<string, { assignment: any, count: number }>)

    // Add grading tasks
    Object.values(submissionsByAssignment).forEach(({ assignment, count }) => {
      const dueDate = assignment.dueDate
      const isOverdue = dueDate && new Date() > new Date(dueDate)
      const priority = isOverdue ? 'high' : count > 10 ? 'medium' : 'low'

      tasks.push({
        id: `grading-${assignment.id}`,
        type: 'grading',
        title: `Grade ${assignment.title}`,
        description: `${count} submission${count === 1 ? '' : 's'} need grading - ${assignment.subject.name}`,
        priority,
        count,
        dueDate: isOverdue ? 'Overdue' : dueDate ? formatDueDate(dueDate) : undefined
      })
    })

    // 2. Missing attendance records (classes in the last 7 days without attendance)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const teacherClassSubjects = await prisma.classSubject.findMany({
      where: { teacherId: teacher.id },
      include: {
        class: true,
        subject: true,
        classMeetings: {
          include: {
            period: true
          }
        }
      }
    })

    // Check for missing attendance in the last 7 days
    const missingAttendanceClasses = []
    for (const classSubject of teacherClassSubjects) {
      // Get class meetings for this class subject
      for (const meeting of classSubject.classMeetings) {
        // Check if there should have been a class in the last 7 days
        const dayOfWeek = meeting.dayOfWeek
        const today = new Date()
        
        // Check each day in the last 7 days
        for (let i = 1; i <= 7; i++) {
          const checkDate = new Date()
          checkDate.setDate(today.getDate() - i)
          const checkDayOfWeek = checkDate.getDay() === 0 ? 7 : checkDate.getDay()
          
          if (checkDayOfWeek === dayOfWeek) {
            // There should have been a class on this day
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
              missingAttendanceClasses.push({
                classSubject,
                date: checkDate
              })
            }
          }
        }
      }
    }

    if (missingAttendanceClasses.length > 0) {
      tasks.push({
        id: 'attendance-missing',
        type: 'attendance',
        title: 'Missing Attendance Records',
        description: `${missingAttendanceClasses.length} class${missingAttendanceClasses.length === 1 ? '' : 'es'} need attendance records`,
        priority: 'medium' as const,
        count: missingAttendanceClasses.length
      })
    }

    // 3. Upcoming assignments without lesson plans
    const upcomingAssignments = await prisma.assignment.findMany({
      where: {
        classSubject: {
          teacherId: teacher.id
        },
        dueDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // Next 14 days
        }
      },
      include: {
        classSubject: {
          include: {
            lessonPlans: {
              where: {
                date: {
                  gte: new Date(),
                  lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
                }
              }
            }
          }
        }
      }
    })

    const classSubjectsNeedingPlans = upcomingAssignments
      .filter(assignment => assignment.classSubject.lessonPlans.length === 0)
      .map(assignment => assignment.classSubject)
      .filter((cs, index, self) => self.findIndex(c => c.id === cs.id) === index) // Remove duplicates

    if (classSubjectsNeedingPlans.length > 0) {
      tasks.push({
        id: 'lesson-planning',
        type: 'planning',
        title: 'Lesson Planning Needed',
        description: `${classSubjectsNeedingPlans.length} class${classSubjectsNeedingPlans.length === 1 ? '' : 'es'} need lesson plans for upcoming assignments`,
        priority: 'medium' as const,
        count: classSubjectsNeedingPlans.length,
        dueDate: 'This week'
      })
    }

    // 4. Unread messages
    const unreadMessages = await prisma.message.count({
      where: {
        recipientId: teacher.id,
        isRead: false
      }
    })

    if (unreadMessages > 0) {
      tasks.push({
        id: 'messages-unread',
        type: 'message' as any,
        title: 'Unread Messages',
        description: `${unreadMessages} unread message${unreadMessages === 1 ? '' : 's'} from parents and students`,
        priority: unreadMessages > 5 ? 'high' : 'medium' as const,
        count: unreadMessages
      })
    }

    // Sort tasks by priority (high -> medium -> low)
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    tasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])

    return NextResponse.json({ tasks })

  } catch (error) {
    console.error('Error fetching pending tasks:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function formatDueDate(date: Date): string {
  const now = new Date()
  const diffInDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Tomorrow'
  if (diffInDays < 7) return `In ${diffInDays} days`
  if (diffInDays < 14) return 'Next week'
  
  return date.toLocaleDateString()
}
