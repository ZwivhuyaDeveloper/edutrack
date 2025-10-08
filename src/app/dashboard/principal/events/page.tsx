"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Search, 
  Filter,
  MapPin,
  Clock,
  Users,
  Eye,
  Edit,
  Trash2,
  Copy,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  BookOpen,
  Trophy,
  Heart,
  Briefcase,
  GraduationCap,
  PartyPopper
} from 'lucide-react'
import { toast } from 'sonner'

interface Event {
  id: string
  title: string
  description?: string
  startDate: string
  endDate: string
  location?: string
  type: 'HOLIDAY' | 'EXAM' | 'MEETING' | 'SPORTS' | 'CULTURAL' | 'PARENT_TEACHER' | 'OTHER'
  isAllDay: boolean
  createdBy: {
    firstName: string
    lastName: string
  }
  audiences: Array<{
    scope: 'SCHOOL' | 'CLASS' | 'SUBJECT' | 'USER'
    class?: {
      name: string
    }
    subject?: {
      name: string
    }
  }>
  attendees: Array<{
    rsvpStatus: string
    userId: string
  }>
}

interface EventStats {
  totalEvents: number
  upcomingEvents: number
  thisWeekEvents: number
  thisMonthEvents: number
  attendanceRate: number
  popularEventType: string
}

const EVENT_TYPES = [
  { value: 'HOLIDAY', label: 'Holiday', icon: Star, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'EXAM', label: 'Examination', icon: BookOpen, color: 'bg-red-100 text-red-800' },
  { value: 'MEETING', label: 'Meeting', icon: Briefcase, color: 'bg-blue-100 text-blue-800' },
  { value: 'SPORTS', label: 'Sports', icon: Trophy, color: 'bg-green-100 text-green-800' },
  { value: 'CULTURAL', label: 'Cultural', icon: PartyPopper, color: 'bg-purple-100 text-purple-800' },
  { value: 'PARENT_TEACHER', label: 'Parent-Teacher', icon: GraduationCap, color: 'bg-orange-100 text-orange-800' },
  { value: 'OTHER', label: 'Other', icon: AlertCircle, color: 'bg-gray-100 text-gray-800' }
]

