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
      allStudents,
      teacherCount,
      classCount,
      subjectCount,
      attendanceData,
      schoolStudents,
      upcomingEventsData,
      unreadNotifications
    ] = await Promise.all([
      // Get detailed student information
      prisma.user.findMany({
        where: { schoolId: user.schoolId, role: 'STUDENT' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          isActive: true,
          createdAt: true,
          enrollments: {
            where: {
              status: 'ACTIVE'
            },
            include: {
              class: {
                select: {
                  name: true,
                  grade: true
                }
              }
            }
          }
        }
      }),
      prisma.user.count({
        where: { schoolId: user.schoolId, role: 'TEACHER', isActive: true }
      }),
      prisma.class.count({
        where: { schoolId: user.schoolId }
      }),
      prisma.subject.count({
        where: { schoolId: user.schoolId }
      }),
      
      // Real attendance rate calculation (last 30 days)
      prisma.attendance.findMany({
        where: {
          session: {
            classSubject: {
              class: {
                schoolId: user.schoolId
              }
            }
          },
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        },
        select: {
          status: true
        }
      }),
      
      // Real pending fees calculation - get student IDs first, then query invoices
      prisma.user.findMany({
        where: { schoolId: user.schoolId, role: 'STUDENT' },
        select: { id: true }
      }),
      
      // Real upcoming events (next 7 days)
      prisma.event.count({
        where: {
          schoolId: user.schoolId,
          startDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
          }
        }
      }),
      
      // Real unread notifications for principal
      prisma.notification.count({
        where: {
          userId: user.id,
          isRead: false
        }
      })
    ])

    // Calculate real attendance rate
    const totalAttendanceRecords = attendanceData.length
    const presentRecords = attendanceData.filter(record => 
      record.status === 'PRESENT' || record.status === 'LATE'
    ).length
    const attendanceRate = totalAttendanceRecords > 0 
      ? Math.round((presentRecords / totalAttendanceRecords) * 100 * 10) / 10 
      : 0

    // Get student IDs for pending fees calculation
    const studentIds = schoolStudents.map(student => student.id)
    
    // Query pending invoices for school students
    const pendingInvoices = await prisma.invoice.findMany({
      where: {
        status: 'PENDING',
        account: {
          studentId: {
            in: studentIds
          }
        }
      },
      select: {
        total: true
      }
    })

    // Calculate student statistics
    const totalStudents = allStudents.length
    const activeStudents = allStudents.filter(student => student.isActive).length
    const enrolledStudents = allStudents.filter(student => student.enrollments.length > 0).length

    // Calculate total pending fees
    const pendingFees = pendingInvoices.reduce((sum: number, invoice: { total: number }) => sum + invoice.total, 0)
    
    // Calculate total paid fees
    const paidFees = await prisma.fee_records.findMany({
      where: {
        paid: true,
        studentId: {
          in: allStudents.map(s => s.id)
        }
      },
      select: {
        amount: true
      }
    })
    const totalPaidFees = paidFees.reduce((sum, fee) => sum + fee.amount, 0)
    
    const upcomingEvents = upcomingEventsData
    const unreadMessages = unreadNotifications

    // Log the stats for debugging
    console.log('Principal Dashboard Stats:', {
      schoolId: user.schoolId,
      totalStudents,
      activeStudents,
      enrolledStudents,
      totalTeachers: teacherCount,
      totalClasses: classCount,
      totalSubjects: subjectCount,
      attendanceRate,
      pendingFees,
      upcomingEvents,
      unreadMessages,
      studentDetails: allStudents.slice(0, 3) // Log first 3 students for debugging
    })

    return NextResponse.json({
      totalStudents,
      totalTeachers: teacherCount,
      totalClasses: classCount,
      totalSubjects: subjectCount,
      attendanceRate,
      pendingFees,
      totalPaidFees,
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
