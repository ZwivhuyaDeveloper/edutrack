/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('[API /classes] Starting request')
    
    // Check authentication
    const { userId } = await auth()
    console.log('[API /classes] User ID:', userId)
    
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
    
    console.log('[API /classes] User found:', user?.id, 'Role:', user?.role)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Build query based on role
    const whereClause: any = {
      schoolId: user.schoolId
    }

    if (user.role === 'TEACHER') {
      // Teachers see only their assigned classes
      const teachingAssignments = await prisma.teachingAssignment.findMany({
        where: { teacherId: user.id },
        include: {
          classSubject: {
            select: { classId: true }
          }
        }
      })
      const classIds = [...new Set(teachingAssignments.map(ta => ta.classSubject.classId))]
      
      // If teacher has no assignments, return empty array
      if (classIds.length === 0) {
        return NextResponse.json({
          success: true,
          classes: []
        })
      }
      
      whereClause.id = { in: classIds }
    }

    const classes = await prisma.class.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        grade: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    console.log('[API /classes] Returning', classes.length, 'classes')
    
    return NextResponse.json({
      success: true,
      classes
    })
  } catch (error) {
    console.error('[API /classes] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch classes', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
