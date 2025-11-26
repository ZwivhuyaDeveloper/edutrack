"use client"
/**
 * ClassesOverviewCard Component
 * 
 * This component receives data via props from the parent page.
 * Data is cached at the page level with a 3-minute TTL to improve performance.
 * Caching reduces API calls and speeds up subsequent page loads.
 */

import { BookOpen, Users, AlertCircle, Loader2, GraduationCap } from "lucide-react"
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

interface ClassData {
  id: string
  name: string
  grade?: string
  section?: string
  _count: {
    enrollments: number
    subjects: number
  }
  subjects: {
    subject: {
      name: string
      code?: string
    }
    teacher: {
      firstName: string
      lastName: string
    }
  }[]
}

interface ClassesOverviewCardProps {
  classes: ClassData[]
  totalClasses: number
  totalSubjects: number
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
  maxDisplay?: number
  onSeeAll?: () => void
}

export function ClassesOverviewCard({ 
  classes, 
  totalClasses,
  totalSubjects,
  isLoading = false,
  error = null,
  onRetry,
  maxDisplay = 4,
  onSeeAll
}: ClassesOverviewCardProps) {
  // Enhanced Loading State
  if (isLoading) {
    return (
      <Card className="shadow-sm border-none rounded-2xl bg-gradient-to-br from-white to-slate-50/50 overflow-hidden relative">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 sm:px-6 pt-4 sm:pt-6 pb-3 relative z-10">
          <div className="flex flex-row items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-100">
              <BookOpen strokeWidth={2} className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
            </div>
            <CardTitle className="text-sm sm:text-base font-bold text-slate-900">Classes Overview</CardTitle>
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
        <CardContent className="px-4 sm:px-6 pb-4 relative z-10">
          <div className="h-[180px] flex flex-col items-center justify-center gap-4 text-center">
            {/* Loading illustration */}
            <div className="relative">
              <div className="absolute inset-0 bg-slate-100 rounded-full blur-xl animate-pulse" />
              <div className="relative p-5 rounded-2xl bg-gradient-to-br from-slate-200/10 to-slate-200/5 border-2 border-dashed border-slate-100/30 backdrop-blur-sm">
                <Users strokeWidth={2} className="h-10 w-10 text-primary animate-pulse" />
              </div>
            </div>

            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm justify-center">
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce" />
                <p className="text-sm font-semibold text-foreground">Loading classes data</p>
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
              </div>
              <p className="text-xs text-muted-foreground max-w-[220px]">Please wait while we fetch the latest statistics</p>
            </div>

            {/* Decorative dots */}
            <div className="flex gap-1.5 mt-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-pulse" />
              <div className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-pulse [animation-delay:0.2s]" />
              <div className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-pulse [animation-delay:0.4s]" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start px-4 sm:px-6 pb-4 sm:pb-6 pt-3 border-t bg-blue-50/30 relative z-10">
          <div className="flex items-baseline gap-2">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">Total Classes:</span>
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
      <Card className="shadow-sm border-none rounded-2xl bg-gradient-to-br from-white to-red-50/20 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 sm:px-6 pt-4 sm:pt-6 pb-3">
        <div className="flex flex-row items-center gap-2">
          <div className="p-2 rounded-xl bg-slate-100">
            <BookOpen strokeWidth={2} className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
          </div>
          <CardTitle className="text-sm sm:text-base font-bold text-slate-900">Classes Overview</CardTitle>
        </div>
        </CardHeader>
        <CardContent className="px-3 hidden sm:px-5">
          <div className="h-[200px] flex items-center justify-center">
            <Alert variant="destructive" className="max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">
                <p className="font-medium">Failed to load classes data</p>
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
        <CardFooter className="flex-col h-fit items-start gap-2 px-6 pt-0">
          <div className="flex w-full h-fit flex-col gap-0">
            <div className="text-lg sm:text-lg font-bold text-muted-foreground/50">
              Total Classes: <span className="text-primary/50">---</span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">
              Data unavailable
            </p>
          </div>
        </CardFooter>
      </Card>
    )
  }

  // Enhanced Empty State
  if (!classes || classes.length === 0) {
    return (
      <Card className="shadow-sm border-none rounded-2xl bg-gradient-to-br from-white to-slate-50/50 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 sm:px-6 pt-4 sm:pt-6 pb-3">
        <div className="flex flex-row items-center gap-2">
          <div className="p-2 rounded-xl bg-slate-100">
            <BookOpen strokeWidth={2} className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
          </div>
          <CardTitle className="text-sm sm:text-base font-bold text-slate-900">Classes Overview</CardTitle>
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
        <CardContent className="px-6 pb-6 hidden pt-0">
          <div className="h-[200px] flex flex-col items-center justify-center gap-3 text-center">
            <div className="rounded-full bg-primary/10 p-4">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">No classes found</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Start creating classes to organize students and subjects
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start px-6">
          <div className="text-lg sm:text-lg font-bold">
            Total Classes: <span className="text-primary">0</span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">
            No classes created
          </p>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="border-none shadow-none justify-start h-full gap-5 h-full pt-0">
      <CardHeader className="flex flex-row border-b items-center justify-between space-y-0 px-6 pt-6 pb-3">
        <div className="flex flex-1 flex-row w-full items-center justify-start gap-2 pl-4 py-1 sm:py-1">
          <div className="p-2 rounded-xl bg-slate-100">
            <BookOpen strokeWidth={3} className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
          </div>
          <CardTitle className="text-sm sm:text-sm w-full font-semibold text-black">Classes Overview</CardTitle>
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
        {/* Classes List */}
        <div className="space-y-3">
          {classes.slice(0, maxDisplay).map((classItem) => (
              <div 
                key={classItem.id} 
                className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-zinc-50 hover:bg-zinc-100/50 transition-colors border border-zinc-50"
              >
                {/* Left Section: Class Info */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-foreground truncate">
                    {classItem.name}
                  </h3>
                  {classItem.grade && (
                    <Badge variant="outline" className="text-xs px-2 py-0 h-5 flex-shrink-0 border-primary/30 text-primary">
                      Grade {classItem.grade}
                    </Badge>
                  )}
                  {classItem.section && (
                    <Badge variant="secondary" className="text-xs px-2 py-0 h-5 flex-shrink-0">
                      Sec {classItem.section}
                    </Badge>
                  )}
                </div>

                {/* Right Section: Stats */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span className="font-medium">{classItem._count.enrollments}</span>
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <BookOpen className="h-3 w-3" />
                    <span className="font-medium">{classItem._count.subjects}</span>
                  </span>
                </div>
              </div>
            ))}
        </div>
      </CardContent>

      {/* Total Count Footer */}
      <CardFooter className="flex flex-col items-start px-4 sm:px-6 pb-4 sm:pb-6 pt-3 border-t bg-slate-50/30">
      <div className="flex w-full flex-col gap-1">
        <div className="text-lg sm:text-lg font-bold">
          Total Classes: <span className="text-primary">{totalClasses}</span>
        </div>
        <p className="text-xs sm:text-sm font-medium text-muted-foreground">
          {totalSubjects} subjects across all classes
        </p>
      </div>
      </CardFooter>
    </Card>
  )
}

