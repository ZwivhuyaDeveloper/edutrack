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

    // Get user from database with error handling
    let user
    try {
      user = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: { id: true, role: true, schoolId: true }
      })
    } catch (dbError) {
      console.error('Database connection error:', dbError)
      // Return empty array for MVP if database is not set up yet
      return NextResponse.json([])
    }

    if (!user) {
      // User not in database yet - return empty array for MVP
      console.log('User not found in database, returning empty classes')
      return NextResponse.json([])
    }

    if (user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Access denied. Student role required.' },
        { status: 403 }
      )
    }

    // Get student's enrolled classes with error handling
    let enrollments
    try {
      enrollments = await prisma.enrollment.findMany({
        where: {
          studentId: user.id,
          status: 'ACTIVE'
        },
        include: {
          class: {
            include: {
              grade: true,
              classSubjects: {
                include: {
                  subject: true,
                  teacher: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      email: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: {
          enrolledAt: 'desc'
        }
      })
    } catch (dbError) {
      console.error('Error fetching enrollments:', dbError)
      // Return empty array if no enrollments exist
      return NextResponse.json([])
    }

    // Transform data for frontend
    const classes = enrollments.map(enrollment => ({
      id: enrollment.class.id,
      name: enrollment.class.name,
      grade: enrollment.class.grade?.name || 'N/A',
      section: enrollment.class.section,
      academicYear: enrollment.class.academicYear,
      subjects: enrollment.class.classSubjects?.map(cs => ({
        id: cs.subject.id,
        name: cs.subject.name,
        code: cs.subject.code,
        teacher: cs.teacher ? {
          id: cs.teacher.id,
          name: `${cs.teacher.firstName} ${cs.teacher.lastName}`,
          email: cs.teacher.email
        } : null
      })) || [],
      enrolledAt: enrollment.enrolledAt,
      status: enrollment.status
    }))

    return NextResponse.json(classes)
  } catch (error) {
    console.error('Error fetching student classes:', error)
    // Return empty array instead of error for MVP
    return NextResponse.json([])
  }
}
