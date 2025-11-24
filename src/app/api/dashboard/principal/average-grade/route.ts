import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { RateLimiters } from '@/lib/rate-limit'
import { secureLog, sanitizeForLog } from '@/lib/secure-logger'

// Enable Next.js caching with revalidation
export const revalidate = 300 // Revalidate every 5 minutes (grades change moderately)
export const dynamic = 'force-dynamic' // Ensure fresh data for authenticated users

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting (30 requests per minute)
    const rateLimitResult = await RateLimiters.api(request)
    if (!rateLimitResult.success) {
      console.warn('[Principal Average Grade] Rate limit exceeded')
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

    // Get all grades for students in the school with grade item details
    const grades = await prisma.grade.findMany({
      where: {
        student: { schoolId: user.schoolId, role: 'STUDENT' }
      },
      select: {
        id: true,
        points: true,
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        gradeItem: {
          select: {
            maxPoints: true,
            classSubject: {
              select: {
                subject: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (grades.length === 0) {
      // No grades yet - return zeros
      return NextResponse.json({
        averageGrade: 0,
        highestGrade: 0,
        lowestGrade: 0,
        gradeDistribution: [],
        topPerformers: []
      })
    }

    // Calculate percentage grades
    const percentageGrades = grades.map(grade => {
      const maxPoints = grade.gradeItem.maxPoints
      const percentage = maxPoints > 0 ? (grade.points / maxPoints) * 100 : 0
      return {
        id: grade.id,
        percentage,
        studentId: grade.student.id,
        studentName: `${grade.student.firstName} ${grade.student.lastName}`,
        subject: grade.gradeItem.classSubject.subject.name
      }
    })

    // Calculate average grade
    const totalPercentage = percentageGrades.reduce((sum, g) => sum + g.percentage, 0)
    const averageGrade = percentageGrades.length > 0 ? totalPercentage / percentageGrades.length : 0

    // Find highest and lowest grades
    const sortedGrades = [...percentageGrades].sort((a, b) => b.percentage - a.percentage)
    const highestGrade = sortedGrades[0]?.percentage || 0
    const lowestGrade = sortedGrades[sortedGrades.length - 1]?.percentage || 0

    // Calculate grade distribution
    const distribution = {
      'A (90-100%)': 0,
      'B (80-89%)': 0,
      'C (70-79%)': 0,
      'D (60-69%)': 0,
      'F (0-59%)': 0
    }

    percentageGrades.forEach(grade => {
      if (grade.percentage >= 90) distribution['A (90-100%)']++
      else if (grade.percentage >= 80) distribution['B (80-89%)']++
      else if (grade.percentage >= 70) distribution['C (70-79%)']++
      else if (grade.percentage >= 60) distribution['D (60-69%)']++
      else distribution['F (0-59%)']++
    })

    const totalGrades = percentageGrades.length
    const gradeDistribution = Object.entries(distribution).map(([range, count]) => ({
      range,
      count,
      percentage: totalGrades > 0 ? (count / totalGrades) * 100 : 0
    }))

    // Get top performers (unique students with their best grades)
    const studentBestGrades = new Map<string, { id: string; name: string; grade: number; subject: string }>()
    
    percentageGrades.forEach(grade => {
      const existing = studentBestGrades.get(grade.studentId)
      if (!existing || grade.percentage > existing.grade) {
        studentBestGrades.set(grade.studentId, {
          id: grade.studentId,
          name: grade.studentName,
          grade: grade.percentage,
          subject: grade.subject
        })
      }
    })

    const topPerformers = Array.from(studentBestGrades.values())
      .sort((a, b) => b.grade - a.grade)
      .slice(0, 5)

    // Log the stats for debugging using secure logger (sanitized and dev-only)
    secureLog.info('Principal Average Grade Data:', sanitizeForLog({
      schoolId: user.schoolId,
      averageGrade: averageGrade.toFixed(2),
      highestGrade: highestGrade.toFixed(2),
      lowestGrade: lowestGrade.toFixed(2),
      totalGrades: percentageGrades.length,
      topPerformersCount: topPerformers.length
    }))

    const response = NextResponse.json({
      averageGrade: Math.round(averageGrade * 10) / 10, // Round to 1 decimal
      highestGrade: Math.round(highestGrade * 10) / 10,
      lowestGrade: Math.round(lowestGrade * 10) / 10,
      gradeDistribution,
      topPerformers
    })
    
    // Add cache headers for client-side caching (5 minutes)
    response.headers.set('Cache-Control', 'private, max-age=300, stale-while-revalidate=600')
    return response
  } catch (error) {
    console.error('Error fetching principal average grade:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
