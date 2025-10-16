"use client"

import { BookOpen, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

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
  maxDisplay?: number
  onSeeAll?: () => void
}

export function ClassesOverviewCard({ 
  classes, 
  totalClasses,
  totalSubjects,
  isLoading = false,
  maxDisplay = 4,
  onSeeAll
}: ClassesOverviewCardProps) {
  return (
    <Card className="border-none shadow-none pt-0">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-6 pt-6 pb-3">
        <div className="flex flex-row items-center gap-1.5 sm:gap-2">
          <BookOpen strokeWidth={3} className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          <CardTitle className="text-sm sm:text-md font-semibold text-primary">Classes Overview</CardTitle>
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
          {isLoading ? (
            <div className="text-xs text-muted-foreground">Loading classes...</div>
          ) : classes.length > 0 ? (
            classes.slice(0, maxDisplay).map((classItem) => (
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
            ))
          ) : (
            <div className="text-xs text-muted-foreground text-center py-4">No classes found</div>
          )}
        </div>
      </CardContent>

      {/* Total Count Footer */}
      <CardFooter className="flex flex-col items-start px-6 pb-6">
        <div className="text-lg sm:text-xl font-bold">
          Total Classes: <span className="text-primary">{totalClasses}</span>
        </div>
        <p className="text-xs sm:text-sm font-medium text-muted-foreground">
          {totalSubjects} subjects across all classes
        </p>
      </CardFooter>
    </Card>
  )
}
