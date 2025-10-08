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

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true }
    })

    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Get student's enrolled classes
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: user.id, status: 'ACTIVE' },
      select: { classId: true }
    })

    const classIds = enrollments.map(e => e.classId)

    // Get assignments for enrolled classes
    const assignments = await prisma.assignment.findMany({
      where: {
        classId: { in: classIds }
      },
      include: {
        subject: {
          select: { name: true, code: true }
        },
        class: {
          select: { name: true, section: true }
        },
        submissions: {
          where: { studentId: user.id },
          select: {
            id: true,
            status: true,
            grade: true,
            submittedAt: true
          }
        }
      },
      orderBy: { dueDate: 'asc' }
    })

    return NextResponse.json(assignments)
  } catch (error) {
    console.error('Error fetching assignments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
