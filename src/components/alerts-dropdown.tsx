"use client"

import { useState, useEffect, useCallback } from 'react'
import { Bell, AlertTriangle, Clock, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

interface Alert {
  id: string
  type: 'warning' | 'info' | 'error'
  title: string
  message: string
  priority: 'high' | 'medium' | 'low'
}

interface AlertsDropdownProps {
  role: string
}

export function AlertsDropdown({ role }: AlertsDropdownProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchAlerts = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Fetch alerts based on role
      let endpoint = ''
      switch (role.toUpperCase()) {
        case 'PRINCIPAL':
          endpoint = '/api/dashboard/principal/alerts'
          break
        case 'TEACHER':
          endpoint = '/api/dashboard/teacher/alerts'
          break
        case 'STUDENT':
          endpoint = '/api/dashboard/student/alerts'
          break
        default:
          endpoint = '/api/dashboard/alerts'
      }

      const response = await fetch(endpoint)
      if (response.ok) {
        const data = await response.json()
        setAlerts(data.alerts || [])
        setUnreadCount(data.alerts?.length || 0)
      } else {
        console.error('Failed to fetch alerts:', response.status)
      }
    } catch (error) {
      console.error('Error fetching alerts:', error)
    } finally {
      setIsLoading(false)
    }
  }, [role])

  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return 'destructive'
      case 'warning': return 'secondary'
      default: return 'default'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId))
    setUnreadCount(prev => Math.max(0, prev - 1))
    toast.success('Alert dismissed')
  }

  const markAllAsRead = () => {
    setUnreadCount(0)
    toast.success('All alerts marked as read')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative rounded-full p-1.5 sm:p-2 hover:bg-accent transition-colors" aria-label="Notifications">
          <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-primary text-[9px] sm:text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] sm:w-[400px] p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 pb-2 sm:pb-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <h3 className="font-semibold text-sm sm:text-base">Alerts</h3>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-[10px] sm:text-xs bg-primary text-primary-foreground">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {alerts.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 sm:h-7 text-[10px] sm:text-xs px-2"
              onClick={markAllAsRead}
            >
              Mark all read
            </Button>
          )}
        </div>
        <Separator />

        {/* Alerts List */}
        <ScrollArea className="h-[300px] sm:h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12">
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground animate-spin mb-2" />
              <p className="text-xs sm:text-sm text-muted-foreground">Loading alerts...</p>
            </div>
          ) : alerts.length > 0 ? (
            <div className="p-1.5 sm:p-2">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`relative p-2.5 sm:p-3 mx-1.5 sm:mx-2 mb-2 bg-primary/10 border-2 border-primary rounded-lg ${getPriorityColor(alert.priority)} hover:shadow-sm transition-shadow`}
                >
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 rounded-full p-0.5 sm:p-1 hover:bg-white/50 transition-colors"
                    aria-label="Dismiss alert"
                  >
                    <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                  </button>
                  <div className="flex items-start gap-2 sm:gap-3 pr-5 sm:pr-6">
                    <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mt-0.5 text-primary flex-shrink-0" />
                    <div className="flex-1 space-y-0.5 sm:space-y-1">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <p className="text-xs sm:text-sm font-semibold text-primary leading-tight">{alert.title}</p>
                        <Badge variant={getAlertColor(alert.type)} className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0">
                          {alert.priority}
                        </Badge>
                      </div>
                      <p className="text-[11px] sm:text-xs text-primary leading-relaxed">{alert.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12">
              <div className="rounded-full bg-muted p-2 sm:p-3 mb-2 sm:mb-3">
                <Bell className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
              </div>
              <p className="text-xs sm:text-sm font-medium mb-1">No alerts</p>
              <p className="text-[11px] sm:text-xs text-muted-foreground text-center px-4">
                You&apos;re all caught up! New alerts will appear here.
              </p>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {alerts.length > 0 && (
          <>
            <Separator />
            <div className="p-1.5 sm:p-2">
              <Button variant="ghost" className="w-full text-[11px] sm:text-xs" size="sm">
                View All Alerts
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
