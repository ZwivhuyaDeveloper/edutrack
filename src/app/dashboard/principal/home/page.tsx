"use client"

import { useState, useEffect, useMemo } from 'react'
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
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ActivitySquareIcon,
  MousePointer,
  MouseIcon,
  ActivityIcon
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { StudentEnrollmentChart } from '@/components/student-enrollment-chart'

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

interface EnrollmentTrend {
  month: string
  students: number
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
  const [enrollmentTrends, setEnrollmentTrends] = useState<EnrollmentTrend[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [hasPartialData, setHasPartialData] = useState(false)
  
  // Activity pagination and filtering
  const [activityPeriod, setActivityPeriod] = useState<string>('7')
  const [activityPage, setActivityPage] = useState(1)
  const activitiesPerPage = 6

  useEffect(() => {
    // Use requestIdleCallback for non-critical data fetching
    const timeoutId = setTimeout(() => {
      fetchDashboardData()
    }, 0)
    
    return () => clearTimeout(timeoutId)
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setHasPartialData(false)
      
      // Fetch stats first (priority), then others in parallel
      const statsRes = await fetch('/api/dashboard/principal/stats', {
        // Add cache control for better performance
        next: { revalidate: 60 } // Cache for 60 seconds
      })
      
      // Fetch non-critical data in parallel
      const [activityRes, trendsRes] = await Promise.all([
        fetch('/api/dashboard/principal/activity', {
          next: { revalidate: 30 }
        }),
        fetch('/api/dashboard/principal/enrollment-trends', {
          next: { revalidate: 300 } // Cache trends for 5 minutes
        })
      ])

      let statsLoaded = false
      let activityLoaded = false

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

      // Handle enrollment trends response
      if (trendsRes.ok) {
        const trendsData = await trendsRes.json()
        console.log('Received enrollment trends:', trendsData)
        setEnrollmentTrends(trendsData.trends || [])
      } else {
        console.error('Failed to fetch enrollment trends:', trendsRes.status)
        // Set default trend data if API fails
        setEnrollmentTrends([
          { month: 'Jan', students: stats.totalStudents - 150 },
          { month: 'Feb', students: stats.totalStudents - 120 },
          { month: 'Mar', students: stats.totalStudents - 80 },
          { month: 'Apr', students: stats.totalStudents - 50 },
          { month: 'May', students: stats.totalStudents - 20 },
          { month: 'Jun', students: stats.totalStudents },
        ])
      }

      // If stats failed but activity loaded, show partial data
      if (!statsLoaded && activityLoaded) {
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

  // Pagination helpers - memoized for performance
  const getPeriodLabel = (days: string) => {
    switch (days) {
      case '1': return 'Today'
      case '7': return 'Last 7 days'
      case '14': return 'Last 14 days'
      case '30': return 'Last 30 days'
      default: return 'Last 7 days'
    }
  }

  // Memoize filtered and paginated activities to avoid unnecessary recalculations
  const filteredActivities = useMemo(() => recentActivity, [recentActivity])
  const totalPages = useMemo(() => Math.ceil(filteredActivities.length / activitiesPerPage), [filteredActivities.length, activitiesPerPage])
  const paginatedActivities = useMemo(() => 
    filteredActivities.slice(
      (activityPage - 1) * activitiesPerPage,
      activityPage * activitiesPerPage
    ),
    [filteredActivities, activityPage, activitiesPerPage]
  )

  const handlePeriodChange = (value: string) => {
    setActivityPeriod(value)
    setActivityPage(1) // Reset to first page when period changes
    // In a real implementation, you would refetch data with the new period
    toast.info(`Showing activities from ${getPeriodLabel(value).toLowerCase()}`)
  }

  const handlePreviousPage = () => {
    if (activityPage > 1) {
      setActivityPage(activityPage - 1)
    }
  }

  const handleNextPage = () => {
    if (activityPage < totalPages) {
      setActivityPage(activityPage + 1)
    }
  }

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
      <div className="space-y-4 pt-4">
        <div className="grid space-y-4 bg-white p-5 rounded-3xl lg:grid-cols-1">
          {/* Stats Cards Skeleton */}
          <div className="grid gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border-none shadow-none bg-zinc-100 overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex flex-row items-center gap-2">
                    <div className="h-5 w-5 bg-zinc-300 animate-pulse rounded" />
                    <div className="h-4 w-24 bg-zinc-300 animate-pulse rounded" />
                  </div>
                  <div className="h-7 w-16 bg-zinc-300 animate-pulse rounded" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="h-8 w-20 bg-zinc-300 animate-pulse rounded" />
                  <div className="h-3 w-32 bg-zinc-300 animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Stats Skeleton */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="border-none shadow-none bg-zinc-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex flex-row items-center gap-2">
                    <div className="h-5 w-5 bg-zinc-300 animate-pulse rounded" />
                    <div className="h-4 w-20 bg-zinc-300 animate-pulse rounded" />
                  </div>
                  <div className="h-7 w-16 bg-zinc-300 animate-pulse rounded" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-16 bg-zinc-300 animate-pulse rounded mb-2" />
                  <div className="h-3 w-28 bg-zinc-300 animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions Skeleton */}
          <Card className="border-none shadow-none bg-zinc-100">
            <CardHeader>
              <div className="h-6 w-40 bg-zinc-300 animate-pulse rounded mb-2" />
              <div className="h-4 w-64 bg-zinc-300 animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 bg-zinc-300 animate-pulse rounded-lg" />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Skeleton */}
          <Card className="border-none shadow-none bg-zinc-100">
            <CardHeader className="space-y-4 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <div className="h-6 w-48 bg-zinc-300 animate-pulse rounded" />
                  <div className="h-4 w-56 bg-zinc-300 animate-pulse rounded" />
                </div>
                <div className="h-9 w-32 bg-zinc-300 animate-pulse rounded" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                    <div className="h-9 w-9 bg-zinc-300 animate-pulse rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 bg-zinc-300 animate-pulse rounded" />
                      <div className="h-3 w-1/2 bg-zinc-300 animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 pt-4">
      {/* Partial Data Warning Banner */}
      {hasPartialData && (
        <Card className="border-primary bg-primary">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-primary flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-primary">
                  Some dashboard data could not be loaded
                </p>
                <p className="text-xs text-primary mt-1">
                  The dashboard is showing partial information. Try refreshing to load all data.
                </p>
              </div>
              <Button onClick={handleRetry} size="sm" variant="outline" className="border-primary">
                <RefreshCw className="mr-2 h-3 w-3" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
 
      {/* Header */}
      <div className="items-center hidden justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl text-primary font-bold tracking-tight">Principal Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening at your school today.
          </p>
        </div>
      </div>

      {/* Content Container */}

      <div className="grid space-y-4 bg-white p-5 rounded-3xl lg:grid-cols-1">

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-none bg-zinc-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex flex-row items-center gap-2">
              <Users strokeWidth={3} className="h-5 w-5 text-primary" />
              <CardTitle className="text-md font-semibold text-primary">Total Students</CardTitle>
            </div>
            <Button variant="default" size="sm" className="border-primary text-xs">
              See All
            </Button>
          </CardHeader>
          <CardContent className="space-y-2 lg:text-md text-sm">
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-sm font-medium text-muted-foreground">
              Active enrollments
            </p>
            {/* Student Enrollment Trend Chart */}
            {/*
            <div className="w-full mt-3">
              <StudentEnrollmentChart
                data={enrollmentTrends.length > 0 ? enrollmentTrends : 
                  stats.totalStudents > 0 ? [
                    { month: 'Jan', students: Math.max(stats.totalStudents - 150, 50) },
                    { month: 'Feb', students: Math.max(stats.totalStudents - 120, 80) },
                    { month: 'Mar', students: Math.max(stats.totalStudents - 80, 120) },
                    { month: 'Apr', students: Math.max(stats.totalStudents - 50, 160) },
                    { month: 'May', students: Math.max(stats.totalStudents - 20, 200) },
                    { month: 'Jun', students: stats.totalStudents },
                  ] : [
                    { month: 'Jan', students: 150 },
                    { month: 'Feb', students: 220 },
                    { month: 'Mar', students: 320 },
                    { month: 'Apr', students: 450 },
                    { month: 'May', students: 620 },
                    { month: 'Jun', students: 800 },
                  ]
                }
                isLoading={isLoading}
              />
            </div>
            */}
            </CardContent>
        </Card>

        <Card className="border-none shadow-none bg-zinc-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex flex-row items-center gap-2">
              <GraduationCap strokeWidth={3} className="h-5 w-5 text-primary" />
              <CardTitle className="text-md font-semibold text-primary">Teachers</CardTitle>
            </div>
            <Button variant="default" size="sm" className="border-primary text-xs">
              See All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTeachers}</div>
            <p className="text-sm font-medium text-muted-foreground">
              Active faculty members
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-none bg-zinc-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex flex-row items-center gap-2">
              <TrendingUp strokeWidth={3} className="h-5 w-5 text-primary" />
              <CardTitle className="text-md font-semibold text-primary">Attendance Rate</CardTitle>
            </div>
            <Button variant="default" size="sm" className="border-primary text-xs ">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attendanceRate}%</div>
            <p className="text-sm font-medium text-muted-foreground">
              This week average
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-none bg-zinc-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex flex-row items-center gap-2">
              <DollarSign strokeWidth={3} className="h-5 w-5 text-primary" />
              <CardTitle className="text-md font-semibold text-primary">Pending Fees</CardTitle>
            </div>
            <Button variant="default" size="sm" className="border-primary text-xs">
              Transactions
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.pendingFees}</div>
            <p className="text-sm font-medium text-muted-foreground">
              Outstanding amount
            </p>
          </CardContent>
        </Card>
      </div>

            {/* Additional Stats */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-3">
        <Card className="border-none shadow-none bg-zinc-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex flex-row items-center gap-2">
              <BookOpen strokeWidth={3} className="h-5 w-5 text-primary" />
              <CardTitle className="text-md font-semibold text-primary">Classes</CardTitle>
            </div>
            <Button variant="default" size="sm" className="border-primary text-xs">
              See All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClasses}</div>
            <p className="text-sm font-medium text-muted-foreground">
              {stats.totalSubjects} subjects total
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-none bg-zinc-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex flex-row items-center gap-2">
              <Calendar strokeWidth={3} className="h-5 w-5 text-primary" />
              <CardTitle className="text-md font-semibold text-primary">Upcoming Events</CardTitle>
            </div>
            <Button variant="default" size="sm" className="border-primary text-xs">
              See All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
            <p className="text-sm font-medium text-muted-foreground">
              Next 7 days
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-none bg-zinc-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex flex-row items-center gap-2">
              <MessageSquare strokeWidth={3} className="h-5 w-5 text-primary" />
              <CardTitle className="text-md font-semibold text-primary">Messages</CardTitle>
            </div>
            <Button variant="default" size="sm" className="border-primary text-xs">
              See All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unreadMessages}</div>
            <p className="text-sm font-medium text-muted-foreground">
              Unread messages
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-none shadow-none bg-zinc-100">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex flex-row items-center gap-2 text-primary">
            <MouseIcon strokeWidth={3} className="h-5 w-5 text-primary" />
            Quick Actions</CardTitle>
          <CardDescription className="text-md font-medium text-muted-foreground">
            Frequently used actions for school management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant}
                className="h-20 flex flex-col  border-none shadow-none items-center justify-center gap-2"
                onClick={() => window.location.href = action.href}
              >
                <action.icon strokeWidth={3} className="h-5 w-5" />
                <span className="text-sm">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-1">

