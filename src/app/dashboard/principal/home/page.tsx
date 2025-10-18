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
import { StudentEnrollmentChart } from "@/components/student-enrollment-chart"
import { AttendanceChart } from "@/components/attendance-chart"
import { FeePaymentsChart } from "@/components/fee-payments-chart"
import { PendingFeesCard } from "@/components/pending-fees-card"
import { ClassesOverviewCard } from "@/components/classes-overview-card"
import { StaffOverviewCard } from "@/components/staff-overview-card"
import { UpcomingEventsCard } from "@/components/upcoming-events-card"
import { UnreadMessagesCard } from "@/components/unread-messages-card"

interface DashboardStats {
  totalStudents: number
  totalTeachers: number
  totalClasses: number
  totalSubjects: number
  attendanceRate: number
  pendingFees: number
  totalPaidFees: number
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

interface AttendanceTrend {
  date: string
  rate: number
}

interface Teacher {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
  teacherProfile?: {
    department?: string
  }
}

interface FeeRecord {
  id: string
  description: string
  amount: number
  dueDate: string
  paid: boolean
  studentId: string
  student?: {
    firstName: string
    lastName: string
  }
}

interface PaymentTrend {
  month: string
  amount: number
}

interface Event {
  id: string
  title: string
  description?: string
  startDate: string
  endDate: string
  location?: string
  type: string
  isAllDay: boolean
  createdBy: {
    firstName: string
    lastName: string
  }
}

interface Message {
  id: string
  conversationTitle?: string
  isGroup: boolean
  lastMessage: {
    id: string
    content: string
    sentAt: string
    sender: {
      firstName: string
      lastName: string
      avatar?: string
    }
  } | null
  otherParticipant: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
  } | null
  isUnread: boolean
  updatedAt: string
}

interface ClassData {
  id: string
  name: string
  grade?: string
  section?: string
  _count: {
    enrollments: number
    subjects: number
  }
  subjects: {
    subject: {
      name: string
      code?: string
    }
    teacher: {
      firstName: string
      lastName: string
    }
  }[]
}

interface StaffMember {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
  role: 'TEACHER' | 'CLERK'
  department?: string
  employeeId?: string
  hireDate?: string
}

