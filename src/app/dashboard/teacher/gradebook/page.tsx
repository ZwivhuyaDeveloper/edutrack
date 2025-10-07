"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Download, Search } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function TeacherGradebookPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedClass, setSelectedClass] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [students, setStudents] = useState<any[]>([])

  useEffect(() => {
    async function fetchGradebook() {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/dashboard/teacher/gradebook?classId=${selectedClass}`)
        // const data = await response.json()

        // Mock data
        setStudents([
          {
            id: '1',
            name: 'John Doe',
            studentId: 'ST001',
            grades: {
              assignments: 85,
              quizzes: 90,
              exams: 88,
              overall: 87.5
            }
          },
          {
            id: '2',
            name: 'Jane Smith',
            studentId: 'ST002',
            grades: {
              assignments: 92,
              quizzes: 88,
              exams: 95,
              overall: 91.7
            }
          }
        ])
      } catch (error) {
        console.error('Error fetching gradebook:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchGradebook()
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gradebook</h1>
          <p className="text-gray-600 mt-1">Manage grades and categories</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Grade Item
          </Button>
        </div>
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

      {/* Gradebook Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Grades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 font-semibold text-gray-700">Student ID</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Name</th>
                  <th className="text-center p-3 font-semibold text-gray-700">Assignments</th>
                  <th className="text-center p-3 font-semibold text-gray-700">Quizzes</th>
                  <th className="text-center p-3 font-semibold text-gray-700">Exams</th>
                  <th className="text-center p-3 font-semibold text-gray-700">Overall</th>
                  <th className="text-center p-3 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => (
                  <tr key={student.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 text-sm text-gray-900">{student.studentId}</td>
                    <td className="p-3 text-sm font-medium text-gray-900">{student.name}</td>
                    <td className="p-3 text-sm text-center">{student.grades.assignments}%</td>
                    <td className="p-3 text-sm text-center">{student.grades.quizzes}%</td>
                    <td className="p-3 text-sm text-center">{student.grades.exams}%</td>
                    <td className="p-3 text-sm text-center font-semibold">{student.grades.overall}%</td>
                    <td className="p-3 text-center">
                      <Button variant="ghost" size="sm">Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredStudents.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p>No students found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
