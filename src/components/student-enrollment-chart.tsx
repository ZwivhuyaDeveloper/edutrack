"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface EnrollmentData {
  month: string
  students: number
}

interface StudentEnrollmentChartProps {
  data: EnrollmentData[]
  isLoading?: boolean
}

const chartConfig = {
  students: {
    label: "Students",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export function StudentEnrollmentChart({ data, isLoading = false }: StudentEnrollmentChartProps) {
  // Ensure we have valid data
  const chartData = React.useMemo(() => {
    if (!data || data.length === 0) {
      return [
        { month: 'Jan', students: 100 },
        { month: 'Feb', students: 120 },
        { month: 'Mar', students: 150 },
        { month: 'Apr', students: 180 },
        { month: 'May', students: 210 },
        { month: 'Jun', students: 250 },
      ]
    }
    return data
  }, [data])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[120px] w-full">
        <p className="text-xs text-muted-foreground">Loading chart...</p>
      </div>
    )
  }

  return (
    <ChartContainer
      config={chartConfig}
      className="h-[120px] w-full"
    >
      <AreaChart
        data={chartData}
        margin={{ top: 10, right: 10, left: 45, bottom: 5 }}
      >
        <defs>
          <linearGradient id="fillStudents" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="hsl(var(--primary))"
              stopOpacity={0.4}
            />
            <stop
              offset="100%"
              stopColor="hsl(var(--primary))"
              stopOpacity={0.05}
            />
          </linearGradient>
        </defs>
        <CartesianGrid 
          strokeDasharray="3 3" 
          opacity={0.3}
          stroke="hsl(var(--border))"
          vertical={true}
          horizontal={true}
        />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={{ stroke: "hsl(var(--foreground))", strokeWidth: 1.5 }}
          tickMargin={8}
          tick={{ fontSize: 12, fill: "hsl(var(--foreground))", fontWeight: 500 }}
        />
        <YAxis
          domain={[0, 1000]}
          tickLine={false}
          axisLine={{ stroke: "hsl(var(--foreground))", strokeWidth: 1.5 }}
          tickMargin={8}
          tick={{ fontSize: 12, fill: "hsl(var(--foreground))", fontWeight: 500 }}
          ticks={[0, 200, 400, 600, 800, 1000]}
          width={45}
        />
        <ChartTooltip
          cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 2, strokeDasharray: '5 5', opacity: 0.5 }}
          content={
            <ChartTooltipContent
              labelFormatter={(value) => value}
              formatter={(value) => (
                <div className="flex items-center gap-2">
                  <span className="font-bold text-primary text-base">{value} students</span>
                </div>
              )}
              indicator="dot"
            />
          }
        />
        <Area
          dataKey="students"
          type="monotone"
          fill="url(#fillStudents)"
          stroke="hsl(var(--primary))"
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          dot={{
            r: 5,
            fill: "hsl(var(--primary))",
            stroke: "white",
            strokeWidth: 3
          }}
          activeDot={{
            r: 7,
            fill: "hsl(var(--primary))",
            stroke: "white",
            strokeWidth: 3,
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
          }}
        />
      </AreaChart>
    </ChartContainer>
  )
}
