import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { RateLimiters } from '@/lib/rate-limit'

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

    // Get upcoming events for the next 7 days
    const now = new Date()
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

    const events = await prisma.event.findMany({
      where: {
        schoolId: user.schoolId,
        startDate: {
          gte: now,
          lte: sevenDaysFromNow
        }
      },
      select: {
        id: true,
        title: true,
        description: true,
        startDate: true,
        endDate: true,
        location: true,
        type: true,
        isAllDay: true,
        createdBy: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      },
      take: 5
    })

    return NextResponse.json({ 
      events 
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
