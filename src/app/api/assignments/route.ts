/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user from database to verify role
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true, schoolId: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Only teachers and admins can create assignments
    if (user.role !== 'TEACHER' && user.role !== 'ADMIN' && user.role !== 'PRINCIPAL') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, description, dueDate, maxPoints, classId, subjectId, attachments } = body

    // Validation
    if (!title || !dueDate || !classId || !subjectId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get active term for the school
    const activeTerm = await prisma.term.findFirst({
      where: {
        schoolId: user.schoolId,
        isActive: true
      }
    })

    if (!activeTerm) {
      return NextResponse.json(
        { error: 'No active term found. Please contact your administrator.' },
        { status: 400 }
      )
    }

    // Create assignment
    const assignment = await prisma.assignment.create({
      data: {
        title,
        description: description || null,
        dueDate: new Date(dueDate),
        maxPoints: maxPoints ? parseFloat(maxPoints) : null,
        attachments: attachments || [],
        classId,
        subjectId,
        termId: activeTerm.id
      },
      include: {
        class: true,
        subject: true,
        term: true
      }
    })

    return NextResponse.json({
      success: true,
      assignment
    })
  } catch (error) {
    console.error('Assignment creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create assignment' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true, schoolId: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')
    const subjectId = searchParams.get('subjectId')

    // Build query based on role
    const whereClause: any = {}

    if (user.role === 'STUDENT') {
      // Students see assignments for their enrolled classes
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: user.id },
        select: { classId: true }
      })
      const classIds = enrollments.map(e => e.classId)
      whereClause.classId = { in: classIds }
    } else if (user.role === 'TEACHER') {
      // Teachers see assignments for their teaching classes
      const teachingAssignments = await prisma.teachingAssignment.findMany({
        where: { teacherId: user.id },
        include: {
          classSubject: {
            select: { classId: true, subjectId: true }
          }
        }
      })
      const classIds = teachingAssignments.map(ta => ta.classSubject.classId)
      whereClause.classId = { in: classIds }
    }

    // Apply filters
    if (classId) {
      whereClause.classId = classId
    }
    if (subjectId) {
      whereClause.subjectId = subjectId
    }

    const assignments = await prisma.assignment.findMany({
      where: whereClause,
      include: {
        class: true,
        subject: true,
        term: true,
        submissions: {
          where: user.role === 'STUDENT' ? { studentId: user.id } : undefined,
          select: {
            id: true,
            submittedAt: true,
            grade: true
          }
        }
      },
      orderBy: {
        dueDate: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      assignments
    })
  } catch (error) {
    console.error('Fetch assignments error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    )
  }
}
