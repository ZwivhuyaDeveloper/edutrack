"use client"

import * as React from "react"
import { ChevronsUpDown, Plus } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: React.ElementType
    plan: string
  }[]
}) {
  const { state, isMobile } = useSidebar()
  const [activeTeam, setActiveTeam] = React.useState(teams[0])

  if (!activeTeam) {
    return null
  }

  const isCollapsed = state === "collapsed"
  const logoSize = isCollapsed ? "size-10" : "size-12"
  const containerSize = isCollapsed ? "size-8" : "size-12"
  const containerPadding = isCollapsed ? "p-0 px-0.5" : "p-1 px-1.5"

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent h-fit w-full data-[state=open]:text-sidebar-accent-foreground"
              tooltip={isCollapsed ? `${activeTeam.name} - ${activeTeam.plan}` : undefined}
            >
              <div className={` text-sidebar-primary-foreground ${containerSize} ${containerPadding} items-center justify-center rounded-lg`}>
                <activeTeam.logo className={`${logoSize}`} />
              </div>
              <div className={`grid flex-1 text-left leading-tight ${isCollapsed ? 'hidden' : ''}`}>
                <span className="truncate text-md font-bold">{activeTeam.name}</span>
                <span className="truncate text-xs font-medium tracking-widest">{activeTeam.plan}</span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}