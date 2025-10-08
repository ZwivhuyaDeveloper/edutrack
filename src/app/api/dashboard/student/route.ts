import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        studentProfile: true,
        school: true
      }
    })

    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Not a student' }, { status: 403 })
    }

    // Get student's enrollments
    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId: user.id,
        status: 'ACTIVE'
      },
      include: {
        class: {
          include: {
            subjects: {
              include: {
                subject: true,
                teacher: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                },
                classMeetings: {
                  include: {
                    period: true,
                    room: true
                  }
                }
              }
            }
          }
        }
      }
    })

    // Get today's schedule
    const today = new Date().getDay()
    const todaySchedule = enrollments.flatMap(enrollment => 
      enrollment.class.subjects.flatMap(classSubject =>
        classSubject.classMeetings
          .filter(meeting => meeting.dayOfWeek === today)
          .map(meeting => ({
            id: meeting.id,
            subject: classSubject.subject.name,
            teacher: `${classSubject.teacher.firstName} ${classSubject.teacher.lastName}`,
            startTime: meeting.period.startTime,
            endTime: meeting.period.endTime,
            room: meeting.room ? `${meeting.room.name}, ${meeting.room.building}` : 'TBA',
            periodName: meeting.period.name
          }))
      )
    ).sort((a, b) => a.startTime.localeCompare(b.startTime))

    // Get upcoming assignments
    const classIds = enrollments.map(e => e.class.id)
    const assignments = await prisma.assignment.findMany({
      where: {
        classId: { in: classIds },
        dueDate: { gte: new Date() }
      },
      include: {
        subject: {
          select: { name: true }
        },
        submissions: {
          where: { studentId: user.id },
          select: {
            id: true,
            submittedAt: true,
            grade: true
          }
        }
      },
      orderBy: { dueDate: 'asc' },
      take: 10
    })

    const formattedAssignments = assignments.map(assignment => ({
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate,
      maxPoints: assignment.maxPoints,
      subject: assignment.subject.name,
      submission: assignment.submissions[0] || null
    }))

    // Get recent grades
    const grades = await prisma.grade.findMany({
      where: { studentId: user.id },
      include: {
        gradeItem: {
          include: {
            classSubject: {
              include: {
                subject: {
                  select: { name: true }
                }
              }
            }
          }
        }
      },
      orderBy: { gradedAt: 'desc' },
      take: 10
    })

    const formattedGrades = grades.map(grade => ({
      id: grade.id,
      points: grade.points,
      maxPoints: grade.gradeItem.maxPoints,
      itemName: grade.gradeItem.name,
      subject: grade.gradeItem.classSubject.subject.name,
      gradedAt: grade.gradedAt,
      feedback: grade.feedback
    }))

    // Get school announcements
    const announcements = await prisma.announcement.findMany({
      where: {
        schoolId: user.schoolId,
        publishedAt: { lte: new Date() },
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: new Date() } }
        ]
      },
      orderBy: { publishedAt: 'desc' },
      take: 5
    })

    const formattedAnnouncements = announcements.map(announcement => ({
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      publishedAt: announcement.publishedAt,
      createdAt: announcement.createdAt
    }))

    // Get attendance summary
    const attendanceRecords = await prisma.attendance.findMany({
      where: { studentId: user.id },
      include: {
        session: {
          select: { date: true }
        }
      }
    })

    const attendanceStats = {
      total: attendanceRecords.length,
      present: attendanceRecords.filter(r => r.status === 'PRESENT').length,
      absent: attendanceRecords.filter(r => r.status === 'ABSENT').length,
      late: attendanceRecords.filter(r => r.status === 'LATE').length,
      excused: attendanceRecords.filter(r => r.status === 'EXCUSED').length
    }

    return NextResponse.json({
      student: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        grade: user.studentProfile?.grade,
        school: user.school.name
      },
      schedule: todaySchedule,
      assignments: formattedAssignments,
      grades: formattedGrades,
      announcements: formattedAnnouncements,
      attendance: attendanceStats,
      stats: {
        pendingAssignments: formattedAssignments.filter(a => !a.submission).length,
        classesToday: todaySchedule.length,
        recentGrades: formattedGrades.length,
        unreadAnnouncements: formattedAnnouncements.length
      }
    })
  } catch (error) {
    console.error('Error fetching student dashboard data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
