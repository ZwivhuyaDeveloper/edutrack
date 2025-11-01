"use client"
/**
 * AttendanceChart Component
 * 
 * This component receives data via props from the parent page.
 * Data is cached at the page level with a 5-minute TTL to improve performance.
 * Attendance trends change less frequently, so they are cached longer.
 */

import * as React from "react"
import { TrendingUp, Users, AlertCircle, Loader2, BarChart3 } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
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

interface AttendanceData {
  date: string
  rate: number
}

interface AttendanceChartProps {
  data: AttendanceData[]
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
}

const chartConfig = {
  rate: {
    label: "Attendance Rate",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function AttendanceChart({ 
  data, 
  isLoading = false,
  error = null,
  onRetry
}: AttendanceChartProps) {
  const [timeRange, setTimeRange] = React.useState("30")

  // Process and filter data based on time range
  const chartData = React.useMemo(() => {
    if (!data || data.length === 0) {
      return []
    }

    // Filter data based on selected time range (in days)
    const rangeDays = parseInt(timeRange)
    
    // If we want all days and data has enough, return the requested range
    // Otherwise, slice to the requested range
    if (rangeDays >= data.length) {
      return data
    }
    
    return data.slice(-rangeDays)
  }, [data, timeRange])

  // Calculate average attendance rate
  const averageRate = React.useMemo(() => {
    if (chartData.length === 0) return 0
    const sum = chartData.reduce((acc, curr) => acc + curr.rate, 0)
    return (sum / chartData.length).toFixed(1)
  }, [chartData])

  // Calculate dynamic bar gap based on data length for responsive bars
  const barGapConfig = React.useMemo(() => {
    const dataLength = chartData.length
    if (dataLength <= 7) return { categoryGap: '20%', barGap: 4 }
    if (dataLength <= 14) return { categoryGap: '15%', barGap: 3 }
    if (dataLength <= 30) return { categoryGap: '10%', barGap: 2 }
    if (dataLength <= 90) return { categoryGap: '5%', barGap: 1 }
    return { categoryGap: '2%', barGap: 0 } // For larger ranges
  }, [chartData.length])

  // Enhanced Loading State
  if (isLoading) {
    return (
      <Card className="bg-transparent border-none shadow-none h-full">
        <CardHeader className="flex flex-col items-stretch space-y-0 border-b px-1 sm:flex-row">
          <div className="flex flex-1 flex-row w-full items-center justify-start gap-2 pl-4 py-1 sm:py-1">
            <TrendingUp strokeWidth={2} className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <CardDescription className="text-sm sm:text-sm w-full font-bold text-primary">
              Attendance Trend
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-3 sm:px-5">
          <div className="h-[200px] flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Loading attendance data...</p>
              <p className="text-xs text-muted-foreground mt-1">Please wait while we fetch the latest statistics</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 px-6">
          <div className="flex w-full flex-col gap-1">
            <div className="text-lg sm:text-lg font-bold text-muted-foreground/50">
              Attendance Rate: <span className="text-primary/50">---%</span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">
              This week average
            </p>
          </div>
        </CardFooter>
      </Card>
    )
  }

  // Enhanced Error State
  if (error) {
    return (
      <Card className="bg-transparent border-none shadow-none h-full">
        <CardHeader className="flex flex-col w-full items-stretch space-y-0 border-b px-1 sm:flex-row">
          <div className="flex flex-1 flex-row w-full items-center justify-start gap-2 pl-4 py-1 sm:py-1">
            <TrendingUp strokeWidth={2} className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <CardDescription className="text-sm sm:text-sm w-full font-bold text-primary">
              Attendance Trend
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-3 sm:px-5">
          <div className="h-[200px] flex items-center justify-center">
            <Alert variant="destructive" className="max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">
                <p className="font-medium">Failed to load attendance data</p>
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
        <CardFooter className="flex-col items-start gap-2 px-6">
          <div className="flex w-full flex-col gap-1">
            <div className="text-lg sm:text-lg font-bold text-muted-foreground/50">
              Attendance Rate: <span className="text-primary/50">---%</span>
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
      <Card className="bg-transparent border-none shadow-none h-full">
        <CardHeader className="flex flex-col items-stretch space-y-0 border-b px-1 sm:flex-row">
          <div className="flex flex-1 flex-row w-full items-center justify-start gap-2 pl-4 py-1 sm:py-1">
            <TrendingUp strokeWidth={2} className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <CardDescription className="text-sm sm:text-sm w-full font-semibold text-primary">
              Attendance Trend
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-3 sm:px-5">
          <div className="h-[200px] flex flex-col items-center justify-center gap-3 text-center">
            <div className="rounded-full bg-primary/10 p-4">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">No attendance data available</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Start tracking attendance to see trends and statistics
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 px-6">
          <div className="flex w-full h-fit flex-col gap-0">
            <div className="text-lg sm:text-lg font-bold">
              Attendance Rate: <span className="text-primary">0%</span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">
              No records available
            </p>
          </div>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="bg-transparent border-none shadow-none h-full">
      <CardHeader className="flex flex-col w-full items-stretch space-y-0 border-b px-1 sm:flex-row">
        <div className="flex flex-1 flex-row w-full items-center justify-start gap-2 pl-4 py-1 sm:py-1">
          <TrendingUp strokeWidth={2} className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <CardDescription className="text-sm sm:text-sm w-full font-bold text-primary">
            Attendance Trend
          </CardDescription>
        </div>
        <div className="flex w-fit">
          <div className="relative z-30 flex flex-1 flex-col w-fit justify-center gap-1 border-t px-1 py-1 sm:border-l sm:border-t-0 sm:px-2 sm:py-1">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger
                className="w-fit justify-center border-none shadow-none bg-primary hover:bg-primary/80 text-xs text-white rounded-lg"
                aria-label="Select time range"
              >
                <SelectValue placeholder="Last 12 months" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="7" className="rounded-lg">
                  Last 7 days
                </SelectItem>
                <SelectItem value="14" className="rounded-lg">
                  Last 14 days
                </SelectItem>
                <SelectItem value="30" className="rounded-lg">
                  Last 30 days
                </SelectItem>
                <SelectItem value="90" className="rounded-lg">
                  Last 3 months
                </SelectItem>
                <SelectItem value="180" className="rounded-lg">
                  Last 6 months
                </SelectItem>
                <SelectItem value="365" className="rounded-lg">
                  Last 12 months
                </SelectItem>
                <SelectItem value="730" className="rounded-lg">
                  Past 2 years
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
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
            barCategoryGap={barGapConfig.categoryGap}
            barGap={barGapConfig.barGap}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              angle={-45}
              textAnchor="end"
              height={60}
              tick={{ fontSize: 10 }}
              interval={Math.max(0, Math.floor(chartData.length / 10))}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar 
              dataKey="rate" 
              fill="var(--chart-1)" 
              radius={8}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 px-6 pb-0">
        <div className="flex w-full flex-col gap-1">
          <div className="text-lg sm:text-lg font-bold">
            Attendance Rate: <span className="text-primary">{averageRate}%</span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">
            This week average
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}
