"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Plus,
  MessageSquare,
  Bell,
  Clock,
  UserPlus,
  CalendarPlus,
  RefreshCw
} from 'lucide-react'
import { ChartAreaInteractive } from '@/components/chart-area-interactive'
import { toast } from 'sonner'

interface DashboardStats {
  totalStudents: number
  totalTeachers: number
  totalClasses: number
  totalSubjects: number
  attendanceRate: number
  pendingFees: number
  upcomingEvents: number
  unreadMessages: number
}

interface RecentActivity {
  id: string
  type: 'enrollment' | 'assignment' | 'payment' | 'announcement'
  message: string
  timestamp: string
  user?: string
}

interface Alert {
  id: string
  type: 'warning' | 'info' | 'error'
  title: string
  message: string
  priority: 'high' | 'medium' | 'low'
}

export default function PrincipalHomePage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalSubjects: 0,
    attendanceRate: 0,
    pendingFees: 0,
    upcomingEvents: 0,
    unreadMessages: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [hasPartialData, setHasPartialData] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setHasPartialData(false)
      
      const [statsRes, activityRes, alertsRes] = await Promise.all([
        fetch('/api/dashboard/principal/stats'),
        fetch('/api/dashboard/principal/activity'),
        fetch('/api/dashboard/principal/alerts')
      ])

      let statsLoaded = false
      let activityLoaded = false
      let alertsLoaded = false

      // Handle stats response
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        console.log('Received stats data:', statsData)
        setStats(statsData)
        statsLoaded = true
      } else {
        const errorData = await statsRes.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Failed to fetch stats:', statsRes.status, statsRes.statusText, errorData)
        
        if (statsRes.status === 401) {
          setError('Unauthorized. Please sign in again.')
          toast.error('Session expired. Please sign in again.')
          setTimeout(() => window.location.href = '/sign-in', 2000)
          return
        } else if (statsRes.status === 403) {
          setError('Access denied. You do not have permission to view this page.')
          toast.error('Access denied')
        } else if (statsRes.status === 500) {
          setError('Server error. Please try again later.')
          toast.error('Failed to load statistics. Please try again.')
        } else {
          setError(`Failed to load data: ${errorData.error || 'Unknown error'}`)
          toast.error('Failed to load dashboard data')
        }
      }

      // Handle activity response
      if (activityRes.ok) {
        const activityData = await activityRes.json()
        console.log('Received activity data:', activityData)
        setRecentActivity(activityData.activities || [])
        activityLoaded = true
      } else {
        console.error('Failed to fetch activity:', activityRes.status)
        if (statsLoaded) {
          setHasPartialData(true)
          toast.warning('Some dashboard data could not be loaded')
        }
      }

      // Handle alerts response
      if (alertsRes.ok) {
        const alertsData = await alertsRes.json()
        setAlerts(alertsData.alerts || [])
        alertsLoaded = true
      } else {
        console.error('Failed to fetch alerts:', alertsRes.status)
        if (statsLoaded) {
          setHasPartialData(true)
          toast.warning('Some dashboard data could not be loaded')
        }
      }

      // If stats failed but other data loaded, show partial data
      if (!statsLoaded && (activityLoaded || alertsLoaded)) {
        setHasPartialData(true)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Network error. Please check your connection and try again.')
      toast.error('Failed to load dashboard data. Please check your connection.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    fetchDashboardData()
  }

  const quickActions = [
    {
      label: 'Add Teacher',
      icon: UserPlus,
      href: '/dashboard/principal/people?tab=teachers&action=add',
      variant: 'default' as const
    },
    {
      label: 'Create Class',
      icon: Plus,
      href: '/dashboard/principal/academic?tab=classes&action=create',
      variant: 'outline' as const
    },
    {
      label: 'New Event',
      icon: CalendarPlus,
      href: '/dashboard/principal/events?action=create',
      variant: 'outline' as const
    },
    {
      label: 'Send Message',
      icon: MessageSquare,
      href: '/dashboard/principal/communication?tab=messages&action=compose',
      variant: 'outline' as const
    }
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'enrollment': return Users
      case 'assignment': return BookOpen
      case 'payment': return DollarSign
      case 'announcement': return Bell
      case 'class': return Calendar
      case 'teacher': return GraduationCap
      default: return Clock
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'enrollment': 
        return { bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' }
      case 'assignment': 
        return { bg: 'bg-purple-100 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400' }
      case 'payment': 
        return { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400' }
      case 'announcement': 
        return { bg: 'bg-orange-100 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400' }
      case 'class': 
        return { bg: 'bg-indigo-100 dark:bg-indigo-900/20', text: 'text-indigo-600 dark:text-indigo-400' }
      case 'teacher': 
        return { bg: 'bg-pink-100 dark:bg-pink-900/20', text: 'text-pink-600 dark:text-pink-400' }
      default: 
        return { bg: 'bg-gray-100 dark:bg-gray-900/20', text: 'text-gray-600 dark:text-gray-400' }
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return 'destructive'
      case 'warning': return 'secondary'
      default: return 'default'
    }
  }

  // Error state
  if (error && !isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, Principal</p>
          </div>
        </div>

        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
              <div className="rounded-full bg-destructive/10 p-3">
                <AlertTriangle className="h-10 w-10 text-destructive" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Failed to Load Dashboard</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  {error}
                </p>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleRetry} variant="default">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </Button>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Reload Page
                </Button>
              </div>
              {retryCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  Retry attempts: {retryCount}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 w-24 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pt-7">
      {/* Partial Data Warning Banner */}
      {hasPartialData && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-800">
                  Some dashboard data could not be loaded
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  The dashboard is showing partial information. Try refreshing to load all data.
                </p>
              </div>
              <Button onClick={handleRetry} size="sm" variant="outline" className="border-orange-300">
                <RefreshCw className="mr-2 h-3 w-3" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl text-primary font-bold tracking-tight">Principal Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening at your school today.
          </p>
        </div>
      </div>

      {/* Alerts */}
        <Card className='p-5 px-6 justify-center w-full'>
          <CardHeader>
            <CardTitle className='text-lg font-semibold'>Alerts</CardTitle>
          </CardHeader>
          <CardContent className='w-full'>
            <div className="space-y-2 w-full flex flex-col mx-auto">
              {alerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="flex items-center gap-2 p-3 w-full rounded-lg border border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-orange-800">{alert.title}</p>
                    <p className="text-xs text-orange-600">{alert.message}</p>
                  </div>
                  <Badge variant={getAlertColor(alert.type)} className="text-xs">
                    {alert.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>



      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Active enrollments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teachers</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTeachers}</div>
            <p className="text-xs text-muted-foreground">
              Active faculty members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">
              This week average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Fees</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.pendingFees}</div>
            <p className="text-xs text-muted-foreground">
              Outstanding amount
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Frequently used actions for school management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant}
                className="h-20 flex flex-col items-center justify-center gap-2"
                onClick={() => window.location.href = action.href}
              >
                <action.icon className="h-5 w-5" />
                <span className="text-sm">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Analytics Chart */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>School Analytics</CardTitle>
            <CardDescription>
              Student enrollment and performance trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartAreaInteractive />
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates from your school (Last 7 days)
              </CardDescription>
            </div>
            {recentActivity.length > 0 && (
              <Button variant="ghost" size="sm" className="text-xs">
                View All
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.slice(0, 6).map((activity) => {
                  const Icon = getActivityIcon(activity.type)
                  const activityColor = getActivityColor(activity.type)
                  return (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-full ${activityColor.bg}`}>
                        <Icon className={`h-4 w-4 ${activityColor.text}`} />
                      </div>
                      <div className="flex-1 space-y-1 min-w-0">
                        <p className="text-sm font-medium leading-tight">{activity.message}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                          </div>
                          {activity.user && (
                            <Badge variant="secondary" className="text-xs">
                              {activity.user}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8">
                  <div className="rounded-full bg-muted p-3 w-fit mx-auto mb-3">
                    <Clock className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium mb-1">No recent activity</p>
                  <p className="text-xs text-muted-foreground">
                    Activity from the last 7 days will appear here
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClasses}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalSubjects} subjects total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
            <p className="text-xs text-muted-foreground">
              Next 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unreadMessages}</div>
            <p className="text-xs text-muted-foreground">
              Unread messages
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
