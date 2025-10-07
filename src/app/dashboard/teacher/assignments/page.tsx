/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useCallback } from 'react'
import { AssignmentListItem, DashboardStatCard } from '@/components/dashboard'
import { CreateAssignmentModal } from '@/components/CreateAssignmentModal'
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
  const [classes, setClasses] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    graded: 0
  })

  const fetchAssignments = useCallback(async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (selectedClass) {
        params.append('classId', selectedClass)
      }

      const url = `/api/assignments${params.toString() ? `?${params.toString()}` : ''}`
      console.log('[fetchAssignments] Fetching:', url)
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      console.log('[fetchAssignments] Response status:', response.status, 'Content-Type:', response.headers.get('content-type'))
      const contentType = response.headers.get('content-type') || ''
      const text = await response.text()
      
      if (!response.ok) {
        console.error('Failed to fetch assignments:', response.status, response.statusText)
        console.error('Response body:', text.substring(0, 500))
        setAssignments([])
        return
      }
      
      if (!text) {
        setAssignments([])
        return
      }
      
      try {
        if (!contentType.includes('application/json')) {
          console.error('[fetchAssignments] Non-JSON response. Status:', response.status, 'Content-Type:', contentType)
          setAssignments([])
          return
        }
        const data = JSON.parse(text)
        setAssignments(data.assignments || [])
        
        // Calculate stats
        const total = data.assignments?.length || 0
        const graded = data.assignments?.filter((a: any) => 
          a.submissions && a.submissions.length > 0 && a.submissions.some((s: any) => s.grade !== null)
        ).length || 0
        const pending = total - graded
        
        setStats({ total, pending, graded })
      } catch (parseError) {
        console.error('Failed to parse assignments response. Status:', response.status)
        console.error('Response body:', text.substring(0, 500))
        setAssignments([])
      }
    } catch (error) {
      console.error('Error fetching assignments:', error)
    } finally {
      setIsLoading(false)
    }
  }, [selectedClass])

  const fetchClasses = useCallback(async () => {
    try {
      console.log('[fetchClasses] Fetching: /api/classes')
      const response = await fetch('/api/classes', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      console.log('[fetchClasses] Response status:', response.status, 'Content-Type:', response.headers.get('content-type'))
      const text = await response.text()
      
      if (!response.ok) {
        console.error('Failed to fetch classes:', response.status, response.statusText)
        console.error('Response body:', text.substring(0, 500))
        setClasses([])
        return
      }
      
      if (!text) {
        setClasses([])
        return
      }
      
      try {
        const contentType = response.headers.get('content-type') || ''
        if (!contentType.includes('application/json')) {
          console.error('[fetchClasses] Non-JSON response. Status:', response.status, 'Content-Type:', contentType)
          setClasses([])
          return
        }
        const data = JSON.parse(text)
        setClasses(data.classes || [])
      } catch (parseError) {
        console.error('Failed to parse classes response. Status:', response.status)
        console.error('Response body:', text.substring(0, 500))
        setClasses([])
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
    }
  }, [])

  useEffect(() => {
    fetchClasses()
    fetchAssignments()
  }, [fetchClasses, fetchAssignments])

  const filteredAssignments = assignments.filter(a =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.subject?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const pendingAssignments = filteredAssignments.filter(a => 
    !a.submissions || a.submissions.length === 0 || !a.submissions.some((s: any) => s.grade !== null)
  )
  const gradedAssignments = filteredAssignments.filter(a => 
    a.submissions && a.submissions.length > 0 && a.submissions.some((s: any) => s.grade !== null)
  )

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
        <Button onClick={() => setIsModalOpen(true)}>
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
        <div className="flex gap-2 items-center">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="All classes" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={String(cls.id)} value={String(cls.id)}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedClass && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSelectedClass('')}
            >
              Clear
            </Button>
          )}
        </div>

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
            <AssignmentListItem 
              key={assignment.id} 
              id={assignment.id}
              title={assignment.title}
              subject={assignment.subject?.name || 'Unknown Subject'}
              dueDate={assignment.dueDate}
              maxPoints={assignment.maxPoints}
              description={assignment.description}
              className={assignment.class?.name}
              attachments={assignment.attachments}
              submissionsCount={assignment.submissions?.length || 0}
            />
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
            <AssignmentListItem 
              key={assignment.id} 
              id={assignment.id}
              title={assignment.title}
              subject={assignment.subject?.name || 'Unknown Subject'}
              dueDate={assignment.dueDate}
              maxPoints={assignment.maxPoints}
              description={assignment.description}
              className={assignment.class?.name}
              attachments={assignment.attachments}
              submissionsCount={assignment.submissions?.length || 0}
            />
          ))}
          {pendingAssignments.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No pending assignments</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="graded" className="space-y-3 mt-6">
          {gradedAssignments.map(assignment => (
            <AssignmentListItem 
              key={assignment.id} 
              id={assignment.id}
              title={assignment.title}
              subject={assignment.subject?.name || 'Unknown Subject'}
              dueDate={assignment.dueDate}
              maxPoints={assignment.maxPoints}
              description={assignment.description}
              className={assignment.class?.name}
              attachments={assignment.attachments}
              submissionsCount={assignment.submissions?.length || 0}
            />
          ))}
          {gradedAssignments.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No graded assignments</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Assignment Modal */}
      <CreateAssignmentModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={fetchAssignments}
      />
    </div>
  )
}