import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { GraduationCap, Clock, MapPin, User } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface ClassTileProps {
  id: string
  name: string
  grade?: string
  section?: string
  teacher: {
    name: string
    avatar?: string
  }
  nextMeeting?: {
    subject: string
    time: string
    room: string
  }
  subjectCount?: number
  status?: 'ACTIVE' | 'INACTIVE' | 'COMPLETED'
  href?: string
  className?: string
}

export function ClassTile({
  id,
  name,
  grade,
  section,
  teacher,
  nextMeeting,
  subjectCount,
  status = 'ACTIVE',
  href,
  className
}: ClassTileProps) {
  const statusConfig = {
    ACTIVE: { color: 'bg-green-100 text-green-800', label: 'Active' },
    INACTIVE: { color: 'bg-gray-100 text-gray-800', label: 'Inactive' },
    COMPLETED: { color: 'bg-blue-100 text-blue-800', label: 'Completed' }
  }

  const content = (
    <Card className={cn("hover:shadow-lg transition-shadow", className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{name}</CardTitle>
              <p className="text-sm text-gray-600">
                {grade && section ? `${grade} • ${section}` : grade || section || ''}
              </p>
            </div>
          </div>
          <Badge className={statusConfig[status].color} variant="secondary">
            {statusConfig[status].label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Teacher Info */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Avatar className="h-8 w-8">
            <AvatarImage src={teacher.avatar} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-xs text-gray-600">Teacher</p>
            <p className="text-sm font-medium text-gray-900">{teacher.name}</p>
          </div>
        </div>

        {/* Subject Count */}
        {subjectCount !== undefined && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">{subjectCount}</span> {subjectCount === 1 ? 'Subject' : 'Subjects'}
          </div>
        )}

        {/* Next Meeting */}
        {nextMeeting && (
          <div className="bg-blue-50 rounded-lg p-3 space-y-1">
            <p className="text-xs font-medium text-blue-900 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Next Class
            </p>
            <p className="text-sm font-semibold text-blue-900">
              {nextMeeting.subject}
            </p>
            <div className="flex items-center gap-3 text-xs text-blue-700">
              <span>{nextMeeting.time}</span>
              {nextMeeting.room && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {nextMeeting.room}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}
