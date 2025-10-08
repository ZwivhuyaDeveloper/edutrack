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
        teacherProfile: true
      }
    })

    if (!teacher || teacher.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    // Get today's day of week (1 = Monday, 7 = Sunday)
    const today = new Date()
    const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay() // Convert Sunday from 0 to 7

    // Get today's class meetings for this teacher
    const todayMeetings = await prisma.classMeeting.findMany({
      where: {
        dayOfWeek,
        classSubject: {
          teacherId: teacher.id
        }
      },
      include: {
        classSubject: {
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
        },
        period: true,
        room: true
      },
      orderBy: {
        period: {
          order: 'asc'
        }
      }
    })

    // Transform the data to match the expected format
    const classes = todayMeetings.map(meeting => {
      const classSubject = meeting.classSubject
      const studentCount = classSubject.class.enrollments.length

      return {
        id: classSubject.id,
        name: `${classSubject.subject.name} - ${classSubject.class.name}`,
        subject: classSubject.subject.name,
        grade: classSubject.class.grade,
        studentCount,
        schedule: `${meeting.period.startTime} - ${meeting.period.endTime}`,
        nextSession: {
          time: meeting.period.startTime,
          room: meeting.room.name,
          topic: `${classSubject.subject.name} Class` // You could enhance this with lesson plan data
        }
      }
    })

    return NextResponse.json({ classes })

  } catch (error) {
    console.error('Error fetching today\'s classes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
