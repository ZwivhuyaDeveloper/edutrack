import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface ConversationPreviewProps {
  id: string
  title?: string
  participants: Array<{
    name: string
    avatar?: string
  }>
  lastMessage: {
    content: string
    sender: string
    timestamp: Date | string
  }
  unreadCount?: number
  isGroup?: boolean
  isActive?: boolean
  onClick?: () => void
  className?: string
}

export function ConversationPreview({
  id,
  title,
  participants,
  lastMessage,
  unreadCount = 0,
  isGroup = false,
  isActive = false,
  onClick,
  className
}: ConversationPreviewProps) {
  const displayName = title || (isGroup 
    ? participants.map(p => p.name).join(', ')
    : participants[0]?.name || 'Unknown')

  const timestamp = typeof lastMessage.timestamp === 'string' 
    ? new Date(lastMessage.timestamp) 
    : lastMessage.timestamp

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg cursor-pointer transition-colors",
        isActive ? "bg-primary/10 border-l-4 border-primary" : "hover:bg-gray-50",
        unreadCount > 0 && "bg-blue-50",
        className
      )}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {isGroup ? (
          <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">
              {participants.length}
            </span>
          </div>
        ) : (
          <Avatar className="h-12 w-12">
            <AvatarImage src={participants[0]?.avatar} />
            <AvatarFallback>
              {participants[0]?.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
        )}
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">{unreadCount}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className={cn(
            "font-semibold text-sm truncate",
            unreadCount > 0 ? "text-gray-900" : "text-gray-700"
          )}>
            {displayName}
          </h4>
          <span className="text-xs text-gray-500 flex-shrink-0">
            {formatDistanceToNow(timestamp, { addSuffix: true })}
          </span>
        </div>
        <p className={cn(
          "text-sm line-clamp-2",
          unreadCount > 0 ? "text-gray-900 font-medium" : "text-gray-600"
        )}>
          <span className="text-gray-500">{lastMessage.sender}: </span>
          {lastMessage.content}
        </p>
      </div>
    </div>
  )
}
