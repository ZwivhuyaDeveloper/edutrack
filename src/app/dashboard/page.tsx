"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser, useClerk } from "@clerk/nextjs"
import { AppSidebar } from "@/components/app-sidebar"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
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
} from "lucide-react"

// Define user roles and page types
type PageType = "dashboard" | "assignments" | "reports" | "messages"

// Role-based page components mapping
const rolePageMap = {
  learner: {
    dashboard: () => import("./learner/home/page").then(mod => ({ default: mod.default })),
    assignments: () => import("./learner/assignments/page").then(mod => ({ default: mod.default })),
    reports: () => import("./learner/reports/page").then(mod => ({ default: mod.default })),
    messages: () => import("./learner/messages/page").then(mod => ({ default: mod.default })),
  },
  teacher: {
    dashboard: () => import("./teacher/home/page").then(mod => ({ default: mod.default })),
    assignments: () => import("./teacher/assignments/page").then(mod => ({ default: mod.default })),
    reports: () => import("./teacher/reports/page").then(mod => ({ default: mod.default })),
    messages: () => import("./teacher/messages/page").then(mod => ({ default: mod.default })),
  },
  principal: {
    dashboard: () => import("./principal/home/page").then(mod => ({ default: mod.default })),
    assignments: () => import("./principal/assignments/page").then(mod => ({ default: mod.default })),
    reports: () => import("./principal/reports/page").then(mod => ({ default: mod.default })),
    messages: () => import("./principal/messages/page").then(mod => ({ default: mod.default })),
  },
  parent: {
    dashboard: () => import("./parent/home/page").then(mod => ({ default: mod.default })),
    assignments: () => import("./parent/assignments/page").then(mod => ({ default: mod.default })),
    reports: () => import("./parent/reports/page").then(mod => ({ default: mod.default })),
    messages: () => import("./parent/messages/page").then(mod => ({ default: mod.default })),
  },
}

interface DatabaseUser {
  id: string
  clerkId: string
  email: string
  firstName: string
  lastName: string
  role: 'STUDENT' | 'TEACHER' | 'PARENT' | 'PRINCIPAL'
  school: {
    id: string
    name: string
  }
  studentProfile?: unknown
  teacherProfile?: unknown
  parentProfile?: unknown
  principalProfile?: unknown
}

