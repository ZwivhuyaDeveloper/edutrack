"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  AlertTriangle,
  Plus,
  MessageSquare,
  UserPlus,
  CalendarPlus,
  RefreshCw,
  MouseIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { StudentEnrollmentChart } from "@/components/student-enrollment-chart"
import { AttendanceChart } from "@/components/attendance-chart"
import { FeePaymentsChart } from "@/components/fee-payments-chart"
import { PendingFeesCard } from "@/components/pending-fees-card"
import { ClassesOverviewCard } from "@/components/classes-overview-card"
import { StaffOverviewCard } from "@/components/staff-overview-card"
import { UpcomingEventsCard } from "@/components/upcoming-events-card"
import { UnreadMessagesCard } from "@/components/unread-messages-card"
import { RecentActivityCard } from "@/components/recent-activity-card"
import { getDashboardCacheKey, clearCache } from "@/hooks/use-cached-fetch"

// Client-side cache for dashboard data
interface CacheEntry {
  data: unknown
  timestamp: number
  expiry: number
}
const dashboardCache = new Map<string, CacheEntry>()

// Helper to clear all dashboard cache
function clearDashboardCache() {
  dashboardCache.clear()
  clearCache('dashboard:principal/stats')
  clearCache('dashboard:principal/activity')
  clearCache('dashboard:principal/enrollment-trends')
  clearCache('dashboard:principal/attendance-trends')
  clearCache('dashboard:principal/teachers')
  clearCache('dashboard:principal/fee-records')
  clearCache('dashboard:principal/payment-trends')
  clearCache('dashboard:principal/events')
  clearCache('dashboard:principal/messages')
  clearCache('dashboard:principal/classes')
  clearCache('dashboard:principal/staff')
}

