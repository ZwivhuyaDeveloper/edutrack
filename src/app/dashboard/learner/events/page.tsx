"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { 
  Calendar as CalendarIcon, 
  MapPin,
  Clock,
  Loader2,
  Users,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react'
import { format, isSameDay } from 'date-fns'

interface Event {
  id: string
  title: string
  description: string | null
  startDate: string
  endDate: string
  location: string | null
  type: 'HOLIDAY' | 'EXAM' | 'MEETING' | 'SPORTS' | 'CULTURAL' | 'PARENT_TEACHER' | 'OTHER'
  isAllDay: boolean
  attendee: {
    rsvpStatus: 'attending' | 'declined' | 'maybe' | null
  } | null
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch('/api/dashboard/student/events')
        if (!response.ok) throw new Error('Failed to fetch events')
        const data = await response.json()
        setEvents(data)
      } catch (error) {
        console.error('Error fetching events:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const handleRSVP = async (eventId: string, status: 'attending' | 'declined' | 'maybe') => {
    try {
      const response = await fetch(`/api/dashboard/student/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        setEvents(events.map(event => 
          event.id === eventId 
            ? { ...event, attendee: { rsvpStatus: status } }
            : event
        ))
      }
    } catch (error) {
      console.error('Error updating RSVP:', error)
    }
  }

  const getEventTypeConfig = (type: Event['type']) => {
    switch (type) {
      case 'HOLIDAY':
        return { color: 'bg-green-100 text-green-800 border-green-200', label: 'Holiday' }
      case 'EXAM':
        return { color: 'bg-red-100 text-red-800 border-red-200', label: 'Exam' }
      case 'MEETING':
        return { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Meeting' }
      case 'SPORTS':
        return { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Sports' }
      case 'CULTURAL':
        return { color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Cultural' }
      case 'PARENT_TEACHER':
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Parent-Teacher' }
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Other' }
    }
  }

  const getRSVPIcon = (status: string | null) => {
    switch (status) {
      case 'attending':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'declined':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'maybe':
        return <HelpCircle className="h-4 w-4 text-yellow-600" />
      default:
        return null
    }
  }

  const getEventDates = () => {
    const dates: { [key: string]: Event[] } = {}
    events.forEach(event => {
      const dateStr = format(new Date(event.startDate), 'yyyy-MM-dd')
      if (!dates[dateStr]) dates[dateStr] = []
      dates[dateStr].push(event)
    })
    return dates
  }

  const eventDates = getEventDates()
  const selectedDateEvents = events.filter(event => 
    isSameDay(new Date(event.startDate), selectedDate)
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Events & Calendar</h1>
        <p className="text-gray-600 mt-1">View upcoming events and manage your RSVPs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Event Calendar
            </CardTitle>
            <CardDescription>Click on a date to view events</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
              modifiers={{
                hasEvent: (date) => {
                  const dateStr = format(date, 'yyyy-MM-dd')
                  return !!eventDates[dateStr]
                }
              }}
              modifiersClassNames={{
                hasEvent: 'bg-primary/10 font-bold'
              }}
            />

            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <div className="h-3 w-3 bg-primary/10 rounded border border-primary/20" />
              <span>Has events</span>
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Events */}
        <Card>
          <CardHeader>
            <CardTitle>
              {format(selectedDate, 'MMMM d, yyyy')}
            </CardTitle>
            <CardDescription>Events on this day</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDateEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm">No events on this day</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateEvents.map((event) => {
                  const typeConfig = getEventTypeConfig(event.type)
                  return (
                    <div 
                      key={event.id}
                      className="p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-sm text-gray-900">{event.title}</h4>
                        <Badge className={`${typeConfig.color} border text-xs`} variant="secondary">
                          {typeConfig.label}
                        </Badge>
                      </div>
                      {!event.isAllDay && (
                        <p className="text-xs text-gray-600 flex items-center gap-1 mb-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(event.startDate), 'h:mm a')} - {format(new Date(event.endDate), 'h:mm a')}
                        </p>
                      )}
                      {event.location && (
                        <p className="text-xs text-gray-600 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* All Events List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            All Upcoming Events
          </CardTitle>
          <CardDescription>Complete list of events you can attend</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.map((event) => {
              const typeConfig = getEventTypeConfig(event.type)
              return (
                <div 
                  key={event.id}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{event.title}</h3>
                        <Badge className={`${typeConfig.color} border`} variant="secondary">
                          {typeConfig.label}
                        </Badge>
                        {event.attendee?.rsvpStatus && (
                          <div className="flex items-center gap-1">
                            {getRSVPIcon(event.attendee.rsvpStatus)}
                            <span className="text-xs text-gray-600 capitalize">
                              {event.attendee.rsvpStatus}
                            </span>
                          </div>
                        )}
                      </div>
                      {event.description && (
                        <p className="text-sm text-gray-700 mb-2">{event.description}</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          {format(new Date(event.startDate), 'MMM d, yyyy')}
                          {!isSameDay(new Date(event.startDate), new Date(event.endDate)) && (
                            <> - {format(new Date(event.endDate), 'MMM d, yyyy')}</>
                          )}
                        </div>
                        {!event.isAllDay && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {format(new Date(event.startDate), 'h:mm a')} - {format(new Date(event.endDate), 'h:mm a')}
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {event.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* RSVP Buttons */}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                    <Button
                      size="sm"
                      variant={event.attendee?.rsvpStatus === 'attending' ? 'default' : 'outline'}
                      onClick={() => handleRSVP(event.id, 'attending')}
                      className="flex-1"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Attending
                    </Button>
                    <Button
                      size="sm"
                      variant={event.attendee?.rsvpStatus === 'maybe' ? 'default' : 'outline'}
                      onClick={() => handleRSVP(event.id, 'maybe')}
                      className="flex-1"
                    >
                      <HelpCircle className="h-4 w-4 mr-1" />
                      Maybe
                    </Button>
                    <Button
                      size="sm"
                      variant={event.attendee?.rsvpStatus === 'declined' ? 'destructive' : 'outline'}
                      onClick={() => handleRSVP(event.id, 'declined')}
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Decline
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>

          {events.length === 0 && (
            <div className="text-center py-12">
              <CalendarIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No upcoming events</h3>
              <p className="text-gray-600">There are no events scheduled at this time</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
