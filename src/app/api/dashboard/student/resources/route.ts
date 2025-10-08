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

    // Get student's enrolled classes
    let resources
    try {
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: user.id, status: 'ACTIVE' },
        select: { classId: true }
      })

      const classIds = enrollments.map(e => e.classId)

      // Get resources for enrolled classes
      resources = await prisma.resource.findMany({
        where: {
          OR: [
            { classId: { in: classIds } },
            { isPublic: true }
          ]
        },
        include: {
          subject: {
            select: {
              name: true,
              code: true
            }
          },
          uploadedBy: {
            select: {
              firstName: true,
              lastName: true,
              role: true
            }
          }
        },
        orderBy: {
          uploadedAt: 'desc'
        },
        take: 100
      })
    } catch (dbError) {
      console.error('Error fetching resources:', dbError)
      return NextResponse.json([])
    }

    const formattedResources = resources.map(resource => ({
      id: resource.id,
      title: resource.title,
      description: resource.description,
      type: resource.type,
      fileUrl: resource.fileUrl,
      fileName: resource.fileName,
      fileSize: resource.fileSize,
      subject: resource.subject ? {
        name: resource.subject.name,
        code: resource.subject.code
      } : null,
      uploadedBy: {
        name: `${resource.uploadedBy.firstName} ${resource.uploadedBy.lastName}`,
        role: resource.uploadedBy.role
      },
      uploadedAt: resource.uploadedAt,
      isPublic: resource.isPublic
    }))

    return NextResponse.json(formattedResources)
  } catch (error) {
    console.error('Error fetching resources:', error)
    return NextResponse.json([])
  }
}
