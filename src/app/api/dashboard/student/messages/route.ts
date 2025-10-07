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

    // Get messages for the student
    let messages
    try {
      messages = await prisma.message.findMany({
        where: {
          OR: [
            { recipientId: user.id },
            { senderId: user.id }
          ]
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
              avatar: true
            }
          },
          recipient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
              avatar: true
            }
          }
        },
        orderBy: {
          sentAt: 'desc'
        },
        take: 100
      })
    } catch (dbError) {
      console.error('Error fetching messages:', dbError)
      return NextResponse.json([])
    }

    const formattedMessages = messages.map(message => ({
      id: message.id,
      subject: message.subject,
      content: message.content,
      sender: {
        id: message.sender.id,
        name: `${message.sender.firstName} ${message.sender.lastName}`,
        role: message.sender.role,
        avatar: message.sender.avatar
      },
      recipient: {
        id: message.recipient.id,
        name: `${message.recipient.firstName} ${message.recipient.lastName}`,
        role: message.recipient.role,
        avatar: message.recipient.avatar
      },
      isRead: message.isRead,
      sentAt: message.sentAt,
      readAt: message.readAt,
      // Determine if current user is sender or recipient
      isSent: message.senderId === user.id
    }))

    return NextResponse.json(formattedMessages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json([])
  }
}
