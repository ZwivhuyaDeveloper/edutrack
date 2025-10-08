"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Clock,
  MapPin,
  BookOpen,
  Loader2,
  User
} from 'lucide-react'

interface ScheduleData {
  monday: ClassMeeting[]
  tuesday: ClassMeeting[]
  wednesday: ClassMeeting[]
  thursday: ClassMeeting[]
  friday: ClassMeeting[]
  saturday: ClassMeeting[]
  sunday: ClassMeeting[]
}

interface ClassMeeting {
  id: string
  subject: string
  teacher: {
    firstName: string
    lastName: string
  }
  period: {
    name: string
    startTime: string
    endTime: string
    order: number
  }
  room: {
    name: string
    building: string | null
  } | null
  classSubject: {
    class: {
      name: string
    }
  }
}

const DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
]

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<string>('monday')

  useEffect(() => {
    async function fetchSchedule() {
      try {
        const response = await fetch('/api/dashboard/student/schedule')
        if (!response.ok) throw new Error('Failed to fetch schedule')
        const data = await response.json()
        setSchedule(data)
        
        // Set current day as default
        const today = new Date().getDay()
        const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        setSelectedDay(dayKeys[today])
      } catch (error) {
        console.error('Error fetching schedule:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSchedule()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!schedule) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Card>
          <CardHeader>
            <CardTitle>Schedule not available</CardTitle>
            <CardDescription>Unable to load your schedule</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const currentDaySchedule = schedule[selectedDay as keyof ScheduleData] || []

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Schedule</h1>
        <p className="text-gray-600 mt-1">Your weekly class timetable</p>
      </div>

      {/* Day Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {DAYS.map((day) => {
          const daySchedule = schedule[day.key as keyof ScheduleData] || []
          const hasClasses = daySchedule.length > 0
          
          return (
            <button
              key={day.key}
              onClick={() => setSelectedDay(day.key)}
              className={`flex-shrink-0 px-4 py-3 rounded-lg border-2 transition-all ${
                selectedDay === day.key
                  ? 'border-primary bg-primary text-white'
                  : hasClasses
                  ? 'border-gray-200 bg-white hover:border-primary/50'
                  : 'border-gray-100 bg-gray-50 text-gray-400'
              }`}
            >
              <p className="font-semibold text-sm">{day.label}</p>
              <p className="text-xs mt-1">
                {hasClasses ? `${daySchedule.length} classes` : 'No classes'}
              </p>
            </button>
          )
        })}
      </div>

      {/* Weekly Grid View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Weekly Overview
          </CardTitle>
          <CardDescription>All your classes at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold text-gray-700">Period</th>
                  {DAYS.map((day) => (
                    <th key={day.key} className="text-left p-3 font-semibold text-gray-700 min-w-[150px]">
                      {day.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Get all unique periods */}
                {Array.from(
                  new Set(
                    Object.values(schedule)
                      .flat()
                      .map((m) => m.period.order)
                  )
                )
                  .sort((a, b) => a - b)
                  .map((periodOrder) => {
                    // Find period info from any day
                    const periodInfo = Object.values(schedule)
                      .flat()
                      .find((m) => m.period.order === periodOrder)?.period

                    if (!periodInfo) return null

                    return (
                      <tr key={periodOrder} className="border-b hover:bg-gray-50">
                        <td className="p-3 align-top">
                          <div className="font-medium text-gray-900">{periodInfo.name}</div>
                          <div className="text-xs text-gray-600">
                            {periodInfo.startTime} - {periodInfo.endTime}
                          </div>
                        </td>
                        {DAYS.map((day) => {
                          const daySchedule = schedule[day.key as keyof ScheduleData] || []
                          const meeting = daySchedule.find((m) => m.period.order === periodOrder)

                          return (
                            <td key={day.key} className="p-3 align-top">
                              {meeting ? (
                                <div className="bg-primary/5 border border-primary/20 rounded-lg p-2">
                                  <p className="font-medium text-sm text-gray-900 mb-1">
                                    {meeting.subject}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {meeting.teacher.firstName} {meeting.teacher.lastName}
                                  </p>
                                  {meeting.room && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      {meeting.room.name}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <div className="text-center text-gray-400 text-sm">-</div>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Selected Day Detail View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            {DAYS.find(d => d.key === selectedDay)?.label} Schedule
          </CardTitle>
          <CardDescription>Detailed view of your classes</CardDescription>
        </CardHeader>
        <CardContent>
          {currentDaySchedule.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No classes scheduled</h3>
              <p className="text-gray-600">You have no classes on this day</p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentDaySchedule
                .sort((a, b) => a.period.order - b.period.order)
                .map((meeting) => (
                  <div 
                    key={meeting.id}
                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {/* Time */}
                    <div className="flex-shrink-0 text-center min-w-[80px]">
                      <p className="text-sm font-semibold text-gray-900">
                        {meeting.period.startTime}
                      </p>
                      <p className="text-xs text-gray-600">to</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {meeting.period.endTime}
                      </p>
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {meeting.period.name}
                      </Badge>
                    </div>

                    {/* Divider */}
                    <div className="h-full w-px bg-gray-300" />

                    {/* Details */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {meeting.subject}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-600" />
                          <div>
                            <p className="text-xs text-gray-600">Teacher</p>
                            <p className="text-sm font-medium text-gray-900">
                              {meeting.teacher.firstName} {meeting.teacher.lastName}
                            </p>
                          </div>
                        </div>

                        {meeting.room && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-600" />
                            <div>
                              <p className="text-xs text-gray-600">Room</p>
                              <p className="text-sm font-medium text-gray-900">
                                {meeting.room.name}
                                {meeting.room.building && ` (${meeting.room.building})`}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-gray-600" />
                          <div>
                            <p className="text-xs text-gray-600">Class</p>
                            <p className="text-sm font-medium text-gray-900">
                              {meeting.classSubject.class.name}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
