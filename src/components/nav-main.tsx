"use client"

import { type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

type PageType = "dashboard" | "assignments" | "reports" | "messages"

interface NavMainProps {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
  onNavigate?: (page: PageType) => void
  activePage?: PageType
}

export function NavMain({ items, onNavigate, activePage }: NavMainProps) {
  const handleItemClick = (title: string) => {
    if (onNavigate) {
      // Extract base title for navigation (remove role prefix)
      const baseTitle = title.toLowerCase().replace(/^(teacher|principal|parent)\s+/, '')
      switch (baseTitle) {
        case "dashboard":
          onNavigate("dashboard")
          break
        case "assignments":
          onNavigate("assignments")
          break
        case "reports":
          onNavigate("reports")
          break
        case "messages":
          onNavigate("messages")
          break
      }
    }
  }

  const isItemActive = (title: string) => {
    const baseTitle = title.toLowerCase().replace(/^(teacher|principal|parent)\s+/, '')
    return activePage === baseTitle
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu className="font-sans">
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive || isItemActive(item.title)}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  size="default"
                  tooltip={item.title}
                  onClick={() => handleItemClick(item.title)}
                  className={`
                    transition-colors duration-200 ease-in-out
                    ${(() => {
                      // Handle role-based title matching
                      const baseTitle = item.title.toLowerCase().replace(/^(teacher|principal|parent)\s+/, '')
                      return activePage === baseTitle
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    })()}
                  `}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors duration-200 ${
                    (() => {
                      // Handle role-based title matching
                      const baseTitle = item.title.toLowerCase().replace(/^(teacher|principal|parent)\s+/, '')
                      return activePage === baseTitle
                        ? "text-primary-foreground"
                        : "text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground"
                    })()
                  }`}>
                    {item.icon && <item.icon size={18} />}
                  </div>
                  <span className="ml-1 font-medium">
                    {item.title}
                  </span>
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild>
                        <a href={subItem.url}>
                          <span>{subItem.title}</span>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
