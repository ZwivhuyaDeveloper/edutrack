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

    // Get enrolled classes count
    const classesCount = await prisma.enrollment.count({
      where: { studentId: user.id, status: 'ACTIVE' }
    })

    // Get enrollments for further queries
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: user.id, status: 'ACTIVE' },
      select: { classId: true }
    })

    const classIds = enrollments.map(e => e.classId)

    // Get assignments stats
    const totalAssignments = await prisma.assignment.count({
      where: { classId: { in: classIds } }
    })

    const submissions = await prisma.submission.findMany({
      where: { studentId: user.id },
      select: { status: true, grade: true }
    })

    const pendingAssignments = totalAssignments - submissions.length
    const completedAssignments = submissions.filter(s => s.status === 'GRADED').length

    // Calculate average grade
    const gradedSubmissions = submissions.filter(s => s.grade !== null)
    const averageGrade = gradedSubmissions.length > 0
      ? gradedSubmissions.reduce((sum, s) => sum + (s.grade || 0), 0) / gradedSubmissions.length
      : 0

    // Get attendance rate (mock data for now)
    const attendanceRate = 92.5

    return NextResponse.json({
      totalClasses: classesCount,
      totalAssignments,
      pendingAssignments,
      completedAssignments,
      averageGrade: Math.round(averageGrade * 10) / 10,
      attendanceRate
    })
  } catch (error) {
    console.error('Error fetching student stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
