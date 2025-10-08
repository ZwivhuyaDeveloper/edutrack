/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

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
    const studentId = searchParams.get('studentId')

    // Build query based on role and filters
    const whereClause: any = {}

    // Apply filters
    if (classId) {
      whereClause.classId = classId
    }
    if (studentId) {
      whereClause.studentId = studentId
    }

    // Role-based access control
    if (user.role === 'STUDENT') {
      // Students can only see their own enrollments
      whereClause.studentId = user.id
    } else if (user.role === 'TEACHER') {
      // Teachers can see enrollments for their assigned classes
      if (!classId) {
        // If no classId specified, get all classes teacher is assigned to
        const teachingAssignments = await prisma.teachingAssignment.findMany({
          where: { teacherId: user.id },
          include: {
            classSubject: {
              select: { classId: true }
            }
          }
        })
        const classIds = [...new Set(teachingAssignments.map(ta => ta.classSubject.classId))]
        
        if (classIds.length === 0) {
          return NextResponse.json({
            success: true,
            enrollments: []
          })
        }
        
        whereClause.classId = { in: classIds }
      }
    } else if (user.role === 'PARENT') {
      // Parents can see enrollments for their children
      const childRelationships = await prisma.parentChildRelationship.findMany({
        where: { parentId: user.id },
        select: { childId: true }
      })
      const childIds = childRelationships.map(r => r.childId)
      
      if (childIds.length === 0) {
        return NextResponse.json({
          success: true,
          enrollments: []
        })
      }
      
      whereClause.studentId = { in: childIds }
    }
    // PRINCIPAL, CLERK, and ADMIN can see all enrollments in their school (no additional filter)

    const enrollments = await prisma.enrollment.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        },
        class: {
          select: {
            id: true,
            name: true,
            grade: true,
            section: true
          }
        }
      },
      orderBy: [
        { student: { lastName: 'asc' } },
        { student: { firstName: 'asc' } }
      ]
    })

    return NextResponse.json({
      success: true,
      enrollments
    })
  } catch (error) {
    console.error('Fetch enrollments error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch enrollments' },
      { status: 500 }
    )
  }
}

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

    // Only principals and clerks can create enrollments
    if (!['PRINCIPAL', 'CLERK', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { studentId, classId } = body

    // Validation
    if (!studentId || !classId) {
      return NextResponse.json(
        { error: 'Missing required fields: studentId and classId' },
        { status: 400 }
      )
    }

    // Verify student exists and belongs to same school
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { id: true, role: true, schoolId: true }
    })

    if (!student || student.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Invalid student' },
        { status: 400 }
      )
    }

    if (student.schoolId !== user.schoolId) {
      return NextResponse.json(
        { error: 'Student not in your school' },
        { status: 403 }
      )
    }

    // Verify class exists and belongs to same school
    const classData = await prisma.class.findUnique({
      where: { id: classId },
      select: { id: true, schoolId: true }
    })

    if (!classData) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      )
    }

    if (classData.schoolId !== user.schoolId) {
      return NextResponse.json(
        { error: 'Class not in your school' },
        { status: 403 }
      )
    }

    // Check if enrollment already exists
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_classId: {
          studentId,
          classId
        }
      }
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Student is already enrolled in this class' },
        { status: 400 }
      )
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        studentId,
        classId,
        status: 'ACTIVE'
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        class: {
          select: {
            id: true,
            name: true,
            grade: true,
            section: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      enrollment
    })
  } catch (error) {
    console.error('Enrollment creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create enrollment' },
      { status: 500 }
    )
  }
}
