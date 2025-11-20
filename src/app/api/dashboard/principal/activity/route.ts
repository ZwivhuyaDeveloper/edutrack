import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { RateLimiters } from '@/lib/rate-limit'
import { cachedJsonResponse, CacheConfig } from '@/lib/api-cache-config'

// Enable Next.js caching
export const revalidate = 30 // Revalidate every 30 seconds
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const rateLimitResult = await RateLimiters.api(request)
    if (!rateLimitResult.success) return rateLimitResult.response
    
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

    // Get real recent activities from different sources
    const [
      recentEnrollments,
      schoolStudents,
      recentAnnouncements,
      recentAssignments,
      recentClasses,
      recentTeachers
    ] = await Promise.all([

      // Recent student enrollments
      prisma.enrollment.findMany({
        where: {
          class: {
            schoolId: user.schoolId
          },
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        },
        include: {
          student: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          class: {
            select: {
              name: true,
              grade: true,
              section: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 3
      }),

      // Get student IDs for payment query
      prisma.user.findMany({
        where: { schoolId: user.schoolId, role: 'STUDENT' },
        select: { id: true }
      }),

      // Recent announcements
      prisma.announcement.findMany({
        where: {
          schoolId: user.schoolId,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        },
        include: {
          createdBy: {
            select: {
              firstName: true,
              lastName: true,
              role: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 3
      }),

      // Recent assignments
      prisma.assignment.findMany({
        where: {
          class: {
            schoolId: user.schoolId
          },
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        },
        include: {
          subject: {
            select: {
              name: true
            }
          },
          class: {
            select: {
              name: true,
              grade: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 3
      }),

      // Recent classes created
      prisma.class.findMany({
        where: {
          schoolId: user.schoolId,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        },
        select: {
          id: true,
          name: true,
          grade: true,
          section: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 3
      }),

      // Recent teachers added
      prisma.user.findMany({
        where: {
          schoolId: user.schoolId,
          role: 'TEACHER',
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 3
      })
    ])

    // Get recent payments using student IDs
    const studentIds = schoolStudents.map(student => student.id)
    const recentPayments = await prisma.payment.findMany({
      where: {
        account: {
          studentId: {
            in: studentIds
          }
        },
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 3
    })

    // Helper function to format timestamps
    const formatTimestamp = (date: Date): string => {
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffHours / 24)
      
      if (diffHours < 1) return 'Just now'
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
      return date.toLocaleDateString()
    }

    // Helper function to parse timestamp for sorting
    const parseTimestamp = (timestamp: string): number => {
      if (timestamp === 'Just now') return Date.now()
      if (timestamp.includes('hour')) {
        const hours = parseInt(timestamp.split(' ')[0])
        return Date.now() - (hours * 60 * 60 * 1000)
      }
      if (timestamp.includes('day')) {
        const days = parseInt(timestamp.split(' ')[0])
        return Date.now() - (days * 24 * 60 * 60 * 1000)
      }
      return new Date(timestamp).getTime()
    }

    // Format activities from different sources
    interface Activity {
      id: string
      type: string
      message: string
      timestamp: string
      user: string
    }
    
    const activities: Activity[] = []

    // Add enrollment activities
    recentEnrollments.forEach(enrollment => {
      activities.push({
        id: `enrollment-${enrollment.id}`,
        type: 'enrollment',
        message: `${enrollment.student.firstName} ${enrollment.student.lastName} enrolled in ${enrollment.class.name}`,
        timestamp: formatTimestamp(enrollment.createdAt),
        user: 'System'
      })
    })

    // Add payment activities
    recentPayments.forEach((payment: { id: string; amount: number; createdAt: Date }) => {
      activities.push({
        id: `payment-${payment.id}`,
        type: 'payment',
        message: `Payment of $${payment.amount} received`,
        timestamp: formatTimestamp(payment.createdAt),
        user: 'Finance Dept'
      })
    })

    // Add announcement activities
    recentAnnouncements.forEach(announcement => {
      activities.push({
        id: `announcement-${announcement.id}`,
        type: 'announcement',
        message: `New announcement: ${announcement.title}`,
        timestamp: formatTimestamp(announcement.createdAt),
        user: `${announcement.createdBy.firstName} ${announcement.createdBy.lastName}`
      })
    })

    // Add assignment activities
    recentAssignments.forEach(assignment => {
      activities.push({
        id: `assignment-${assignment.id}`,
        type: 'assignment',
        message: `New ${assignment.subject.name} assignment: ${assignment.title}`,
        timestamp: formatTimestamp(assignment.createdAt),
        user: 'Teacher'
      })
    })

    // Add class creation activities
    recentClasses.forEach(classItem => {
      activities.push({
        id: `class-${classItem.id}`,
        type: 'class',
        message: `New class created: ${classItem.name}${classItem.section ? ` (Section ${classItem.section})` : ''}`,
        timestamp: formatTimestamp(classItem.createdAt),
        user: 'Administration'
      })
    })

    // Add teacher addition activities
    recentTeachers.forEach(teacher => {
      activities.push({
        id: `teacher-${teacher.id}`,
        type: 'teacher',
        message: `New teacher joined: ${teacher.firstName} ${teacher.lastName}`,
        timestamp: formatTimestamp(teacher.createdAt),
        user: 'HR Department'
      })
    })

    // Sort all activities by timestamp (most recent first)
    activities.sort((a, b) => {
      const timeA = parseTimestamp(a.timestamp)
      const timeB = parseTimestamp(b.timestamp)
      return timeB - timeA
    })

    // Log activity summary for debugging
    console.log('Principal Activity Summary:', {
      schoolId: user.schoolId,
      totalActivities: activities.length,
      enrollments: recentEnrollments.length,
      payments: recentPayments.length,
      announcements: recentAnnouncements.length,
      assignments: recentAssignments.length,
      classes: recentClasses.length,
      teachers: recentTeachers.length,
      topActivities: activities.slice(0, 3).map(a => ({ type: a.type, message: a.message }))
    })

    // Return top 10 activities with cache headers
    return cachedJsonResponse(
      { activities: activities.slice(0, 10) },
      CacheConfig.REALTIME
    )
  } catch (error) {
    console.error('Error fetching activity:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
