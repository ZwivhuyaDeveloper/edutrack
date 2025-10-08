"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ClassMeeting {
  id: string
  subject: string
  teacher: string
  room: string
  period: {
    name: string
    startTime: string
    endTime: string
    order: number
  }
  dayOfWeek: number // 0-6 (Sunday-Saturday)
}

interface TimetableGridProps {
  meetings: ClassMeeting[]
  title?: string
  description?: string
  className?: string
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

export function TimetableGrid({
  meetings,
  title = 'Weekly Timetable',
  description = 'Your class schedule',
  className
}: TimetableGridProps) {
  // Get all unique periods sorted by order
  const periods = Array.from(
    new Set(meetings.map(m => JSON.stringify(m.period)))
  )
    .map(p => JSON.parse(p))
    .sort((a, b) => a.order - b.order)

  // Group meetings by day and period
  const getMeetingForDayAndPeriod = (day: number, periodOrder: number) => {
    return meetings.find(m => m.dayOfWeek === day && m.period.order === periodOrder)
  }

  // Use weekdays (1-5) for Monday to Friday
  const displayDays = [1, 2, 3, 4, 5] // Monday to Friday

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left p-3 font-semibold text-gray-700 bg-gray-50 min-w-[120px]">
                  Period
                </th>
                {displayDays.map((dayIndex) => (
                  <th
                    key={dayIndex}
                    className="text-left p-3 font-semibold text-gray-700 bg-gray-50 min-w-[150px]"
                  >
                    {DAYS[dayIndex]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods.map((period) => (
                <tr key={period.order} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-3 align-top bg-gray-50/50">
                    <div className="font-medium text-gray-900">{period.name}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {period.startTime} - {period.endTime}
                    </div>
                  </td>
                  {displayDays.map((dayIndex) => {
                    const meeting = getMeetingForDayAndPeriod(dayIndex, period.order)

                    return (
                      <td key={dayIndex} className="p-3 align-top">
                        {meeting ? (
                          <div className="bg-primary/5 border-l-4 border-primary rounded-r-lg p-3 hover:bg-primary/10 transition-colors">
                            <p className="font-semibold text-sm text-gray-900 mb-1">
                              {meeting.subject}
                            </p>
                            <p className="text-xs text-gray-600 mb-1">
                              {meeting.teacher}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {meeting.room}
                            </Badge>
                          </div>
                        ) : (
                          <div className="text-center text-gray-400 text-sm py-2">
                            -
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          {periods.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No classes scheduled</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
