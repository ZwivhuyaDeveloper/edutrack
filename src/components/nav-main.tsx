"use client"

import { ChevronRight, Circle, Dot, type LucideIcon } from "lucide-react"

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
      switch (title.toLowerCase()) {
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

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive || activePage === item.title.toLowerCase()}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  size="default"
                  tooltip={item.title}
                  onClick={() => handleItemClick(item.title)}
                  className={activePage === item.title.toLowerCase() ? "bg-sidebar-accent" : ""}
                >
                  <span className="size-8">
                    {item.icon && <item.icon size={25} />}
                  </span>
                  <span>{item.title}</span>
                  <Dot className="ml-auto size-2 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
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
