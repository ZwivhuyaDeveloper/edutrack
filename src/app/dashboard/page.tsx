"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useUser, useClerk } from "@clerk/nextjs"
import type { PageType } from "@/types/dashboard"
import { AppSidebar, getRoleBasedNavigation } from "@/components/app-sidebar"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { AlertsDropdown } from "@/components/alerts-dropdown"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Search,
  Bell,
  Settings,
  LogOut,
  User,
  GraduationCap,
  BookOpen,
  Users,
  Shield,
  Heart,
  Calendar,
  FileText,
  MessageSquare,
  Award,
  TrendingUp,
  Loader2,
  AlertCircle,
  Building2,
  X,
  Info,
  AlertTriangle,
  XCircle,
} from "lucide-react"

// Role-based page components mapping
const rolePageMap: Record<string, Partial<Record<PageType, () => Promise<{ default: React.ComponentType }>>>> = {
  STUDENT: {
    dashboard: () => import("./learner/home/page").then(mod => ({ default: mod.default })),
    assignments: () => import("./learner/assignments/page").then(mod => ({ default: mod.default })),
    reports: () => import("./learner/reports/page").then(mod => ({ default: mod.default })),
    messages: () => import("./learner/messages/page").then(mod => ({ default: mod.default })),
    classes: () => import("./learner/classes/page").then(mod => ({ default: mod.default })),
    attendance: () => import("./learner/attendance/page").then(mod => ({ default: mod.default })),
    resources: () => import("./learner/resources/page").then(mod => ({ default: mod.default })),
    events: () => import("./learner/events/page").then(mod => ({ default: mod.default })),
    announcements: () => import("./learner/announcements/page").then(mod => ({ default: mod.default })),
    gradebook: () => import("./learner/gradebook/page").then(mod => ({ default: mod.default })),
  },
  TEACHER: {
    dashboard: () => import("./teacher/home/page").then(mod => ({ default: mod.default })),
    students: () => import("./teacher/students/page").then(mod => ({ default: mod.default })),
    assignments: () => import("./teacher/assignments/page").then(mod => ({ default: mod.default })),
    classes: () => import("./teacher/classes/page").then(mod => ({ default: mod.default })),
    gradebook: () => import("./teacher/gradebook/page").then(mod => ({ default: mod.default })),
    timetable: () => import("./teacher/timetable/page").then(mod => ({ default: mod.default })),
    attendance: () => import("./teacher/attendance/page").then(mod => ({ default: mod.default })),
    lessons: () => import("./teacher/lessons/page").then(mod => ({ default: mod.default })),
    announcements: () => import("./teacher/announcements/page").then(mod => ({ default: mod.default })),
    resources: () => import("./teacher/resources/page").then(mod => ({ default: mod.default })),
    analytics: () => import("./teacher/analytics/page").then(mod => ({ default: mod.default })),
    reports: () => import("./teacher/reports/page").then(mod => ({ default: mod.default })),
    messages: () => import("./teacher/messages/page").then(mod => ({ default: mod.default })),
    settings: () => import("./teacher/settings/page").then(mod => ({ default: mod.default })),
  },
  PRINCIPAL: {
    dashboard: () => import("./principal/home/page").then(mod => ({ default: mod.default })),
    people: () => import("./principal/people/page").then(mod => ({ default: mod.default })),
    academic: () => import("./principal/academic/page").then(mod => ({ default: mod.default })),
    operations: () => import("./principal/operations/page").then(mod => ({ default: mod.default })),
    communication: () => import("./principal/communication/page").then(mod => ({ default: mod.default })),
    settings: () => import("./principal/settings/page").then(mod => ({ default: mod.default })),
  },
  PARENT: {
    dashboard: () => import("./parent/home/page").then(mod => ({ default: mod.default })),
    assignments: () => import("./parent/assignments/page").then(mod => ({ default: mod.default })),
    reports: () => import("./parent/reports/page").then(mod => ({ default: mod.default })),
    messages: () => import("./parent/messages/page").then(mod => ({ default: mod.default })),
  },
  CLERK: {
    dashboard: () => Promise.resolve({ default: () => <ClerkDashboardPlaceholder /> }),
    assignments: () => Promise.resolve({ default: () => <div>Clerk Assignments</div> }),
    reports: () => Promise.resolve({ default: () => <div>Clerk Reports</div> }),
    messages: () => Promise.resolve({ default: () => <div>Clerk Messages</div> }),
  },
  ADMIN: {
    dashboard: () => Promise.resolve({ default: () => <AdminDashboardPlaceholder /> }),
    assignments: () => Promise.resolve({ default: () => <div>Admin Assignments</div> }),
    reports: () => Promise.resolve({ default: () => <div>Admin Reports</div> }),
    messages: () => Promise.resolve({ default: () => <div>Admin Messages</div> }),
  },
}

