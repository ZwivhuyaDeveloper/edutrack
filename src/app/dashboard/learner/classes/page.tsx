"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  BookOpen, 
  Users, 
  Clock,
  Search,
  Loader2,
  ChevronRight,
  GraduationCap
} from 'lucide-react'
import Link from 'next/link'

interface ClassData {
  id: string
  name: string
  grade: string
  section: string
  subjects: Array<{
    id: string
    name: string
    teacher: {
      firstName: string
      lastName: string
      avatar: string | null
    }
  }>
  enrollmentStatus: string
  nextMeeting: {
    subject: string
    startTime: string
    endTime: string
    room: string
  } | null
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function fetchClasses() {
      try {
        const response = await fetch('/api/dashboard/student/classes')
        if (!response.ok) throw new Error('Failed to fetch classes')
        const data = await response.json()
        setClasses(data)
      } catch (error) {
        console.error('Error fetching classes:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchClasses()
  }, [])

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.section?.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
        <h1 className="text-3xl font-bold text-gray-900">My Classes</h1>
        <p className="text-gray-600 mt-1">View all your enrolled classes and subjects</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search classes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.map((classItem) => (
          <Card key={classItem.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{classItem.name}</CardTitle>
                    <CardDescription>
                      {classItem.grade} {classItem.section && `• ${classItem.section}`}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={classItem.enrollmentStatus === 'ACTIVE' ? 'default' : 'secondary'}>
                  {classItem.enrollmentStatus}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Subjects */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Subjects ({classItem.subjects.length})
                </p>
                <div className="space-y-2">
                  {classItem.subjects.slice(0, 3).map((subject) => (
                    <div key={subject.id} className="flex items-center gap-2 text-sm">
                      <div className="h-2 w-2 bg-primary rounded-full" />
                      <span className="text-gray-700">{subject.name}</span>
                      <span className="text-gray-500 text-xs">
                        • {subject.teacher.firstName} {subject.teacher.lastName}
                      </span>
                    </div>
                  ))}
                  {classItem.subjects.length > 3 && (
                    <p className="text-xs text-gray-500 pl-4">
                      +{classItem.subjects.length - 3} more
                    </p>
                  )}
                </div>
              </div>

              {/* Next Meeting */}
              {classItem.nextMeeting && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-blue-900 mb-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Next Class
                  </p>
                  <p className="text-sm font-semibold text-blue-900">
                    {classItem.nextMeeting.subject}
                  </p>
                  <p className="text-xs text-blue-700">
                    {classItem.nextMeeting.startTime} - {classItem.nextMeeting.endTime} • {classItem.nextMeeting.room}
                  </p>
                </div>
              )}

              {/* View Details Button */}
              <Link href={`/dashboard/learner/classes/${classItem.id}`}>
                <Button variant="outline" className="w-full group">
                  View Details
                  <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClasses.length === 0 && (
        <div className="text-center py-12">
          <GraduationCap className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No classes found</h3>
          <p className="text-gray-600">
            {searchQuery ? 'Try adjusting your search' : 'You are not enrolled in any classes yet'}
          </p>
        </div>
      )}
    </div>
  )
}
