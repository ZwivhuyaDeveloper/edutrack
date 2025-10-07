import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Clock, AlertCircle, FileText, Calendar } from 'lucide-react'
import { format, isPast, isToday, isTomorrow } from 'date-fns'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface AssignmentListItemProps {
  id: string
  title: string
  subject: string
  dueDate: Date | string
  maxPoints?: number
  isSubmitted?: boolean
  grade?: number | null
  description?: string
  onSubmit?: () => void
  href?: string
  className?: string
}

export function AssignmentListItem({
  id,
  title,
  subject,
  dueDate,
  maxPoints,
  isSubmitted = false,
  grade,
  description,
  onSubmit,
  href,
  className
}: AssignmentListItemProps) {
  const dueDateObj = typeof dueDate === 'string' ? new Date(dueDate) : dueDate

  const getStatus = () => {
    if (isSubmitted) {
      return {
        label: grade !== null && grade !== undefined ? `Graded: ${grade}/${maxPoints}` : 'Submitted',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle2,
        iconColor: 'text-green-600'
      }
    }
    if (isPast(dueDateObj)) {
      return {
        label: 'Overdue',
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: AlertCircle,
        iconColor: 'text-red-600'
      }
    }
    if (isToday(dueDateObj)) {
      return {
        label: 'Due Today',
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: Clock,
        iconColor: 'text-orange-600'
      }
    }
    if (isTomorrow(dueDateObj)) {
      return {
        label: 'Due Tomorrow',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock,
        iconColor: 'text-yellow-600'
      }
    }
    return {
      label: 'Pending',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: FileText,
      iconColor: 'text-blue-600'
    }
  }

  const status = getStatus()
  const StatusIcon = status.icon

  const content = (
    <div className={cn(
      "flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors",
      className
    )}>
      <div className="flex-shrink-0">
        <StatusIcon className={cn("h-5 w-5", status.iconColor)} />
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 truncate">{title}</h4>
        <p className="text-sm text-gray-600">{subject}</p>
        {description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{description}</p>
        )}
      </div>

      <div className="flex-shrink-0 text-right space-y-2">
        <Badge className={cn(status.color, "border")} variant="secondary">
          {status.label}
        </Badge>
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <Calendar className="h-3 w-3" />
          <span>{format(dueDateObj, 'MMM d, yyyy')}</span>
        </div>
        {maxPoints && !isSubmitted && (
          <p className="text-xs text-gray-500">{maxPoints} points</p>
        )}
      </div>

      {!isSubmitted && onSubmit && (
        <Button size="sm" onClick={onSubmit}>
          Submit
        </Button>
      )}
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}