// Placeholder components for roles without dedicated pages yet
function ClerkDashboardPlaceholder() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Clerk Dashboard</CardTitle>
        <CardDescription>Administrative staff dashboard</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Clerk dashboard features are coming soon. You&apos;ll be able to manage student records, fees, and administrative tasks here.
        </p>
      </CardContent>
    </Card>
  )
}

function AdminDashboardPlaceholder() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Dashboard</CardTitle>
        <CardDescription>System administrator dashboard</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Admin dashboard features are coming soon. You&apos;ll have full system access and management capabilities here.
        </p>
      </CardContent>
    </Card>
  )
}

interface DatabaseUser {
  id: string
  clerkId: string
  email: string
  firstName: string
  lastName: string
  role: string
  schoolId: string
  avatar?: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
  school: {
    id: string
    name: string
    city?: string
    state?: string
    logo?: string
  }
  profile?: unknown
  permissions?: Record<string, boolean>
  dashboardRoute?: string
  studentProfile?: unknown
  teacherProfile?: {
    department?: string
    employeeId?: string
    [key: string]: unknown
  }
  parentProfile?: unknown
  principalProfile?: unknown
  clerkProfile?: unknown
}

function DashboardContent() {
  const [activePage, setActivePage] = useState<PageType>("dashboard")
  const [PageComponents, setPageComponents] = useState<Partial<Record<PageType, React.ComponentType>>>({} as Partial<Record<PageType, React.ComponentType>>)
  const [dbUser, setDbUser] = useState<DatabaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [roleAlert, setRoleAlert] = useState<{
    show: boolean
    type: 'warning' | 'info' | 'error'
    title: string
    message: string
    actionLabel?: string
    actionUrl?: string
    alertId?: string // Unique identifier for the alert
    timestamp?: number // When the alert was created
  } | null>(null)
  const { user: clerkUser, isLoaded } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()

  // Helper function to check if an alert was dismissed
  const isAlertDismissed = useCallback((alertId: string, timestamp: number): boolean => {
    try {
      const dismissedAlerts = JSON.parse(localStorage.getItem('dismissedAlerts') || '{}')
      const dismissedTimestamp = dismissedAlerts[alertId]
      
      console.log('Checking alert dismissal:', {
        alertId,
        alertTimestamp: timestamp,
        dismissedTimestamp,
        isDismissed: dismissedTimestamp && dismissedTimestamp >= timestamp
      })
      
      // If alert was dismissed and the timestamp matches or is older, keep it dismissed
      if (dismissedTimestamp && dismissedTimestamp >= timestamp) {
        return true
      }
      return false
    } catch (error) {
      console.error('Error checking dismissed alerts:', error)
      return false
    }
  }, [])

  // Helper function to dismiss an alert
  const dismissAlert = useCallback((alertId: string, timestamp: number) => {
    try {
      const dismissedAlerts = JSON.parse(localStorage.getItem('dismissedAlerts') || '{}')
      dismissedAlerts[alertId] = timestamp
      localStorage.setItem('dismissedAlerts', JSON.stringify(dismissedAlerts))
      
      console.log('Alert dismissed:', {
        alertId,
        timestamp,
        allDismissedAlerts: dismissedAlerts
      })
      
      setRoleAlert(null)
      
      // Add toast notification
      toast.success('Alert dismissed', {
        description: 'This alert will not appear again unless there are new updates.',
        duration: 3000,
      })
    } catch (error) {
      console.error('Error dismissing alert:', error)
      setRoleAlert(null)
    }
  }, [])

  // Function to check for role-specific alerts
  const checkRoleAlerts = useCallback((user: DatabaseUser) => {
    const currentTimestamp = Date.now()
    
    switch (user.role) {
      case 'TEACHER':
        // Check if teacher profile is incomplete
        if (!user.teacherProfile?.department || !user.teacherProfile?.employeeId) {
          const alertId = `teacher-profile-incomplete-${user.id}`
          const alertTimestamp = user.updatedAt ? new Date(user.updatedAt).getTime() : currentTimestamp
          
          if (!isAlertDismissed(alertId, alertTimestamp)) {
            setRoleAlert({
              show: true,
              type: 'warning',
              title: 'Profile Incomplete',
              message: 'Please complete your teacher profile to access all features.',
              actionLabel: 'Complete Profile',
              actionUrl: '/dashboard/profile',
              alertId,
              timestamp: alertTimestamp
            })
          }
        }
        break
      
      case 'STUDENT':
        // Check if student has pending assignments or low grades
        const studentAlertId = `student-welcome-${user.id}`
        const studentTimestamp = currentTimestamp
        
        if (!isAlertDismissed(studentAlertId, studentTimestamp)) {
          setRoleAlert({
            show: true,
            type: 'info',
            title: 'Welcome Back!',
            message: 'You have new assignments and upcoming exams this week.',
            actionLabel: 'View Assignments',
            actionUrl: '/dashboard/assignments',
            alertId: studentAlertId,
            timestamp: studentTimestamp
          })
        }
        break
      
      case 'PRINCIPAL':
        // Check for important school metrics or pending approvals
        const principalAlertId = `principal-overview-${user.id}`
        const principalTimestamp = currentTimestamp
        
        if (!isAlertDismissed(principalAlertId, principalTimestamp)) {
          setRoleAlert({
            show: true,
            type: 'info',
            title: 'School Overview',
            message: 'Your school dashboard is ready. Monitor key metrics and manage operations.',
            actionLabel: 'View Reports',
            actionUrl: '/dashboard/operations',
            alertId: principalAlertId,
            timestamp: principalTimestamp
          })
        }
        break
      
      case 'PARENT':
        // Check for student updates or messages
        const parentAlertId = `parent-updates-${user.id}`
        const parentTimestamp = currentTimestamp
        
        if (!isAlertDismissed(parentAlertId, parentTimestamp)) {
          setRoleAlert({
            show: true,
            type: 'info',
            title: 'Student Updates',
            message: 'Stay informed about your child\'s academic progress and school activities.',
            actionLabel: 'View Reports',
            actionUrl: '/dashboard/reports',
            alertId: parentAlertId,
            timestamp: parentTimestamp
          })
        }
        break
      
      default:
        setRoleAlert(null)
    }
  }, [isAlertDismissed])

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !clerkUser) {
      router.push('/sign-in')
    }
  }, [clerkUser, isLoaded, router])

  // Enhanced user data fetching
  useEffect(() => {
    const fetchUserData = async () => {
      if (!clerkUser) return
      
      try {
        setError(null)
        const response = await fetch('/api/users/me')
        
        if (response.ok) {
          const data = await response.json()
          setDbUser(data.user)
          
          // Check for role-specific alerts
          checkRoleAlerts(data.user)
          
        } else if (response.status === 401) {
          // Not authenticated; redirect to sign-in
          window.location.replace('/sign-in')
          return
        } else if (response.status === 404) {
          // User not found in database, redirect to registration
          window.location.replace('/sign-up')
          return
        } else {
          const errorData = await response.json().catch(() => ({}))
          setError(errorData.error || `Failed to load user data (${response.status})`)
          toast.error('Failed to load dashboard', {
            description: errorData.error || 'Please try refreshing the page.',
            duration: 5000,
          })
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        setError('Network error while loading dashboard')
        toast.error('Connection Error', {
          description: 'Please check your internet connection and try again.',
          action: {
            label: 'Retry',
            onClick: () => window.location.reload()
          },
          duration: 10000,
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (clerkUser && !dbUser) {
      fetchUserData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clerkUser, router])

  // Load page components based on user role
  useEffect(() => {
    if (!dbUser) return

    const loadComponents = async () => {
      const components = {} as Partial<Record<PageType, React.ComponentType>>

      // Get role-specific page map
      const rolePages = rolePageMap[dbUser.role]
      
      if (!rolePages) {
        console.error(`No page map found for role: ${dbUser.role}`)
        return
      }

      for (const [pageType, importFn] of Object.entries(rolePages)) {
        try {
          const mod = await importFn()
          components[pageType as PageType] = mod.default
        } catch (error) {
          console.error(`Failed to load ${pageType} page for ${dbUser.role}:`, error)
          // Fallback to a simple error component
          components[pageType as PageType] = () => (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Page not found</p>
            </div>
          )
        }
      }

      setPageComponents(components)
    }

    loadComponents()
  }, [dbUser])

  const renderPageContent = () => {
    const Component = PageComponents[activePage]
    return Component ? <Component /> : (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const handleLogout = () => {
    signOut()
    router.push('/')
  }

  // Get role-specific information
  const getRoleSpecificInfo = () => {
    if (!dbUser) return { title: '', subtitle: '', badge: '' }

    switch (dbUser.role) {
      case 'STUDENT':
        return {
          title: 'Student',
          subtitle: 'Active Learner',
          badge: 'bg-blue-100 text-blue-800'
        }
      case 'TEACHER':
        return {
          title: 'Teacher',
          subtitle: 'Educator',
          badge: 'bg-green-100 text-green-800'
        }
      case 'PRINCIPAL':
        return {
          title: 'Principal',
          subtitle: 'Administrator',
          badge: 'bg-red-100 text-red-800'
        }
      case 'PARENT':
        return {
          title: 'Parent/Guardian',
          subtitle: 'Connected',
          badge: 'bg-purple-100 text-purple-800'
        }
      case 'CLERK':
        return {
          title: 'Clerk',
          subtitle: 'Administrative Staff',
          badge: 'bg-orange-100 text-orange-800'
        }
      case 'ADMIN':
        return {
          title: 'Admin',
          subtitle: 'System Administrator',
          badge: 'bg-gray-100 text-gray-800'
        }
      default:
        return { title: 'User', subtitle: '', badge: 'bg-gray-100 text-gray-800' }
    }
  }

  const roleInfo = getRoleSpecificInfo()

  // Role-specific menu items
  const getRoleSpecificMenuItems = () => {
    if (!dbUser) return []

    const baseItems = [
      {
        icon: User,
        label: 'View Profile',
        description: 'Manage your personal information',
        action: () => router.push('/dashboard/profile')
      },
      {
        icon: Settings,
        label: 'Account Settings',
        description: 'Update preferences and security',
        action: () => {
          if (dbUser.role === 'STUDENT') {
            router.push('/dashboard/learner/settings')
          } else {
            console.log('Settings')
          }
        }
      }
    ]

    const roleSpecificItems = []

    switch (dbUser.role) {
      case 'STUDENT':
        roleSpecificItems.push(
          {
            icon: GraduationCap,
            label: 'My Classes',
            description: 'View enrolled classes',
            action: () => router.push('/dashboard/learner/classes')
          },
          {
            icon: BookOpen,
            label: 'Assignments',
            description: 'Check pending work',
            action: () => router.push('/dashboard/learner/assignments')
          },
          {
            icon: Award,
            label: 'Gradebook',
            description: 'View academic performance',
            action: () => router.push('/dashboard/learner/gradebook')
          },
          {
            icon: Calendar,
            label: 'Schedule',
            description: 'View weekly timetable',
            action: () => router.push('/dashboard/learner/schedule')
          },
          {
            icon: Users,
            label: 'Attendance',
            description: 'Track attendance records',
            action: () => router.push('/dashboard/learner/attendance')
          },
          {
            icon: MessageSquare,
            label: 'Messages',
            description: 'View conversations',
            action: () => router.push('/dashboard/learner/messages')
          },
          {
            icon: Bell,
            label: 'Announcements',
            description: 'School updates',
            action: () => router.push('/dashboard/learner/announcements')
          },
          {
            icon: FileText,
            label: 'Resources',
            description: 'Learning materials',
            action: () => router.push('/dashboard/learner/resources')
          },
          {
            icon: Calendar,
            label: 'Events',
            description: 'School events & calendar',
            action: () => router.push('/dashboard/learner/events')
          },
          {
            icon: TrendingUp,
            label: 'Finance',
            description: 'Fees & payments',
            action: () => router.push('/dashboard/learner/finance')
          }
        )
        break

      case 'TEACHER':
        roleSpecificItems.push(
          {
            icon: Users,
            label: 'My Students',
            description: 'Manage student roster',
            action: () => router.push('/dashboard/teacher/students')
          },
          {
            icon: BookOpen,
            label: 'My Classes',
            description: 'View assigned classes',
            action: () => router.push('/dashboard/teacher/classes')
          },
          {
            icon: FileText,
            label: 'Assignments',
            description: 'Create and manage assignments',
            action: () => router.push('/dashboard/teacher/assignments')
          },
          {
            icon: TrendingUp,
            label: 'Gradebook',
            description: 'Record and track grades',
            action: () => router.push('/dashboard/teacher/gradebook')
          },
          {
            icon: Calendar,
            label: 'Timetable',
            description: 'View teaching schedule',
            action: () => router.push('/dashboard/teacher/timetable')
          },
          {
            icon: Users,
            label: 'Attendance',
            description: 'Mark student attendance',
            action: () => router.push('/dashboard/teacher/attendance')
          },
          {
            icon: MessageSquare,
            label: 'Messages',
            description: 'Communicate with parents',
            action: () => router.push('/dashboard/teacher/messages')
          },
          {
            icon: FileText,
            label: 'Resources',
            description: 'Teaching materials',
            action: () => router.push('/dashboard/teacher/resources')
          }
        )
        break

      case 'PRINCIPAL':
        // Principal uses the 5-page architecture with sidebar navigation
        // No additional quick actions needed in dropdown menu
        break

      case 'PARENT':
        roleSpecificItems.push(
          {
            icon: Heart,
            label: 'My Children',
            description: 'View your children\'s progress',
            action: () => console.log('My Children')
          },
          {
            icon: FileText,
            label: 'Progress Reports',
            description: 'Academic progress updates',
            action: () => console.log('Progress Reports')
          },
          {
            icon: Calendar,
            label: 'School Calendar',
            description: 'Important dates and events',
            action: () => console.log('School Calendar')
          },
          {
            icon: MessageSquare,
            label: 'Teacher Communication',
            description: 'Contact teachers',
            action: () => console.log('Teacher Communication')
          }
        )
        break

      case 'CLERK':
        roleSpecificItems.push(
          {
            icon: Users,
            label: 'Student Management',
            description: 'Manage student records',
            action: () => console.log('Student Management')
          },
          {
            icon: FileText,
            label: 'Fee Management',
            description: 'Process fees and payments',
            action: () => console.log('Fee Management')
          },
          {
            icon: Calendar,
            label: 'Attendance Records',
            description: 'View and manage attendance',
            action: () => console.log('Attendance Records')
          },
          {
            icon: TrendingUp,
            label: 'Reports',
            description: 'Generate administrative reports',
            action: () => console.log('Reports')
          }
        )
        break

      case 'ADMIN':
        roleSpecificItems.push(
          {
            icon: Shield,
            label: 'System Management',
            description: 'Manage system settings',
            action: () => console.log('System Management')
          },
          {
            icon: Users,
            label: 'User Management',
            description: 'Manage all users',
            action: () => console.log('User Management')
          },
          {
            icon: FileText,
            label: 'Audit Logs',
            description: 'View system audit logs',
            action: () => console.log('Audit Logs')
          },
          {
            icon: Settings,
            label: 'Global Settings',
            description: 'Configure system-wide settings',
            action: () => console.log('Global Settings')
          }
        )
        break
    }

    return [...baseItems, ...roleSpecificItems]
  }

  // Get navigation items for mobile bottom nav (must be before early returns)
  const userRole = dbUser?.role === 'PRINCIPAL' ? 'admin' : (dbUser?.role.toLowerCase() as 'student' | 'teacher' | 'parent' | undefined) || 'student'
  const navItems = useMemo(() => getRoleBasedNavigation(userRole), [userRole])

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error && !dbUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert className="w-full max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Dashboard Loading Error</p>
              <p className="text-sm">{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                size="sm" 
                className="w-full mt-2"
              >
                Retry
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!clerkUser || !dbUser) {
    return null // Will redirect via useEffect
  }

  return (
    <SidebarProvider>
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:block">
        <AppSidebar 
          onNavigate={setActivePage} 
          activePage={activePage} 
          userRole={userRole} 
        />
      </div>
      
      <SidebarInset className="bg-zinc-100 shadow-md h-full w-full max-w-full pb-16 md:pb-0 overflow-x-hidden">

        {/* Header */}
        <header className="flex h-auto max-w-full md:h-14 lg:h-16 shrink-0 bg-white rounded-2xl md:rounded-4xl lg:rounded-6xl shadow-none 
          mx-2 sm:mx-3 md:mx-4 mt-3 md:mt-5 lg:mt-7 mb-0 items-center px-3 md:px-4 lg:px-6 py-3 md:py-0  md:justify-between transition-[width,height] 
          ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-16 font-sans overflow-hidden">
          {/* Left section - Sidebar trigger */}
          <div className="flex items-center gap-1.5 md:gap-2 flex-1 md:flex-initial min-w-0">
            <SidebarTrigger className="-ml-0 hidden md:flex" />
            <Separator orientation="vertical" className="hidden md:block h-5 md:h-6 bg-gray-300" />
            <div className="flex flex-col md:flex-row items-start md:items-center gap-0.5 md:gap-1.5 lg:gap-2 min-w-0 overflow-hidden">
              <span className="text-xs md:text-sm lg:text-base font-semibold text-primary capitalize whitespace-nowrap">
                {dbUser.role.toLowerCase()} Dashboard
              </span>
              <span className="text-xs md:text-sm lg:text-base text-black gap-1 md:gap-1.5 lg:gap-2 flex flex-row items-center min-w-0">
                <p className="font-medium hidden lg:inline">
                  Welcome back,
                </p>
                <p className="font-semibold text-background-muted truncate max-w-[120px] md:max-w-[150px] lg:max-w-none">
                  {dbUser.firstName} {dbUser.lastName}
                </p>
              </span>
            </div>
          </div>

          {/* Center section - Search input */}
          <div className="hidden lg:flex flex-1 justify-center  px-2 lg:px-4 min-w-0">
            <div className="relative w-full max-w-[200px] md:max-w-[280px] lg:max-w-[400px] hidden">
              <Search className="absolute left-2.5 md:left-3 top-1/2 -translate-y-1/2 h-3.5 md:h-4 w-3.5 md:w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-full h-8 md:h-9 lg:h-10 text-xs md:text-sm bg-zinc-100 rounded-full shadow-none border-0 pl-7 md:pl-9 pr-3"
              />
            </div>
          </div>

          {/* Right section - User menu */}
          <div className="flex flex-row items-center justify-end gap-1 md:gap-2 flex-shrink-0">
            <AlertsDropdown role={dbUser.role} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full p-1 md:p-1.5 lg:p-2 hover:bg-accent transition-colors" aria-label="User menu">
                  <Avatar className="h-7 w-7 md:h-8 md:w-8 lg:h-9 lg:w-9">
                    <AvatarImage src={clerkUser.imageUrl} alt={`${dbUser.firstName} ${dbUser.lastName}`} />
                    <AvatarFallback>
                      <User className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={clerkUser.imageUrl} alt={`${dbUser.firstName} ${dbUser.lastName}`} />
                      <AvatarFallback className="bg-primary/10">
                        <User className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold leading-none">{dbUser.firstName} {dbUser.lastName}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleInfo.badge}`}>
                          {roleInfo.title}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-tight">{dbUser.email}</p>
                      <p className="text-xs text-muted-foreground leading-tight">{dbUser.school.name}</p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Role-specific quick actions */}
                {getRoleSpecificMenuItems().map((item, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={item.action}
                    className="p-3 cursor-pointer"
                  >
                    <div className="flex items-start gap-3 w-full">
                      <item.icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div className="flex flex-col space-y-1 flex-1">
                        <p className="text-sm font-medium leading-none">{item.label}</p>
                        <p className="text-xs text-muted-foreground leading-tight">{item.description}</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="p-3 text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main content area */}
        <div className="flex flex-1 bg-zinc-100 flex-col gap-4 px-2 sm:px-4 pb-4 md:pb-4 pt-0 font-sans max-w-full overflow-x-hidden">
          {/* Role-specific alert banner */}
          {roleAlert?.show && (
            <div className="pt-4 max-w-full overflow-x-hidden">
              <Alert className={`relative flex flex-col shadow-sm p-0 overflow-hidden max-w-full ${
                roleAlert.type === 'warning' 
                  ? 'border-l-4 border-l-amber-500 border-amber-200 bg-gradient-to-r from-amber-50 to-amber-50/50' 
                  : roleAlert.type === 'error'
                  ? 'border-l-4 border-l-red-500 border-red-200 bg-gradient-to-r from-red-50 to-red-50/50'
                  : 'border-l-4 border-primary bg-gradient-to-r from-primary/10 to-primary/20'
                }`}>
                {/* Header Section */}
                <div className="flex items-center justify-between w-full px-4 py-3 border-b border-current/10">
                  <div className="flex items-center gap-3">
                    {/* Icon */}
                    <div className={`flex-shrink-0 rounded-full p-2 ${
                      roleAlert.type === 'warning'
                        ? 'bg-amber-100'
                        : roleAlert.type === 'error'
                        ? 'bg-red-100'
                        : 'bg-primary/20'
                    }`}>
                      {roleAlert.type === 'warning' ? (
                        <AlertTriangle className="h-5 w-5 text-amber-600" strokeWidth={2.5} />
                      ) : roleAlert.type === 'error' ? (
                        <XCircle className="h-5 w-5 text-red-600" strokeWidth={2.5} />
                      ) : (
                        <Info className="h-5 w-5 text-primary" strokeWidth={2.5} />
                      )}
                    </div>
                    
                    {/* Title */}
                    <h4 className={`font-semibold text-base ${
                      roleAlert.type === 'warning'
                        ? 'text-amber-900'
                        : roleAlert.type === 'error'
                        ? 'text-red-900'
                        : 'text-black'
                    }`}>
                      {roleAlert.title}
                    </h4>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Action Button */}
                    {roleAlert.actionLabel && roleAlert.actionUrl && (
                      <Button 
                        onClick={() => router.push(roleAlert.actionUrl!)} 
                        size="sm"
                        className={`flex-shrink-0 ${
                          roleAlert.type === 'warning'
                            ? 'bg-amber-600 hover:bg-amber-700 text-white'
                            : roleAlert.type === 'error'
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-primary hover:bg-primary text-white'
                        }`}
                      >
                        {roleAlert.actionLabel}
                      </Button>
                    )}
                    
                    {/* Dismiss Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (roleAlert.alertId && roleAlert.timestamp) {
                          dismissAlert(roleAlert.alertId, roleAlert.timestamp)
                        } else {
                          setRoleAlert(null)
                        }
                      }}
                      className={`flex-shrink-0 h-8 w-8 p-0 rounded-full hover:bg-white/50 ${
                        roleAlert.type === 'warning'
                          ? 'text-amber-600 hover:text-amber-700'
                          : roleAlert.type === 'error'
                          ? 'text-red-600 hover:text-red-700'
                          : 'text-primary hover:text-primary'
                      }`}
                    >
                      <X className="h-7 w-7" strokeWidth={3} />
                    </Button>
                  </div>
                </div>
                
                {/* Body Section - Description */}
                <div className="px-6 py-5">
                  <AlertDescription className={`text-lg ${
                    roleAlert.type === 'warning'
                      ? 'text-amber-800'
                      : roleAlert.type === 'error'
                      ? 'text-red-800'
                      : 'text-black'
                  }`}>
                    {roleAlert.message}
                  </AlertDescription>
                </div>
              </Alert>
            </div>
          )}
          {renderPageContent()}
        </div>
      </SidebarInset>
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav 
        items={navItems}
        onNavigate={setActivePage}
        activePage={activePage}
        maxItems={5}
      />
    </SidebarProvider>
  )
}

export default function DashboardPage() {
  return (
    <>
    <div className="min-h-screen w-full max-w-full overflow-x-hidden">
      <DashboardContent />
    </div>
    </>
  )
}
