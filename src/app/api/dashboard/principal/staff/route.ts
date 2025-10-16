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

    // Fetch teachers
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
        teacherProfile: {
          select: {
            department: true,
            employeeId: true,
            hireDate: true
          }
        }
      },
      orderBy: {
        firstName: 'asc'
      },
      take: 10 // Get top 10 teachers
    })

    // Fetch clerks
    const clerks = await prisma.user.findMany({
      where: {
        schoolId: user.schoolId,
        role: 'CLERK',
        isActive: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        clerkProfile: {
          select: {
            department: true,
            employeeId: true,
            hireDate: true
          }
        }
      },
      orderBy: {
        firstName: 'asc'
      },
      take: 10 // Get top 10 clerks
    })

    // Combine and format staff data
    const staff = [
      ...teachers.map(teacher => ({
        id: teacher.id,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        email: teacher.email,
        avatar: teacher.avatar,
        role: 'TEACHER' as const,
        department: teacher.teacherProfile?.department,
        employeeId: teacher.teacherProfile?.employeeId,
        hireDate: teacher.teacherProfile?.hireDate
      })),
      ...clerks.map(clerk => ({
        id: clerk.id,
        firstName: clerk.firstName,
        lastName: clerk.lastName,
        email: clerk.email,
        avatar: clerk.avatar,
        role: 'CLERK' as const,
        department: clerk.clerkProfile?.department,
        employeeId: clerk.clerkProfile?.employeeId,
        hireDate: clerk.clerkProfile?.hireDate
      }))
    ]

    return NextResponse.json({ 
      staff,
      totalTeachers: teachers.length,
      totalClerks: clerks.length
    })
  } catch (error) {
    console.error('Error fetching staff:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
