"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Paperclip } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  content: string
  sender: {
    id: string
    name: string
    avatar?: string
  }
  timestamp: Date | string
  isCurrentUser?: boolean
}

interface MessageThreadProps {
  messages: Message[]
  conversationTitle?: string
  currentUserId: string
  onSendMessage?: (content: string) => void
  className?: string
}

export function MessageThread({
  messages,
  conversationTitle,
  currentUserId,
  onSendMessage,
  className
}: MessageThreadProps) {
  const [newMessage, setNewMessage] = useState('')

  const handleSend = () => {
    if (newMessage.trim() && onSendMessage) {
      onSendMessage(newMessage)
      setNewMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Card className={className}>
      {conversationTitle && (
        <CardHeader>
          <CardTitle>{conversationTitle}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {/* Messages */}
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {messages.map((message) => {
            const isCurrentUser = message.sender.id === currentUserId || message.isCurrentUser
            const timestamp = typeof message.timestamp === 'string' 
              ? new Date(message.timestamp) 
              : message.timestamp

            return (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  isCurrentUser ? "flex-row-reverse" : "flex-row"
                )}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={message.sender.avatar} />
                  <AvatarFallback>
                    {message.sender.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>

                <div className={cn(
                  "flex flex-col gap-1 max-w-[70%]",
                  isCurrentUser ? "items-end" : "items-start"
                )}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-700">
                      {message.sender.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {format(timestamp, 'h:mm a')}
                    </span>
                  </div>
                  <div className={cn(
                    "rounded-lg px-4 py-2",
                    isCurrentUser 
                      ? "bg-primary text-white rounded-tr-none" 
                      : "bg-gray-100 text-gray-900 rounded-tl-none"
                  )}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              </div>
            )
          })}

          {messages.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No messages yet. Start the conversation!</p>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" size="icon" className="flex-shrink-0">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Textarea
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="min-h-[60px] resize-none"
          />
          <Button 
            onClick={handleSend} 
            disabled={!newMessage.trim()}
            className="flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
