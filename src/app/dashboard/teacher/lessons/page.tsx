"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, FileText, Calendar, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

export default function TeacherLessonsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [lessonPlans, setLessonPlans] = useState<any[]>([])

  useEffect(() => {
    async function fetchLessonPlans() {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/dashboard/teacher/lessons')
        // const data = await response.json()

        // Mock data
        setLessonPlans([
          {
            id: '1',
            title: 'Introduction to Algebra',
            subject: 'Mathematics',
            class: 'Grade 10A',
            date: new Date('2025-10-15'),
            status: 'PUBLISHED' as const,
            objectives: 'Understand basic algebraic concepts'
          },
          {
            id: '2',
            title: 'Newton\'s Laws of Motion',
            subject: 'Physics',
            class: 'Grade 11B',
            date: new Date('2025-10-16'),
            status: 'DRAFT' as const,
            objectives: 'Learn the three laws of motion'
          }
        ])
      } catch (error) {
        console.error('Error fetching lesson plans:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLessonPlans()
  }, [])

  const filteredPlans = lessonPlans.filter(plan =>
    plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.subject.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const statusConfig = {
    DRAFT: { color: 'bg-yellow-100 text-yellow-800', label: 'Draft' },
    PUBLISHED: { color: 'bg-green-100 text-green-800', label: 'Published' },
    COMPLETED: { color: 'bg-blue-100 text-blue-800', label: 'Completed' }
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Lesson Planning</h1>
          <p className="text-gray-600 mt-1">Create and manage your lesson plans</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Lesson Plan
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search lesson plans..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Lesson Plans List */}
      <div className="space-y-4">
        {filteredPlans.map(plan => (
          <Card key={plan.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{plan.title}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {plan.subject} • {plan.class}
                    </p>
                  </div>
                </div>
                <Badge className={statusConfig[plan.status].color} variant="secondary">
                  {statusConfig[plan.status].label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-700">{plan.objectives}</p>
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{plan.date.toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="ghost" size="sm">View</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredPlans.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p>No lesson plans found</p>
          </div>
        )}
      </div>
    </div>
  )
}
