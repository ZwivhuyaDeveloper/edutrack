"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Clock, 
  MapPin, 
  Calendar, 
  Users, 
  Plus, 
  Search, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Eye,
  Trash2,
  BarChart3,
  CalendarDays,
  Building,
  Timer,
  UserCheck
} from 'lucide-react'
import { toast } from 'sonner'

interface AttendanceStats {
  totalPresent: number
  totalAbsent: number
  totalLate: number
  attendanceRate: number
  classAttendance: Array<{
    className: string
    presentCount: number
    totalCount: number
    rate: number
  }>
}

interface Period {
  id: string
  name: string
  startTime: string
  endTime: string
  order: number
  _count: {
    classMeetings: number
  }
}

interface Room {
  id: string
  name: string
  building?: string
  capacity?: number
  floor?: string
  facilities: string[]
  _count: {
    classMeetings: number
  }
}

interface TimetableEntry {
  id: string
  dayOfWeek: number
  period: {
    name: string
    startTime: string
    endTime: string
  }
  room?: {
    name: string
    building?: string
  }
  classSubject: {
    class: {
      name: string
      grade: string
    }
    subject: {
      name: string
    }
    teacher: {
      firstName: string
      lastName: string
    }
  }
}

interface OperationsStats {
  totalRooms: number
  totalPeriods: number
  utilizationRate: number
  conflictsCount: number
  attendanceRate: number
  onTimeRate: number
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function PrincipalOperationsPage() {
  const [activeTab, setActiveTab] = useState('attendance')
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats>({
    totalPresent: 0,
    totalAbsent: 0,
    totalLate: 0,
    attendanceRate: 0,
    classAttendance: []
  })
  const [periods, setPeriods] = useState<Period[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [timetable, setTimetable] = useState<TimetableEntry[]>([])
  const [stats, setStats] = useState<OperationsStats>({
    totalRooms: 0,
    totalPeriods: 0,
    utilizationRate: 0,
    conflictsCount: 0,
    attendanceRate: 0,
    onTimeRate: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedItem, setSelectedItem] = useState<Room | Period | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  useEffect(() => {
    fetchData()
    fetchStats()
  }, [activeTab, selectedDate])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      let endpoint = ''
      
      switch (activeTab) {
        case 'attendance':
          endpoint = `/api/principal/attendance?date=${selectedDate}`
          break
        case 'schedule':
          endpoint = '/api/principal/timetable'
          break
        case 'resources':
          // Fetch both rooms and periods
          const [roomsRes, periodsRes] = await Promise.all([
            fetch('/api/principal/rooms'),
            fetch('/api/principal/periods')
          ])
          if (roomsRes.ok && periodsRes.ok) {
            const roomsData = await roomsRes.json()
            const periodsData = await periodsRes.json()
            setRooms(roomsData.rooms || [])
            setPeriods(periodsData.periods || [])
          }
          setIsLoading(false)
          return
        case 'finance':
        case 'reports':
        case 'settings':
        case 'audit':
          // These tabs don't need API calls yet
          setIsLoading(false)
          return
      }

      const response = await fetch(endpoint)
      if (response.ok) {
        const data = await response.json()
        
        switch (activeTab) {
          case 'attendance':
            setAttendanceStats(data)
            break
          case 'schedule':
            setTimetable(data.timetable || [])
            break
          case 'rooms':
            setRooms(data.rooms || [])
            break
          case 'periods':
            setPeriods(data.periods || [])
            break
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/principal/operations/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const AttendanceOverview = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{attendanceStats.totalPresent}</div>
            <p className="text-xs text-muted-foreground">Students present today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{attendanceStats.totalAbsent}</div>
            <p className="text-xs text-muted-foreground">Students absent today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{attendanceStats.totalLate}</div>
            <p className="text-xs text-muted-foreground">Students late today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{attendanceStats.attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">Overall rate today</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Class-wise Attendance</CardTitle>
          <CardDescription>Attendance breakdown by class for {selectedDate}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {attendanceStats.classAttendance.map((classAtt, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{classAtt.className}</div>
                  <div className="text-sm text-muted-foreground">
                    {classAtt.presentCount} of {classAtt.totalCount} students present
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{classAtt.rate}%</div>
                  <Badge variant={classAtt.rate >= 90 ? 'default' : classAtt.rate >= 75 ? 'secondary' : 'destructive'}>
                    {classAtt.rate >= 90 ? 'Excellent' : classAtt.rate >= 75 ? 'Good' : 'Needs Attention'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const TimetableView = () => {
    const groupedTimetable = timetable.reduce((acc, entry) => {
      const day = DAYS_OF_WEEK[entry.dayOfWeek]
      if (!acc[day]) acc[day] = []
      acc[day].push(entry)
      return acc
    }, {} as Record<string, TimetableEntry[]>)

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Timetable</CardTitle>
            <CardDescription>School schedule overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {DAYS_OF_WEEK.slice(1, 6).map((day) => (
                <div key={day} className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">{day}</h3>
                  <div className="grid gap-2">
                    {groupedTimetable[day]?.length > 0 ? (
                      groupedTimetable[day]
                        .sort((a, b) => a.period.startTime.localeCompare(b.period.startTime))
                        .map((entry) => (
                          <div key={entry.id} className="flex items-center justify-between p-2 bg-muted rounded">
                            <div className="flex items-center gap-3">
                              <div className="text-sm font-medium">
                                {entry.period.startTime} - {entry.period.endTime}
                              </div>
                              <div className="text-sm">
                                {entry.classSubject.class.name} - {entry.classSubject.subject.name}
                              </div>
                            </div>
                            <div className="text-right text-sm">
                              <div>{entry.classSubject.teacher.firstName} {entry.classSubject.teacher.lastName}</div>
                              <div className="text-muted-foreground">{entry.room?.name || 'No room'}</div>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No classes scheduled
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const RoomsGrid = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <Card key={room.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{room.name}</CardTitle>
                  <CardDescription>
                    {room.building && `${room.building} - `}
                    {room.floor && `Floor ${room.floor}`}
                  </CardDescription>
                </div>
                <Badge variant="outline">{room._count.classMeetings} classes</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Capacity: </span>
                  <span className="font-semibold">{room.capacity || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Usage: </span>
                  <span className="font-semibold">{room._count.classMeetings} classes</span>
                </div>
              </div>

              {room.facilities.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Facilities</h4>
                  <div className="flex flex-wrap gap-1">
                    {room.facilities.map((facility, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {facility}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedItem(room)
                      setIsViewModalOpen(true)
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.location.href = `/dashboard/principal/operations/rooms/${room.id}/edit`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = `/dashboard/principal/operations/rooms/${room.id}`}
                >
                  View Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const PeriodsGrid = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {periods
          .sort((a, b) => a.order - b.order)
          .map((period) => (
            <Card key={period.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{period.name}</CardTitle>
                    <CardDescription>
                      {period.startTime} - {period.endTime}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{period._count.classMeetings} classes</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Order: </span>
                    <span className="font-semibold">{period.order}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duration: </span>
                    <span className="font-semibold">
                      {(() => {
                        const start = new Date(`2000-01-01T${period.startTime}`)
                        const end = new Date(`2000-01-01T${period.endTime}`)
                        const diff = (end.getTime() - start.getTime()) / (1000 * 60)
                        return `${diff} min`
                      })()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedItem(period)
                        setIsViewModalOpen(true)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.location.href = `/dashboard/principal/operations/periods/${period.id}/edit`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = `/dashboard/principal/operations/periods/${period.id}`}
                  >
                    View Classes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  )

  const CreateModal = () => (
    <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New {activeTab === 'periods' ? 'Period' : 'Room'}</DialogTitle>
          <DialogDescription>
            Add a new {activeTab === 'periods' ? 'time period' : 'room'} to your school
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {activeTab === 'rooms' && (
            <>
              <div>
                <label className="text-sm font-medium">Room Name</label>
                <Input placeholder="e.g., Room 101" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Building</label>
                  <Input placeholder="e.g., Main Building" />
                </div>
                <div>
                  <label className="text-sm font-medium">Floor</label>
                  <Input placeholder="e.g., 1st Floor" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Capacity</label>
                <Input type="number" placeholder="Number of students" />
              </div>
              <div>
                <label className="text-sm font-medium">Facilities</label>
                <Input placeholder="e.g., Projector, Whiteboard (comma separated)" />
              </div>
            </>
          )}

          {activeTab === 'periods' && (
            <>
              <div>
                <label className="text-sm font-medium">Period Name</label>
                <Input placeholder="e.g., Period 1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Start Time</label>
                  <Input type="time" />
                </div>
                <div>
                  <label className="text-sm font-medium">End Time</label>
                  <Input type="time" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Order</label>
                <Input type="number" placeholder="Period order (1, 2, 3...)" />
              </div>
            </>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast.success(`${activeTab === 'periods' ? 'Period' : 'Room'} created successfully`)
              setIsCreateModalOpen(false)
              fetchData()
            }}>
              Create {activeTab === 'periods' ? 'Period' : 'Room'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Operations Center</h1>
          <p className="text-muted-foreground">
            Manage attendance, finance, resources, reports, and school settings
          </p>
        </div>
        {(activeTab === 'rooms' || activeTab === 'periods') && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add {activeTab === 'periods' ? 'Period' : 'Room'}
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">Today&apos;s attendance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRooms}</div>
            <p className="text-xs text-muted-foreground">Available rooms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Periods</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPeriods}</div>
            <p className="text-xs text-muted-foreground">Configured periods</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilization</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.utilizationRate}%</div>
            <p className="text-xs text-muted-foreground">Room utilization</p>
          </CardContent>
        </Card>
      </div>

      {/* Date Selector for Attendance */}
      {activeTab === 'attendance' && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div>
                <label className="text-sm font-medium">Select Date</label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-40"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/dashboard/principal/operations/attendance/reports'}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                View Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search for Rooms/Periods */}
      {(activeTab === 'rooms' || activeTab === 'periods') && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={`Search ${activeTab}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-1">
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-muted animate-pulse rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <AttendanceOverview />
          )}
        </TabsContent>

        <TabsContent value="schedule">
          {isLoading ? (
            <Card>
              <CardHeader>
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <TimetableView />
          )}
        </TabsContent>

        <TabsContent value="rooms">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 w-full bg-muted animate-pulse rounded" />
                      <div className="h-3 w-3/4 bg-muted animate-pulse rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : rooms.length > 0 ? (
            <RoomsGrid />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No rooms found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Add rooms to manage your school&apos;s physical spaces.
                </p>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Room
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="resources">
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Rooms & Facilities
                  </CardTitle>
                  <CardDescription>Manage physical spaces</CardDescription>
                </CardHeader>
                <CardContent>
                  {rooms.length > 0 ? (
                    <RoomsGrid />
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No rooms configured</p>
                      <Button onClick={() => setIsCreateModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Room
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Time Periods
                  </CardTitle>
                  <CardDescription>School day structure</CardDescription>
                </CardHeader>
                <CardContent>
                  {periods.length > 0 ? (
                    <PeriodsGrid />
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No periods configured</p>
                      <Button onClick={() => setIsCreateModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Period
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="finance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Financial Overview
              </CardTitle>
              <CardDescription>
                Fee collection, payments, and financial reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$0</div>
                    <p className="text-xs text-muted-foreground">This academic year</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Outstanding Fees</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$0</div>
                    <p className="text-xs text-muted-foreground">Pending collection</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Payment Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0%</div>
                    <p className="text-xs text-muted-foreground">On-time payments</p>
                  </CardContent>
                </Card>
              </div>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Financial management features will be integrated here
                </p>
                <Button variant="outline">
                  View Financial Reports
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Reports & Analytics
              </CardTitle>
              <CardDescription>
                Comprehensive school reports and data analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-base">Attendance Reports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Daily, weekly, and monthly attendance analytics
                    </p>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-base">Academic Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Grade distribution and student progress
                    </p>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-base">Financial Reports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Fee collection and payment analytics
                    </p>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-base">Staff Reports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Teacher performance and workload analysis
                    </p>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-base">Enrollment Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Student enrollment and retention metrics
                    </p>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-base">Custom Reports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Build and export custom data reports
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                School Settings
              </CardTitle>
              <CardDescription>
                Configure school information and system preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">School Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">School Name</label>
                    <Input placeholder="Enter school name" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input type="email" placeholder="school@example.com" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <Input type="tel" placeholder="+1 (555) 000-0000" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Website</label>
                    <Input type="url" placeholder="https://school.com" className="mt-1" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Academic Year</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Start Date</label>
                    <Input type="date" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">End Date</label>
                    <Input type="date" className="mt-1" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Audit Logs
              </CardTitle>
              <CardDescription>
                System activity and change history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Audit Logs</h3>
                <p className="text-muted-foreground">
                  Track all system changes and user activities
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Modal */}
      <CreateModal />
    </div>
  )
}
