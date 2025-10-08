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

    let user
    try {
      user = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: { id: true, role: true }
      })
    } catch (dbError) {
      console.error('Database connection error:', dbError)
      return NextResponse.json([])
    }

    if (!user) {
      return NextResponse.json([])
    }

    if (user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Get student's reports
    let reports
    try {
      reports = await prisma.report.findMany({
        where: {
          studentId: user.id
        },
        include: {
          class: {
            select: {
              name: true,
              section: true,
              academicYear: true
            }
          },
          generatedBy: {
            select: {
              firstName: true,
              lastName: true,
              role: true
            }
          }
        },
        orderBy: {
          generatedAt: 'desc'
        },
        take: 50
      })
    } catch (dbError) {
      console.error('Error fetching reports:', dbError)
      return NextResponse.json([])
    }

    const formattedReports = reports.map(report => ({
      id: report.id,
      title: report.title,
      type: report.type,
      period: report.period,
      academicYear: report.academicYear,
      class: {
        name: report.class.name,
        section: report.class.section,
        academicYear: report.class.academicYear
      },
      fileUrl: report.fileUrl,
      generatedBy: {
        name: `${report.generatedBy.firstName} ${report.generatedBy.lastName}`,
        role: report.generatedBy.role
      },
      generatedAt: report.generatedAt,
      remarks: report.remarks
    }))

    return NextResponse.json(formattedReports)
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json([])
  }
}
