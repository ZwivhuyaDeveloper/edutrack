"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertBanner } from '@/components/dashboard'
import { 
  BookOpen, 
  Users, 
  ClipboardList, 
  MessageSquare, 
  Calendar, 
  BarChart3,
  Activity,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

interface TeacherStats {
  totalStudents: number
  totalClasses: number
  pendingAssignments: number
  averageGrade: number
  attendanceRate: number
  unreadMessages: number
}

interface ClassData {
  id: string
  name: string
  subject: string
  grade: string
  studentCount: number
  schedule: string
  nextSession?: {
    time: string
    room: string
    topic: string
  }
}

interface RecentActivity {
  id: string
  type: 'submission' | 'grade' | 'message' | 'attendance'
  title: string
  description: string
  timestamp: string
  metadata?: Record<string, unknown>
}

interface PendingTask {
  id: string
  type: 'grading' | 'attendance' | 'planning'
  title: string
  description: string
  dueDate?: string
  priority: 'high' | 'medium' | 'low'
  count?: number
}

export default function TeacherHomePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [loadingStats, setLoadingStats] = useState(false)
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [loadingActivities, setLoadingActivities] = useState(false)
  const [stats, setStats] = useState<TeacherStats | null>(null)
  const [todayClasses, setTodayClasses] = useState<ClassData[]>([])
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([])
  const [alerts, setAlerts] = useState<Array<{type: string; title: string; message: string}>>([])

  const fetchStats = useCallback(async () => {
    setLoadingStats(true)
    try {
      const response = await fetch('/api/teacher/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      } else {
        // Fallback to mock data if API not available
        setStats({
          totalStudents: 125,
          totalClasses: 6,
          pendingAssignments: 18,
          averageGrade: 82.5,
          attendanceRate: 94.2,
          unreadMessages: 7
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      // Fallback data
      setStats({
        totalStudents: 125,
        totalClasses: 6,
        pendingAssignments: 18,
        averageGrade: 82.5,
        attendanceRate: 94.2,
        unreadMessages: 7
      })
    } finally {
      setLoadingStats(false)
    }
  }, [])

  const fetchTodayClasses = useCallback(async () => {
    setLoadingClasses(true)
    try {
      const response = await fetch('/api/teacher/classes/today')
      if (response.ok) {
        const data = await response.json()
        setTodayClasses(data.classes || [])
      } else {
        // Fallback mock data
        setTodayClasses([
          {
            id: '1',
            name: 'Mathematics 101',
            subject: 'Mathematics',
            grade: '10',
            studentCount: 28,
            schedule: '09:00 - 10:30',
            nextSession: {
              time: '09:00 AM',
              room: 'Room 204',
              topic: 'Quadratic Equations'
            }
          },
          {
            id: '2',
            name: 'Physics Advanced',
            subject: 'Physics',
            grade: '11',
            studentCount: 24,
            schedule: '11:00 - 12:30',
            nextSession: {
              time: '11:00 AM',
              room: 'Lab 301',
              topic: 'Wave Motion'
            }
          }
        ])
      }
    } catch (error) {
      console.error('Error fetching today classes:', error)
      setTodayClasses([])
    } finally {
      setLoadingClasses(false)
    }
  }, [])

  const fetchRecentActivities = useCallback(async () => {
    setLoadingActivities(true)
    try {
      const response = await fetch('/api/teacher/activities/recent')
      if (response.ok) {
        const data = await response.json()
        setRecentActivities(data.activities || [])
      } else {
        // Fallback mock data
        setRecentActivities([
          {
            id: '1',
            type: 'submission',
            title: 'New assignment submissions',
            description: 'Mathematics Quiz - 15 submissions received',
            timestamp: '2 hours ago'
          },
          {
            id: '2',
            type: 'grade',
            title: 'Grades published',
            description: 'Physics Lab Report - Grade 11A',
            timestamp: '1 day ago'
          },
          {
            id: '3',
            type: 'message',
            title: 'Parent message received',
            description: 'From Sarah Johnson\'s parent about homework',
            timestamp: '2 days ago'
          }
        ])
      }
    } catch (error) {
      console.error('Error fetching activities:', error)
      setRecentActivities([])
    } finally {
      setLoadingActivities(false)
    }
  }, [])

  const fetchPendingTasks = useCallback(async () => {
    try {
      const response = await fetch('/api/teacher/tasks/pending')
      if (response.ok) {
        const data = await response.json()
        setPendingTasks(data.tasks || [])
      } else {
        // Fallback mock data
        setPendingTasks([
          {
            id: '1',
            type: 'grading',
            title: 'Grade Math Quiz',
            description: '18 submissions need grading',
            priority: 'high',
            count: 18,
            dueDate: 'Tomorrow'
          },
          {
            id: '2',
            type: 'attendance',
            title: 'Missing Attendance',
            description: '2 classes need attendance records',
            priority: 'medium',
            count: 2
          },
          {
            id: '3',
            type: 'planning',
            title: 'Lesson Planning',
            description: 'Prepare next week\'s physics lessons',
            priority: 'medium',
            dueDate: 'This Friday'
          }
        ])
      }
    } catch (error) {
      console.error('Error fetching pending tasks:', error)
      setPendingTasks([])
    }
  }, [])

  const fetchAlerts = useCallback(async () => {
    try {
      const response = await fetch('/api/teacher/alerts')
      if (response.ok) {
        const data = await response.json()
        setAlerts(data.alerts || [])
      } else {
        // Fallback mock data
        setAlerts([
          {
            type: 'warning',
            title: 'Attendance Reminder',
            message: 'You have 2 classes today without attendance records.'
          },
          {
            type: 'info',
            title: 'Parent-Teacher Conference',
            message: 'Scheduled meetings next week. Check your calendar.'
          }
        ])
      }
    } catch (error) {
      console.error('Error fetching alerts:', error)
      setAlerts([])
    }
  }, [])

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true)
    try {
      await Promise.all([
        fetchStats(),
        fetchTodayClasses(),
        fetchRecentActivities(),
        fetchPendingTasks(),
        fetchAlerts()
      ])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }, [fetchStats, fetchTodayClasses, fetchRecentActivities, fetchPendingTasks, fetchAlerts])

  useEffect(() => {
    fetchInitialData()
  }, [fetchInitialData])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'submission': return ClipboardList
      case 'grade': return BarChart3
      case 'message': return MessageSquare
      case 'attendance': return Users
      default: return Activity
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'submission': return 'bg-blue-100 text-blue-600'
      case 'grade': return 'bg-green-100 text-green-600'
      case 'message': return 'bg-purple-100 text-purple-600'
      case 'attendance': return 'bg-orange-100 text-orange-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'secondary'
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here&apos;s your teaching overview</p>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <AlertBanner
              key={index}
              type={alert.type as 'info' | 'warning' | 'error'}
              title={alert.title}
              message={alert.message}
              dismissible
            />
          ))}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.totalStudents || 0}
            </div>
            <p className="text-xs text-muted-foreground">Across all classes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.totalClasses || 0}
            </div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Grading</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.pendingAssignments || 0}
            </div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? <Loader2 className="h-6 w-6 animate-spin" /> : `${stats?.averageGrade || 0}%`}
            </div>
            <p className="text-xs text-muted-foreground">Class average</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.unreadMessages || 0}
            </div>
            <p className="text-xs text-muted-foreground">Unread</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common teaching tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <ClipboardList className="h-6 w-6" />
              <span>Create Assignment</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              <span>Grade Submissions</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Users className="h-6 w-6" />
              <span>Take Attendance</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <MessageSquare className="h-6 w-6" />
              <span>Send Message</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Classes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today&apos;s Classes
            </CardTitle>
            <CardDescription>Your scheduled classes for today</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingClasses ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : todayClasses.length > 0 ? (
              <div className="space-y-4">
                {todayClasses.map((classItem) => (
                  <div key={classItem.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{classItem.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {classItem.subject} • Grade {classItem.grade}
                        </p>
                        {classItem.nextSession && (
                          <p className="text-xs text-muted-foreground">
                            {classItem.nextSession.time} • {classItem.nextSession.room}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">{classItem.studentCount} students</Badge>
                      {classItem.nextSession && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {classItem.nextSession.topic}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No classes scheduled today</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Pending Tasks
            </CardTitle>
            <CardDescription>Tasks that need your attention</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingTasks.length > 0 ? (
              <div className="space-y-4">
                {pendingTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${getActivityColor(task.type)}`}>
                        {(() => {
                          const IconComponent = getActivityIcon(task.type)
                          return <IconComponent className="h-4 w-4" />
                        })()}
                      </div>
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                        {task.dueDate && (
                          <p className="text-xs text-muted-foreground">Due: {task.dueDate}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getPriorityColor(task.priority) as 'destructive' | 'secondary' | 'outline'}>
                        {task.priority}
                      </Badge>
                      {task.count && (
                        <Badge variant="outline">{task.count}</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ClipboardList className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">All caught up!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest teaching activities</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingActivities ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : recentActivities.length > 0 ? (
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${getActivityColor(activity.type)}`}>
                    {(() => {
                      const IconComponent = getActivityIcon(activity.type)
                      return <IconComponent className="h-4 w-4" />
                    })()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No recent activity</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}