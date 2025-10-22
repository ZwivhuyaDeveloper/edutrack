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

    // Get classes with enrollment count and subject count
    const classes = await prisma.class.findMany({
      where: {
        schoolId: user.schoolId
      },
      select: {
        id: true,
        name: true,
        grade: true,
        section: true,
        _count: {
          select: {
            enrollments: true,
            subjects: true
          }
        },
        subjects: {
          select: {
            subject: {
              select: {
                name: true,
                code: true
              }
            },
            teacher: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          },
          take: 3 // Get first 3 subjects for preview
        }
      },
      orderBy: [
        { grade: 'asc' },
        { section: 'asc' }
      ],
      take: 6 // Get top 6 classes
    })

    return NextResponse.json({ 
      classes 
    })
  } catch (error) {
    console.error('Error fetching classes:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
