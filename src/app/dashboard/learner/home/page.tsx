"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Calendar, 
  BookOpen, 
  TrendingUp, 
  Bell, 
  Clock,
  CheckCircle2,
  AlertCircle,
  Award,
  FileText,
  Loader2
} from 'lucide-react'
import { format, isToday, isTomorrow, isPast } from 'date-fns'

interface DashboardData {
  student: {
    firstName: string
    lastName: string
    grade: string
    school: string
  }
  schedule: Array<{
    id: string
    subject: string
    teacher: string
    startTime: string
    endTime: string
    room: string
    periodName: string
  }>
  assignments: Array<{
    id: string
    title: string
    description: string
    dueDate: string
    maxPoints: number
    subject: string
    submission: { submittedAt: string; grade: number | null } | null
  }>
  grades: Array<{
    id: string
    points: number
    maxPoints: number
    itemName: string
    subject: string
    gradedAt: string
    feedback: string | null
  }>
  announcements: Array<{
    id: string
    title: string
    content: string
    priority: string
    publishedAt: string
    createdAt: string
  }>
  stats: {
    pendingAssignments: number
    classesToday: number
    recentGrades: number
    unreadAnnouncements: number
  }
}

export default function HomePage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await fetch('/api/dashboard/student')
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data')
        }
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const getAssignmentStatus = (assignment: DashboardData['assignments'][0]) => {
    if (assignment.submission) {
      return { label: 'Submitted', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2 }
    }
    const dueDate = new Date(assignment.dueDate)
    if (isPast(dueDate)) {
      return { label: 'Overdue', color: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle }
    }
    if (isToday(dueDate)) {
      return { label: 'Due Today', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Clock }
    }
    if (isTomorrow(dueDate)) {
      return { label: 'Due Tomorrow', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock }
    }
    return { label: 'Pending', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: FileText }
  }

  const calculateGradePercentage = (points: number, maxPoints: number) => {
    return ((points / maxPoints) * 100).toFixed(1)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>{error || 'Failed to load dashboard'}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col mt-2 gap-4">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-primary/90 rounded-3xl p-6 text-white">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Welcome Back, {data.student.firstName}! 👋
        </h1>
        <p className="text-blue-100">
          {data.student.grade} • {data.student.school}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Assignments</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats.pendingAssignments}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Classes Today</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats.classesToday}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recent Grades</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats.recentGrades}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Announcements</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats.unreadAnnouncements}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Bell className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today's Schedule */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Today&apos;s Schedule
                </CardTitle>
                <CardDescription>
                  {format(new Date(), 'EEEE, MMMM d, yyyy')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {data.schedule.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>No classes scheduled for today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.schedule.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{meeting.subject}</p>
                      <p className="text-sm text-gray-600">{meeting.teacher}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {meeting.startTime} - {meeting.endTime}
                      </p>
                      <p className="text-xs text-gray-500">{meeting.room}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Announcements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-600" />
              Announcements
            </CardTitle>
            <CardDescription>Latest updates</CardDescription>
          </CardHeader>
          <CardContent>
            {data.announcements.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm">No announcements</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-2 mb-1">
                      <h4 className="font-semibold text-sm text-gray-900 flex-1">
                        {announcement.title}
                      </h4>
                      {(announcement.priority === 'high' || announcement.priority === 'urgent') && (
                        <Badge variant="destructive" className="text-xs">
                          {announcement.priority}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                      {announcement.content}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(announcement.publishedAt || announcement.createdAt), 'MMM d, h:mm a')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upcoming Assignments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  Upcoming Assignments
                </CardTitle>
                <CardDescription>Assignments due soon</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {data.assignments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>No upcoming assignments</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.assignments.slice(0, 5).map((assignment) => {
                  const status = getAssignmentStatus(assignment)
                  const StatusIcon = status.icon
                  return (
                    <div
                      key={assignment.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <div className="flex-shrink-0">
                        <StatusIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{assignment.title}</p>
                        <p className="text-sm text-gray-600">{assignment.subject}</p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <Badge className={`${status.color} border`} variant="secondary">
                          {status.label}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(assignment.dueDate), 'MMM d')}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Grades */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-green-600" />
                  Recent Grades
                </CardTitle>
                <CardDescription>Your latest results</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {data.grades.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Award className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>No grades available yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.grades.slice(0, 5).map((grade) => {
                  const percentage = calculateGradePercentage(grade.points, grade.maxPoints)
                  const percentageNum = parseFloat(percentage)
                  return (
                    <div
                      key={grade.id}
                      className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{grade.itemName}</p>
                          <p className="text-xs text-gray-600">{grade.subject}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            {grade.points}/{grade.maxPoints}
                          </p>
                          <p className={`text-xs font-medium ${
                            percentageNum >= 90 ? 'text-green-600' :
                            percentageNum >= 80 ? 'text-blue-600' :
                            percentageNum >= 70 ? 'text-yellow-600' :
                            percentageNum >= 60 ? 'text-orange-600' :
                            'text-red-600'
                          }`}>
                            {percentage}%
                          </p>
                        </div>
                      </div>
                      <Progress value={percentageNum} className="h-2" />
                      <p className="text-xs text-gray-500 mt-2">
                        Graded {format(new Date(grade.gradedAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}