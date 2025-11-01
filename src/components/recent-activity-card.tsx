"use client"

import { Clock, AlertCircle, Loader2, ActivityIcon, Users, BookOpen, DollarSign, Bell, Calendar, GraduationCap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface RecentActivity {
  id: string
  type: 'enrollment' | 'assignment' | 'payment' | 'announcement' | 'class' | 'teacher'
  message: string
  timestamp: string
  user?: string
}

interface RecentActivityCardProps {
  activities: RecentActivity[]
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
  period?: string
  onPeriodChange?: (period: string) => void
  page?: number
  onPageChange?: (page: number) => void
  activitiesPerPage?: number
  maxDisplay?: number
}

export function RecentActivityCard({ 
  activities, 
  isLoading = false,
  error = null,
  onRetry,
  period = '7',
  onPeriodChange,
  page = 1,
  onPageChange,
  activitiesPerPage = 6,
  maxDisplay
}: RecentActivityCardProps) {
  // Helper functions
  const getPeriodLabel = (days: string) => {
    switch (days) {
      case '1': return 'Today'
      case '7': return 'Last 7 days'
      case '14': return 'Last 14 days'
      case '30': return 'Last 30 days'
      default: return 'Last 7 days'
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'enrollment': return Users
      case 'assignment': return BookOpen
      case 'payment': return DollarSign
      case 'announcement': return Bell
      case 'class': return Calendar
      case 'teacher': return GraduationCap
      default: return Clock
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'enrollment': 
        return { bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' }
      case 'assignment': 
        return { bg: 'bg-purple-100 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400' }
      case 'payment': 
        return { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400' }
      case 'announcement': 
        return { bg: 'bg-orange-100 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400' }
      case 'class': 
        return { bg: 'bg-indigo-100 dark:bg-indigo-900/20', text: 'text-indigo-600 dark:text-indigo-400' }
      case 'teacher': 
        return { bg: 'bg-pink-100 dark:bg-pink-900/20', text: 'text-pink-600 dark:text-pink-400' }
      default: 
        return { bg: 'bg-gray-100 dark:bg-gray-900/20', text: 'text-gray-600 dark:text-gray-400' }
    }
  }

  // Calculate pagination
  const totalPages = Math.ceil(activities.length / activitiesPerPage)
  const paginatedActivities = activities.slice(
    (page - 1) * activitiesPerPage,
    page * activitiesPerPage
  )
  const displayedActivities = maxDisplay ? paginatedActivities.slice(0, maxDisplay) : paginatedActivities

  // Enhanced Loading State
  if (isLoading) {
    return (
      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="space-y-3 sm:space-y-4 border-b pb-3 sm:pb-4 p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex flex-col gap-1 sm:gap-2">
              <CardTitle className="text-base sm:text-base lg:text-lg font-bold flex flex-row items-center gap-2 text-primary">
                <ActivityIcon strokeWidth={3} className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                Recent Activity
              </CardTitle>
              <CardDescription className="text-sm sm:text-md font-medium text-muted-foreground">
                Latest updates from your school
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-md text-muted-foreground hidden sm:inline">Period:</span>
              <Select value={period} onValueChange={onPeriodChange} disabled>
                <SelectTrigger className="w-full sm:w-fit gap-2 h-8 sm:h-9 text-xs sm:text-sm bg-primary text-white border-primary [&>svg]:text-white">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className="h-[200px] flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Loading activities...</p>
              <p className="text-xs text-muted-foreground mt-1">Please wait while we fetch recent activity</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Enhanced Error State
  if (error) {
    return (
      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="space-y-3 sm:space-y-4 border-b pb-3 sm:pb-4 p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex flex-col gap-1 sm:gap-2">
              <CardTitle className="text-base sm:text-base lg:text-lg font-bold flex flex-row items-center gap-2 text-primary">
                <ActivityIcon strokeWidth={3} className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                Recent Activity
              </CardTitle>
              <CardDescription className="text-sm sm:text-md font-medium text-muted-foreground">
                Latest updates from your school
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className="h-[200px] flex items-center justify-center">
            <Alert variant="destructive" className="max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">
                <p className="font-medium">Failed to load activities</p>
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
      </Card>
    )
  }

  // Enhanced Empty State
  if (!activities || activities.length === 0) {
    return (
      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="space-y-3 sm:space-y-4 border-b pb-3 sm:pb-4 p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex flex-col gap-1 sm:gap-2">
              <CardTitle className="text-base sm:text-base lg:text-lg font-bold flex flex-row items-center gap-2 text-primary">
                <ActivityIcon strokeWidth={3} className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                Recent Activity
              </CardTitle>
              <CardDescription className="text-sm sm:text-md font-medium text-muted-foreground">
                Latest updates from your school
              </CardDescription>
            </div>
            {onPeriodChange && (
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-md text-muted-foreground hidden sm:inline">Period:</span>
                <Select value={period} onValueChange={onPeriodChange}>
                  <SelectTrigger className="w-full sm:w-fit gap-2 h-8 sm:h-9 text-xs sm:text-sm bg-primary text-white border-primary [&>svg]:text-white">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Today</SelectItem>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="14">Last 14 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className="text-center py-6 sm:py-8">
            <div className="rounded-full bg-muted p-2 sm:p-3 w-fit mx-auto mb-2 sm:mb-3">
              <Clock strokeWidth={3} className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <p className="text-sm font-medium mb-1">No recent activity</p>
            <p className="text-xs text-muted-foreground">
              Activity from {getPeriodLabel(period).toLowerCase()} will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-none shadow-sm bg-white">
      <CardHeader className="space-y-3 sm:space-y-4 border-b pb-3 sm:pb-4 p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex flex-col gap-1 sm:gap-2">
            <CardTitle className="text-base sm:text-base lg:text-lg font-bold flex flex-row items-center gap-2 text-primary">
              <ActivityIcon strokeWidth={3} className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription className="text-sm sm:text-md font-medium text-muted-foreground">
              Latest updates from your school
            </CardDescription>
          </div>
          
          {/* Period Filter */}
          {onPeriodChange && (
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-md text-muted-foreground hidden sm:inline">Period:</span>
              <Select value={period} onValueChange={onPeriodChange}>
                <SelectTrigger className="w-full sm:w-fit gap-2 h-8 sm:h-9 text-xs sm:text-sm bg-primary text-white border-primary [&>svg]:text-white">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Today</SelectItem>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="14">Last 14 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-3 sm:p-6 pt-0">
        <div className="space-y-2 sm:space-y-3">
          {displayedActivities.map((activity) => {
            const Icon = getActivityIcon(activity.type)
            const activityColor = getActivityColor(activity.type)
            return (
              <div key={activity.id} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-zinc-100 rounded-lg hover:bg-white transition-colors">
                <div className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full flex-shrink-0 ${activityColor.bg}`}>
                  <Icon strokeWidth={3} className={`h-4 w-4 sm:h-5 sm:w-5 ${activityColor.text}`} />
                </div>
                <div className="flex-1 space-y-1 min-w-0">
                  <p className="text-sm sm:text-base font-semibold leading-tight">{activity.message}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Clock strokeWidth={3} className="h-3 w-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                    </div>
                    {activity.user && (
                      <Badge variant="secondary" className="text-xs">
                        {activity.user}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Pagination Controls */}
        {activities.length > activitiesPerPage && onPageChange && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t">
            <div className="text-xs text-muted-foreground text-center sm:text-left">
              Showing {Math.min((page - 1) * activitiesPerPage + 1, activities.length)} - {Math.min(page * activitiesPerPage, activities.length)} of {activities.length} activities
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                className="h-7 w-7 sm:h-8 sm:w-8 p-0 border-primary border-3 bg-transparent text-primary"
              >
                <ChevronLeft strokeWidth={3} className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <Button
                    key={pageNum}
                    variant={pageNum === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 bg-primary border-primary border-3 text-primary-foreground text-xs sm:text-sm"
                  >
                    {pageNum}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
                className="h-7 w-7 sm:h-8 sm:w-8 p-0 border-primary border-3 bg-transparent text-primary"
              >
                <ChevronRight strokeWidth={3} className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