        {/* Recent Activity */}
        <Card className="border-none shadow-none bg-zinc-100">
          <CardHeader className="space-y-4 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col gap-2">
                <CardTitle className="text-lg font-bold flex flex-row items-center gap-2 text-primary"><ActivityIcon strokeWidth={3} className="h-5 w-5 text-primary" />Recent Activity</CardTitle>
                <CardDescription className="text-md font-medium text-muted-foreground">
                  Latest updates from your school
                </CardDescription>
              </div>
              
              {/* Period Filter */}
              <div className="flex items-center gap-2">
                <span className="text-md text-muted-foreground">Period:</span>
                <Select value={activityPeriod} onValueChange={handlePeriodChange}>
                  <SelectTrigger className="w-fit gap-2 h-9 text-sm bg-primary text-white border-primary [&>svg]:text-white">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Today</SelectItem>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="14">Last 14 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              {paginatedActivities.length > 0 ? (
                paginatedActivities.map((activity) => {
                  const Icon = getActivityIcon(activity.type)
                  const activityColor = getActivityColor(activity.type)
                  return (
                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-white rounded-lg hover:bg-white transition-colors">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-full ${activityColor.bg}`}>
                        <Icon strokeWidth={3} className={`h-5 w-5 ${activityColor.text}`} />
                      </div>
                      <div className="flex-1 space-y-1 min-w-0">
                        <p className="text-ld font-semibold leading-tight">{activity.message}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1">
                            <Clock strokeWidth={3} className="h-3 w-3 text-muted-foreground" />
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
                    <Clock strokeWidth={3} className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-sm font-medium mb-1">No recent activity</p>
                  <p className="text-xs text-muted-foreground">
                    Activity from {getPeriodLabel(activityPeriod).toLowerCase()} will appear here
                  </p>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {filteredActivities.length > activitiesPerPage && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <div className="text-xs text-muted-foreground">
                  Showing {Math.min((activityPage - 1) * activitiesPerPage + 1, filteredActivities.length)} - {Math.min(activityPage * activitiesPerPage, filteredActivities.length)} of {filteredActivities.length} activities
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={activityPage === 1}
                    className="h-8 w-8 p-0 border-primary border-3 bg-transparent text-primary"
                  >
                    <ChevronLeft strokeWidth={3} className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={page === activityPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActivityPage(page)}
                        className="h-8 w-8 p-0 bg-primary border-primary border-3 text-primary-foreground"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={activityPage === totalPages}
                    className="h-8 w-8 p-0 border-primary border-3 bg-transparent text-primary"
                  >
                    <ChevronRight strokeWidth={3} className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}
