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
        select: { id: true, role: true, schoolId: true }
      })
    } catch (dbError) {
      console.error('Database connection error:', dbError)
      return NextResponse.json([])
    }

    if (!user) {
      return NextResponse.json([])
    }

    // Get announcements for the student's school
    let announcements
    try {
      announcements = await prisma.announcement.findMany({
        where: {
          schoolId: user.schoolId,
          OR: [
            { targetAudience: 'ALL' },
            { targetAudience: 'STUDENTS' }
          ],
          isActive: true
        },
        include: {
          author: {
            select: {
              firstName: true,
              lastName: true,
              role: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 50
      })
    } catch (dbError) {
      console.error('Error fetching announcements:', dbError)
      return NextResponse.json([])
    }

    const formattedAnnouncements = announcements.map(announcement => ({
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      targetAudience: announcement.targetAudience,
      author: {
        name: `${announcement.author.firstName} ${announcement.author.lastName}`,
        role: announcement.author.role
      },
      createdAt: announcement.createdAt,
      expiresAt: announcement.expiresAt
    }))

    return NextResponse.json(formattedAnnouncements)
  } catch (error) {
    console.error('Error fetching announcements:', error)
    return NextResponse.json([])
  }
}
