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

    let user
    try {
      user = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: { id: true, role: true }
      })
    } catch (dbError) {
      console.error('Database connection error:', dbError)
      return NextResponse.json([])
    }

    if (!user) {
      return NextResponse.json([])
    }

    if (user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Get student's class schedule
    let schedule
    try {
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: user.id, status: 'ACTIVE' },
        include: {
          class: {
            include: {
              periods: {
                include: {
                  subject: true,
                  teacher: {
                    select: {
                      firstName: true,
                      lastName: true
                    }
                  },
                  room: true
                },
                orderBy: {
                  startTime: 'asc'
                }
              }
            }
          }
        }
      })

      schedule = enrollments.flatMap(e => 
        e.class.periods.map(period => ({
          id: period.id,
          dayOfWeek: period.dayOfWeek,
          startTime: period.startTime,
          endTime: period.endTime,
          subject: {
            name: period.subject.name,
            code: period.subject.code
          },
          teacher: period.teacher ? {
            name: `${period.teacher.firstName} ${period.teacher.lastName}`
          } : null,
          room: period.room ? {
            name: period.room.name,
            building: period.room.building
          } : null
        }))
      )
    } catch (dbError) {
      console.error('Error fetching schedule:', dbError)
      return NextResponse.json([])
    }

    return NextResponse.json(schedule)
  } catch (error) {
    console.error('Error fetching schedule:', error)
    return NextResponse.json([])
  }
}
