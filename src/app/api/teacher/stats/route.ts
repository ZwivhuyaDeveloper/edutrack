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
      where: { clerkId: userId },
      include: {
        teacherProfile: true,
        school: true
      }
    })

    if (!teacher || teacher.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    // Get teacher's class subjects
    const classSubjects = await prisma.classSubject.findMany({
      where: { teacherId: teacher.id },
      include: {
        class: {
          include: {
            enrollments: {
              where: { status: 'ACTIVE' }
            }
          }
        },
        subject: true
      }
    })

    // Calculate total students across all classes
    const totalStudents = classSubjects.reduce((total, cs) => {
      return total + cs.class.enrollments.length
    }, 0)

    // Get pending assignment submissions that need grading
    const pendingSubmissions = await prisma.assignmentSubmission.findMany({
      where: {
        assignment: {
          classSubject: {
            teacherId: teacher.id
          }
        },
        grade: null // Not graded yet
      }
    })

    // Get average grade for teacher's classes
    const grades = await prisma.grade.findMany({
      where: { teacherId: teacher.id },
      include: { gradeItem: true }
    })

    let averageGrade = 0
    if (grades.length > 0) {
      const totalPoints = grades.reduce((sum, grade) => sum + grade.points, 0)
      const totalMaxPoints = grades.reduce((sum, grade) => sum + grade.gradeItem.maxPoints, 0)
      averageGrade = totalMaxPoints > 0 ? (totalPoints / totalMaxPoints) * 100 : 0
    }

    // Get attendance rate for teacher's classes (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const attendanceSessions = await prisma.attendanceSession.findMany({
      where: {
        classSubject: {
          teacherId: teacher.id
        },
        date: {
          gte: thirtyDaysAgo
        }
      },
      include: {
        attendances: true
      }
    })

    let attendanceRate = 0
    if (attendanceSessions.length > 0) {
      const totalAttendances = attendanceSessions.reduce((sum, session) => sum + session.attendances.length, 0)
      const presentAttendances = attendanceSessions.reduce((sum, session) => {
        return sum + session.attendances.filter(a => a.status === 'PRESENT').length
      }, 0)
      attendanceRate = totalAttendances > 0 ? (presentAttendances / totalAttendances) * 100 : 0
    }

    // Get unread messages
    const unreadMessages = await prisma.message.count({
      where: {
        recipientId: teacher.id,
        isRead: false
      }
    })

    const stats = {
      totalStudents,
      totalClasses: classSubjects.length,
      pendingAssignments: pendingSubmissions.length,
      averageGrade: Math.round(averageGrade * 10) / 10, // Round to 1 decimal
      attendanceRate: Math.round(attendanceRate * 10) / 10, // Round to 1 decimal
      unreadMessages
    }

    return NextResponse.json({ stats })

  } catch (error) {
    console.error('Error fetching teacher stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
