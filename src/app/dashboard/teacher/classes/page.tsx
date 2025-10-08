"use client"

import { useState, useEffect } from 'react'
import { ClassTile, DashboardStatCard } from '@/components/dashboard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, BookOpen, Users, GraduationCap } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface ClassWithDetails {
  id: string
  name: string
  grade?: string
  section?: string
  teacher: {
    name: string
    avatar?: string
  }
  subjectCount: number
  studentCount: number
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED'
  href: string
}

export default function TeacherClassesPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [classes, setClasses] = useState<ClassWithDetails[]>([])
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    activeSubjects: 0
  })

  useEffect(() => {
    async function fetchClasses() {
      try {
        setIsLoading(true)
        
        // Fetch classes assigned to this teacher
        const response = await fetch('/api/classes')
        
        if (!response.ok) {
          console.error('Failed to fetch classes:', response.status)
          setClasses([])
          return
        }
        
        const contentType = response.headers.get('content-type') || ''
        const text = await response.text()
        
        if (!text) {
          setClasses([])
          return
        }
        
        if (!contentType.includes('application/json')) {
          console.error('[TeacherClasses] Non-JSON response. Status:', response.status, 'Content-Type:', contentType)
          setClasses([])
          return
        }
        
        const data = JSON.parse(text)
        const classesData = data.classes || []
        
        // Fetch enrollments count for each class
        const classesWithDetails = await Promise.all(
          classesData.map(async (cls: any) => {
            try {
              const enrollmentRes = await fetch(`/api/enrollments?classId=${cls.id}`)
              let studentCount = 0
              
              if (enrollmentRes.ok) {
                const enrollmentText = await enrollmentRes.text()
                if (enrollmentText) {
                  const enrollmentData = JSON.parse(enrollmentText)
                  studentCount = enrollmentData.enrollments?.length || 0
                }
              }
              
              return {
                id: cls.id,
                name: cls.name,
                grade: cls.grade,
                section: cls.section,
                teacher: { name: 'You', avatar: '' },
                subjectCount: 1, // Will be enhanced when we have class-subject mapping
                studentCount,
                status: 'ACTIVE' as const,
                href: `/dashboard/teacher/classes/${cls.id}`
              }
            } catch (err) {
              console.error('Error fetching enrollment for class:', cls.id, err)
              return {
                id: cls.id,
                name: cls.name,
                grade: cls.grade,
                section: cls.section,
                teacher: { name: 'You', avatar: '' },
                subjectCount: 1,
                studentCount: 0,
                status: 'ACTIVE' as const,
                href: `/dashboard/teacher/classes/${cls.id}`
              }
            }
          })
        )
        
        setClasses(classesWithDetails)
        
        // Calculate stats
        const totalStudents = classesWithDetails.reduce((sum, cls) => sum + (cls.studentCount || 0), 0)
        const activeSubjects = classesWithDetails.reduce((sum, cls) => sum + (cls.subjectCount || 0), 0)
        
        setStats({
          totalClasses: classesWithDetails.length,
          totalStudents,
          activeSubjects
        })
      } catch (error) {
        console.error('Error fetching classes:', error)
        setClasses([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchClasses()
  }, [])

  const filteredClasses = classes.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.grade?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Classes</h1>
          <p className="text-gray-600 mt-1">Manage your assigned classes and rosters</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Request New Class
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardStatCard
          title="Total Classes"
          value={stats.totalClasses}
          icon={BookOpen}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        <DashboardStatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={Users}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        <DashboardStatCard
          title="Active Subjects"
          value={stats.activeSubjects}
          icon={GraduationCap}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
        />
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClasses.map(classItem => (
          <ClassTile key={classItem.id} {...classItem} />
        ))}
      </div>

      {filteredClasses.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <p>No classes found</p>
        </div>
      )}
    </div>
  )
}
