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
                <span className="truncate text-xs font-medium tracking-wider">{activeTeam.plan}</span>
              </div>
              <ChevronsUpDown className={`ml-auto ${isCollapsed ? 'hidden' : ''}`} />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Teams
            </DropdownMenuLabel>
            {teams.map((team, index) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => setActiveTeam(team)}
                className="gap-2 p-2"
              >
                <div className={`flex ${isCollapsed ? 'size-6' : 'size-8'} items-center justify-center rounded-md border`}>
                  <team.logo className={`${isCollapsed ? 'size-4' : 'size-6'}`} />
                </div>
                {team.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">Add team</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
