"use client"
/**
 * StaffOverviewCard Component
 * 
 * This component receives data via props from the parent page.
 * Data is cached at the page level with a 3-minute TTL to improve performance.
 * Caching reduces API calls and speeds up subsequent page loads.
 */

import { GraduationCap, AlertCircle, Loader2, Users } from "lucide-react"
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

interface StaffMember {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
  role: 'TEACHER' | 'CLERK'
  department?: string
  employeeId?: string
  hireDate?: string
}

interface StaffOverviewCardProps {
  staff: StaffMember[]
  totalTeachers: number
  totalClerks: number
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
  maxDisplay?: number
  onSeeAll?: () => void
}

export function StaffOverviewCard({ 
  staff, 
  totalTeachers,
  totalClerks,
  isLoading = false,
  error = null,
  onRetry,
  maxDisplay = 4,
  onSeeAll
}: StaffOverviewCardProps) {
  const totalStaff = totalTeachers + totalClerks

  // Enhanced Loading State
  if (isLoading) {
    return (
      <Card className="shadow-sm border-none rounded-2xl bg-white overflow-hidden relative">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 sm:px-6 pt-4 sm:pt-6 pb-3 relative z-10">
          <div className="flex flex-row items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <GraduationCap strokeWidth={2.5} className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
            </div>
            <CardTitle className="text-sm sm:text-base font-bold text-slate-900">Staff Overview</CardTitle>
          </div>
        </CardHeader>
        <CardFooter className="flex flex-col items-start px-4 sm:px-6 pb-4 sm:pb-6 pt-3 border-t bg-white relative z-10">
          <div className="flex items-baseline gap-2">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">Total Staff:</span>
            <div className="h-6 w-12 bg-primary/10 rounded animate-pulse" />
          </div>
          <p className="text-xs text-muted-foreground/70 mt-1">Loading statistics...</p>
        </CardFooter>
      </Card>
    )
  }

  // Enhanced Error State
  if (error) {
    return (
      <Card className="border-none shadow-none justify-between gap-5 h-full pt-0">
        <CardHeader className="flex flex-row border-b items-center justify-between space-y-0 px-6 pt-6 pb-3">
          <div className="flex flex-row items-center gap-1.5 sm:gap-2">
            <div className="p-2 rounded-xl bg-slate-100 ">
              <GraduationCap strokeWidth={2.5} className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <CardTitle className="text-sm sm:text-sm font-semibold text-primary">Staff Overview</CardTitle>
          </div>
          <Button 
            variant="default" 
            size="sm" 
            className="border-primary hidden text-xs h-7 px-2 sm:px-3"
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
                <p className="font-medium">Failed to load staff</p>
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
          <div className="text-lg sm:text-lg font-bold text-muted-foreground/50">
            Total Staff: <span className="text-primary/50">---</span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">
            Data unavailable
          </p>
        </CardFooter>
      </Card>
    )
  }

  // Enhanced Empty State
  if (!staff || staff.length === 0) {
    return (
      <Card className="border-none shadow-none justify-between gap-5 h-full pt-0">
        <CardHeader className="flex flex-row items-center border-b justify-between space-y-0 px-6 pt-6 pb-3">
          <div className="flex flex-row items-center gap-1.5 sm:gap-2">
            <GraduationCap strokeWidth={2.5} className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <CardTitle className="text-sm sm:text-sm font-semibold text-primary">Staff Overview</CardTitle>
          </div>
          <Button 
            variant="default" 
            size="sm" 
            className="border-primary hidden text-xs h-7 px-2 sm:px-3"
            onClick={onSeeAll}
          >
            See All
          </Button>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-0">
          <div className="h-[200px] flex flex-col items-center justify-center gap-3 text-center">
            <div className="rounded-full bg-primary/10 p-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">No staff members found</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Start adding teachers and clerks to manage your school staff
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start px-6">
          <div className="text-lg sm:text-lg font-bold">
            Total Staff: <span className="text-primary">0</span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">
            No staff members
          </p>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="border-none shadow-none bg-white justify-start h-full gap-5 pt-0">
      <CardHeader className="flex flex-row border-b items-center justify-between space-y-0 px-6 pt-6 pb-3">
        <div className="flex flex-row items-center gap-1.5 sm:gap-2">
          <div className="p-2 rounded-xl bg-slate-100">
            <GraduationCap strokeWidth={2.5} className="h-5 w-5 sm:h-6 sm:w-6 text-slate-800" />
          </div>
          <CardTitle className="text-sm sm:text-sm w-full font-semibold text-black">Staff Overview</CardTitle>
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
      <CardContent className="px-4 hidden sm:px-6 pb-4">
        {/* Staff List */}
        <div className="space-y-2">
          {staff.slice(0, maxDisplay).map((member) => (
              <div 
                key={member.id} 
                className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50 hover:bg-zinc-100/50 transition-colors border border-zinc-50"
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {member.avatar ? (
                    <img 
                      src={member.avatar} 
                      alt={`${member.firstName} ${member.lastName}`}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-semibold text-primary">
                        {member.firstName[0]}{member.lastName[0]}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">
                      {member.firstName} {member.lastName}
                    </p>
                    <Badge 
                      variant={member.role === 'TEACHER' ? 'default' : 'secondary'} 
                      className="text-xs px-2 py-0 h-5 flex-shrink-0"
                    >
                      {member.role === 'TEACHER' ? 'Teacher' : 'Clerk'}
                    </Badge>
                    {member.department && (
                      <Badge variant="outline" className="text-xs px-2 py-0 h-5 flex-shrink-0">
                        {member.department}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {member.email}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </CardContent>

      {/* Total Count Footer */}
      <CardFooter className="flex flex-col items-start px-4 sm:px-6 pb-4 sm:pb-6 pt-3  bg-white">
        <div className="flex w-full flex-col gap-1">
          <div className="text-2xl sm:text-2xl font-bold">
            Total Staff: <span className="text-primary">{totalStaff}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs sm:text-sm font-medium text-muted-foreground">
          <span>{totalTeachers} Teachers</span>
          <span>•</span>
          <span>{totalClerks} Clerks</span>
        </div>
      </CardFooter>
    </Card>
  )
}
