"use client"

import { Calendar, Clock, AlertCircle, Loader2, CalendarX } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Event {
  id: string
  title: string
  description?: string
  type: string
  startDate: string
  endDate: string
  location?: string
  isAllDay: boolean
}

interface UpcomingEventsCardProps {
  events: Event[]
  totalEvents: number
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
  maxDisplay?: number
  onSeeAll?: () => void
}

export function UpcomingEventsCard({ 
  events, 
  totalEvents,
  isLoading = false,
  error = null,
  onRetry,
  maxDisplay = 3,
  onSeeAll
}: UpcomingEventsCardProps) {
  // Enhanced Loading State
  if (isLoading) {
    return (
      <Card className="border-none shadow-none justify-between gap-5 h-full pt-0">
        <CardHeader className="flex flex-row items-center border-b border-zinc-200 justify-between space-y-0 px-6 pt-6 pb-3">
          <div className="flex flex-row items-center gap-1.5 sm:gap-2">
            <Calendar strokeWidth={3} className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <CardTitle className="text-sm sm:text-sm font-semibold text-primary">Upcoming Events</CardTitle>
          </div>
          <Button 
            variant="default" 
            size="sm" 
            className="border-primary text-xs h-7 px-2 sm:px-3"
            onClick={onSeeAll}
          >
            See All
          </Button>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-0">
          <div className="h-[200px] flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Loading events...</p>
              <p className="text-xs text-muted-foreground mt-1">Please wait while we fetch upcoming events</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start px-6">
          <div className="text-lg sm:text-xl font-bold text-muted-foreground/50">
            Total: <span className="text-primary/50">---</span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">
            Next 7 days
          </p>
        </CardFooter>
      </Card>
    )
  }

  // Enhanced Error State
  if (error) {
    return (
      <Card className="border-none shadow-none justify-between gap-5 h-full pt-0">
        <CardHeader className="flex flex-row items-center border-b border-zinc-200 justify-between space-y-0 px-6 pt-6 pb-3">
          <div className="flex flex-row items-center gap-1.5 sm:gap-2">
            <Calendar strokeWidth={3} className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <CardTitle className="text-sm sm:text-md font-semibold text-primary">Upcoming Events</CardTitle>
          </div>
          <Button 
            variant="default" 
            size="sm" 
            className="border-primary text-xs h-7 px-2 sm:px-3"
            onClick={onSeeAll}
          >
            See All
          </Button>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-0">
          <div className="h-[200px] flex items-center justify-center">
            <Alert variant="destructive" className="max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">
                <p className="font-medium">Failed to load events</p>
                <p className="text-xs mt-1">{error}</p>
                {onRetry && (
                  <Button 
                    onClick={onRetry} 
                    variant="outline" 
                    size="sm" 
                    className="mt-3 w-full"
                  >
                    Try Again
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start px-6">
          <div className="text-lg sm:text-xl font-bold text-muted-foreground/50">
            Total: <span className="text-primary/50">---</span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">
            Data unavailable
          </p>
        </CardFooter>
      </Card>
    )
  }

  // Enhanced Empty State
  if (!events || events.length === 0) {
    return (
      <Card className="border-none shadow-none justify-between gap-5 h-full pt-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-6 pt-6 pb-3">
          <div className="flex flex-row items-center gap-1.5 sm:gap-2">
            <Calendar strokeWidth={3} className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <CardTitle className="text-sm sm:text-md font-semibold text-primary">Upcoming Events</CardTitle>
          </div>
          <Button 
            variant="default" 
            size="sm" 
            className="border-primary text-xs h-7 px-2 sm:px-3"
            onClick={onSeeAll}
          >
            See All
          </Button>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-0">
          <div className="h-[200px] flex flex-col items-center justify-center gap-3 text-center">
            <div className="rounded-full bg-primary/10 p-4">
              <CalendarX className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">No upcoming events</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                No events scheduled for the next 7 days
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start px-6">
          <div className="text-lg sm:text-xl font-bold">
            Total: <span className="text-primary">0</span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">
            No events scheduled
          </p>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="border-none shadow-none justify-between gap-5 h-full pt-0">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-6 pt-6 pb-3">
        <div className="flex flex-row items-center gap-1.5 sm:gap-2">
          <Calendar strokeWidth={3} className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          <CardTitle className="text-sm sm:text-md font-semibold text-primary">Upcoming Events</CardTitle>
        </div>
        <Button 
          variant="default" 
          size="sm" 
          className="border-primary text-xs h-7 px-2 sm:px-3"
          onClick={onSeeAll}
        >
          See All
        </Button>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-0">
        {/* Events List */}
        <div className="space-y-3">
          {events.slice(0, maxDisplay).map((event) => (
              <div 
                key={event.id} 
                className="flex flex-col gap-1 p-3 rounded-lg bg-zinc-50 hover:bg-zinc-100/50 transition-colors border border-zinc-50"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {event.title}
                    </p>
                    {event.description && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {event.description}
                      </p>
                    )}
                  </div>
                  <Badge variant="secondary" className="text-xs px-2 py-0 h-5 flex-shrink-0">
                    {event.type}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(event.startDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      hour: event.isAllDay ? undefined : '2-digit',
                      minute: event.isAllDay ? undefined : '2-digit'
                    })}
                  </span>
                  {event.location && (
                    <span className="truncate">📍 {event.location}</span>
                  )}
                </div>
              </div>
            ))}
        </div>
      </CardContent>

      {/* Total Count Footer */}
      <CardFooter className="flex flex-col items-start px-6">
        <div className="text-lg sm:text-xl font-bold">
          Total: <span className="text-primary">{totalEvents}</span>
        </div>
        <p className="text-xs sm:text-sm font-medium text-muted-foreground">
          Next 7 days
        </p>
      </CardFooter>
    </Card>
  )
}
