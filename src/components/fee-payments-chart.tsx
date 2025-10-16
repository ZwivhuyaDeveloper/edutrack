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
import { TrendingUp, AlertCircle, Loader2, DollarSign } from "lucide-react"
import { IconMoneybag, IconMoneybagPlus } from "@tabler/icons-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface PaymentData {
  month: string
  amount: number
}

interface FeePaymentsChartProps {
  data: PaymentData[]
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
}

const chartConfig = {
  amount: {
    label: "Payments",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function FeePaymentsChart({ 
  data, 
  isLoading = false,
  error = null,
  onRetry
}: FeePaymentsChartProps) {
  const [timeRange, setTimeRange] = React.useState("6")

  // Process and filter data based on time range
  const chartData = React.useMemo(() => {
    if (!data || data.length === 0) {
      return []
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

  // Enhanced Loading State
  if (isLoading) {
    return (
      <Card className="border-none shadow-none bg-transparent h-full">
        <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
          <div className="flex flex-1 flex-row items-center justify-start gap-2 pl-4 py-1 sm:py-1">
            <IconMoneybagPlus strokeWidth={2} className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            <CardTitle className="text-primary">Fee Payments Trend</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-10 p-0 justify-between h-full">
          <div className="px-3 sm:px-5 h-[200px] flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Loading payment data...</p>
              <p className="text-xs text-muted-foreground mt-1">Please wait while we fetch the latest statistics</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 px-3">
          <div className="flex flex-col gap-1 px-3">
            <div className="text-lg sm:text-xl font-bold text-muted-foreground/50">
              Total Paid: <span className="text-primary/50">$---</span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">
              {timeRangeLabel} collections
            </p>
          </div>
        </CardFooter>
      </Card>
    )
  }

  // Enhanced Error State
  if (error) {
    return (
      <Card className="border-none shadow-none bg-transparent h-full">
        <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
          <div className="flex flex-1 flex-row items-center justify-start gap-2 pl-4 py-1 sm:py-1">
            <IconMoneybagPlus strokeWidth={2} className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            <CardTitle className="text-primary">Fee Payments Trend</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-10 p-0 justify-between h-full">
          <div className="px-3 sm:px-5 h-[200px] flex items-center justify-center">
            <Alert variant="destructive" className="max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">
                <p className="font-medium">Failed to load payment data</p>
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
        <CardFooter className="flex-col items-start gap-2 px-3">
          <div className="flex flex-col gap-1 px-3">
            <div className="text-lg sm:text-xl font-bold text-muted-foreground/50">
              Total Paid: <span className="text-primary/50">$---</span>
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
      <Card className="border-none shadow-none bg-transparent h-full">
        <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
          <div className="flex flex-1 flex-row items-center justify-start gap-2 pl-4 py-1 sm:py-1">
            <IconMoneybagPlus strokeWidth={2} className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            <CardTitle className="text-primary">Fee Payments Trend</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-10 p-0 justify-between h-full">
          <div className="px-3 sm:px-5 h-[200px] flex flex-col items-center justify-center gap-3 text-center">
            <div className="rounded-full bg-primary/10 p-4">
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">No payment data available</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Start collecting fees to see payment trends and statistics
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 px-3">
          <div className="flex flex-col gap-1 px-3">
            <div className="text-lg sm:text-xl font-bold">
              Total Paid: <span className="text-primary">$0.00</span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">
              No collections recorded
            </p>
          </div>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="border-none shadow-none bg-transparent h-full">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-row items-center justify-start gap-2 pl-4 py-1 sm:py-1">
          <IconMoneybagPlus strokeWidth={2} className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
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
      <CardContent className="flex flex-col gap-10 p-0 justify-between h-full">
        <div className="px-3 sm:px-5 h-full">
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
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 px-3 pb-0">
        <div className="flex flex-col gap-1 px-3">
          <div className="text-lg sm:text-xl font-bold">
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
