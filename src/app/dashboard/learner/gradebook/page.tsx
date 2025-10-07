"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Award, 
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  BookOpen,
  BarChart3
} from 'lucide-react'
import { format } from 'date-fns'

interface GradeData {
  subject: {
    id: string
    name: string
    code: string
  }
  categories: Array<{
    id: string
    name: string
    weight: number
    items: Array<{
      id: string
      name: string
      maxPoints: number
      date: string
      grade: {
        points: number
        feedback: string | null
        gradedAt: string
      } | null
    }>
  }>
  overallGrade: {
    percentage: number
    letterGrade: string
    trend: 'up' | 'down' | 'stable'
  }
}

export default function GradebookPage() {
  const [grades, setGrades] = useState<GradeData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)

  useEffect(() => {
    async function fetchGrades() {
      try {
        const response = await fetch('/api/dashboard/student/grades')
        if (!response.ok) throw new Error('Failed to fetch grades')
        const data = await response.json()
        setGrades(data)
        if (data.length > 0) setSelectedSubject(data[0].subject.id)
      } catch (error) {
        console.error('Error fetching grades:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchGrades()
  }, [])

  const getLetterGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-100'
    if (percentage >= 80) return 'text-blue-600 bg-blue-100'
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-100'
    if (percentage >= 60) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-600" />
  }

  const calculateCategoryAverage = (items: GradeData['categories'][0]['items']) => {
    const gradedItems = items.filter(item => item.grade !== null)
    if (gradedItems.length === 0) return null
    
    const total = gradedItems.reduce((sum, item) => {
      return sum + (item.grade!.points / item.maxPoints) * 100
    }, 0)
    
    return (total / gradedItems.length).toFixed(1)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const currentSubject = grades.find(g => g.subject.id === selectedSubject)

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gradebook</h1>
        <p className="text-gray-600 mt-1">Track your academic performance across all subjects</p>
      </div>

      {/* Overall Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {grades.map((gradeData) => (
          <Card 
            key={gradeData.subject.id}
            className={`cursor-pointer transition-all ${
              selectedSubject === gradeData.subject.id 
                ? 'ring-2 ring-primary shadow-lg' 
                : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedSubject(gradeData.subject.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                {getTrendIcon(gradeData.overallGrade.trend)}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{gradeData.subject.name}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">
                  {gradeData.overallGrade.percentage.toFixed(1)}%
                </span>
                <Badge className={getLetterGradeColor(gradeData.overallGrade.percentage)}>
                  {gradeData.overallGrade.letterGrade}
                </Badge>
              </div>
              <Progress value={gradeData.overallGrade.percentage} className="h-2 mt-3" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed View */}
      {currentSubject && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  {currentSubject.subject.name} - Detailed Breakdown
                </CardTitle>
                <CardDescription>{currentSubject.subject.code}</CardDescription>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Overall Grade</p>
                <p className="text-2xl font-bold text-gray-900">
                  {currentSubject.overallGrade.percentage.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={currentSubject.categories[0]?.id} className="w-full">
              <TabsList className="w-full justify-start overflow-x-auto">
                {currentSubject.categories.map((category) => (
                  <TabsTrigger key={category.id} value={category.id}>
                    {category.name} ({category.weight}%)
                  </TabsTrigger>
                ))}
              </TabsList>

              {currentSubject.categories.map((category) => {
                const categoryAvg = calculateCategoryAverage(category.items)
                
                return (
                  <TabsContent key={category.id} value={category.id} className="space-y-4 mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-600">Weight: {category.weight}%</p>
                      </div>
                      {categoryAvg && (
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Category Average</p>
                          <p className="text-xl font-bold text-gray-900">{categoryAvg}%</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      {category.items.map((item) => (
                        <div 
                          key={item.id}
                          className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{item.name}</h4>
                              <p className="text-sm text-gray-600">
                                Due: {format(new Date(item.date), 'MMM d, yyyy')}
                              </p>
                            </div>
                            {item.grade ? (
                              <div className="text-right">
                                <p className="text-lg font-bold text-gray-900">
                                  {item.grade.points}/{item.maxPoints}
                                </p>
                                <p className={`text-sm font-medium ${
                                  getLetterGradeColor((item.grade.points / item.maxPoints) * 100).split(' ')[0]
                                }`}>
                                  {((item.grade.points / item.maxPoints) * 100).toFixed(1)}%
                                </p>
                              </div>
                            ) : (
                              <Badge variant="secondary">Not Graded</Badge>
                            )}
                          </div>

                          {item.grade && (
                            <>
                              <Progress 
                                value={(item.grade.points / item.maxPoints) * 100} 
                                className="h-2 mb-3" 
                              />
                              {item.grade.feedback && (
                                <div className="bg-white p-3 rounded border border-gray-200">
                                  <p className="text-xs font-medium text-gray-700 mb-1">Teacher Feedback</p>
                                  <p className="text-sm text-gray-600">{item.grade.feedback}</p>
                                </div>
                              )}
                              <p className="text-xs text-gray-500 mt-2">
                                Graded on {format(new Date(item.grade.gradedAt), 'MMM d, yyyy')}
                              </p>
                            </>
                          )}
                        </div>
                      ))}

                      {category.items.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Award className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                          <p>No grade items in this category yet</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                )
              })}
            </Tabs>
          </CardContent>
        </Card>
      )}

      {grades.length === 0 && (
        <div className="text-center py-12">
          <Award className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No grades available</h3>
          <p className="text-gray-600">Your grades will appear here once teachers post them</p>
        </div>
      )}
    </div>
  )
}
