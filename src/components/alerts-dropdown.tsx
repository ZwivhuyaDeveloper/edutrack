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
        <button className="relative rounded-full p-2 hover:bg-accent transition-colors" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[400px] p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-3">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-base">Alerts</h3>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs bg-primary text-primary-foreground">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {alerts.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={markAllAsRead}
            >
              Mark all read
            </Button>
          )}
        </div>
        <Separator />

        {/* Alerts List */}
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Clock className="h-8 w-8 text-muted-foreground animate-spin mb-2" />
              <p className="text-sm text-muted-foreground">Loading alerts...</p>
            </div>
          ) : alerts.length > 0 ? (
            <div className="p-2">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`relative p-3 mx-2 mb-2 bg-primary/10 border-2 border-primary rounded-lg  ${getPriorityColor(alert.priority)} hover:shadow-sm transition-shadow`}
                >
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="absolute top-2 right-2 rounded-full p-1 hover:bg-white/50 transition-colors"
                    aria-label="Dismiss alert"
                  >
                    <X className="h-4 w-4 text-primary" />
                  </button>
                  <div className="flex items-start gap-3 pr-6">
                    <AlertTriangle  className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-primary leading-tight">{alert.title}</p>
                        <Badge variant={getAlertColor(alert.type)} className="text-[10px] px-1.5 py-0">
                          {alert.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-primary leading-relaxed">{alert.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-muted p-3 mb-3">
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium mb-1">No alerts</p>
              <p className="text-xs text-muted-foreground text-center px-4">
                You&apos;re all caught up! New alerts will appear here.
              </p>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {alerts.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Button variant="ghost" className="w-full text-xs" size="sm">
                View All Alerts
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
