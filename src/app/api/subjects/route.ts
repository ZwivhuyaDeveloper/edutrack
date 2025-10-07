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

    // Build query based on role
    const whereClause: any = {
      schoolId: user.schoolId
    }

    if (user.role === 'TEACHER') {
      // Teachers see only subjects they teach
      const teachingAssignments = await prisma.teachingAssignment.findMany({
        where: { 
          teacherId: user.id,
          ...(classId ? { classSubject: { classId } } : {})
        },
        include: {
          classSubject: {
            select: { subjectId: true }
          }
        }
      })
      const subjectIds = [...new Set(teachingAssignments.map(ta => ta.classSubject.subjectId))]
      
      // If teacher has no assignments, return empty array
      if (subjectIds.length === 0) {
        return NextResponse.json({
          success: true,
          subjects: []
        })
      }
      
      whereClause.id = { in: subjectIds }
    }

    const subjects = await prisma.subject.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        code: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      subjects
    })
  } catch (error) {
    console.error('Fetch subjects error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subjects' },
      { status: 500 }
    )
  }
}
