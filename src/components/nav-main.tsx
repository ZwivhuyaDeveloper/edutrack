"use client"

import { type LucideIcon } from "lucide-react"
import type { PageType } from "@/types/dashboard"
import { useSidebar } from "@/components/ui/sidebar"

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
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  const handleItemClick = (title: string) => {
    if (onNavigate) {
      // Extract base title for navigation (remove role prefix)
      const baseTitle = title.toLowerCase().replace(/^(teacher|admin|principal|parent)\s+/, '')
      
      // Map title to PageType
      const pageTypeMap: Record<string, PageType> = {
        "dashboard": "dashboard",
        "assignments": "assignments",
        "reports": "reports",
        "messages": "messages",
        "classes": "classes",
        "gradebook": "gradebook",
        "schedule": "schedule",
        "attendance": "attendance",
        "finance": "finance",
        "resources": "resources",
        "events": "events",
        "announcements": "announcements",
        "students": "students",
        "timetable": "timetable",
        "lessons": "lessons",
        "analytics": "analytics",
        "settings": "settings",
        "people": "people",
        "academic": "academic",
        "operations": "operations",
        "communication": "communication",
      }
      
      const pageType = pageTypeMap[baseTitle]
      if (pageType) {
        onNavigate(pageType)
      }
    }
  }

  const isItemActive = (title: string) => {
    const baseTitle = title.toLowerCase().replace(/^(teacher|admin|principal|parent)\s+/, '')
    return activePage === baseTitle
  }

  return (
    <SidebarGroup className="px-1 md:px-1.5 lg:px-2">
      <SidebarGroupLabel className="text-[10px] md:text-xs font-semibold text-muted-foreground/70 uppercase tracking-wide mb-1.5 md:mb-2">
        Navigation
      </SidebarGroupLabel>
      <SidebarMenu className="space-y-0.5 md:space-y-1">
        {items.map((item, index) => {
          const isActive = isItemActive(item.title)
          
          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive || isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem className="relative">
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    tooltip={isCollapsed ? item.title : undefined}
                    onClick={() => handleItemClick(item.title)}
                    className={`
                      relative w-full transition-all duration-300 ease-out
                      ${isCollapsed 
                        ? 'justify-center p-1.5 md:p-2 h-10 md:h-12 w-10 md:w-12 mx-auto' 
                        : 'justify-start px-2 md:px-2.5 lg:px-3 py-2 md:py-2.5 h-10 md:h-11 lg:h-12'
                      }
                      ${isActive
                        ? 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90'
                        : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
                      }
                      group-hover:scale-[1.02] transform-gpu
                      before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-r before:from-primary/5 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300
                      ${!isActive ? 'hover:before:opacity-100' : ''}
                    `}
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animationFillMode: 'both'
                    }}
                  >
                    {/* Icon Container */}
                    <div className={`
                      relative flex items-center justify-center shrink-0
                      ${isCollapsed ? 'w-5 md:w-6 h-5 md:h-6' : 'w-6 md:w-7 lg:w-8 h-6 md:h-7 lg:h-8 mr-2 md:mr-2.5 lg:mr-3'}
                      transition-all duration-300 ease-out
                      ${isActive 
                        ? 'text-primary-foreground scale-110' 
                        : 'text-muted-foreground/70 group-hover:text-accent-foreground group-hover:scale-105'
                      }
                    `}>
                      {item.icon && (
                        <item.icon 
                          size={isCollapsed ? 18 : 20} 
                          className="transition-all duration-300 ease-out md:w-5 md:h-5 lg:w-[22px] lg:h-[22px]"
                          strokeWidth={isActive ? 2.5 : 2}
                        />
                      )}
                    </div>

                    {/* Text Label */}
                    <span className={`
                      text-sm md:text-base font-medium transition-all duration-300 ease-out
                      ${isCollapsed ? 'sr-only' : 'block'}
                      ${isActive ? 'text-primary-foreground font-semibold' : 'text-muted-foreground group-hover:text-accent-foreground'}
                      truncate
                    `}>
                      {item.title}
                    </span>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                
                {/* Sub-menu items */}
                <CollapsibleContent className="transition-all duration-300 ease-out">
                  <SidebarMenuSub className="ml-4 md:ml-5 lg:ml-6 mt-0.5 md:mt-1 space-y-0.5 md:space-y-1">
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton 
                          asChild
                          className="text-sm text-muted-foreground hover:text-accent-foreground transition-colors duration-200"
                        >
                          <a href={subItem.url} className="flex items-center py-1.5 px-2 rounded-md hover:bg-accent/30">
                            <span>{subItem.title}</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
