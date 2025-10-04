"use client"

import { useState, useEffect } from "react"
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

// Define user roles and page types
type UserRole = "learner" | "teacher" | "principal" | "parent"
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

export default function Page() {
  const [activePage, setActivePage] = useState<PageType>("dashboard")
  const [userRole, setUserRole] = useState<UserRole>("learner")
  const [PageComponents, setPageComponents] = useState<Record<PageType, React.ComponentType>>({} as Record<PageType, React.ComponentType>)

  // Detect user role (replace with proper authentication logic)
  useEffect(() => {
    const savedRole = localStorage.getItem("userRole") as UserRole
    if (savedRole && ["learner", "teacher", "principal", "parent"].includes(savedRole)) {
      setUserRole(savedRole)
    } else {
      // Default to learner for demo purposes
      setUserRole("learner")
      localStorage.setItem("userRole", "learner")
    }
  }, [])

  // Load page components based on user role
  useEffect(() => {
    const loadComponents = async () => {
      const components = {} as Record<PageType, React.ComponentType>

      for (const [pageType, importFn] of Object.entries(rolePageMap[userRole])) {
        try {
          const mod = await importFn()
          components[pageType as PageType] = mod.default
        } catch (error) {
          console.error(`Failed to load ${pageType} page for ${userRole}:`, error)
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

    if (userRole) {
      loadComponents()
    }
  }, [userRole])

  const renderPageContent = () => {
    const Component = PageComponents[activePage]
    return Component ? <Component /> : (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const handleRoleChange = (newRole: UserRole) => {
    setUserRole(newRole)
    localStorage.setItem("userRole", newRole)
    // Reset to dashboard when changing roles
    setActivePage("dashboard")
  }

  return (
    <SidebarProvider>
      <AppSidebar onNavigate={setActivePage} activePage={activePage} userRole={userRole} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 bg-zinc-100 rounded-xl shadow-lg mx-4 mt-6 mb-4 items-center justify-between px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 font-sans border border-gray-200/50">
          {/* Left section - Sidebar trigger */}
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium capitalize">{userRole} Dashboard</span>
              <select
                value={userRole}
                onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                className="text-xs bg-transparent border rounded px-2 py-1"
                aria-label="Select user role"
              >
                <option value="learner">Learner</option>
                <option value="teacher">Teacher</option>
                <option value="principal">Principal</option>
                <option value="parent">Parent</option>
              </select>
            </div>
          </div>

          {/* Right section - Search and user menu */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-[200px] pl-8 md:w-[300px]"
              />
            </div>
            <button className="rounded-full p-2 hover:bg-accent" aria-label="Notifications">
              <Bell className="h-4 w-4" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full p-2 hover:bg-accent" aria-label="User menu">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
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
                <DropdownMenuItem>
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
