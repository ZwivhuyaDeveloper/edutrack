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

    // Get recent teachers (limit to 5 for the dashboard)
    const teachers = await prisma.user.findMany({
      where: {
        schoolId: user.schoolId,
        role: 'TEACHER',
        isActive: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        createdAt: true,
        teacherProfile: {
          select: {
            department: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    return NextResponse.json({ 
      teachers 
    })
  } catch (error) {
    console.error('Error fetching teachers:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
