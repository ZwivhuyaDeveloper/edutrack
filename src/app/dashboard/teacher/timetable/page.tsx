"use client"

import { useState, useEffect } from 'react'
import { TimetableGrid } from '@/components/dashboard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'

export default function TeacherTimetablePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [meetings, setMeetings] = useState<any[]>([])

  useEffect(() => {
    async function fetchTimetable() {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/dashboard/teacher/timetable')
        // const data = await response.json()

        // Mock data
        setMeetings([
          {
            id: '1',
            subject: 'Mathematics',
            teacher: 'You',
            room: 'Room 204',
            period: {
              name: 'Period 1',
              startTime: '08:00',
              endTime: '09:00',
              order: 1
            },
            dayOfWeek: 1 // Monday
          },
          {
            id: '2',
            subject: 'Physics',
            teacher: 'You',
            room: 'Lab 3',
            period: {
              name: 'Period 2',
              startTime: '09:00',
              endTime: '10:00',
              order: 2
            },
            dayOfWeek: 1 // Monday
          },
          {
            id: '3',
            subject: 'Mathematics',
            teacher: 'You',
            room: 'Room 204',
            period: {
              name: 'Period 1',
              startTime: '08:00',
              endTime: '09:00',
              order: 1
            },
            dayOfWeek: 2 // Tuesday
          }
        ])
      } catch (error) {
        console.error('Error fetching timetable:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTimetable()
  }, [])

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Timetable</h1>
        <p className="text-gray-600 mt-1">View your weekly teaching schedule</p>
      </div>

      {/* Timetable */}
      <Tabs defaultValue="week" className="w-full">
        <TabsList>
          <TabsTrigger value="week">Week View</TabsTrigger>
          <TabsTrigger value="day">Day View</TabsTrigger>
        </TabsList>

        <TabsContent value="week" className="mt-6">
          <TimetableGrid
            meetings={meetings}
            title="Weekly Schedule"
            description="Your classes for this week"
          />
        </TabsContent>

        <TabsContent value="day" className="mt-6">
          <TimetableGrid
            meetings={meetings.filter(m => m.dayOfWeek === new Date().getDay())}
            title="Today's Schedule"
            description="Your classes for today"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
