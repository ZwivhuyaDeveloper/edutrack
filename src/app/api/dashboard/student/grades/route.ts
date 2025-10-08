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
      return NextResponse.json([])
    }

    if (!user) {
      console.log('User not found in database, returning empty grades')
      return NextResponse.json([])
    }

    if (user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Access denied. Student role required.' },
        { status: 403 }
      )
    }

    // Get student's submissions with grades
    let submissions
    try {
      submissions = await prisma.submission.findMany({
        where: {
          studentId: user.id,
          status: 'GRADED'
        },
        include: {
          assignment: {
            include: {
              subject: {
                select: {
                  id: true,
                  name: true,
                  code: true
                }
              },
              class: {
                select: {
                  name: true,
                  section: true
                }
              }
            }
          }
        },
        orderBy: {
          gradedAt: 'desc'
        }
      })
    } catch (dbError) {
      console.error('Error fetching grades:', dbError)
      return NextResponse.json([])
    }

    // Transform data for frontend
    const grades = submissions.map(submission => ({
      id: submission.id,
      assignment: {
        id: submission.assignment.id,
        title: submission.assignment.title,
        type: submission.assignment.type,
        maxPoints: submission.assignment.maxPoints,
        dueDate: submission.assignment.dueDate
      },
      subject: {
        id: submission.assignment.subject.id,
        name: submission.assignment.subject.name,
        code: submission.assignment.subject.code
      },
      class: {
        name: submission.assignment.class.name,
        section: submission.assignment.class.section
      },
      grade: submission.grade,
      feedback: submission.feedback,
      submittedAt: submission.submittedAt,
      gradedAt: submission.gradedAt,
      percentage: submission.assignment.maxPoints > 0 
        ? Math.round((submission.grade! / submission.assignment.maxPoints) * 100)
        : 0
    }))

    return NextResponse.json(grades)
  } catch (error) {
    console.error('Error fetching student grades:', error)
    return NextResponse.json([])
  }
}
