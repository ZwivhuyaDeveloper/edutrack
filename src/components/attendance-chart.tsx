"use client"

import * as React from "react"
import { TrendingDown, TrendingUp, Users } from "lucide-react"
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

interface AttendanceData {
  date: string
  rate: number
}

interface AttendanceChartProps {
  data: AttendanceData[]
  isLoading?: boolean
}

const chartConfig = {
  rate: {
    label: "Attendance Rate",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function AttendanceChart({ 
  data, 
  isLoading = false
}: AttendanceChartProps) {
  const [timeRange, setTimeRange] = React.useState("30")

  // Process and filter data based on time range
  const chartData = React.useMemo(() => {
    if (!data || data.length === 0) {
      // Generate default data based on selected time range (in days)
      const rangeDays = parseInt(timeRange)
      const defaultData = []
      const now = new Date()
      
      for (let i = rangeDays - 1; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        defaultData.push({
          date: dateStr,
          rate: 75 + Math.random() * 20 // Random rate between 75-95%
        })
      }
      
      return defaultData
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

  // Calculate trend percentage
  const trendPercentage = React.useMemo(() => {
    if (chartData.length < 2) return "0"
    const firstValue = chartData[0].rate
    const lastValue = chartData[chartData.length - 1].rate
    if (firstValue === 0) return "0"
    return (((lastValue - firstValue) / firstValue) * 100).toFixed(1)
  }, [chartData])

  // Get date range for footer
  const dateRange = React.useMemo(() => {
    if (chartData.length === 0) return ""
    const firstDate = chartData[0].date
    const lastDate = chartData[chartData.length - 1].date
    const currentYear = new Date().getFullYear()
    
    return `${firstDate} - ${lastDate} ${currentYear}`
  }, [chartData])

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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Attendance Trend</CardTitle>
          <CardDescription>Loading attendance data...</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading chart...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-transparent border-none shadow-none">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b px-1 sm:flex-row">
        <div className="flex flex-1 flex-row w-full items-center justify-start gap-2 pl-4 py-1 sm:py-1">
          <Users strokeWidth={2} className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
          <CardDescription className="text-sm sm:text-sm w-30 font-bold text-primary">
            Attendance Trend
          </CardDescription>
        </div>
        <div className="flex">
          <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-1 py-1 sm:border-l sm:border-t-0 sm:px-2 sm:py-1">
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
      <CardFooter className="hidden">
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="flex flex-col justify-between gap-2">
            <div className="flex items-center gap-1 font-medium leading-none">
              {parseFloat(trendPercentage) >= 0 ? 'Attendance up' : 'Attendance down'} by {Math.abs(parseFloat(trendPercentage))}% 
              {parseFloat(trendPercentage) >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Average: {averageRate}% • {dateRange}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
