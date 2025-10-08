"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { CheckCircle2, XCircle, HelpCircle, MapPin, Clock } from 'lucide-react'
import { format, isSameDay } from 'date-fns'
import { cn } from '@/lib/utils'

type EventType = 'HOLIDAY' | 'EXAM' | 'MEETING' | 'SPORTS' | 'CULTURAL' | 'PARENT_TEACHER' | 'OTHER'
type RSVPStatus = 'attending' | 'declined' | 'maybe' | null

interface Event {
  id: string
  title: string
  description?: string
  startDate: Date | string
  endDate: Date | string
  location?: string
  type: EventType
  isAllDay?: boolean
  rsvpStatus?: RSVPStatus
}

interface EventCalendarProps {
  events: Event[]
  onRSVP?: (eventId: string, status: RSVPStatus) => void
  title?: string
  description?: string
  className?: string
}

const eventTypeConfig = {
  HOLIDAY: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Holiday' },
  EXAM: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Exam' },
  MEETING: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Meeting' },
  SPORTS: { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Sports' },
  CULTURAL: { color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Cultural' },
  PARENT_TEACHER: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Parent-Teacher' },
  OTHER: { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Other' }
}

export function EventCalendar({
  events,
  onRSVP,
  title = 'Events Calendar',
  description = 'View and manage your events',
  className
}: EventCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const startDate = typeof event.startDate === 'string' ? new Date(event.startDate) : event.startDate
      return isSameDay(startDate, date)
    })
  }

  const selectedDateEvents = getEventsForDate(selectedDate)

  const getEventDates = () => {
    return events.map(event => {
      const startDate = typeof event.startDate === 'string' ? new Date(event.startDate) : event.startDate
      return startDate
    })
  }

  const handleRSVP = (eventId: string, status: 'attending' | 'declined' | 'maybe') => {
    if (onRSVP) {
      onRSVP(eventId, status)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
              modifiers={{
                hasEvent: (date) => getEventsForDate(date).length > 0
              }}
              modifiersClassNames={{
                hasEvent: 'bg-primary/10 font-bold'
              }}
            />
            <div className="mt-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-primary/10 rounded border border-primary/20" />
                <span>Has events</span>
              </div>
            </div>
          </div>

          {/* Selected Date Events */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {format(selectedDate, 'MMMM d, yyyy')}
              </h3>
              <p className="text-sm text-gray-600">
                {selectedDateEvents.length} {selectedDateEvents.length === 1 ? 'event' : 'events'}
              </p>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {selectedDateEvents.map((event) => {
                const config = eventTypeConfig[event.type]
                const startDate = typeof event.startDate === 'string' ? new Date(event.startDate) : event.startDate
                const endDate = typeof event.endDate === 'string' ? new Date(event.endDate) : event.endDate

                return (
                  <div key={event.id} className="p-3 bg-gray-50 rounded-lg space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-sm text-gray-900">{event.title}</h4>
                      <Badge className={cn(config.color, "border text-xs")} variant="secondary">
                        {config.label}
                      </Badge>
                    </div>

                    {event.description && (
                      <p className="text-xs text-gray-600">{event.description}</p>
                    )}

                    <div className="space-y-1">
                      {!event.isAllDay && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Clock className="h-3 w-3" />
                          <span>
                            {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
                          </span>
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <MapPin className="h-3 w-3" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>

                    {/* RSVP Buttons */}
                    {onRSVP && (
                      <div className="flex gap-1 pt-2">
                        <Button
                          size="sm"
                          variant={event.rsvpStatus === 'attending' ? 'default' : 'outline'}
                          onClick={() => handleRSVP(event.id, 'attending')}
                          className="flex-1 h-7 text-xs"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Yes
                        </Button>
                        <Button
                          size="sm"
                          variant={event.rsvpStatus === 'maybe' ? 'default' : 'outline'}
                          onClick={() => handleRSVP(event.id, 'maybe')}
                          className="flex-1 h-7 text-xs"
                        >
                          <HelpCircle className="h-3 w-3 mr-1" />
                          Maybe
                        </Button>
                        <Button
                          size="sm"
                          variant={event.rsvpStatus === 'declined' ? 'destructive' : 'outline'}
                          onClick={() => handleRSVP(event.id, 'declined')}
                          className="flex-1 h-7 text-xs"
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          No
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}

              {selectedDateEvents.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No events on this day</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
