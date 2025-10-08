"use client"

import { useState, useEffect } from 'react'
import { ConversationPreview, MessageThread } from '@/components/dashboard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function TeacherMessagesPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])

  useEffect(() => {
    async function fetchConversations() {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/dashboard/teacher/messages')
        // const data = await response.json()

        // Mock data
        setConversations([
          {
            id: '1',
            participants: [{ name: 'John Doe', avatar: '' }],
            lastMessage: {
              content: 'Thank you for the feedback on my assignment',
              sender: 'John Doe',
              timestamp: new Date('2025-10-07T10:30:00')
            },
            unreadCount: 2
          },
          {
            id: '2',
            title: 'Grade 10A - Mathematics',
            isGroup: true,
            participants: [{ name: 'Class Group' }],
            lastMessage: {
              content: 'Reminder: Quiz tomorrow',
              sender: 'You',
              timestamp: new Date('2025-10-06T15:00:00')
            },
            unreadCount: 0
          }
        ])

        setMessages([
          {
            id: '1',
            content: 'Hello, I have a question about the homework',
            sender: { id: 'student1', name: 'John Doe', avatar: '' },
            timestamp: new Date('2025-10-07T10:00:00')
          },
          {
            id: '2',
            content: 'Sure, what do you need help with?',
            sender: { id: 'teacher1', name: 'You', avatar: '' },
            timestamp: new Date('2025-10-07T10:05:00'),
            isCurrentUser: true
          }
        ])
      } catch (error) {
        console.error('Error fetching messages:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchConversations()
  }, [])

  const filteredConversations = conversations.filter(conv => {
    const title = conv.title || conv.participants[0]?.name || ''
    return title.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const handleSendMessage = (content: string) => {
    console.log('Sending message:', content)
    // TODO: Implement send message API call
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-96" />
          <Skeleton className="h-96 col-span-2" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-1">Communicate with students and parents</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>

      {/* Messages Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Conversations List */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-2">
            {filteredConversations.map(conv => (
              <ConversationPreview
                key={conv.id}
                {...conv}
                isActive={selectedConversation === conv.id}
                onClick={() => setSelectedConversation(conv.id)}
              />
            ))}
          </div>

          {filteredConversations.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No conversations found</p>
            </div>
          )}
        </div>

        {/* Message Thread */}
        <div className="lg:col-span-2">
          {selectedConversation ? (
            <MessageThread
              messages={messages}
              conversationTitle="John Doe"
              currentUserId="teacher1"
              onSendMessage={handleSendMessage}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
              <p className="text-gray-500">Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
