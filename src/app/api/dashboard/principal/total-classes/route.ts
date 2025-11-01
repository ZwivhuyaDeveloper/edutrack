import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { RateLimiters } from '@/lib/rate-limit'

interface GradeDistributionItem {
  grade: string | null
  _count: {
    _all: number
  }
}

export async function GET(request: NextRequest) {
  try {
    const rateLimitResult = await RateLimiters.api(request)
    if (!rateLimitResult.success) {
      return rateLimitResult.response
    }

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

    const [
      totalClasses,
      enrollmentGroups,
      gradeGroups,
      recentClasses
    ] = await Promise.all([
      prisma.class.count({
        where: { schoolId: user.schoolId }
      }),
      prisma.enrollment.groupBy({
        by: ['classId'],
        where: {
          class: { schoolId: user.schoolId },
          status: 'ACTIVE'
        },
        _count: { _all: true }
      }),
      prisma.class.groupBy({
        by: ['grade'],
        where: { schoolId: user.schoolId },
        _count: { _all: true }
      }),
      prisma.class.findMany({
        where: { schoolId: user.schoolId },
        select: {
          id: true,
          name: true,
          grade: true,
          section: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      })
    ])

    const totalActiveEnrollments = enrollmentGroups.reduce((total, group) => total + group._count._all, 0)
    const activeClassIds = new Set(enrollmentGroups.map(group => group.classId))
    const activeClasses = activeClassIds.size

    const averageStudentsPerClass = totalClasses > 0
      ? Math.round((totalActiveEnrollments / totalClasses) * 10) / 10
      : 0

    const gradeDistribution = (gradeGroups as GradeDistributionItem[]).map((grade) => ({
      grade: grade.grade ?? 'Unassigned',
      count: grade._count._all
    }))

    const enrollmentMap = new Map<string, number>(
      enrollmentGroups.map(group => [group.classId, group._count._all])
    )

    const recentClassSummary = recentClasses.map((classItem) => ({
      id: classItem.id,
      name: classItem.name,
      grade: classItem.grade,
      section: classItem.section,
      createdAt: classItem.createdAt,
      activeStudents: enrollmentMap.get(classItem.id) ?? 0
    }))

    console.log('Principal Total Classes Summary:', {
      schoolId: user.schoolId,
      totalClasses,
      activeClasses,
      totalActiveEnrollments,
      averageStudentsPerClass,
      gradeDistributionCount: gradeDistribution.length
    })

    return NextResponse.json({
      totalClasses,
      activeClasses,
      averageStudentsPerClass,
      gradeDistribution,
      recentClasses: recentClassSummary
    })
  } catch (error) {
    console.error('Error fetching total classes summary:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
