import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { RateLimiters } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    const rateLimitResult = await RateLimiters.api(request)
    if (!rateLimitResult.success) return rateLimitResult.response
    
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

    // Get conversations where the principal is a participant
    const conversations = await prisma.conversationParticipant.findMany({
      where: {
        userId: user.id
      },
      select: {
        conversationId: true,
        lastReadAt: true,
        conversation: {
          select: {
            id: true,
            title: true,
            isGroup: true,
            updatedAt: true,
            messages: {
              orderBy: {
                sentAt: 'desc'
              },
              take: 1,
              select: {
                id: true,
                content: true,
                sentAt: true,
                senderId: true,
                sender: {
                  select: {
                    firstName: true,
                    lastName: true,
                    avatar: true
                  }
                }
              }
            },
            participants: {
              where: {
                userId: {
                  not: user.id
                }
              },
              select: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatar: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        conversation: {
          updatedAt: 'desc'
        }
      },
      take: 5
    })

    // Format the messages data
    const messages = conversations.map(conv => {
      const lastMessage = conv.conversation.messages[0]
      const otherParticipant = conv.conversation.participants[0]?.user
      
      // Determine if message is unread
      const isUnread = lastMessage && conv.lastReadAt 
        ? new Date(lastMessage.sentAt) > new Date(conv.lastReadAt)
        : true

      return {
        id: conv.conversation.id,
        conversationTitle: conv.conversation.title,
        isGroup: conv.conversation.isGroup,
        lastMessage: lastMessage ? {
          id: lastMessage.id,
          content: lastMessage.content,
          sentAt: lastMessage.sentAt,
          sender: lastMessage.sender
        } : null,
        otherParticipant: otherParticipant || null,
        isUnread,
        updatedAt: conv.conversation.updatedAt
      }
    })

    // Filter only unread messages
    const unreadMessages = messages.filter(msg => msg.isUnread)

    return NextResponse.json({ 
      messages: unreadMessages,
      totalUnread: unreadMessages.length
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
