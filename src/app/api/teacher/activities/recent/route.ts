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

    const activities = []

    // Get recent assignment submissions (last 7 days)
    const recentSubmissions = await prisma.assignmentSubmission.findMany({
      where: {
        assignment: {
          classSubject: {
            teacherId: teacher.id
          }
        },
        submittedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      include: {
        assignment: {
          include: {
            subject: true,
            class: true
          }
        },
        student: true
      },
      orderBy: {
        submittedAt: 'desc'
      },
      take: 10
    })

    // Add submission activities
    for (const submission of recentSubmissions) {
      activities.push({
        id: `submission-${submission.id}`,
        type: 'submission',
        title: 'New assignment submission',
        description: `${submission.assignment.title} - ${submission.student.firstName} ${submission.student.lastName}`,
        timestamp: formatTimestamp(submission.submittedAt),
        metadata: {
          assignmentId: submission.assignmentId,
          studentId: submission.studentId
        }
      })
    }

    // Get recent grades published (last 7 days)
    const recentGrades = await prisma.grade.findMany({
      where: {
        teacherId: teacher.id,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        gradeItem: {
          include: {
            classSubject: {
              include: {
                class: true,
                subject: true
              }
            }
          }
        },
        student: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    // Add grade activities
    for (const grade of recentGrades) {
      activities.push({
        id: `grade-${grade.id}`,
        type: 'grade',
        title: 'Grade published',
        description: `${grade.gradeItem.name} - ${grade.gradeItem.classSubject.subject.name} ${grade.gradeItem.classSubject.class.name}`,
        timestamp: formatTimestamp(grade.createdAt),
        metadata: {
          gradeId: grade.id,
          studentId: grade.studentId
        }
      })
    }

    // Get recent messages (last 7 days)
    const recentMessages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: teacher.id },
          { recipientId: teacher.id }
        ],
        sentAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        sender: true,
        recipient: true,
        conversation: true
      },
      orderBy: {
        sentAt: 'desc'
      },
      take: 10
    })

    // Add message activities
    for (const message of recentMessages) {
      const isReceived = message.recipientId === teacher.id
      const otherUser = isReceived ? message.sender : message.recipient
      
      activities.push({
        id: `message-${message.id}`,
        type: 'message',
        title: isReceived ? 'Message received' : 'Message sent',
        description: `${isReceived ? 'From' : 'To'} ${otherUser?.firstName} ${otherUser?.lastName}: ${message.content.substring(0, 50)}${message.content.length > 50 ? '...' : ''}`,
        timestamp: formatTimestamp(message.sentAt),
        metadata: {
          messageId: message.id,
          conversationId: message.conversationId
        }
      })
    }

    // Get recent attendance sessions (last 7 days)
    const recentAttendance = await prisma.attendanceSession.findMany({
      where: {
        classSubject: {
          teacherId: teacher.id
        },
        date: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        classSubject: {
          include: {
            class: true,
            subject: true
          }
        },
        attendances: true
      },
      orderBy: {
        date: 'desc'
      },
      take: 10
    })

    // Add attendance activities
    for (const session of recentAttendance) {
      const presentCount = session.attendances.filter(a => a.status === 'PRESENT').length
      const totalCount = session.attendances.length
      
      activities.push({
        id: `attendance-${session.id}`,
        type: 'attendance',
        title: 'Attendance recorded',
        description: `${session.classSubject.subject.name} ${session.classSubject.class.name} - ${presentCount}/${totalCount} present`,
        timestamp: formatTimestamp(session.date),
        metadata: {
          sessionId: session.id,
          classSubjectId: session.classSubjectId
        }
      })
    }

    // Sort all activities by timestamp (most recent first)
    activities.sort((a, b) => {
      const timeA = parseTimestamp(a.timestamp)
      const timeB = parseTimestamp(b.timestamp)
      return timeB.getTime() - timeA.getTime()
    })

    // Return top 15 activities
    return NextResponse.json({ activities: activities.slice(0, 15) })

  } catch (error) {
    console.error('Error fetching recent activities:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function formatTimestamp(date: Date): string {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`
  
  return date.toLocaleDateString()
}

function parseTimestamp(timestamp: string): Date {
  // Simple parsing for our formatted timestamps
  if (timestamp === 'Just now') return new Date()
  
  const match = timestamp.match(/(\d+)\s+(minute|hour|day)s?\s+ago/)
  if (match) {
    const value = parseInt(match[1])
    const unit = match[2]
    const now = new Date()
    
    switch (unit) {
      case 'minute':
        return new Date(now.getTime() - value * 60 * 1000)
      case 'hour':
        return new Date(now.getTime() - value * 60 * 60 * 1000)
      case 'day':
        return new Date(now.getTime() - value * 24 * 60 * 60 * 1000)
    }
  }
  
  return new Date(timestamp)
}
