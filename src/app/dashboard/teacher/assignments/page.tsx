"use client"

import { useState, useEffect } from 'react'
import { AssignmentListItem, DashboardStatCard } from '@/components/dashboard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Search, FileText, CheckCircle, Clock } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function TeacherAssignmentsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [assignments, setAssignments] = useState<any[]>([])
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    graded: 0
  })

  useEffect(() => {
    async function fetchAssignments() {
      try {
        // TODO: Replace with actual API call
        setAssignments([
          {
            id: '1',
            title: 'Algebra Assignment 3',
            subject: 'Mathematics',
            dueDate: new Date('2025-10-15'),
            maxPoints: 100,
            isSubmitted: false,
            description: 'Solve quadratic equations',
            href: '/dashboard/teacher/assignments/1'
          },
          {
            id: '2',
            title: 'Physics Lab Report',
            subject: 'Physics',
            dueDate: new Date('2025-10-20'),
            maxPoints: 50,
            isSubmitted: true,
            grade: 45,
            description: 'Newton\'s laws experiment',
            href: '/dashboard/teacher/assignments/2'
          }
        ])

        setStats({
          total: 15,
          pending: 8,
          graded: 7
        })
      } catch (error) {
        console.error('Error fetching assignments:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAssignments()
  }, [selectedClass])

  const filteredAssignments = assignments.filter(a =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.subject.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const pendingAssignments = filteredAssignments.filter(a => !a.isSubmitted)
  const gradedAssignments = filteredAssignments.filter(a => a.isSubmitted)

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
          <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-600 mt-1">Create and manage assignments</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Assignment
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardStatCard
          title="Total Assignments"
          value={stats.total}
          icon={FileText}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        <DashboardStatCard
          title="Pending Review"
          value={stats.pending}
          icon={Clock}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-100"
        />
        <DashboardStatCard
          title="Graded"
          value={stats.graded}
          icon={CheckCircle}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
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

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search assignments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Assignments Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All ({filteredAssignments.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingAssignments.length})</TabsTrigger>
          <TabsTrigger value="graded">Graded ({gradedAssignments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3 mt-6">
          {filteredAssignments.map(assignment => (
            <AssignmentListItem key={assignment.id} {...assignment} />
          ))}
          {filteredAssignments.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p>No assignments found</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-3 mt-6">
          {pendingAssignments.map(assignment => (
            <AssignmentListItem key={assignment.id} {...assignment} />
          ))}
          {pendingAssignments.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No pending assignments</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="graded" className="space-y-3 mt-6">
          {gradedAssignments.map(assignment => (
            <AssignmentListItem key={assignment.id} {...assignment} />
          ))}
          {gradedAssignments.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No graded assignments</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}