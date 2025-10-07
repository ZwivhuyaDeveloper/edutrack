"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { 
  CheckCircle2, 
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  Calendar as CalendarIcon,
  TrendingUp,
  BarChart3
} from 'lucide-react'
import { format, startOfMonth, endOfMonth } from 'date-fns'

interface AttendanceRecord {
  id: string
  date: string
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'
  subject: string
  notes: string | null
}

interface AttendanceStats {
  totalDays: number
  present: number
  absent: number
  late: number
  excused: number
  attendanceRate: number
}

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [stats, setStats] = useState<AttendanceStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date())

  useEffect(() => {
    async function fetchAttendance() {
      try {
        const response = await fetch('/api/dashboard/student/attendance')
        if (!response.ok) throw new Error('Failed to fetch attendance')
        const data = await response.json()
        setRecords(data.records)
        setStats(data.stats)
      } catch (error) {
        console.error('Error fetching attendance:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAttendance()
  }, [])

  const getStatusConfig = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'PRESENT':
        return { 
          icon: CheckCircle2, 
          color: 'text-green-600 bg-green-100 border-green-200',
          label: 'Present'
        }
      case 'ABSENT':
        return { 
          icon: XCircle, 
          color: 'text-red-600 bg-red-100 border-red-200',
          label: 'Absent'
        }
      case 'LATE':
        return { 
          icon: Clock, 
          color: 'text-orange-600 bg-orange-100 border-orange-200',
          label: 'Late'
        }
      case 'EXCUSED':
        return { 
          icon: AlertCircle, 
          color: 'text-blue-600 bg-blue-100 border-blue-200',
          label: 'Excused'
        }
    }
  }

  const getAttendanceDates = () => {
    const dates: { [key: string]: AttendanceRecord['status'] } = {}
    records.forEach(record => {
      const dateStr = format(new Date(record.date), 'yyyy-MM-dd')
      // Prioritize worse statuses
      if (!dates[dateStr] || 
          (record.status === 'ABSENT' && dates[dateStr] !== 'ABSENT') ||
          (record.status === 'LATE' && dates[dateStr] === 'PRESENT')) {
        dates[dateStr] = record.status
      }
    })
    return dates
  }

  const attendanceDates = getAttendanceDates()

  const getDayRecords = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return records.filter(r => format(new Date(r.date), 'yyyy-MM-dd') === dateStr)
  }

  const selectedDayRecords = getDayRecords(selectedDate)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
        <p className="text-gray-600 mt-1">Track your attendance history and statistics</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.attendanceRate.toFixed(1)}%</p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Present</p>
                  <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Absent</p>
                  <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Late</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.late}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Excused</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.excused}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Attendance Calendar
            </CardTitle>
            <CardDescription>Click on a date to view details</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              month={selectedMonth}
              onMonthChange={setSelectedMonth}
              className="rounded-md border"
              modifiers={{
                present: (date) => {
                  const dateStr = format(date, 'yyyy-MM-dd')
                  return attendanceDates[dateStr] === 'PRESENT'
                },
                absent: (date) => {
                  const dateStr = format(date, 'yyyy-MM-dd')
                  return attendanceDates[dateStr] === 'ABSENT'
                },
                late: (date) => {
                  const dateStr = format(date, 'yyyy-MM-dd')
                  return attendanceDates[dateStr] === 'LATE'
                },
                excused: (date) => {
                  const dateStr = format(date, 'yyyy-MM-dd')
                  return attendanceDates[dateStr] === 'EXCUSED'
                }
              }}
              modifiersClassNames={{
                present: 'bg-green-100 text-green-900 hover:bg-green-200',
                absent: 'bg-red-100 text-red-900 hover:bg-red-200',
                late: 'bg-orange-100 text-orange-900 hover:bg-orange-200',
                excused: 'bg-blue-100 text-blue-900 hover:bg-blue-200'
              }}
            />

            <div className="flex items-center gap-4 mt-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-green-100 rounded border border-green-200" />
                <span className="text-sm text-gray-600">Present</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-red-100 rounded border border-red-200" />
                <span className="text-sm text-gray-600">Absent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-orange-100 rounded border border-orange-200" />
                <span className="text-sm text-gray-600">Late</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-blue-100 rounded border border-blue-200" />
                <span className="text-sm text-gray-600">Excused</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Day Details */}
        <Card>
          <CardHeader>
            <CardTitle>
              {format(selectedDate, 'MMMM d, yyyy')}
            </CardTitle>
            <CardDescription>Attendance records for this day</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDayRecords.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm">No attendance records for this day</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDayRecords.map((record) => {
                  const config = getStatusConfig(record.status)
                  const Icon = config.icon
                  return (
                    <div 
                      key={record.id}
                      className="p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900">{record.subject}</p>
                        <Badge className={`${config.color} border`} variant="secondary">
                          <Icon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                      </div>
                      {record.notes && (
                        <p className="text-sm text-gray-600 mt-2">{record.notes}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
