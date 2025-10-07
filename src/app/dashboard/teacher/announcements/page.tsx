"use client"

import { useState, useEffect } from 'react'
import { AlertBanner, EventCalendar } from '@/components/dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Bell } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function TeacherAnnouncementsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        // TODO: Replace with actual API calls
        setAnnouncements([
          {
            id: '1',
            title: 'Class Cancelled',
            content: 'Mathematics class on Friday is cancelled due to school event',
            priority: 'high',
            publishedAt: new Date('2025-10-05')
          }
        ])

        setEvents([
          {
            id: '1',
            title: 'Parent-Teacher Meeting',
            description: 'Discuss student progress',
            startDate: new Date('2025-10-20T14:00:00'),
            endDate: new Date('2025-10-20T16:00:00'),
            location: 'School Hall',
            type: 'PARENT_TEACHER' as const,
            rsvpStatus: null
          }
        ])
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleRSVP = (eventId: string, status: 'attending' | 'declined' | 'maybe') => {
    console.log('RSVP:', eventId, status)
    // TODO: Implement RSVP API call
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Announcements & Events</h1>
          <p className="text-gray-600 mt-1">Publish updates and manage events</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Announcement
        </Button>
      </div>

      {/* Recent Announcements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Recent Announcements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {announcements.map(announcement => (
            <div key={announcement.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{announcement.title}</h3>
                <Badge variant={announcement.priority === 'high' ? 'destructive' : 'secondary'}>
                  {announcement.priority}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{announcement.content}</p>
              <p className="text-xs text-gray-500 mt-2">
                {announcement.publishedAt.toLocaleDateString()}
              </p>
            </div>
          ))}

          {announcements.length === 0 && (
            <p className="text-center py-8 text-gray-500">No announcements</p>
          )}
        </CardContent>
      </Card>

      {/* Events Calendar */}
      <EventCalendar
        events={events}
        onRSVP={handleRSVP}
        title="School Events"
        description="Upcoming events and meetings"
      />
    </div>
  )
}
