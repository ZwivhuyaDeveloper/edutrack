"use client"

import * as React from "react"
import type { PageType, SidebarUserRole } from "@/types/dashboard"
import {
  BlocksIcon,
  Grid,
  MessageCircle,
  MessageCirclePlus,
  PaperclipIcon,
  Newspaper,
  GraduationCap,
  Calendar,
  Users,
  Award,
  FileText,
  Bell,
  TrendingUp,
  CalendarDays,
  Settings,
  BookOpen,
  BarChart3,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import Image from "next/image"
import logo from "@/assets/Standalone_Logo.png"

// Role-based navigation data
const getRoleBasedNavigation = (userRole: string) => {
  switch (userRole) {
    case "student":
      return [
        {
          title: "Dashboard",
          url: "#",
          icon: BlocksIcon,
          isActive: true,
        },
        {
          title: "Classes",
          url: "#",
          icon: GraduationCap,
        },
        {
          title: "Assignments",
          url: "#",
          icon: PaperclipIcon,
        },
        {
          title: "Gradebook",
          url: "#",
          icon: Award,
        },
        {
          title: "Schedule",
          url: "#",
          icon: Calendar,
        },
        {
          title: "Attendance",
          url: "#",
          icon: Users,
        },
        {
          title: "Messages",
          url: "#",
          icon: MessageCirclePlus,
        },
        {
          title: "Announcements",
          url: "#",
          icon: Bell,
        },
        {
          title: "Resources",
          url: "#",
          icon: FileText,
        },
        {
          title: "Events",
          url: "#",
          icon: CalendarDays,
        },
        {
          title: "Finance",
          url: "#",
          icon: TrendingUp,
        },
        {
          title: "Reports",
          url: "#",
          icon: Newspaper,
        },
      ]
    
    case "teacher":
      return [
        {
          title: "Dashboard",
          url: "#",
          icon: BlocksIcon,
          isActive: true,
        },
        {
          title: "Students",
          url: "#",
          icon: Users,
        },
        {
          title: "Assignments",
          url: "#",
          icon: PaperclipIcon,
        },
        {
          title: "Classes",
          url: "#",
          icon: GraduationCap,
        },
        {
          title: "Gradebook",
          url: "#",
          icon: Award,
        },
        {
          title: "Timetable",
          url: "#",
          icon: Calendar,
        },
        {
          title: "Attendance",
          url: "#",
          icon: CalendarDays,
        },
        {
          title: "Lessons",
          url: "#",
          icon: BookOpen,
        },
        {
          title: "Announcements",
          url: "#",
          icon: Bell,
        },
        {
          title: "Resources",
          url: "#",
          icon: FileText,
        },
        {
          title: "Analytics",
          url: "#",
          icon: BarChart3,
        },
        {
          title: "Reports",
          url: "#",
          icon: Newspaper,
        },
        {
          title: "Messages",
          url: "#",
          icon: MessageCirclePlus,
        },
        {
          title: "Settings",
          url: "#",
          icon: Settings,
        },
      ]
    
    case "admin":
      return [
        {
          title: "Admin Dashboard",
          url: "#",
          icon: BlocksIcon,
          isActive: true,
        },
        {
          title: "Assignments",
          url: "#",
          icon: PaperclipIcon,
        },
        {
          title: "Reports",
          url: "#",
          icon: Newspaper,
        },
        {
          title: "Messages",
          url: "#",
          icon: MessageCirclePlus,
        },
      ]
    
    case "parent":
      return [
        {
          title: "Parent Dashboard",
          url: "#",
          icon: BlocksIcon,
          isActive: true,
        },
        {
          title: "Assignments",
          url: "#",
          icon: PaperclipIcon,
        },
        {
          title: "Reports",
          url: "#",
          icon: Newspaper,
        },
        {
          title: "Messages",
          url: "#",
          icon: MessageCirclePlus,
        },
      ]
    
    default:
      return [
        {
          title: "Dashboard",
          url: "#",
          icon: BlocksIcon,
          isActive: true,
        },
      ]
  }
}

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "EduTrack",
      logo: () => <Image src={logo} alt="EduTrack"  quality={100} width={1000} height={1000} className=" w-full h-full object-fill" />,
      plan: "AI SOFTWARE",
    },

  ],
  pages: [
    {
      name: "Dashboard",
      url: "/dashboard",
      icon: Grid,
    },
    {
      name: "Assignments",
      url: "/assignments",
      icon: PaperclipIcon,
    },
    {
      name: "Reports",
      url: "/reports",
      icon: Newspaper,
    },
    {
      name: "Messages",
      url: "/messages",
      icon: MessageCircle,
    },
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onNavigate?: (page: PageType) => void
  activePage?: PageType
  userRole?: SidebarUserRole
}

export function AppSidebar({ onNavigate, activePage, userRole = "student", ...props }: AppSidebarProps) {
  // Get role-based navigation items
  const navItems = React.useMemo(() => getRoleBasedNavigation(userRole), [userRole])

  return (
    <Sidebar collapsible="icon" {...props} className="items-center  font-sans">
      <SidebarHeader className="mb-12 ml-1 mt-5">
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} onNavigate={onNavigate} activePage={activePage} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
