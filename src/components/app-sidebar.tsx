"use client"

import * as React from "react"
import {
  AudioWaveform,
  BarChart,
  Blocks,
  BlocksIcon,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  GalleryVerticalEndIcon,
  Grid,
  Map,
  MessageCircle,
  MessageCirclePlus,
  MessageSquarePlus,
  Newspaper,
  PaperclipIcon,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
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
import { IconReport } from "@tabler/icons-react"

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
  navMain: [
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
      icon: IconReport,

    },
    {
      title: "Messages",
      url: "#",
      icon: MessageCirclePlus,

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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props} className="items-center">
      <SidebarHeader className="mb-12 ml-1 mt-5">
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