export default function PrincipalHomePage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalSubjects: 0,
    attendanceRate: 0,
    pendingFees: 0,
    totalPaidFees: 0,
    upcomingEvents: 0,
    unreadMessages: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [enrollmentTrends, setEnrollmentTrends] = useState<EnrollmentTrend[]>([])
  const [attendanceTrends, setAttendanceTrends] = useState<AttendanceTrend[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([])
  const [paymentTrends, setPaymentTrends] = useState<PaymentTrend[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [classes, setClasses] = useState<ClassData[]>([])
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [totalClerks, setTotalClerks] = useState(0)
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
      const [activityRes, trendsRes, attendanceTrendsRes, teachersRes, feeRecordsRes, paymentTrendsRes, eventsRes, messagesRes, classesRes, staffRes] = await Promise.all([
        fetch('/api/dashboard/principal/activity', {
          next: { revalidate: 30 }
        }),
        fetch('/api/dashboard/principal/enrollment-trends', {
          next: { revalidate: 300 } // Cache trends for 5 minutes
        }),
        fetch('/api/dashboard/principal/attendance-trends', {
          next: { revalidate: 300 } // Cache trends for 5 minutes
        }),
        fetch('/api/dashboard/principal/teachers', {
          next: { revalidate: 60 } // Cache teachers for 1 minute
        }),
        fetch('/api/dashboard/principal/fee-records', {
          next: { revalidate: 60 } // Cache fee records for 1 minute
        }),
        fetch('/api/dashboard/principal/payment-trends', {
          next: { revalidate: 300 } // Cache payment trends for 5 minutes
        }),
        fetch('/api/dashboard/principal/events', {
          next: { revalidate: 60 } // Cache events for 1 minute
        }),
        fetch('/api/dashboard/principal/messages', {
          next: { revalidate: 30 } // Cache messages for 30 seconds
        }),
        fetch('/api/dashboard/principal/classes', {
          next: { revalidate: 300 } // Cache classes for 5 minutes
        }),
        fetch('/api/dashboard/principal/staff', {
          next: { revalidate: 300 } // Cache staff for 5 minutes
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

      // Handle attendance trends response
      if (attendanceTrendsRes.ok) {
        const attendanceData = await attendanceTrendsRes.json()
        console.log('Received attendance trends:', attendanceData)
        setAttendanceTrends(attendanceData.trends || [])
      } else {
        console.error('Failed to fetch attendance trends:', attendanceTrendsRes.status)
      }

      // Handle teachers response
      if (teachersRes.ok) {
        const teachersData = await teachersRes.json()
        console.log('Received teachers:', teachersData)
        setTeachers(teachersData.teachers || [])
      } else {
        console.error('Failed to fetch teachers:', teachersRes.status)
      }

      // Handle fee records response
      if (feeRecordsRes.ok) {
        const feeRecordsData = await feeRecordsRes.json()
        console.log('Received fee records:', feeRecordsData)
        setFeeRecords(feeRecordsData.feeRecords || [])
      } else {
        console.error('Failed to fetch fee records:', feeRecordsRes.status)
      }

      // Handle payment trends response
      if (paymentTrendsRes.ok) {
        const paymentData = await paymentTrendsRes.json()
        console.log('Received payment trends:', paymentData)
        setPaymentTrends(paymentData.trends || [])
      } else {
        console.error('Failed to fetch payment trends:', paymentTrendsRes.status)
      }

      // Handle events response
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json()
        console.log('Received events:', eventsData)
        setEvents(eventsData.events || [])
      } else {
        console.error('Failed to fetch events:', eventsRes.status)
      }

      // Handle messages response
      if (messagesRes.ok) {
        const messagesData = await messagesRes.json()
        console.log('Received messages:', messagesData)
        setMessages(messagesData.messages || [])
      } else {
        console.error('Failed to fetch messages:', messagesRes.status)
      }

      // Handle classes response
      if (classesRes.ok) {
        const classesData = await classesRes.json()
        console.log('Received classes:', classesData)
        setClasses(classesData.classes || [])
      } else {
        console.error('Failed to fetch classes:', classesRes.status)
      }

      // Handle staff response
      if (staffRes.ok) {
        const staffData = await staffRes.json()
        console.log('Received staff:', staffData)
        setStaff(staffData.staff || [])
        setTotalClerks(staffData.totalClerks || 0)
      } else {
        console.error('Failed to fetch staff:', staffRes.status)
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
      <div className="space-y-3 sm:space-y-4 pt-2 sm:pt-4 px-2 sm:px-0">
        <div className="grid space-y-3 sm:space-y-4 bg-white p-3 sm:p-5 rounded-2xl sm:rounded-3xl lg:grid-cols-1">
          {/* Stats Cards Skeleton */}
          <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border-none shadow-none bg-zinc-100 overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
                  <div className="flex flex-row items-center gap-1.5 sm:gap-2">
                    <div className="h-4 w-4 sm:h-5 sm:w-5 bg-zinc-300 animate-pulse rounded" />
                    <div className="h-3 w-20 sm:h-4 sm:w-24 bg-zinc-300 animate-pulse rounded" />
                  </div>
                  <div className="h-7 w-14 sm:w-16 bg-zinc-300 animate-pulse rounded" />
                </CardHeader>
                <CardContent className="space-y-1 sm:space-y-2 p-3 sm:p-6 pt-0">
                  <div className="h-6 w-16 sm:h-8 sm:w-20 bg-zinc-300 animate-pulse rounded" />
                  <div className="h-3 w-28 sm:w-32 bg-zinc-300 animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Stats Skeleton */}
          <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-1 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="border-none shadow-none bg-zinc-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
                  <div className="flex flex-row items-center gap-1.5 sm:gap-2">
                    <div className="h-4 w-4 sm:h-5 sm:w-5 bg-zinc-300 animate-pulse rounded" />
                    <div className="h-3 w-16 sm:h-4 sm:w-20 bg-zinc-300 animate-pulse rounded" />
                  </div>
                  <div className="h-7 w-14 sm:w-16 bg-zinc-300 animate-pulse rounded" />
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="h-6 w-14 sm:h-8 sm:w-16 bg-zinc-300 animate-pulse rounded mb-2" />
                  <div className="h-3 w-24 sm:w-28 bg-zinc-300 animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions Skeleton */}
          <Card className="border-none shadow-none bg-zinc-100">
            <CardHeader className="p-3 sm:p-6">
              <div className="h-5 w-32 sm:h-6 sm:w-40 bg-zinc-300 animate-pulse rounded mb-2" />
              <div className="h-3 w-48 sm:h-4 sm:w-64 bg-zinc-300 animate-pulse rounded" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 sm:h-20 bg-zinc-300 animate-pulse rounded-lg" />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Skeleton */}
          <Card className="border-none shadow-none bg-zinc-100">
            <CardHeader className="space-y-3 sm:space-y-4 pb-3 sm:pb-4 p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex flex-col gap-1 sm:gap-2">
                  <div className="h-5 w-40 sm:h-6 sm:w-48 bg-zinc-300 animate-pulse rounded" />
                  <div className="h-3 w-48 sm:h-4 sm:w-56 bg-zinc-300 animate-pulse rounded" />
                </div>
                <div className="h-8 w-full sm:h-9 sm:w-32 bg-zinc-300 animate-pulse rounded" />
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="space-y-2 sm:space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-lg">
                    <div className="h-8 w-8 sm:h-9 sm:w-9 bg-zinc-300 animate-pulse rounded-full flex-shrink-0" />
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
    <div className="space-y-3 sm:space-y-4 pt-2 sm:pt-4 lg:px-2 px-0 sm:px-1">
      {/* Partial Data Warning Banner */}
      {hasPartialData && (
        <Card className="border-primary bg-primary">
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-primary flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-primary">
                  Some dashboard data could not be loaded
                </p>
                <p className="text-xs text-primary mt-1">
                  The dashboard is showing partial information. Try refreshing to load all data.
                </p>
              </div>
              <Button onClick={handleRetry} size="sm" variant="outline" className="border-primary w-full sm:w-auto">
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

      <div className="grid space-y-3 sm:space-y-4 bg-transparent rounded-2xl sm:rounded-3xl lg:grid-cols-1">

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-3 md:gap-3  grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-none gap-5 pb-0 pt-0 mb-0 bg-white">
            <StudentEnrollmentChart
              data={enrollmentTrends}
              isLoading={isLoading}
            />
        </Card>

        <Card className="border-none shadow-none gap-5 pt-0 mb-0 bg-white">
          {/* Attendance Trend Chart */}
          <AttendanceChart
            data={attendanceTrends}
            isLoading={isLoading}
          />
        </Card>

        <Card className="border-none shadow-none pt-0 mb-0 bg-white">
          <FeePaymentsChart
            data={paymentTrends}
            isLoading={isLoading}
          />
        </Card>

        <Card className="border-none shadow-none pt-0 mb-0 bg-white">
          <PendingFeesCard
            feeRecords={feeRecords}
            totalPending={stats.pendingFees}
            isLoading={isLoading}
          />
        </Card>
      </div>

            {/* Additional Stats */}
      <div className="grid gap-3 sm:gap-3 md:gap-3 grid-cols-1 md:grid-cols-4">


        <Card className="border-none shadow-none pt-0 bg-white">
          <UnreadMessagesCard
            messages={messages}
            totalUnread={stats.unreadMessages}
            isLoading={isLoading}
            maxDisplay={3}
          />
        </Card>

        <Card className="border-none shadow-none pt-0 bg-white">
          <UpcomingEventsCard
            events={events}
            totalEvents={stats.upcomingEvents}
            isLoading={isLoading}
            maxDisplay={3}
          />
        </Card>

        <Card className="border-none shadow-none pt-0 bg-white">
          <ClassesOverviewCard
            classes={classes}
            totalClasses={stats.totalClasses}
            totalSubjects={stats.totalSubjects}
            isLoading={isLoading}
            maxDisplay={4}
        />
        </Card>

        <Card className="border-none shadow-none pt-0 bg-white">
          <StaffOverviewCard
            staff={staff}
            totalTeachers={stats.totalTeachers}
            totalClerks={totalClerks}
            isLoading={isLoading}
            maxDisplay={4}
          />
        </Card>

      </div>

      {/* Quick Actions */}
      <Card className="border-none shadow-none bg-white">
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-base sm:text-lg font-semibold flex flex-row items-center gap-2 text-primary">
            <MouseIcon strokeWidth={3} className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Quick Actions</CardTitle>
          <CardDescription className="text-sm sm:text-md font-medium text-muted-foreground">
            Frequently used actions
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant}
                className={`h-16 sm:h-20 flex flex-col border-none shadow-none items-center justify-center gap-1 sm:gap-2 ${action.variant === 'outline' ? 'bg-zinc-100 hover:bg-zinc-200' : ''}`}
                onClick={() => window.location.href = action.href}
              >
                <action.icon strokeWidth={3} className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-1">

        {/* Recent Activity */}
        <Card className="border-none shadow-none bg-white">
          <CardHeader className="space-y-3 sm:space-y-4 pb-3 sm:pb-4 p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex flex-col gap-1 sm:gap-2">
                <CardTitle className="text-base sm:text-lg font-bold flex flex-row items-center gap-2 text-primary">
                  <ActivityIcon strokeWidth={3} className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-sm sm:text-md font-medium text-muted-foreground">
                  Latest updates from your school
                </CardDescription>
              </div>
              
              {/* Period Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-md text-muted-foreground hidden sm:inline">Period:</span>
                <Select value={activityPeriod} onValueChange={handlePeriodChange}>
                  <SelectTrigger className="w-full sm:w-fit gap-2 h-8 sm:h-9 text-xs sm:text-sm bg-primary text-white border-primary [&>svg]:text-white">
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
          
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="space-y-2 sm:space-y-3">
              {paginatedActivities.length > 0 ? (
                paginatedActivities.map((activity) => {
                  const Icon = getActivityIcon(activity.type)
                  const activityColor = getActivityColor(activity.type)
                  return (
                    <div key={activity.id} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-zinc-100 rounded-lg hover:bg-white transition-colors">
                      <div className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full flex-shrink-0 ${activityColor.bg}`}>
                        <Icon strokeWidth={3} className={`h-4 w-4 sm:h-5 sm:w-5 ${activityColor.text}`} />
                      </div>
                      <div className="flex-1 space-y-1 min-w-0">
                        <p className="text-sm sm:text-base font-semibold leading-tight">{activity.message}</p>
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
                <div className="text-center py-6 sm:py-8">
                  <div className="rounded-full bg-muted p-2 sm:p-3 w-fit mx-auto mb-2 sm:mb-3">
                    <Clock strokeWidth={3} className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
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
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t">
                <div className="text-xs text-muted-foreground text-center sm:text-left">
                  Showing {Math.min((activityPage - 1) * activitiesPerPage + 1, filteredActivities.length)} - {Math.min(activityPage * activitiesPerPage, filteredActivities.length)} of {filteredActivities.length} activities
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={activityPage === 1}
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 border-primary border-3 bg-transparent text-primary"
                  >
                    <ChevronLeft strokeWidth={3} className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={page === activityPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActivityPage(page)}
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0 bg-primary border-primary border-3 text-primary-foreground text-xs sm:text-sm"
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
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 border-primary border-3 bg-transparent text-primary"
                  >
                    <ChevronRight strokeWidth={3} className="h-3 w-3 sm:h-4 sm:w-4" />
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
