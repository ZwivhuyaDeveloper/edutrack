"use client"

import * as React from "react"
import {
  BlocksIcon,
  Grid,
  MessageCircle,
  MessageCirclePlus,
  PaperclipIcon,
  Newspaper,
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
  const baseNav = [
    {
      title: "Dashboard",
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

  // Customize navigation based on role
  switch (userRole) {
    case "teacher":
      return baseNav.map(item => ({
        ...item,
        title: item.title === "Dashboard" ? "Teacher Dashboard" : item.title,
      }))
    case "admin":
      return baseNav.map(item => ({
        ...item,
        title: item.title === "Dashboard" ? "Admin Dashboard" : item.title,
      }))
    case "parent":
      return baseNav.map(item => ({
        ...item,
        title: item.title === "Dashboard" ? "Parent Dashboard" : item.title,
      }))
    default: // student
      return baseNav
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

type PageType = "dashboard" | "assignments" | "reports" | "messages"
type UserRole = "student" | "teacher" | "admin" | "parent"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onNavigate?: (page: PageType) => void
  activePage?: PageType
  userRole?: UserRole
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
