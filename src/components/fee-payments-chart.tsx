"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface PaymentData {
  month: string
  amount: number
}

interface FeePaymentsChartProps {
  data: PaymentData[]
  isLoading?: boolean
}

const chartConfig = {
  amount: {
    label: "Payments",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function FeePaymentsChart({ 
  data, 
  isLoading = false
}: FeePaymentsChartProps) {
  const [timeRange, setTimeRange] = React.useState("6")

  // Process and filter data based on time range
  const chartData = React.useMemo(() => {
    if (!data || data.length === 0) {
      // Generate default data based on selected time range
      const rangeMonths = parseInt(timeRange)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const defaultData = []
      const currentMonth = new Date().getMonth()
      
      for (let i = 0; i < rangeMonths; i++) {
        const monthIndex = (currentMonth - rangeMonths + i + 1 + 12) % 12
        defaultData.push({
          month: months[monthIndex],
          amount: 5000 + Math.random() * 3000 // Random amount between $5000-$8000
        })
      }
      
      return defaultData
    }

    // Filter data based on selected time range
    const rangeMonths = parseInt(timeRange)
    
    if (rangeMonths >= data.length) {
      return data
    }
    
    return data.slice(-rangeMonths)
  }, [data, timeRange])

  // Calculate total payments for the selected time range
  const totalPayments = React.useMemo(() => {
    if (chartData.length === 0) return "0.00"
    const sum = chartData.reduce((acc, curr) => acc + curr.amount, 0)
    return sum.toFixed(2)
  }, [chartData])

  // Get time range label
  const timeRangeLabel = React.useMemo(() => {
    const months = parseInt(timeRange)
    if (months === 3) return "Last 3 months"
    if (months === 6) return "Last 6 months"
    if (months === 12) return "Last 12 months"
    return `Last ${months} months`
  }, [timeRange])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fee Payments Trend</CardTitle>
          <CardDescription>Loading payment data...</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading chart...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-3 py-3 sm:px-6 sm:py-6">
          <CardTitle className="text-primary">Fee Payments Trend</CardTitle>
        </div>
        <div className="flex">
          <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-1 py-1 sm:border-l sm:border-t-0 sm:px-2 sm:py-1">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger
                className="w-fit justify-center border-none shadow-none bg-primary hover:bg-primary/80 text-xs text-white rounded-lg"
                aria-label="Select time range"
              >
                <SelectValue placeholder="Last 6 months" />
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
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent 
                  hideLabel
                  formatter={(value) => `$${Number(value).toFixed(2)}`}
                />
              }
            />
            <Line
              dataKey="amount"
              type="monotone"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={{
                fill: "var(--chart-1)",
              }}
              activeDot={{
                r: 6,
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 p-3 sm:p-6 pt-3">
        <div className="flex w-full flex-col gap-2">
          <div className="text-xl sm:text-2xl font-bold">
            Total Paid: <span className="text-primary">${totalPayments}</span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">
            {timeRangeLabel} collections
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}
