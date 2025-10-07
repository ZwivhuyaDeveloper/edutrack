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
        select: { id: true, role: true, schoolId: true }
      })
    } catch (dbError) {
      console.error('Database connection error:', dbError)
      return NextResponse.json([])
    }

    if (!user) {
      return NextResponse.json([])
    }

    // Get events for the student's school
    let events
    try {
      events = await prisma.event.findMany({
        where: {
          schoolId: user.schoolId,
          OR: [
            { targetAudience: 'ALL' },
            { targetAudience: 'STUDENTS' }
          ],
          isActive: true
        },
        include: {
          organizer: {
            select: {
              firstName: true,
              lastName: true,
              role: true
            }
          }
        },
        orderBy: {
          startDate: 'asc'
        },
        take: 100
      })
    } catch (dbError) {
      console.error('Error fetching events:', dbError)
      return NextResponse.json([])
    }

    const formattedEvents = events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      type: event.type,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      targetAudience: event.targetAudience,
      organizer: event.organizer ? {
        name: `${event.organizer.firstName} ${event.organizer.lastName}`,
        role: event.organizer.role
      } : null,
      maxParticipants: event.maxParticipants,
      registrationDeadline: event.registrationDeadline,
      createdAt: event.createdAt
    }))

    return NextResponse.json(formattedEvents)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json([])
  }
}
