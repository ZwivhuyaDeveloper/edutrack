"use client"

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
      <Card className="border-none shadow-none justify-between gap-5 h-full pt-0">
        <CardHeader className="flex flex-row items-center border-b justify-between space-y-0 px-6 pt-6 pb-3">
          <div className="flex flex-row items-center gap-1.5 sm:gap-2">
            <BookOpen strokeWidth={2} className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <CardTitle className="text-sm sm:text-sm font-semibold text-primary">Classes Overview</CardTitle>
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
          <div className="h-[200px] flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Loading classes...</p>
              <p className="text-xs text-muted-foreground mt-1">Please wait while we fetch class information</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start px-6">
          <div className="text-lg sm:text-lg font-bold text-muted-foreground/50">
            Total Classes: <span className="text-primary/50">---</span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">
            --- subjects across all classes
          </p>
        </CardFooter>
      </Card>
    )
  }

  // Enhanced Error State
  if (error) {
    return (
      <Card className="border-none shadow-none justify-between gap-5 h-full pt-0">
        <CardHeader className="flex flex-row items-center border-b justify-between space-y-0 px-6 pt-6 pb-3">
          <div className="flex flex-row items-center gap-1.5 sm:gap-2">
            <BookOpen strokeWidth={2} className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <CardTitle className="text-sm sm:text-sm font-semibold text-primary">Classes Overview</CardTitle>
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
                <p className="font-medium">Failed to load classes</p>
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
            Total Classes: <span className="text-primary/50">---</span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">
            Data unavailable
          </p>
        </CardFooter>
      </Card>
    )
  }

  // Enhanced Empty State
  if (!classes || classes.length === 0) {
    return (
      <Card className="border-none shadow-none justify-between gap-5 h-full pt-0">
        <CardHeader className="flex flex-row items-center border-b justify-between space-y-0 px-6 pt-6 pb-3">
          <div className="flex flex-row items-center gap-1.5 sm:gap-2">
            <BookOpen strokeWidth={2} className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <CardTitle className="text-sm sm:text-sm font-semibold text-primary">Classes Overview</CardTitle>
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
              <GraduationCap className="h-8 w-8 text-primary" />
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
    <Card className="border-none shadow-none justify-between gap-5 h-full pt-0">
      <CardHeader className="flex flex-row border-b items-center justify-between space-y-0 px-6 pt-6 pb-3">
        <div className="flex flex-row items-center gap-1.5 sm:gap-2">
          <BookOpen strokeWidth={2} className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <CardTitle className="text-sm sm:text-msm font-semibold text-primary">Classes Overview</CardTitle>
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
      <CardFooter className="flex flex-col items-start px-6 ">
        <div className="text-lg sm:text-lg font-bold">
          Total Classes: <span className="text-primary">{totalClasses}</span>
        </div>
        <p className="text-xs sm:text-sm font-medium text-muted-foreground">
          {totalSubjects} subjects across all classes
        </p>
      </CardFooter>
    </Card>
  )
}
