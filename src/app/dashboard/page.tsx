"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { RoleSwitcher } from "@/components/RoleSwitcher"

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

function DashboardContent() {
  const [activePage, setActivePage] = useState<PageType>("dashboard")
  const [PageComponents, setPageComponents] = useState<Record<PageType, React.ComponentType>>({} as Record<PageType, React.ComponentType>)
  const { user, logout } = useAuth()
  const router = useRouter()

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  // Load page components based on user role
  useEffect(() => {
    if (!user) return

    const loadComponents = async () => {
      const components = {} as Record<PageType, React.ComponentType>

      for (const [pageType, importFn] of Object.entries(rolePageMap[user.role])) {
        try {
          const mod = await importFn()
          components[pageType as PageType] = mod.default
        } catch (error) {
          console.error(`Failed to load ${pageType} page for ${user.role}:`, error)
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
  }, [user])

  const renderPageContent = () => {
    const Component = PageComponents[activePage]
    return Component ? <Component /> : (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  if (!user) {
    return null // Will redirect via useEffect
  }

  return (
    <SidebarProvider>
      <AppSidebar onNavigate={setActivePage} activePage={activePage} userRole={user.role} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 bg-zinc-100 rounded-4xl shadow-none mx-4 mt-6 mb-4 items-center px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 font-sans">
          {/* Left section - Sidebar trigger */}
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4 bg-gray-200" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium capitalize">{user.role} Dashboard</span>
              <span className="text-xs text-muted-foreground">
                Welcome back, {user.name}
              </span>
            </div>
          </div>

          {/* Center section - Search input */}
          <div className="flex-1 flex justify-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-[200px] pl-8 md:w-[300px]"
              />
            </div>
          </div>

          {/* Right section - User menu */}
          <div className="flex items-center gap-2">
            <RoleSwitcher />
            <button className="rounded-full p-2 hover:bg-accent" aria-label="Notifications">
              <Bell className="h-4 w-4" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full p-2 hover:bg-accent" aria-label="User menu">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
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
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
