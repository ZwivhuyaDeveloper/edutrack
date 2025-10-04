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
                  className={`
                    transition-colors duration-200 ease-in-out
                    ${activePage === item.title.toLowerCase()
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }
                  `}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors duration-200 ${
                    activePage === item.title.toLowerCase()
                      ? "text-primary-foreground"
                      : "text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground"
                  }`}>
                    {item.icon && <item.icon size={18} />}
                  </div>
                  <span className="ml-3 font-medium">
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
