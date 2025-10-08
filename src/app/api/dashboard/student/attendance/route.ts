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

    // Get student's attendance records
    let attendanceRecords
    try {
      attendanceRecords = await prisma.attendance.findMany({
        where: {
          studentId: user.id
        },
        include: {
          class: {
            select: {
              name: true,
              section: true
            }
          },
          period: {
            include: {
              subject: {
                select: {
                  name: true,
                  code: true
                }
              }
            }
          }
        },
        orderBy: {
          date: 'desc'
        },
        take: 100 // Last 100 records
      })
    } catch (dbError) {
      console.error('Error fetching attendance:', dbError)
      return NextResponse.json([])
    }

    const attendance = attendanceRecords.map(record => ({
      id: record.id,
      date: record.date,
      status: record.status,
      class: {
        name: record.class.name,
        section: record.class.section
      },
      subject: record.period?.subject ? {
        name: record.period.subject.name,
        code: record.period.subject.code
      } : null,
      remarks: record.remarks
    }))

    return NextResponse.json(attendance)
  } catch (error) {
    console.error('Error fetching attendance:', error)
    return NextResponse.json([])
  }
}
