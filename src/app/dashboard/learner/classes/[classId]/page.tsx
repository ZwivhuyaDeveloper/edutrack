"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  BookOpen, 
  Users, 
  Calendar,
  FileText,
  Mail,
  Phone,
  Loader2,
  Download,
  ExternalLink
} from 'lucide-react'

interface ClassDetailData {
  id: string
  name: string
  grade: string
  section: string
  subjects: Array<{
    id: string
    name: string
    code: string
    description: string
    teacher: {
      id: string
      firstName: string
      lastName: string
      email: string
      avatar: string | null
    }
    resources: Array<{
      id: string
      title: string
      type: string
      url: string
    }>
  }>
  classmates: Array<{
    id: string
    firstName: string
    lastName: string
    avatar: string | null
  }>
  schedule: Array<{
    id: string
    dayOfWeek: number
    subject: string
    period: {
      name: string
      startTime: string
      endTime: string
    }
    room: string
  }>
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function ClassDetailPage() {
  const params = useParams()
  const classId = params.classId as string
  const [classData, setClassData] = useState<ClassDetailData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchClassDetail() {
      try {
        const response = await fetch(`/api/dashboard/student/classes/${classId}`)
        if (!response.ok) throw new Error('Failed to fetch class details')
        const data = await response.json()
        setClassData(data)
      } catch (error) {
        console.error('Error fetching class details:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchClassDetail()
  }, [classId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!classData) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Card>
          <CardHeader>
            <CardTitle>Class not found</CardTitle>
            <CardDescription>The requested class could not be loaded</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/90 rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">{classData.name}</h1>
        <p className="text-blue-100">
          {classData.grade} {classData.section && `• Section ${classData.section}`}
        </p>
      </div>

      <Tabs defaultValue="subjects" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="classmates">Classmates</TabsTrigger>
        </TabsList>

        {/* Subjects Tab */}
        <TabsContent value="subjects" className="space-y-4 mt-6">
          {classData.subjects.map((subject) => (
            <Card key={subject.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      {subject.name}
                    </CardTitle>
                    <CardDescription>{subject.code}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {subject.description && (
                  <p className="text-sm text-gray-700">{subject.description}</p>
                )}

                {/* Teacher Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">Teacher</p>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={subject.teacher.avatar || undefined} />
                      <AvatarFallback>
                        {subject.teacher.firstName[0]}{subject.teacher.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {subject.teacher.firstName} {subject.teacher.lastName}
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <a 
                          href={`mailto:${subject.teacher.email}`}
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          <Mail className="h-3 w-3" />
                          {subject.teacher.email}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resources */}
                {subject.resources.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Resources</p>
                    <div className="space-y-2">
                      {subject.resources.map((resource) => (
                        <div 
                          key={resource.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-gray-600" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{resource.title}</p>
                              <Badge variant="secondary" className="text-xs mt-1">
                                {resource.type}
                              </Badge>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" asChild>
                            <a href={resource.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Weekly Schedule
              </CardTitle>
              <CardDescription>Your class timetable</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {DAYS.map((day, index) => {
                  const daySchedule = classData.schedule.filter(s => s.dayOfWeek === index)
                  if (daySchedule.length === 0) return null

                  return (
                    <div key={day}>
                      <h3 className="font-semibold text-gray-900 mb-2">{day}</h3>
                      <div className="space-y-2">
                        {daySchedule.map((meeting) => (
                          <div 
                            key={meeting.id}
                            className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{meeting.subject}</p>
                              <p className="text-sm text-gray-600">{meeting.period.name}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">
                                {meeting.period.startTime} - {meeting.period.endTime}
                              </p>
                              <p className="text-xs text-gray-600">{meeting.room}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Classmates Tab */}
        <TabsContent value="classmates" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Classmates ({classData.classmates.length})
              </CardTitle>
              <CardDescription>Students in your class</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classData.classmates.map((classmate) => (
                  <div 
                    key={classmate.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Avatar>
                      <AvatarImage src={classmate.avatar || undefined} />
                      <AvatarFallback>
                        {classmate.firstName[0]}{classmate.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">
                        {classmate.firstName} {classmate.lastName}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
