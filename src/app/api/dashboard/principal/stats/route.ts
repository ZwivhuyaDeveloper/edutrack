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
      select: { id: true, role: true, schoolId: true }
    })

    if (!user || user.role !== 'PRINCIPAL') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Get school statistics
    const [
      totalStudents,
      totalTeachers,
      totalClasses,
      totalSubjects
    ] = await Promise.all([
      prisma.user.count({
        where: { schoolId: user.schoolId, role: 'STUDENT', isActive: true }
      }),
      prisma.user.count({
        where: { schoolId: user.schoolId, role: 'TEACHER', isActive: true }
      }),
      prisma.class.count({
        where: { schoolId: user.schoolId, isActive: true }
      }),
      prisma.subject.count({
        where: { schoolId: user.schoolId, isActive: true }
      })
    ])

    // Mock data for now (can be replaced with real calculations)
    const attendanceRate = 94.2
    const pendingFees = 25000
    const upcomingEvents = 5
    const unreadMessages = 12

    return NextResponse.json({
      totalStudents,
      totalTeachers,
      totalClasses,
      totalSubjects,
      attendanceRate,
      pendingFees,
      upcomingEvents,
      unreadMessages
    })
  } catch (error) {
    console.error('Error fetching principal stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
