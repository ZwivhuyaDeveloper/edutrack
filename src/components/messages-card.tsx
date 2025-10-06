"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { MessageCircle } from "lucide-react"

interface Message {
  id: string
  sender: string
  senderRole: string
  avatar: string
  subject: string
  message: string
  time: string
  unread: boolean
  priority: string
}

interface MessageItemProps {
  message: Message
}

function MessageItem({ message }: MessageItemProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'border-l-red-500'
      case 'medium': return 'border-l-yellow-500'
      case 'low': return 'border-l-green-500'
      default: return 'border-l-gray-300'
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className={`p-3 bg-white/80 rounded-lg border-l-4 hover:bg-white transition-colors ${getPriorityColor(message.priority)}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
          {message.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-sm font-semibold text-gray-800 truncate">{message.sender}</p>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityBadge(message.priority)}`}>
                {message.priority}
              </span>
              <span className="text-xs text-muted-foreground">{message.time}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-1">{message.senderRole}</p>
          <p className="text-sm font-medium text-gray-700 mb-1 line-clamp-1">{message.subject}</p>
          <p className="text-sm text-gray-600 line-clamp-2">{message.message}</p>
        </div>
      </div>
    </div>
  )
}

interface MessagesCardProps {
  messages?: Message[]
  className?: string
}

export function MessagesCard({
  messages = [],
  className = ""
}: MessagesCardProps) {
  const unreadCount = messages.filter(msg => msg.unread).length

  return (
    <Card className={`@container/card ${className}`}>
      <CardHeader className="flex-col flex items-start gap-4 text-sm">
        <div className="flex-row flex w-full justify-between items-center gap-1.5 text-sm">
          <CardTitle className="line-clamp-1 text-lg text-primary flex items-center gap-2 font-semibold">
            <MessageCircle strokeWidth={3} className="mr- size-7" /> Messages
          </CardTitle>
          <Button className="line-clamp-1 text-md text-white flex items-center gap-2 font-semibold">
            view all
          </Button>
        </div>
        <Separator orientation="horizontal" className="mr-2 h-px w-full bg-foreground/20" />
      </CardHeader>

      <CardContent className="p-0">
        <div className="relative max-h-96 overflow-hidden">
          <div className="max-h-96 overflow-y-auto space-y-3 p-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent hover:scrollbar-thumb-gray-500">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageCircle className="h-16 w-16 text-muted-foreground mb-3" />
                <p className="text-base text-muted-foreground font-medium">No messages yet</p>
                <p className="text-sm text-muted-foreground">Messages will appear here when you receive them</p>
              </div>
            ) : (
              <>
                {/* Unread messages section */}
                {unreadCount > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                        Unread ({unreadCount})
                      </p>
                    </div>
                    <div className="space-y-3">
                      {messages.filter(msg => msg.unread).map((message) => (
                        <MessageItem key={message.id} message={message} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Read messages section */}
                {messages.filter(msg => !msg.unread).length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Earlier Messages
                      </p>
                    </div>
                    <div className="space-y-3">
                      {messages.filter(msg => !msg.unread).map((message) => (
                        <MessageItem key={message.id} message={message} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
