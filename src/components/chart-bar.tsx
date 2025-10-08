"use client"

import { SquareCheckBigIcon, TrendingUp } from "lucide-react"
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
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Separator } from "./ui/separator"

interface SubjectData {
  name: string
  score: number
  grade: string
  status: 'pass' | 'fail'
  attendance?: number
  assignments?: number
}

interface ChartBarDefaultProps {
  data?: SubjectData[]
  title?: string
  className?: string
}

export function ChartBarDefault({
  data = [
    { name: "Mathematics", score: 85, grade: "A", status: "pass", attendance: 95, assignments: 18 },
    { name: "English", score: 78, grade: "B+", status: "pass", attendance: 92, assignments: 15 },
    { name: "Science", score: 82, grade: "A-", status: "pass", attendance: 88, assignments: 16 },
    { name: "Social Studies", score: 75, grade: "B", status: "pass", attendance: 90, assignments: 14 },
    { name: "Art", score: 88, grade: "A", status: "pass", attendance: 85, assignments: 12 },
    { name: "Music", score: 80, grade: "B+", status: "pass", attendance: 87, assignments: 10 }
  ],
  title = "Subject Performance",
  className = ""
}: ChartBarDefaultProps) {
  // Transform subject data for the chart
  const chartData = data.map((subject) => ({
    subject: subject.name,
    score: subject.score,
    grade: subject.grade,
    shortName: subject.name.length > 8 ? subject.name.substring(0, 8) + '...' : subject.name
  }))

  const chartConfig = {
    score: {
      label: "Score",
      color: "var(--primary)",
    },
  } satisfies ChartConfig

  return (
    <Card className={`font-sans @container/card pt-0 pb-0 border-0 bg-transparent gap-2 rounded-4xl shadow-none ${className}`}>
      <CardHeader className="w-full px-0 gap-3">
        <CardTitle className="flex items-center w-full text-lg text-primary">
          <SquareCheckBigIcon strokeWidth={2} className="mr-2 size-7" />
          {title}
        </CardTitle>
        <Separator orientation="horizontal" className="mr-2 h-px w-full bg-foreground/20" />
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 12 }}>
            <CartesianGrid vertical={true} horizontal={true} strokeDasharray="3 3" />
            <XAxis
              dataKey="shortName"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${value}%`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent
                labelFormatter={(value) => {
                  const subject = chartData.find(item => item.shortName === value)
                  return subject ? subject.subject : value
                }}
                formatter={(value) => [`${value}%`, 'Score']}
              />}
            />
            <Bar
              dataKey="score"
              fill="var(--color-score)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
