"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GradeData {
  subject: string
  percentage: number
  letterGrade: string
  trend?: 'up' | 'down' | 'stable'
}

interface GradeSummaryChartProps {
  grades: GradeData[]
  overallAverage?: number
  title?: string
  description?: string
  className?: string
}

export function GradeSummaryChart({
  grades,
  overallAverage,
  title = 'Grade Summary',
  description = 'Your performance across all subjects',
  className
}: GradeSummaryChartProps) {
  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600'
    if (percentage >= 80) return 'text-blue-600'
    if (percentage >= 70) return 'text-yellow-600'
    if (percentage >= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-600'
    if (percentage >= 80) return 'bg-blue-600'
    if (percentage >= 70) return 'bg-yellow-600'
    if (percentage >= 60) return 'bg-orange-600'
    return 'bg-red-600'
  }

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-600" />
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {overallAverage !== undefined && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Overall Average</p>
              <p className={cn("text-3xl font-bold", getGradeColor(overallAverage))}>
                {overallAverage.toFixed(1)}%
              </p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {grades.map((grade, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <span className="font-medium text-gray-900">{grade.subject}</span>
                  {grade.trend && getTrendIcon(grade.trend)}
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn("text-lg font-bold", getGradeColor(grade.percentage))}>
                    {grade.percentage.toFixed(1)}%
                  </span>
                  <span className={cn(
                    "px-2 py-1 rounded text-sm font-semibold min-w-[40px] text-center",
                    getGradeColor(grade.percentage),
                    grade.percentage >= 90 ? 'bg-green-100' :
                    grade.percentage >= 80 ? 'bg-blue-100' :
                    grade.percentage >= 70 ? 'bg-yellow-100' :
                    grade.percentage >= 60 ? 'bg-orange-100' :
                    'bg-red-100'
                  )}>
                    {grade.letterGrade}
                  </span>
                </div>
              </div>
              <div className="relative">
                <Progress value={grade.percentage} className="h-2" />
                <div 
                  className={cn("absolute top-0 left-0 h-2 rounded-full transition-all", getProgressColor(grade.percentage))}
                  style={{ width: `${grade.percentage}%` }}
                />
              </div>
            </div>
          ))}

          {grades.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No grades available yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
