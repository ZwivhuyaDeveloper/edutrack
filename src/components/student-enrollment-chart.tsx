"use client"
/**
 * StudentEnrollmentChart Component
 * 
 * This component receives data via props from the parent page.
 * Data is cached at the page level with a 5-minute TTL to improve performance.
 * Enrollment trends change less frequently, so they are cached longer.
 */

import * as React from "react"
import { Users, AlertCircle, TrendingUp, Loader2 } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface EnrollmentData {
  month: string
  students: number
}

interface StudentEnrollmentChartProps {
  data: EnrollmentData[]
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
}

const chartConfig = {
  students: {
    label: "Students",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export function StudentEnrollmentChart({ 
  data, 
  isLoading = false,
  error = null,
  onRetry
}: StudentEnrollmentChartProps) {
  const [timeRange, setTimeRange] = React.useState("12")

  // Process and filter data based on time range
  const chartData = React.useMemo(() => {
    if (!data || data.length === 0) {
      return []
    }

    // Filter data based on selected time range
    const rangeMonths = parseInt(timeRange)
    
    // If we want all months and data has enough, return the requested range
    // Otherwise, slice to the requested range
    if (rangeMonths >= data.length) {
      return data
    }
    
    return data.slice(-rangeMonths)
  }, [data, timeRange])

  // Calculate total students (latest value in the chart)
  const totalStudents = React.useMemo(() => {
    if (chartData.length === 0) return 0
    return chartData[chartData.length - 1].students
  }, [chartData])

  // Enhanced Loading State
  if (isLoading) {
    return (
      <Card className="shadow-sm border-none rounded-2xl bg-gradient-to-br from-white to-slate-50/50 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 sm:px-6 pt-4 sm:pt-6 pb-3">
          <div className="flex flex-row items-center gap-2">
            <div>
              <Users strokeWidth={2} className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
           <CardTitle className="text-sm sm:text-base font-bold text-slate-900">Student Enrollment Trend</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="px-4 sm:px-6 pb-4">
          <div className="h-[180px] flex flex-col items-center justify-center gap-4 text-center">
            {/* Empty state illustration */}
            <div className="relative">
              <div className="absolute inset-0 bg-slate-200/50 rounded-full blur-2xl" />
              <div className="relative p-5 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 border-2 border-dashed border-slate-300">
                <Users strokeWidth={2} className="h-10 w-10 text-slate-400" />
              </div>
            </div>
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Loading enrollment data...</p>
              <p className="text-xs text-muted-foreground mt-1">Please wait while we fetch the latest statistics</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start px-4 sm:px-6 pb-4 sm:pb-6 pt-3 border-t bg-slate-50/50">
          <div className="flex items-baseline gap-2">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">Total Students:</span>
            <span className="text-lg sm:text-lg font-bold text-muted-foreground/50">
              <span className="text-primary/50">---</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground/70 mt-1">Active enrollments</p>
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
            <Users strokeWidth={2} className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <CardTitle className="text-sm sm:text-base font-bold text-primary">Student Enrollment Trend</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-3 sm:px-5">
          <div className="h-[200px] flex items-center justify-center">
            <Alert variant="destructive" className="max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">
                <p className="font-medium">Failed to load enrollment data</p>
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
              Total Students: <span className="text-primary/50">---</span>
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
  if (!data || data.length === 0) {
    return (
    <Card className="shadow-sm border-none rounded-2xl bg-gradient-to-br from-white via-white to-primary/5 overflow-hidden hover:shadow-md transition-all duration-300 group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 sm:px-6 pt-4 sm:pt-6 pb-3">
        <div className="flex flex-row items-center gap-2">
          <div>
            <Users strokeWidth={2} className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
          <CardTitle className="text-sm sm:text-base font-bold text-primary">Student Enrollment Trend</CardTitle>
        </div>
        </CardHeader>
        <CardContent className="px-3 sm:px-5">
            <div className="h-[180px] flex flex-col items-center justify-center gap-4 text-center">
            {/*Empty state illustration*/}
            <div>
              <div className="absolute inset-0 bg-slate-200/50 rounded-full blur-2xl" />
              <div className="relative p-5 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 border-2 border-dashed border-slate-300">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700">No enrollment data available</p>
              <p className="text-xs text-muted-foreground max-w-[220px]">
                Start enrolling students to see enrollment trends and statistics
              </p>
            </div>
            
            {/* Decorative dots */}
            <div className="flex gap-1.5 mt-2">
              <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
              <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
              <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start px-4 sm:px-6 pb-4 sm:pb-6 pt-3 border-t bg-slate-50/50">
          <div className="flex items-baseline gap-2">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">Total Students:</span>
            <span className="text-2xl font-bold text-slate-900">0</span>
          </div>
          <p className="text-xs text-muted-foreground/70 mt-1">No active enrollments</p>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="bg-transparent border-none shadow-none h-full" >
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b px-1 sm:flex-row">
        <div className="flex flex-1 flex-row w-full items-center justify-start gap-2 pl-4 py-1 sm:py-1">
          <Users strokeWidth={2} className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <CardDescription className="text-sm sm:text-sm w-full font-bold text-primary">
            Student Enrollment Trend
          </CardDescription>
        </div>
        <div className="flex">
          <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-1 py-1  sm:border-l sm:border-t-0 sm:px-2 sm:py-1">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger
                className="w-fit justify-center border-none shadow-none bg-primary hover:bg-primary/80 text-xs text-white rounded-lg"
                aria-label="Select time range"
              >
                <SelectValue placeholder="Last 12 months" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="3" className="rounded-lg">
                  Last 3 months
                </SelectItem>
                <SelectItem value="6" className="rounded-lg">
                  Last 6 months
                </SelectItem>
                <SelectItem value="12" className="rounded-lg">
                  Last 12 months
                </SelectItem>
                <SelectItem value="24" className="rounded-lg">
                  Past 2 years
                </SelectItem>
                <SelectItem value="36" className="rounded-lg">
                  Past 3 years
                </SelectItem>
                <SelectItem value="60" className="rounded-lg">
                  Past 5 years
                </SelectItem>
                <SelectItem value="120" className="rounded-lg">
                  Past 10 years
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-5">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[200px] w-full"
        >
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />

            <Area
              dataKey="students"
              type="natural"
              fill="var(--chart-1)"
              fillOpacity={0.2}
              stroke="var(--chart-1)"
              strokeWidth={3}
              dot={{
                fill: "var(--chart-1)",
                strokeWidth: 2,
                fillOpacity: 1,
                r: 4,
                stroke: "var(--chart-1)"
              }}
              activeDot={{
                r: 6,
                fill: "var(--chart-1)",
                stroke: "var(--chart-1)",
                strokeWidth: 2
              }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 px-6 pt-0 pb-0 ">
        <div className="flex w-full flex-col gap-1">
          <div className="text-lg sm:text-lg font-bold">
            Total Students: <span className="text-primary">{totalStudents}</span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">
            Active enrollments
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}
