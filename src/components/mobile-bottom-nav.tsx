"use client"

import * as React from "react"
import type { PageType } from "@/types/dashboard"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileBottomNavProps {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
  }[]
  onNavigate?: (page: PageType) => void
  activePage?: PageType
  maxItems?: number
}

export function MobileBottomNav({ 
  items, 
  onNavigate, 
  activePage,
  maxItems = 5 
}: MobileBottomNavProps) {
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

  // Take only the first maxItems for mobile display
  const displayItems = items.slice(0, maxItems)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border/40 backdrop-blur-sm md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {displayItems.map((item) => {
          const isActive = isItemActive(item.title)
          const Icon = item.icon

          return (
            <button
              key={item.title}
              onClick={() => handleItemClick(item.title)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-200 relative",
                "active:scale-95 touch-manipulation",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-b-full" />
              )}
              
              {/* Icon */}
              <div className={cn(
                "relative flex items-center justify-center transition-all duration-200",
                isActive ? "scale-110" : "scale-100"
              )}>
                {Icon && (
                  <Icon 
                    size={22} 
                    strokeWidth={isActive ? 2.5 : 2}
                    className="transition-all duration-200"
                  />
                )}
                
                {/* Active background glow */}
                {isActive && (
                  <div className="absolute inset-0 bg-primary/10 rounded-full blur-md -z-10" />
                )}
              </div>

              {/* Label */}
              <span className={cn(
                "text-[10px] font-medium transition-all duration-200 truncate max-w-full px-1",
                isActive ? "font-semibold" : "font-normal"
              )}>
                {item.title}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
