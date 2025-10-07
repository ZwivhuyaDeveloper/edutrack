"use client"

import { useState, useEffect } from 'react'
import { GradeSummaryChart, DashboardStatCard } from '@/components/dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, TrendingUp, Users, Award } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function TeacherAnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedClass, setSelectedClass] = useState('')
  const [gradeData, setGradeData] = useState<any[]>([])
  const [stats, setStats] = useState({
    classAverage: 0,
    topPerformers: 0,
    needsAttention: 0
  })

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        // TODO: Replace with actual API call
        setGradeData([
          { subject: 'Assignments', percentage: 85, letterGrade: 'B', trend: 'up' as const },
          { subject: 'Quizzes', percentage: 90, letterGrade: 'A', trend: 'up' as const },
          { subject: 'Exams', percentage: 88, letterGrade: 'B+', trend: 'stable' as const }
        ])

        setStats({
          classAverage: 87.5,
          topPerformers: 15,
          needsAttention: 5
        })
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [selectedClass])

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600 mt-1">Track performance and export reports</p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Class Filter */}
      <Select value={selectedClass} onValueChange={setSelectedClass}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Select class" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="class1">Mathematics 101 - Grade 10A</SelectItem>
          <SelectItem value="class2">Physics Advanced - Grade 11B</SelectItem>
        </SelectContent>
      </Select>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardStatCard
          title="Class Average"
          value={`${stats.classAverage}%`}
          icon={TrendingUp}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        <DashboardStatCard
          title="Top Performers"
          value={stats.topPerformers}
          icon={Award}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        <DashboardStatCard
          title="Needs Attention"
          value={stats.needsAttention}
          icon={Users}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-100"
        />
      </div>

      {/* Grade Distribution */}
      <GradeSummaryChart
        grades={gradeData}
        overallAverage={stats.classAverage}
        title="Class Performance Overview"
        description="Average grades across all categories"
      />

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <p>Attendance chart will be displayed here</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assignment Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <p>Completion rate chart will be displayed here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
