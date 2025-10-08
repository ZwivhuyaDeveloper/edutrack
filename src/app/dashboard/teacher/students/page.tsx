/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, User, TrendingUp, Calendar } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function TeacherStudentsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [students, setStudents] = useState<any[]>([])

  useEffect(() => {
    async function fetchStudents() {
      try {
        // TODO: Replace with actual API call
        setStudents([
          {
            id: '1',
            name: 'John Doe',
            studentId: 'ST001',
            avatar: '',
            grade: 'Grade 10',
            attendance: 95,
            averageGrade: 87.5,
            lastActive: new Date('2025-10-07')
          },
          {
            id: '2',
            name: 'Jane Smith',
            studentId: 'ST002',
            avatar: '',
            grade: 'Grade 10',
            attendance: 98,
            averageGrade: 91.7,
            lastActive: new Date('2025-10-07')
          }
        ])
      } catch (error) {
        console.error('Error fetching students:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStudents()
  }, [selectedClass])

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.studentId.toLowerCase().includes(searchQuery.toLowerCase())
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Student Insights</h1>
        <p className="text-gray-600 mt-1">View individual student performance and attendance</p>
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
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map(student => (
          <Card key={student.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={student.avatar} />
                  <AvatarFallback>
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">{student.name}</CardTitle>
                  <p className="text-sm text-gray-600">{student.studentId}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  Average Grade
                </span>
                <span className="font-semibold">{student.averageGrade}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Attendance
                </span>
                <span className="font-semibold">{student.attendance}%</span>
              </div>
              <Button variant="outline" className="w-full" size="sm">
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <User className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <p>No students found</p>
        </div>
      )}
    </div>
  )
}
