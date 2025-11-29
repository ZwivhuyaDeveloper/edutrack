"use client"
/**
 * AttendanceChart Component
 * 
 * This component receives data via props from the parent page.
 * Data is cached at the page level with a 5-minute TTL to improve performance.
 * Attendance trends change less frequently, so they are cached longer.
 */

import * as React from "react"
import { TrendingUp, Users, AlertCircle, Loader2, BarChart3, RotateCw } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
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

  // Debug logging
  React.useEffect(() => {
    console.log('[AttendanceChart] Received props:', {
      dataLength: data?.length || 0,
      isLoading,
      error,
      sampleData: data?.slice(0, 3)
    })
  }, [data, isLoading, error])

  // Process and filter data based on time range
  const chartData = React.useMemo(() => {
    if (!data || data.length === 0) {
      console.log('[AttendanceChart] No data available')
      return []
    }

    // Filter data based on selected time range (in days)
    const rangeDays = parseInt(timeRange)
    
    // If we want all days and data has enough, return the requested range
    // Otherwise, slice to the requested range
    let filtered: AttendanceData[]
    if (rangeDays >= data.length) {
      filtered = data
    } else {
      filtered = data.slice(-rangeDays)
    }
    
    console.log('[AttendanceChart] Filtered data:', {
      totalDataPoints: data.length,
      requestedDays: rangeDays,
      filteredPoints: filtered.length,
      sampleFiltered: filtered.slice(0, 3)
    })
    
    return filtered
  }, [data, timeRange])

  // Calculate average attendance rate
  const averageRate = React.useMemo(() => {
    if (chartData.length === 0) return 0
    
    // Validate data structure
    const validData = chartData.filter(item => 
      item && typeof item === 'object' && 
      'rate' in item && 
      typeof item.rate === 'number' && 
      !isNaN(item.rate)
    )
    
    if (validData.length === 0) {
      console.warn('[AttendanceChart] No valid data points found')
      return 0
    }
    
    const sum = validData.reduce((acc, curr) => acc + curr.rate, 0)
    return (sum / validData.length).toFixed(1)
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

  // Validate and sanitize chart data before rendering (must be before early returns)
  const validChartData = React.useMemo(() => {
    return chartData.filter(item => 
      item && 
      typeof item === 'object' && 
      'date' in item && 
      'rate' in item && 
      typeof item.date === 'string' && 
      typeof item.rate === 'number' && 
      !isNaN(item.rate)
    )
  }, [chartData])

  // Enhanced Loading State
  if (isLoading) {
    return (
      <Card className="shadow-sm border-none rounded-2xl bg-white overflow-hidden relative">
      {/* Animated gradient overlay */}
        <div className="absolute inset-0 hidden bg-gradient-to-r from-transparent via-blue-100/20 to-transparent animate-shimmer" />
        <CardHeader className="flex flex-col items-stretch space-y-0 border-b px-1 sm:flex-row">
          <div className="flex flex-row items-center justify-between space-y-0 px-4 sm:px-6 pt-4 sm:pt-6 pb-3 relative z-10">
            <div className="p-2 rounded-xl bg-slate-100">
              <TrendingUp strokeWidth={2.5} className="h-5 w-5 sm:h-6 sm:w-6 text-slate-600" />
            </div>
            <CardTitle className="text-sm sm:text-sm w-full font-bold text-slate-900">Attendance Trend</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 relative z-10">
          <div className="h-[180px] flex flex-col items-center justify-center gap-4 text-center">
            {/* Loading state illustration */}
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <div className="relative p-5 rounded-2xl bg-primary/5 border-2 border-dashed border-primary/30 backdrop-blur-sm">
                <TrendingUp strokeWidth={2.5} className="h-10 w-10 text-primary animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 justify-center">
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce" />
                <p className="text-sm font-semibold text-foreground">Loading attendance data</p>
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
              </div>
              <p className="text-xs text-muted-foreground max-w-[220px]">Fetching latest information...</p>
            </div>

            {/* Decorative dots */}
            <div className="flex gap-1.5 mt-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-pulse" />
              <div className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-pulse [animation-delay:0.2s]" />
              <div className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-pulse [animation-delay:0.4s]" />
            </div>

          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start px-4 sm:px-6 pb-4 sm:pb-6 pt-3 border-t bg-white relative z-10">
          <div className="flex items-baseline gap-2">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">Attendance Rate:</span>
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
      <Card className="shadow-sm border-none rounded-2xl bg-white overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 sm:px-6 pt-4 sm:pt-6 pb-3">
          <div className="flex flex-row items-center gap-2">
            <div className="p-2 rounded-xl bg-red-100">
              <AlertCircle strokeWidth={2.5} className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
            </div>
            <CardTitle className="text-sm sm:text-base font-bold text-red-900">Attendance Trend</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="px-4 sm:px-6 pb-4">
          <div className="h-[180px] flex flex-col items-center justify-center gap-4 text-center">
            {/* Error state illustration */}
            <div className="relative">
              <div className="absolute inset-0 bg-red-200/50 rounded-full blur-2xl" />
              <div className="relative p-5 rounded-2xl bg-red-50 border-2 border-dashed border-red-300">
                <AlertCircle  className="h-10 w-10 text-red-600" strokeWidth={2} />
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-semibold text-red-900">Failed to load attendance data</p>
              <p className="text-xs text-red-700/70 max-w-[220px]">{error}</p>
            </div>
            
            {/* Decorative dots */}
            <div className="flex gap-1.5 mt-2">
              <div className="h-1.5 w-1.5 rounded-full bg-red-300" />
              <div className="h-1.5 w-1.5 rounded-full bg-red-300" />
              <div className="h-1.5 w-1.5 rounded-full bg-red-300" />
            </div>
            
            {/* Retry button */}
            {onRetry && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRetry}
                className="mt-2 h-9 text-sm font-medium border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 hover:border-red-300 transition-all duration-200"
              >
                <RotateCw className="mr-2 h-4 w-4" /> 
                Retry Loading
              </Button>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col items-start px-4 sm:px-6 pb-4 sm:pb-6 pt-3 border-t bg-red-50/30">
          <div className="flex items-baseline gap-2">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">Attendance Rate:</span>
            <span className="text-2xl font-bold text-slate-900">---</span>
          </div>
          <p className="text-xs text-muted-foreground/70 mt-1">Data unavailable</p>
        </CardFooter>
      </Card>
    )
  }

  // Enhanced Empty State
  if (!data || data.length === 0) {
    return (
      <Card className="shadow-sm border-none rounded-2xl bg-white overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 sm:px-6 pt-4 sm:pt-6 pb-3">
          <div className="flex flex-row items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-100">
              <TrendingUp strokeWidth={2.5} className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
            </div>
            <CardTitle className="text-sm sm:text-base font-bold text-slate-900">Attendance Trend</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="px-4 sm:px-6 pb-4">
          <div className="h-[180px] flex flex-col items-center justify-center gap-4 text-center">
            {/* Empty state illustration */}
            <div className="relative">
              <div className="absolute inset-0 bg-slate-200/50 rounded-full blur-2xl" />
              <div className="relative p-5 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700">No attendance data available</p>
              <p className="text-xs text-muted-foreground max-w-[220px]">
                Start tracking attendance to see trends and statistics
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

        <CardFooter className="flex flex-col items-start px-4 sm:px-6 pb-4 sm:pb-6 pt-3 border-t bg-white">
          <div className="flex items-baseline gap-2">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">Attendance Rate:</span>
            <span className="text-2xl font-bold text-slate-900">0%</span>
          </div>
          <p className="text-xs text-muted-foreground/70 mt-1">No records available</p>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm border-none h-full rounded-2xl bg-white overflow-hidden hover:shadow-md transition-all duration-300 group">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b px-1 sm:flex-row">
        <div className="flex flex-1 flex-row w-full items-center justify-start gap-2 pl-4 py-1 sm:py-1">
          <div className="p-2 rounded-xl bg-slate-100">
            <TrendingUp strokeWidth={2.5} className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
          </div>
          <CardTitle className="text-sm sm:text-sm w-full font-semibold text-black">Attendance Trend</CardTitle>
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
      <CardContent className="px-4 sm:px-6 h-fit pb-4">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[251px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={validChartData}
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
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              angle={0}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 10 }}
              interval={Math.max(0, Math.floor(validChartData.length / 10))}
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
      <CardFooter className="flex flex-col items-start -mt-13 px-4 sm:px-6 pb-4 sm:pb-6 pt-3 border-t bg-white">
        <div className="flex w-full flex-col gap-1">
          <div className="text-2xl sm:text-2xl font-bold">
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
