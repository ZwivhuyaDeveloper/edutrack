import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { RateLimiters } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
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

    // Get pending fee records (unpaid) for students in the school
    const feeRecords = await prisma.fee_records.findMany({
      where: {
        paid: false,
        // Get students from the same school
        studentId: {
          in: (await prisma.user.findMany({
            where: {
              schoolId: user.schoolId,
              role: 'STUDENT'
            },
            select: { id: true }
          })).map(s => s.id)
        }
      },
      select: {
        id: true,
        description: true,
        amount: true,
        dueDate: true,
        paid: true,
        studentId: true
      },
      orderBy: {
        dueDate: 'asc'
      },
      take: 5
    })

    // Fetch student details for each fee record
    const feeRecordsWithStudents = await Promise.all(
      feeRecords.map(async (record) => {
        const student = await prisma.user.findUnique({
          where: { id: record.studentId },
          select: {
            firstName: true,
            lastName: true
          }
        })
        
        return {
          ...record,
          student
        }
      })
    )

    return NextResponse.json({ 
      feeRecords: feeRecordsWithStudents 
    })
  } catch (error) {
    console.error('Error fetching fee records:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