// Helper function to fetch with caching - returns cached data or fetches fresh
async function fetchWithCache<T = unknown>(
  url: string,
  cacheKey: string,
  cacheTime: number = 5 * 60 * 1000, // 5 minutes default
  signal?: AbortSignal
): Promise<{ data: T | null; fromCache: boolean; response?: Response }> {
  // Check cache first
  const cached = dashboardCache.get(cacheKey)
  const now = Date.now()

  if (cached && now < cached.expiry) {
    console.log(`[Cache] Using cached data for ${cacheKey}`)
    return { data: cached.data as T, fromCache: true }
  }

  // Fetch fresh data
  console.log(`[Cache] Fetching fresh data for ${cacheKey}`)
  const response = await fetch(url, {
    signal,
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-cache' }
  })

  if (response.ok) {
    const data = await response.clone().json() as T
    dashboardCache.set(cacheKey, {
      data,
      timestamp: now,
      expiry: now + cacheTime
    })
    return { data, fromCache: false, response }
  }

  // If fetch fails but we have stale cache, return it
  if (cached?.data) {
    console.log(`[Cache] Fetch failed, using stale cache for ${cacheKey}`)
    return { data: cached.data as T, fromCache: true }
  }

  return { data: null, fromCache: false, response }
}

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
  
  // Rate limiting and loop prevention
  const [hasFetchedData, setHasFetchedData] = useState(false)
  const [lastFetchTime, setLastFetchTime] = useState<number>(0)
  const [isFetching, setIsFetching] = useState(false)
  const MIN_FETCH_INTERVAL = 30000 // 30 seconds minimum between fetches
  
  // Activity pagination and filtering
  const [activityPeriod, setActivityPeriod] = useState<string>('7')
  const [activityPage, setActivityPage] = useState(1)
  const activitiesPerPage = 6

  useEffect(() => {
    // Prevent infinite loops and duplicate fetches
    if (hasFetchedData) {
      console.log('[Principal Dashboard] Skipping duplicate fetch')
      return
    }
    
    if (isFetching) {
      console.log('[Principal Dashboard] Already fetching, skipping')
      return
    }
    
    // Rate limiting check
    const now = Date.now()
    if (lastFetchTime && (now - lastFetchTime) < MIN_FETCH_INTERVAL) {
      console.log('[Principal Dashboard] Rate limited, skipping fetch')
      return
    }
    
    console.log('[Principal Dashboard] Initial data fetch')
    setHasFetchedData(true)
    
    // Create AbortController for cleanup
    const abortController = new AbortController()
    fetchDashboardData(abortController.signal)
    
    // Cleanup function
    return () => {
      console.log('[Principal Dashboard] Cleaning up - aborting requests')
      abortController.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  const fetchDashboardData = async (signal?: AbortSignal) => {
    // Prevent concurrent fetches
    if (isFetching) {
      console.log('[Principal Dashboard] Fetch already in progress')
      return
    }
    
    // Rate limiting
    const now = Date.now()
    if (lastFetchTime && (now - lastFetchTime) < MIN_FETCH_INTERVAL) {
      console.log('[Principal Dashboard] Rate limited, please wait')
      toast.warning('Please wait before refreshing data')
      return
    }
    
    try {
      setIsFetching(true)
      setIsLoading(true)
      setError(null)
      setHasPartialData(false)
      setLastFetchTime(Date.now())
      
      console.log('[Principal Dashboard] Fetching data...')
      
      // Fetch stats first (priority) with caching (2 minutes cache)
      const statsCacheKey = getDashboardCacheKey('principal/stats')
      const statsResult = await fetchWithCache('/api/dashboard/principal/stats', statsCacheKey, 2 * 60 * 1000, signal)
      
      // Fetch non-critical data in parallel with different cache times
      // Activity: 1 minute (frequently changing)
      // Trends: 5 minutes (less frequently changing)
      // Lists : 3 minutes (moderate update frequency)
      const [activityResult, trendsResult, attendanceTrendsResult, teachersResult, feeRecordsResult, paymentTrendsResult, eventsResult, messagesResult, classesResult, staffResult] = await Promise.all([
        fetchWithCache('/api/dashboard/principal/activity', getDashboardCacheKey('principal/activity'), 60 * 1000, signal),
        fetchWithCache('/api/dashboard/principal/enrollment-trends', getDashboardCacheKey('principal/enrollment-trends'), 5 * 60 * 1000, signal),
        fetchWithCache('/api/dashboard/principal/attendance-trends', getDashboardCacheKey('principal/attendance-trends'), 5 * 60 * 1000, signal),
        fetchWithCache('/api/dashboard/principal/teachers', getDashboardCacheKey('principal/teachers'), 3 * 60 * 1000, signal),
        fetchWithCache('/api/dashboard/principal/fee-records', getDashboardCacheKey('principal/fee-records'), 2 * 60 * 1000, signal),
        fetchWithCache('/api/dashboard/principal/payment-trends', getDashboardCacheKey('principal/payment-trends'), 5 * 60 * 1000, signal),
        fetchWithCache('/api/dashboard/principal/events', getDashboardCacheKey('principal/events'), 3 * 60 * 1000, signal),
        fetchWithCache('/api/dashboard/principal/messages', getDashboardCacheKey('principal/messages'), 1 * 60 * 1000, signal),
        fetchWithCache('/api/dashboard/principal/classes', getDashboardCacheKey('principal/classes'), 3 * 60 * 1000, signal),
        fetchWithCache('/api/dashboard/principal/staff', getDashboardCacheKey('principal/staff'), 3 * 60 * 1000, signal)
      ])

      let statsLoaded = false
      let activityLoaded = false

      // Handle stats response
      if (statsResult.data) {
        console.log(`Received stats data (from cache: ${statsResult.fromCache}):`, statsResult.data)
        setStats(statsResult.data as DashboardStats)
        statsLoaded = true
      } else if (statsResult.response) {
        const errorData = await statsResult.response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Failed to fetch stats:', statsResult.response.status, statsResult.response.statusText, errorData)
        
        if (statsResult.response.status === 401) {
          setError('Unauthorized. Please sign in again.')
          toast.error('Session expired. Please sign in again.')
          setTimeout(() => window.location.href = '/sign-in', 2000)
          return
        } else if (statsResult.response.status === 403) {
          setError('Access denied. You do not have permission to view this page.')
          toast.error('Access denied')
        } else if (statsResult.response.status === 500) {
          setError('Server error. Please try again later.')
          toast.error('Failed to load statistics. Please try again.')
        } else {
          setError(`Failed to load data: ${errorData.error || 'Unknown error'}`)
          toast.error('Failed to load dashboard data')
        }
      }

      // Handle activity response
      if (activityResult.data) {
        const activityData = activityResult.data as { activities?: RecentActivity[] } | RecentActivity[]
        console.log(`Received activity data (from cache: ${activityResult.fromCache}):`, activityData)
        const activitiesArray = Array.isArray(activityData) ? activityData : (Array.isArray((activityData as { activities?: RecentActivity[] }).activities) ? (activityData as { activities: RecentActivity[] }).activities : [])
        console.log('Setting activities array:', activitiesArray.length, 'activities')
        setRecentActivity(activitiesArray)
        activityLoaded = true
      } else if (activityResult.response && !activityResult.response.ok) {
        const errorText = await activityResult.response.text().catch(() => 'Unknown error')
        console.error('Failed to fetch activity:', activityResult.response.status, errorText)
        if (statsLoaded) {
          setHasPartialData(true)
          toast.warning('Some dashboard data could not be loaded')
        }
      }

      // Handle enrollment trends response
      if (trendsResult.data) {
        const trendsData = trendsResult.data as { trends?: EnrollmentTrend[] } | EnrollmentTrend[]
        console.log(`Received enrollment trends (from cache: ${trendsResult.fromCache}):`, trendsData)
        const trendsArray = Array.isArray(trendsData) ? trendsData : (Array.isArray((trendsData as { trends?: EnrollmentTrend[] }).trends) ? (trendsData as { trends: EnrollmentTrend[] }).trends : [])
        console.log('Setting enrollment trends array:', trendsArray.length, 'data points')
        setEnrollmentTrends(trendsArray)
      } else if (!trendsResult.fromCache) {
        // Set default trend data if API fails and no cache
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
      if (attendanceTrendsResult.data) {
        const attendanceData = attendanceTrendsResult.data as { trends?: AttendanceTrend[] } | AttendanceTrend[]
        console.log(`Received attendance trends (from cache: ${attendanceTrendsResult.fromCache}):`, attendanceData)
        const attendanceArray = Array.isArray(attendanceData) ? attendanceData : (Array.isArray((attendanceData as { trends?: AttendanceTrend[] }).trends) ? (attendanceData as { trends: AttendanceTrend[] }).trends : [])
        console.log('Setting attendance trends array:', attendanceArray.length, 'data points')
        setAttendanceTrends(attendanceArray)
      }

      // Handle teachers response (data is stored but not displayed directly)
      if (teachersResult.data) {
        const teachersData = teachersResult.data as { teachers?: Teacher[] } | Teacher[]
        const teachersArray = Array.isArray(teachersData) ? teachersData : (Array.isArray((teachersData as { teachers?: Teacher[] }).teachers) ? (teachersData as { teachers: Teacher[] }).teachers : [])
        console.log(`Setting teachers array (from cache: ${teachersResult.fromCache}):`, teachersArray.length, 'teachers')
        setTeachers(teachersArray)
      }

      // Handle fee records response
      if (feeRecordsResult.data) {
        const feeRecordsData = feeRecordsResult.data as { feeRecords?: FeeRecord[] } | FeeRecord[]
        console.log(`Received fee records (from cache: ${feeRecordsResult.fromCache}):`, feeRecordsData)
        const feeRecordsArray = Array.isArray(feeRecordsData) ? feeRecordsData : (Array.isArray((feeRecordsData as { feeRecords?: FeeRecord[] }).feeRecords) ? (feeRecordsData as { feeRecords: FeeRecord[] }).feeRecords : [])
        console.log('Setting fee records array:', feeRecordsArray.length, 'fee records')
        setFeeRecords(feeRecordsArray)
      }

      // Handle payment trends response
      if (paymentTrendsResult.data) {
        const paymentData = paymentTrendsResult.data as { trends?: PaymentTrend[] } | PaymentTrend[]
        console.log(`Received payment trends (from cache: ${paymentTrendsResult.fromCache}):`, paymentData)
        const paymentArray = Array.isArray(paymentData) ? paymentData : (Array.isArray((paymentData as { trends?: PaymentTrend[] }).trends) ? (paymentData as { trends: PaymentTrend[] }).trends : [])
        console.log('Setting payment trends array:', paymentArray.length, 'data points')
        setPaymentTrends(paymentArray)
      }

      // Handle events response
      if (eventsResult.data) {
        const eventsData = eventsResult.data as { events?: Event[] } | Event[]
        console.log(`Received events (from cache: ${eventsResult.fromCache}):`, eventsData)
        const eventsArray = Array.isArray(eventsData) ? eventsData : (Array.isArray((eventsData as { events?: Event[] }).events) ? (eventsData as { events: Event[] }).events : [])
        console.log('Setting events array:', eventsArray.length, 'events')
        setEvents(eventsArray)
      }

      // Handle messages response
      if (messagesResult.data) {
        const messagesData = messagesResult.data as { messages?: Message[] } | Message[]
        console.log(`Received messages (from cache: ${messagesResult.fromCache}):`, messagesData)
        const messagesArray = Array.isArray(messagesData) ? messagesData : (Array.isArray((messagesData as { messages?: Message[] }).messages) ? (messagesData as { messages: Message[] }).messages : [])
        console.log('Setting messages array:', messagesArray.length, 'messages')
        setMessages(messagesArray)
      }

      // Handle classes response
      if (classesResult.data) {
        const classesData = classesResult.data as { classes?: ClassData[] } | ClassData[]
        console.log(`Received classes (from cache: ${classesResult.fromCache}):`, classesData)
        const classesArray = Array.isArray(classesData) ? classesData : (Array.isArray((classesData as { classes?: ClassData[] }).classes) ? (classesData as { classes: ClassData[] }).classes : [])
        console.log('Setting classes array:', classesArray.length, 'classes')
        setClasses(classesArray)
      }

      // Handle staff response
      if (staffResult.data) {
        const staffData = staffResult.data as { staff?: StaffMember[]; totalClerks?: number } | StaffMember[]
        console.log(`Received staff (from cache: ${staffResult.fromCache}):`, staffData)
        const staffArray = Array.isArray(staffData) ? staffData : (Array.isArray((staffData as { staff?: StaffMember[] }).staff) ? (staffData as { staff: StaffMember[] }).staff : [])
        console.log('Setting staff array:', staffArray.length, 'staff members')
        setStaff(staffArray)
        if (staffData && typeof staffData === 'object' && 'totalClerks' in staffData) {
          setTotalClerks((staffData as { totalClerks?: number }).totalClerks || 0)
        }
      }

      // If stats failed but activity loaded, show partial data
      if (!statsLoaded && activityLoaded) {
        setHasPartialData(true)
      }
    } catch (error) {
      // Don't show error if request was aborted (component unmounted)
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('[Principal Dashboard] Fetch aborted (component unmounted)')
        return
      }
      
      console.error('[Principal Dashboard] Error fetching data:', error)
      setError('Network error. Please check your connection and try again.')
      toast.error('Failed to load dashboard data. Please check your connection.')
    } finally {
      setIsLoading(false)
      setIsFetching(false)
      console.log('[Principal Dashboard] Fetch complete')
    }
  }

  const handleRetry = () => {
    // Check rate limiting before retry
    const now = Date.now()
    if (lastFetchTime && (now - lastFetchTime) < MIN_FETCH_INTERVAL) {
      const waitTime = Math.ceil((MIN_FETCH_INTERVAL - (now - lastFetchTime)) / 1000)
      toast.warning(`Please wait ${waitTime} seconds before retrying`)
      return
    }
    
    console.log('[Principal Dashboard] Manual retry triggered - clearing cache')
    clearDashboardCache() // Clear cache on manual retry
    setRetryCount(prev => prev + 1)
    setHasFetchedData(false) // Allow refetch
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

  // Handle period change for activities
  const handlePeriodChange = (value: string) => {
    setActivityPeriod(value)
    setActivityPage(1) // Reset to first page when period changes
    // In a real implementation, you would refetch data with the new period
    const periodLabels: Record<string, string> = {
      '1': 'today',
      '7': 'last 7 days',
      '14': 'last 14 days',
      '30': 'last 30 days'
    }
    toast.info(`Showing activities from ${periodLabels[value] || 'last 7 days'}`)
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
          <Card className="border-none shadow-none hidden bg-zinc-100">
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
      <header className="items-center hidden  space-x-2 md:grid-cols-2 lg:grid-cols-2 p-2 justify-between">
        <div className="space-y-1 bg-white h-full">
          <h1 className="text-xl md:text-2xl lg:text-3xl text-primary font-bold tracking-tight">Principal Dashboard</h1>
          <p className="text-xs md:text-sm lg:text-base text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening at your school today.
          </p>
        </div>
      {/* Quick Actions */}
      <Card className="border-none  shadow-none bg-white">
        <CardHeader className="p-3 border-b sm:p-6">
          <CardTitle className="text-base sm:text-base lg:text-lg font-semibold flex flex-row items-center gap-2 text-primary">
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
      </header>

      {/* Content Container */}

      <div className="grid space-y-3 sm:space-y-4 max-w-full  h-full bg-transparent rounded-2xl sm:rounded-3xl lg:grid-cols-1">

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-3 w-full  md:gap-3  grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm gap-5 pb-0 pt-0 mb-0 bg-white">
            <StudentEnrollmentChart
              data={enrollmentTrends}
              isLoading={isLoading}
            />
        </Card>

        <Card className="border-none shadow-sm gap-5 pt-0 mb-0 bg-white">
          {/* Attendance Trend Chart */}
          <AttendanceChart
            data={attendanceTrends}
            isLoading={isLoading}
          />
        </Card>

        <Card className="border-none shadow-sm pt-0 mb-0 bg-white">
          <FeePaymentsChart
            data={paymentTrends}
            isLoading={isLoading}
          />
        </Card>

        <Card className="border-none shadow-sm pt-0 mb-0 bg-white">
          <PendingFeesCard
            feeRecords={feeRecords}
            totalPending={stats.pendingFees}
            isLoading={isLoading}
          />
        </Card>
      </div>

            {/* Additional Stats */}
      <div className="grid gap-3 sm:gap-3 w-full md:gap-3 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">


        <Card className="border-none shadow-sm pt-0 bg-white">
          <UnreadMessagesCard
            messages={messages}
            totalUnread={stats.unreadMessages}
            isLoading={isLoading}
            maxDisplay={3}
          />
        </Card>

        <Card className="border-none shadow-sm pt-0 bg-white">
          <UpcomingEventsCard
            events={events}
            totalEvents={stats.upcomingEvents}
            isLoading={isLoading}
            maxDisplay={3}
          />
        </Card>

        <Card className="border-none shadow-sm pt-0 bg-white">
          <ClassesOverviewCard
            classes={classes}
            totalClasses={stats.totalClasses}
            totalSubjects={stats.totalSubjects}
            isLoading={isLoading}
            maxDisplay={4}
        />
        </Card>

        <Card className="border-none shadow-sm pt-0 bg-white">
          <StaffOverviewCard
            staff={staff}
            totalTeachers={stats.totalTeachers}
            totalClerks={totalClerks}
            isLoading={isLoading}
            maxDisplay={4}
          />
        </Card>

      </div>


      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-1">

        {/* Recent Activity */}
        <RecentActivityCard
          activities={recentActivity}
          isLoading={isLoading}
          error={error}
          onRetry={handleRetry}
          period={activityPeriod}
          onPeriodChange={handlePeriodChange}
          page={activityPage}
          onPageChange={setActivityPage}
          activitiesPerPage={activitiesPerPage}
        />
        </div>
      </div>
    </div>
  )
}
