"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns'

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'

interface AttendanceRecord {
  date: Date | string
  status: AttendanceStatus
}

interface AttendanceHeatmapProps {
  records: AttendanceRecord[]
  month?: Date
  title?: string
  description?: string
  showLegend?: boolean
  className?: string
}

export function AttendanceHeatmap({
  records,
  month = new Date(),
  title = 'Attendance Overview',
  description,
  showLegend = true,
  className
}: AttendanceHeatmapProps) {
  const monthStart = startOfMonth(month)
  const monthEnd = endOfMonth(month)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getStatusForDate = (date: Date): AttendanceStatus | null => {
    const record = records.find(r => {
      const recordDate = typeof r.date === 'string' ? new Date(r.date) : r.date
      return isSameDay(recordDate, date)
    })
    return record?.status || null
  }

  const getStatusColor = (status: AttendanceStatus | null) => {
    if (!status) return 'bg-gray-100 border-gray-200'
    
    switch (status) {
      case 'PRESENT':
        return 'bg-green-500 border-green-600'
      case 'ABSENT':
        return 'bg-red-500 border-red-600'
      case 'LATE':
        return 'bg-orange-500 border-orange-600'
      case 'EXCUSED':
        return 'bg-blue-500 border-blue-600'
      default:
        return 'bg-gray-100 border-gray-200'
    }
  }

  // Group days by week
  const weeks: Date[][] = []
  let currentWeek: Date[] = []
  
  // Add empty cells for days before month starts
  const firstDayOfWeek = monthStart.getDay()
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(new Date(0)) // Placeholder
  }

  daysInMonth.forEach((day, index) => {
    currentWeek.push(day)
    if (currentWeek.length === 7 || index === daysInMonth.length - 1) {
      weeks.push([...currentWeek])
      currentWeek = []
    }
  })

  const stats = {
    present: records.filter(r => r.status === 'PRESENT').length,
    absent: records.filter(r => r.status === 'ABSENT').length,
    late: records.filter(r => r.status === 'LATE').length,
    excused: records.filter(r => r.status === 'EXCUSED').length
  }

  const total = stats.present + stats.absent + stats.late + stats.excused
  const attendanceRate = total > 0 ? ((stats.present + stats.late + stats.excused) / total) * 100 : 0

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              {description || format(month, 'MMMM yyyy')}
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Attendance Rate</p>
            <p className="text-2xl font-bold text-green-600">
              {attendanceRate.toFixed(1)}%
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Calendar Grid */}
        <div className="space-y-2">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-600">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-2">
              {week.map((day, dayIndex) => {
                const isPlaceholder = day.getTime() === 0
                const isCurrentMonth = isSameMonth(day, month)
                const status = isCurrentMonth ? getStatusForDate(day) : null

                return (
                  <div
                    key={dayIndex}
                    className={cn(
                      "aspect-square rounded-md border-2 flex items-center justify-center text-xs font-medium transition-all",
                      isPlaceholder ? 'invisible' : '',
                      !isCurrentMonth ? 'bg-gray-50 text-gray-400 border-gray-200' : '',
                      isCurrentMonth && status ? getStatusColor(status) + ' text-white' : '',
                      isCurrentMonth && !status ? 'bg-gray-100 border-gray-200 text-gray-600' : '',
                      'hover:scale-110 cursor-pointer'
                    )}
                    title={isCurrentMonth && status ? `${format(day, 'MMM d')}: ${status}` : ''}
                  >
                    {!isPlaceholder && day.getDate()}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        {showLegend && (
          <div className="space-y-3 pt-4 border-t">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-green-500 border-2 border-green-600 rounded" />
                <span className="text-sm text-gray-700">Present ({stats.present})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-red-500 border-2 border-red-600 rounded" />
                <span className="text-sm text-gray-700">Absent ({stats.absent})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-orange-500 border-2 border-orange-600 rounded" />
                <span className="text-sm text-gray-700">Late ({stats.late})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-blue-500 border-2 border-blue-600 rounded" />
                <span className="text-sm text-gray-700">Excused ({stats.excused})</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