function DashboardContent() {
  const [activePage, setActivePage] = useState<PageType>("dashboard")
  const [PageComponents, setPageComponents] = useState<Record<PageType, React.ComponentType>>({} as Record<PageType, React.ComponentType>)
  const [dbUser, setDbUser] = useState<DatabaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user: clerkUser, isLoaded } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !clerkUser) {
      router.push('/sign-in')
    }
  }, [clerkUser, isLoaded, router])

  // Fetch user data from database
  useEffect(() => {
    const fetchUserData = async () => {
      if (!clerkUser) return
      
      try {
        const response = await fetch('/api/users/me')
        if (response.ok) {
          const data = await response.json()
          setDbUser(data.user)
        } else if (response.status === 404) {
          // User not found in database, redirect to registration
          router.push('/register')
          return
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (clerkUser) {
      fetchUserData()
    }
  }, [clerkUser, router])

  // Load page components based on user role
  useEffect(() => {
    if (!dbUser) return

    const loadComponents = async () => {
      const components = {} as Record<PageType, React.ComponentType>

      // Map database role to component mapping
      const roleMap = {
        STUDENT: rolePageMap.learner,
        TEACHER: rolePageMap.teacher,
        PRINCIPAL: rolePageMap.principal,
        PARENT: rolePageMap.parent
      }

      for (const [pageType, importFn] of Object.entries(roleMap[dbUser.role])) {
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
      default:
        return { title: 'User', subtitle: '', badge: '' }
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
        action: () => console.log('View profile')
      },
      {
        icon: Settings,
        label: 'Account Settings',
        description: 'Update preferences and security',
        action: () => console.log('Settings')
      }
    ]

    const roleSpecificItems = []

    switch (dbUser.role) {
      case 'STUDENT':
        roleSpecificItems.push(
          {
            icon: GraduationCap,
            label: 'My Grades',
            description: 'View academic performance',
            action: () => console.log('Grades')
          },
          {
            icon: BookOpen,
            label: 'Assignments',
            description: 'Check pending work',
            action: () => console.log('Assignments')
          },
          {
            icon: Calendar,
            label: 'Class Schedule',
            description: 'View daily timetable',
            action: () => console.log('Schedule')
          },
          {
            icon: Award,
            label: 'Achievements',
            description: 'View certificates and awards',
            action: () => console.log('Achievements')
          }
        )
        break

      case 'TEACHER':
        roleSpecificItems.push(
          {
            icon: Users,
            label: 'My Students',
            description: 'Manage student roster',
            action: () => console.log('Students')
          },
          {
            icon: FileText,
            label: 'Lesson Plans',
            description: 'Create and manage lessons',
            action: () => console.log('Lesson Plans')
          },
          {
            icon: TrendingUp,
            label: 'Gradebook',
            description: 'Record and track grades',
            action: () => console.log('Gradebook')
          },
          {
            icon: MessageSquare,
            label: 'Parent Communication',
            description: 'Message with parents',
            action: () => console.log('Parent Communication')
          }
        )
        break

      case 'PRINCIPAL':
        roleSpecificItems.push(
          {
            icon: Shield,
            label: 'School Management',
            description: 'Administrative controls',
            action: () => console.log('School Management')
          },
          {
            icon: Users,
            label: 'Staff Directory',
            description: 'Manage teachers and staff',
            action: () => console.log('Staff Directory')
          },
          {
            icon: FileText,
            label: 'Reports & Analytics',
            description: 'School performance data',
            action: () => console.log('Reports')
          },
          {
            icon: Settings,
            label: 'System Settings',
            description: 'Configure school settings',
            action: () => console.log('System Settings')
          }
        )
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
    }

    return [...baseItems, ...roleSpecificItems]
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!clerkUser || !dbUser) {
    return null // Will redirect via useEffect
  }

  return (
    <SidebarProvider>
      <AppSidebar 
        onNavigate={setActivePage} 
        activePage={activePage} 
        userRole={
          dbUser.role === 'PRINCIPAL' ? 'admin' : 
          dbUser.role.toLowerCase() as 'student' | 'teacher' | 'parent'
        } 
      />
      <SidebarInset className="bg-zinc-100">
        <header className="flex h-16 shrink-0 bg-white rounded-4xl shadow-none mx-4 mt-5 mb-1 items-center px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 font-sans">
          {/* Left section - Sidebar trigger */}
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4 bg-gray-200" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-primary capitalize">{dbUser.role.toLowerCase()} Dashboard</span>
              <span className="text-xs text-muted-foreground">
                Welcome back, {dbUser.firstName} {dbUser.lastName}
              </span>
            </div>
          </div>

          {/* Center section - Search input */}
          <div className="flex-1 flex justify-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search reports, assignments, etc."
                className="w-[200px] bg-zinc-100 rounded-full shadow-none border-0 pl-8 md:w-[350px]"
              />
            </div>
          </div>

          {/* Right section - User menu */}
          <div className="flex items-center gap-2">
            <button className="rounded-full p-2 hover:bg-accent" aria-label="Notifications">
              <Bell className="h-4 w-4" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full p-2 hover:bg-accent" aria-label="User menu">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={clerkUser.imageUrl} alt={`${dbUser.firstName} ${dbUser.lastName}`} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
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
        <div className="flex flex-1 bg-zinc-100 flex-col gap-4 p-4 pt-0 font-sans">
          {renderPageContent()}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function DashboardPage() {
  return <DashboardContent />
}
