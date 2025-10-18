"use client"

import { MessageSquare, AlertCircle, Loader2, Mail } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Message {
  id: string
  conversationTitle?: string
  isGroup: boolean
  lastMessage: {
    id: string
    content: string
    sentAt: string
    sender: {
      firstName: string
      lastName: string
      avatar?: string
    }
  } | null
  otherParticipant: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
  } | null
  isUnread: boolean
  updatedAt: string
}

interface UnreadMessagesCardProps {
  messages: Message[]
  totalUnread: number
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
  maxDisplay?: number
  onSeeAll?: () => void
}

export function UnreadMessagesCard({ 
  messages, 
  totalUnread,
  isLoading = false,
  error = null,
  onRetry,
  maxDisplay = 3,
  onSeeAll
}: UnreadMessagesCardProps) {
  // Enhanced Loading State
  if (isLoading) {
    return (
      <Card className="border-none shadow-none justify-between gap-5 h-full pt-0">
        <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-200 space-y-0 px-6 pt-6 pb-3">
          <div className="flex flex-row items-center gap-1.5 sm:gap-2">
            <MessageSquare strokeWidth={3} className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <CardTitle className="text-sm sm:text-md font-semibold text-primary">Unread Messages</CardTitle>
          </div>
          <Button 
            variant="default" 
            size="sm" 
            className="border-primary text-xs h-7 px-2 sm:px-3"
            onClick={onSeeAll}
          >
            See All
          </Button>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-0">
          <div className="h-[200px] flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Loading messages...</p>
              <p className="text-xs text-muted-foreground mt-1">Please wait while we fetch your messages</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start px-6">
          <div className="text-lg sm:text-xl font-bold text-muted-foreground/50">
            Total: <span className="text-primary/50">---</span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">
            Unread messages
          </p>
        </CardFooter>
      </Card>
    )
  }

  // Enhanced Error State
  if (error) {
    return (
      <Card className="border-none shadow-none justify-between gap-5 h-full pt-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-6 pt-6 pb-3">
          <div className="flex flex-row items-center gap-1.5 sm:gap-2">
            <MessageSquare strokeWidth={3} className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <CardTitle className="text-sm sm:text-md font-semibold text-primary">Unread Messages</CardTitle>
          </div>
          <Button 
            variant="default" 
            size="sm" 
            className="border-primary text-xs h-7 px-2 sm:px-3"
            onClick={onSeeAll}
          >
            See All
          </Button>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-0">
          <div className="h-[200px] flex items-center justify-center">
            <Alert variant="destructive" className="max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">
                <p className="font-medium">Failed to load messages</p>
                <p className="text-xs mt-1">{error}</p>
                {onRetry && (
                  <Button 
                    onClick={onRetry} 
                    variant="outline" 
                    size="sm" 
                    className="mt-3 w-full"
                  >
                    Try Again
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start px-6">
          <div className="text-lg sm:text-xl font-bold text-muted-foreground/50">
            Total: <span className="text-primary/50">---</span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">
            Data unavailable
          </p>
        </CardFooter>
      </Card>
    )
  }

  // Enhanced Empty State
  if (!messages || messages.length === 0) {
    return (
      <Card className="border-none shadow-none justify-between gap-5 h-full pt-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-6 pt-6 pb-3">
          <div className="flex flex-row items-center gap-1.5 sm:gap-2">
            <MessageSquare strokeWidth={3} className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <CardTitle className="text-sm sm:text-md font-semibold text-primary">Unread Messages</CardTitle>
          </div>
          <Button 
            variant="default" 
            size="sm" 
            className="border-primary text-xs h-7 px-2 sm:px-3"
            onClick={onSeeAll}
          >
            See All
          </Button>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-0">
          <div className="h-[200px] flex flex-col items-center justify-center gap-3 text-center">
            <div className="rounded-full bg-primary/10 p-4">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">No unread messages</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                You&apos;re all caught up! No new messages at the moment
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start px-6">
          <div className="text-lg sm:text-xl font-bold">
            Total: <span className="text-primary">0</span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">
            All messages read
          </p>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="border-none shadow-none justify-between gap-5 h-full pt-0">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-6 pt-6 pb-3">
        <div className="flex flex-row items-center gap-1.5 sm:gap-2">
          <MessageSquare strokeWidth={3} className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          <CardTitle className="text-sm sm:text-md font-semibold text-primary">Unread Messages</CardTitle>
        </div>
        <Button 
          variant="default" 
          size="sm" 
          className="border-primary text-xs h-7 px-2 sm:px-3"
          onClick={onSeeAll}
        >
          See All
        </Button>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-0">
        {/* Messages List */}
        <div className="space-y-3">
          {messages.slice(0, maxDisplay).map((message) => (
              <div 
                key={message.id} 
                className="flex items-start gap-3 p-3 rounded-lg bg-zinc-50 hover:bg-zinc-100/50 transition-colors border border-zinc-50"
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {message.lastMessage?.sender.avatar ? (
                      <img 
                        src={message.lastMessage.sender.avatar} 
                        alt={`${message.lastMessage.sender.firstName} ${message.lastMessage.sender.lastName}`}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-semibold text-primary">
                        {message.lastMessage?.sender.firstName.charAt(0)}
                        {message.lastMessage?.sender.lastName.charAt(0)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Message Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {message.isGroup 
                          ? message.conversationTitle 
                          : message.otherParticipant 
                            ? `${message.otherParticipant.firstName} ${message.otherParticipant.lastName}`
                            : 'Unknown'}
                      </p>
                      {message.lastMessage && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {message.lastMessage.sender.firstName}: {message.lastMessage.content}
                        </p>
                      )}
                    </div>
                    {message.isUnread && (
                      <Badge variant="destructive" className="text-xs px-2 py-0 h-5 flex-shrink-0">
                        New
                      </Badge>
                    )}
                  </div>
                  {message.lastMessage && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(message.lastMessage.sentAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                </div>
              </div>
            ))}
        </div>
      </CardContent>

      {/* Total Count Footer */}
      <CardFooter className="flex flex-col items-start px-6">
        <div className="text-lg sm:text-xl font-bold">
          Total: <span className="text-primary">{totalUnread}</span>
        </div>
        <p className="text-xs sm:text-sm font-medium text-muted-foreground">
          Unread messages
        </p>
      </CardFooter>
    </Card>
  )
}
