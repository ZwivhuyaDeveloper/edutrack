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
  BookOpen, 
  Plus, 
  Search, 
  GraduationCap,
  FileText,
  BarChart3,
  Edit,
  Eye,
  Award,
  UserPlus
} from 'lucide-react'
import { toast } from 'sonner'
import { Class, Subject, Assignment, Grade } from '@/types/academic'
import { TotalClassesCard } from '@/components/total-classes-card';
import { SubjectsCard } from '@/components/subjects-card'
import { AssignmentsCard } from '@/components/assignments-card';
import { AverageGradeCard } from '@/components/average-grade-card';

interface AcademicStats {
  totalClasses: number
  totalSubjects: number
  totalAssignments: number
  averageGrade: number
  completionRate: number
  activeTerms: number
}

interface AcademicStats {
  totalClasses: number;
}

export default function PrincipalAcademicPage() {
  const [activeTab, setActiveTab] = useState('classes')
  const [classes, setClasses] = useState<Class[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [recentGrades, setRecentGrades] = useState<Grade[]>([])
  const [stats, setStats] = useState<AcademicStats | null>({
    totalClasses: 0,
    totalSubjects: 0,
    totalAssignments: 0,
    averageGrade: 0,
    completionRate: 0,
    activeTerms: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [gradeFilter, setGradeFilter] = useState('all')
  const [selectedItem, setSelectedItem] = useState<Class | Subject | Assignment | Grade | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      let endpoint = ''
      
      switch (activeTab) {
        case 'classes':
          endpoint = '/api/principal/classes'
          break
        case 'subjects':
          endpoint = '/api/principal/subjects'
          break
        case 'assignments':
          endpoint = '/api/principal/assignments'
          break
        case 'grades':
          endpoint = '/api/principal/grades'
          break
      }

      const response = await fetch(endpoint)
      if (response.ok) {
        const data = await response.json()
        
        switch (activeTab) {
          case 'classes':
            setClasses(data.classes || [])
            break
          case 'subjects':
            setSubjects(data.subjects || [])
            break
          case 'assignments':
            setAssignments(data.assignments || [])
            break
          case 'grades':
            setRecentGrades(data.grades || [])
            break
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }, [activeTab])

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/principal/academic/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }, [])

  useEffect(() => {
    fetchData()
    fetchStats()
  }, [fetchData, fetchStats])

  const ClassCard = ({ classItem }: { classItem: Class }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{classItem.name}</CardTitle>
            <CardDescription>
              Grade {classItem.grade} - Section {classItem.section}
            </CardDescription>
          </div>
          <Badge variant="outline">{classItem._count.enrollments} students</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold">{classItem._count.subjects}</div>
            <div className="text-muted-foreground">Subjects</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">{classItem._count.assignments}</div>
            <div className="text-muted-foreground">Assignments</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">{classItem._count.enrollments}</div>
            <div className="text-muted-foreground">Students</div>
          </div>
        </div>
        
        {classItem.subjects.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Subjects & Teachers</h4>
            <div className="space-y-1">
              {classItem.subjects.slice(0, 3).map((cs) => (
                <div key={cs.id} className="flex items-center justify-between text-sm">
                  <span>{cs.subject.name}</span>
                  <span className="text-muted-foreground">
                    {cs.teacher.firstName} {cs.teacher.lastName}
                  </span>
                </div>
              ))}
              {classItem.subjects.length > 3 && (
                <div className="text-xs text-muted-foreground">
                  +{classItem.subjects.length - 3} more subjects
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedItem(classItem)
                setIsViewModalOpen(true)
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = `/dashboard/principal/academic/classes/${classItem.id}/edit`}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = `/dashboard/principal/academic/classes/${classItem.id}`}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const SubjectCard = ({ subject }: { subject: Subject }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{subject.name}</CardTitle>
            <CardDescription>{subject.code}</CardDescription>
          </div>
          <Badge variant="secondary">{subject._count.classSubjects} classes</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {subject.description && (
          <p className="text-sm text-muted-foreground">{subject.description}</p>
        )}
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold">{subject._count.classSubjects}</div>
            <div className="text-muted-foreground">Classes</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">{subject._count.assignments}</div>
            <div className="text-muted-foreground">Assignments</div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedItem(subject)
                setIsViewModalOpen(true)
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = `/dashboard/principal/academic/subjects/${subject.id}/edit`}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = `/dashboard/principal/academic/subjects/${subject.id}`}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const AssignmentCard = ({ assignment }: { assignment: Assignment }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{assignment.title}</CardTitle>
            <CardDescription>
              {assignment.class.name} - {assignment.subject.name}
            </CardDescription>
          </div>
          <div className="text-right">
            <Badge variant={new Date(assignment.dueDate) < new Date() ? 'destructive' : 'default'}>
              {new Date(assignment.dueDate).toLocaleDateString()}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Max Points: </span>
            <span className="font-semibold">{assignment.maxPoints || 'N/A'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Submissions: </span>
            <span className="font-semibold">{assignment._count.submissions}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedItem(assignment)
                setIsViewModalOpen(true)
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = `/dashboard/principal/academic/assignments/${assignment.id}`}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const CreateModal = () => (
    <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New {activeTab}</DialogTitle>
          <DialogDescription>
            Add a new {activeTab.toLowerCase()} to your school
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {activeTab === 'classes' && (
            <>
              <div>
                <label className="text-sm font-medium">Class Name</label>
                <Input placeholder="e.g., Mathematics A" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Grade</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i + 1} value={`${i + 1}`}>
                          Grade {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Section</label>
                  <Input placeholder="e.g., A" />
                </div>
              </div>
            </>
          )}

          {activeTab === 'subjects' && (
            <>
              <div>
                <label className="text-sm font-medium">Subject Name</label>
                <Input className="bg-zinc-100 border-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0" placeholder="e.g., Mathematics" />
              </div>
              <div>
                <label className="text-sm font-medium">Subject Code</label>
                <Input className="bg-zinc-100 border-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0" placeholder="e.g., MATH101" />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input className="bg-zinc-100 border-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0" placeholder="Brief description of the subject" />
              </div>
            </>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast.success(`${activeTab.slice(0, -1)} created successfully`)
              setIsCreateModalOpen(false)
              fetchData()
            }}>
              Create {activeTab.slice(0, -1)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="space-y-6 h-full mb-20">
      <div className='rounded-3xl mt-3  gap-2 space-y-2'>
      {/* Header */}
      <div className="flex items-center p-3 rounded-2xl shadow-sm bg-white mb-3 justify-between">
        <div className="p-3 gap-2">
          <h1 className="text-3xl text-primary font-bold tracking-tight">Academic Management</h1>
          <p className="text-muted-foreground">
            Manage classes, subjects, assignments, and academic performance
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}
          className='bg-primary text-white mr-2'
          >
          <UserPlus className="h-4 w-4 mr-2" />
          Add {activeTab}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid hidden gap-4 md:grid-cols-2 lg:grid-cols-4">
        <TotalClassesCard 
          totalClasses={stats?.totalClasses || 0}
          isLoading={isLoading}
          error={error}
          onRetry={fetchStats}
        />
        <SubjectsCard
          totalSubjects={stats?.totalSubjects || 0}
          isLoading={isLoading}
          error={error}
          onRetry={fetchStats}
        />

        <AssignmentsCard
          totalAssignments={stats?.totalAssignments || 0}
          isLoading={isLoading}
          error={error}
          onRetry={fetchStats}
        />

        <AverageGradeCard
          averageGrade={stats?.averageGrade || 0}
          isLoading={isLoading}
          error={error}
          onRetry={fetchStats}
        />
      </div>

      {/* Search and Filters */}
      <Card className="bg-white rounded-2xl shadow-sm border-none">
        <CardContent className="">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-zinc-100 border-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0"
                />
              </div>
            </div>
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger className="w-fit bg-primary text-white border-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i + 1} value={`${i + 1}`}>
                    Grade {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-white rounded-2xl shadow-sm p-3 border-none">
        <TabsList className="grid w-full grid-cols-4 space-x-1  ">
          <TabsTrigger value="classes" className="bg-white/70 rounded-md shadow-none border-none">Classes</TabsTrigger>
          <TabsTrigger value="subjects" className="rounded-md bg-white/70 ">Subjects</TabsTrigger>
          <TabsTrigger value="assignments" className="rounded-md bg-white/70 ">Assignments</TabsTrigger>
          <TabsTrigger value="grades" className="rounded-md bg-white/70 ">Grades</TabsTrigger>
        </TabsList>

        <TabsContent value="classes" className="space-y-4">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-24 bg-muted animate-pulse rounded" />
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
          ) : classes.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {classes.map((classItem) => (
                <ClassCard key={classItem.id} classItem={classItem} />
              ))}
            </div>
          ) : (
            <Card className="border-none shadow-none h-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No classes found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first class to get started with academic management.
                </p>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Class
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="subjects" className="space-y-4">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : subjects.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {subjects.map((subject) => (
                <SubjectCard key={subject.id} subject={subject} />
              ))}
            </div>
          ) : (
            <Card className="border-none shadow-none h-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No subjects found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Add subjects to organize your curriculum.
                </p>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subject
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="h-4 w-40 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : assignments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {assignments.map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}
            </div>
          ) : (
            <Card className="border-none shadow-none h-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No assignments found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Assignments will appear here as teachers create them.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="grades" className="space-y-4">
          <Card className="border-none shadow-none h-full">
            <CardHeader>
              <CardTitle>Recent Grades</CardTitle>
              <CardDescription>
                Latest grade entries across all classes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentGrades.length > 0 ? (
                <div className="space-y-4">
                  {recentGrades.slice(0, 10).map((grade) => (
                    <div key={grade.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">
                          {grade.student.firstName} {grade.student.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {grade.gradeItem.class.name} - {grade.gradeItem.subject.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {grade.gradeItem.name}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {grade.points}/{grade.maxPoints}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {Math.round((grade.points / grade.maxPoints) * 100)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(grade.gradedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No recent grades</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Modal */}
      <CreateModal />
      </div>
    </div>
  )
}