export default function PrincipalEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [stats, setStats] = useState<EventStats>({
    totalEvents: 0,
    upcomingEvents: 0,
    thisWeekEvents: 0,
    thisMonthEvents: 0,
    attendanceRate: 0,
    popularEventType: ''
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')

  useEffect(() => {
    fetchEvents()
    fetchStats()
  }, [])

  const fetchEvents = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/principal/events')
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      toast.error('Failed to load events')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/principal/events/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleCreateEvent = async (eventData: any) => {
    try {
      const response = await fetch('/api/principal/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      })

      if (response.ok) {
        toast.success('Event created successfully')
        setIsCreateModalOpen(false)
        fetchEvents()
        fetchStats()
      } else {
        toast.error('Failed to create event')
      }
    } catch (error) {
      console.error('Error creating event:', error)
      toast.error('Failed to create event')
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      const response = await fetch(`/api/principal/events/${eventId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Event deleted successfully')
        fetchEvents()
        fetchStats()
      } else {
        toast.error('Failed to delete event')
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error('Failed to delete event')
    }
  }

  const getEventTypeInfo = (type: string) => {
    return EVENT_TYPES.find(t => t.value === type) || EVENT_TYPES[EVENT_TYPES.length - 1]
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const filteredEvents = events.filter(event => {
    let matches = true

    if (searchQuery) {
      matches = matches && (
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (typeFilter !== 'all') {
      matches = matches && event.type === typeFilter
    }

    if (dateFilter !== 'all') {
      const now = new Date()
      const eventDate = new Date(event.startDate)
      
      switch (dateFilter) {
        case 'today':
          matches = matches && eventDate.toDateString() === now.toDateString()
          break
        case 'week':
          const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
          matches = matches && eventDate >= now && eventDate <= weekFromNow
          break
        case 'month':
          const monthFromNow = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
          matches = matches && eventDate >= now && eventDate <= monthFromNow
          break
        case 'past':
          matches = matches && eventDate < now
          break
      }
    }

    return matches
  })

  const EventCard = ({ event }: { event: Event }) => {
    const typeInfo = getEventTypeInfo(event.type)
    const Icon = typeInfo.icon
    const isUpcoming = new Date(event.startDate) > new Date()
    const isPast = new Date(event.endDate) < new Date()

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${typeInfo.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-lg">{event.title}</CardTitle>
                <CardDescription>
                  {typeInfo.label} • {event.audiences[0]?.scope || 'School-wide'}
                </CardDescription>
              </div>
            </div>
            <Badge variant={isUpcoming ? 'default' : isPast ? 'secondary' : 'outline'}>
              {isUpcoming ? 'Upcoming' : isPast ? 'Past' : 'Ongoing'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {event.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {event.description}
            </p>
          )}

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span>
                {event.isAllDay 
                  ? new Date(event.startDate).toLocaleDateString()
                  : `${new Date(event.startDate).toLocaleString()} - ${new Date(event.endDate).toLocaleString()}`
                }
              </span>
            </div>
            
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{event.location}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{event.attendees.length} attendees</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedEvent(event)
                  setIsViewModalOpen(true)
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = `/dashboard/principal/events/${event.id}/edit`}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteEvent(event.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = `/dashboard/principal/events/${event.id}`}
            >
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const CalendarView = () => (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Event Calendar</CardTitle>
          <CardDescription>Select a date to view events</CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            modifiers={{
              hasEvents: (date) => getEventsForDate(date).length > 0
            }}
            modifiersStyles={{
              hasEvents: { backgroundColor: 'hsl(var(--primary))', color: 'white' }
            }}
          />
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>
            Events for {selectedDate?.toLocaleDateString() || 'Selected Date'}
          </CardTitle>
          <CardDescription>
            {selectedDate ? getEventsForDate(selectedDate).length : 0} events scheduled
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedDate && getEventsForDate(selectedDate).length > 0 ? (
            <div className="space-y-4">
              {getEventsForDate(selectedDate).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${getEventTypeInfo(event.type).color}`}>
                      {(() => {
                        const Icon = getEventTypeInfo(event.type).icon
                        return <Icon className="h-4 w-4" />
                      })()}
                    </div>
                    <div>
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {event.isAllDay ? 'All Day' : `${new Date(event.startDate).toLocaleTimeString()} - ${new Date(event.endDate).toLocaleTimeString()}`}
                      </div>
                      {event.location && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{getEventTypeInfo(event.type).label}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedEvent(event)
                        setIsViewModalOpen(true)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No events scheduled for this date</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const CreateEventModal = () => (
    <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>
            Add a new event to your school calendar
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Event Title</label>
            <Input placeholder="Enter event title" />
          </div>
          
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea placeholder="Enter event description..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Event Type</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Audience</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SCHOOL">Entire School</SelectItem>
                  <SelectItem value="CLASS">Specific Class</SelectItem>
                  <SelectItem value="SUBJECT">Subject Groups</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Start Date & Time</label>
              <Input type="datetime-local" />
            </div>
            
            <div>
              <label className="text-sm font-medium">End Date & Time</label>
              <Input type="datetime-local" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Location</label>
            <Input placeholder="Enter event location" />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="allDay" />
            <label htmlFor="allDay" className="text-sm">All Day Event</label>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast.success('Event created successfully')
              setIsCreateModalOpen(false)
              fetchEvents()
            }}>
              <CalendarIcon className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  const ViewEventModal = () => (
    <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
      <DialogContent className="max-w-2xl">
        {selectedEvent && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {(() => {
                  const Icon = getEventTypeInfo(selectedEvent.type).icon
                  return <Icon className="h-5 w-5" />
                })()}
                {selectedEvent.title}
              </DialogTitle>
              <DialogDescription>
                {getEventTypeInfo(selectedEvent.type).label} Event Details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedEvent.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Date & Time</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      <span>
                        {selectedEvent.isAllDay 
                          ? new Date(selectedEvent.startDate).toLocaleDateString()
                          : `${new Date(selectedEvent.startDate).toLocaleString()}`
                        }
                      </span>
                    </div>
                    {!selectedEvent.isAllDay && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Until {new Date(selectedEvent.endDate).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Event Details</h4>
                  <div className="text-sm space-y-1">
                    <div>
                      <span className="text-muted-foreground">Type: </span>
                      <Badge variant="outline">{getEventTypeInfo(selectedEvent.type).label}</Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Audience: </span>
                      {selectedEvent.audiences[0]?.scope || 'School-wide'}
                    </div>
                    {selectedEvent.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{selectedEvent.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Attendees ({selectedEvent.attendees.length})</h4>
                <div className="text-sm text-muted-foreground">
                  {selectedEvent.attendees.length > 0 
                    ? `${selectedEvent.attendees.filter(a => a.rsvpStatus === 'attending').length} attending, ${selectedEvent.attendees.filter(a => a.rsvpStatus === 'declined').length} declined`
                    : 'No RSVP responses yet'
                  }
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setIsViewModalOpen(false)
                  window.location.href = `/dashboard/principal/events/${selectedEvent.id}/edit`
                }}>
                  Edit Event
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events & Calendar</h1>
          <p className="text-muted-foreground">
            Manage school events, holidays, and important dates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => {
            // TODO: Implement export functionality
            toast.info('Export feature coming soon')
          }}>
            <Download className="h-4 w-4 mr-2" />
            Export Calendar
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">All time events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
            <p className="text-xs text-muted-foreground">Next 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisWeekEvents}</div>
            <p className="text-xs text-muted-foreground">Events this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">Average attendance</p>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'calendar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('calendar')}
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Calendar
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  List
                </Button>
              </div>
              
              {viewMode === 'list' && (
                <>
                  <div className="flex-1 max-w-md">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search events..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {EVENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Dates</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="past">Past Events</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      {viewMode === 'calendar' ? (
        <CalendarView />
      ) : (
        <div className="space-y-4">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No events found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchQuery || typeFilter !== 'all' || dateFilter !== 'all'
                    ? 'No events match your current filters.'
                    : 'Create your first event to get started.'
                  }
                </p>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Modals */}
      <CreateEventModal />
      <ViewEventModal />
    </div>
  )
}
