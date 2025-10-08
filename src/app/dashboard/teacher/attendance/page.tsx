"use client"

import { useState, useEffect } from 'react'
import { AttendanceHeatmap, DashboardStatCard } from '@/components/dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Download, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function TeacherAttendancePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([])
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0
  })

  useEffect(() => {
    async function fetchAttendance() {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/dashboard/teacher/attendance?classId=${selectedClass}`)
        // const data = await response.json()

        // Mock data
        setAttendanceRecords([
          { date: new Date('2025-10-01'), status: 'PRESENT' as const },
          { date: new Date('2025-10-02'), status: 'PRESENT' as const },
          { date: new Date('2025-10-03'), status: 'ABSENT' as const },
          { date: new Date('2025-10-04'), status: 'LATE' as const },
          { date: new Date('2025-10-07'), status: 'PRESENT' as const }
        ])

        setStats({
          present: 85,
          absent: 10,
          late: 5
        })
      } catch (error) {
        console.error('Error fetching attendance:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAttendance()
  }, [selectedClass, selectedMonth])

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
          <h1 className="text-3xl font-bold text-gray-900">Attendance Manager</h1>
          <p className="text-gray-600 mt-1">Track and manage student attendance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Session
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardStatCard
          title="Present"
          value={`${stats.present}%`}
          icon={CheckCircle}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        <DashboardStatCard
          title="Absent"
          value={`${stats.absent}%`}
          icon={XCircle}
          iconColor="text-red-600"
          iconBgColor="bg-red-100"
        />
        <DashboardStatCard
          title="Late"
          value={`${stats.late}%`}
          icon={Clock}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-100"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="class1">Mathematics 101 - Grade 10A</SelectItem>
            <SelectItem value="class2">Physics Advanced - Grade 11B</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Attendance Heatmap */}
      <AttendanceHeatmap
        records={attendanceRecords}
        month={selectedMonth}
        title="Monthly Attendance Overview"
        showLegend
      />

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Mathematics 101 - Period 1</p>
                  <p className="text-sm text-gray-600">October {i}, 2025 • 08:00 AM</p>
                </div>
                <Button variant="outline" size="sm">View Details</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
