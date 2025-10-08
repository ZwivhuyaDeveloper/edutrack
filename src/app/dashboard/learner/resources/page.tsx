"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FileText, 
  Video,
  Link as LinkIcon,
  Image,
  File,
  Search,
  Loader2,
  Download,
  ExternalLink,
  Filter,
  BookOpen,
  Presentation
} from 'lucide-react'
import { format } from 'date-fns'

interface Resource {
  id: string
  title: string
  description: string | null
  url: string
  type: 'DOCUMENT' | 'VIDEO' | 'LINK' | 'PRESENTATION' | 'SPREADSHEET' | 'IMAGE' | 'OTHER'
  visibility: 'SCHOOL' | 'CLASS' | 'SUBJECT' | 'PRIVATE'
  fileSize: number | null
  createdAt: string
  owner: {
    firstName: string
    lastName: string
  }
  tags: Array<{
    tag: {
      id: string
      name: string
    }
  }>
  links: Array<{
    classSubject: {
      subject: {
        name: string
      }
      class: {
        name: string
      }
    } | null
  }>
}

interface LessonPlan {
  id: string
  title: string
  date: string
  objectives: string | null
  materials: string | null
  activities: string | null
  homework: string | null
  notes: string | null
  status: 'DRAFT' | 'PUBLISHED' | 'COMPLETED'
  teacher: {
    firstName: string
    lastName: string
  }
  classSubject: {
    subject: {
      name: string
    }
    class: {
      name: string
    }
  }
  attachments: Array<{
    id: string
    url: string
    filename: string
    fileType: string
  }>
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  useEffect(() => {
    async function fetchResources() {
      try {
        const [resourcesRes, lessonPlansRes] = await Promise.all([
          fetch('/api/dashboard/student/resources'),
          fetch('/api/dashboard/student/lesson-plans')
        ])
        
        if (resourcesRes.ok) {
          const resourcesData = await resourcesRes.json()
          setResources(resourcesData)
        }
        
        if (lessonPlansRes.ok) {
          const lessonPlansData = await lessonPlansRes.json()
          setLessonPlans(lessonPlansData)
        }
      } catch (error) {
        console.error('Error fetching resources:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchResources()
  }, [])

  const getResourceIcon = (type: Resource['type']) => {
    switch (type) {
      case 'DOCUMENT':
        return FileText
      case 'VIDEO':
        return Video
      case 'LINK':
        return LinkIcon
      case 'PRESENTATION':
        return Presentation
      case 'IMAGE':
        return Image
      default:
        return File
    }
  }

  const getResourceColor = (type: Resource['type']) => {
    switch (type) {
      case 'DOCUMENT':
        return 'bg-blue-100 text-blue-600'
      case 'VIDEO':
        return 'bg-purple-100 text-purple-600'
      case 'LINK':
        return 'bg-green-100 text-green-600'
      case 'PRESENTATION':
        return 'bg-orange-100 text-orange-600'
      case 'IMAGE':
        return 'bg-pink-100 text-pink-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return null
    const kb = bytes / 1024
    const mb = kb / 1024
    if (mb >= 1) return `${mb.toFixed(2)} MB`
    return `${kb.toFixed(2)} KB`
  }

  const filteredResources = resources.filter(resource => {
    const matchesSearch = 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags.some(t => t.tag.name.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesType = filterType === 'all' || resource.type === filterType

    return matchesSearch && matchesType
  })

  const filteredLessonPlans = lessonPlans.filter(plan =>
    plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.classSubject.subject.name.toLowerCase().includes(searchQuery.toLowerCase())
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
        <h1 className="text-3xl font-bold text-gray-900">Resources & Documents</h1>
        <p className="text-gray-600 mt-1">Access learning materials and lesson plans</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterType('all')}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={filterType === 'DOCUMENT' ? 'default' : 'outline'}
            onClick={() => setFilterType('DOCUMENT')}
            size="sm"
          >
            Documents
          </Button>
          <Button
            variant={filterType === 'VIDEO' ? 'default' : 'outline'}
            onClick={() => setFilterType('VIDEO')}
            size="sm"
          >
            Videos
          </Button>
          <Button
            variant={filterType === 'PRESENTATION' ? 'default' : 'outline'}
            onClick={() => setFilterType('PRESENTATION')}
            size="sm"
          >
            Presentations
          </Button>
        </div>
      </div>

      <Tabs defaultValue="resources" className="w-full">
        <TabsList>
          <TabsTrigger value="resources">Resources ({resources.length})</TabsTrigger>
          <TabsTrigger value="lesson-plans">Lesson Plans ({lessonPlans.length})</TabsTrigger>
        </TabsList>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map((resource) => {
              const Icon = getResourceIcon(resource.type)
              const colorClass = getResourceColor(resource.type)

              return (
                <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base line-clamp-2">{resource.title}</CardTitle>
                        <CardDescription className="mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {resource.type}
                          </Badge>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {resource.description && (
                      <p className="text-sm text-gray-600 line-clamp-3">{resource.description}</p>
                    )}

                    {/* Tags */}
                    {resource.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {resource.tags.map((tagItem) => (
                          <Badge key={tagItem.tag.id} variant="outline" className="text-xs">
                            {tagItem.tag.name}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Subject/Class Info */}
                    {resource.links.length > 0 && resource.links[0].classSubject && (
                      <div className="text-xs text-gray-600">
                        <BookOpen className="h-3 w-3 inline mr-1" />
                        {resource.links[0].classSubject.subject.name} • {resource.links[0].classSubject.class.name}
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                      <span>
                        {resource.owner.firstName} {resource.owner.lastName}
                      </span>
                      {resource.fileSize && (
                        <span>{formatFileSize(resource.fileSize)}</span>
                      )}
                    </div>

                    {/* Action Button */}
                    <Button asChild className="w-full" size="sm">
                      <a href={resource.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Resource
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredResources.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No resources found</h3>
              <p className="text-gray-600">
                {searchQuery || filterType !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'No resources are available yet'}
              </p>
            </div>
          )}
        </TabsContent>

        {/* Lesson Plans Tab */}
        <TabsContent value="lesson-plans" className="space-y-4 mt-6">
          {filteredLessonPlans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      {plan.title}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {plan.classSubject.subject.name} • {plan.classSubject.class.name}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <Badge variant={plan.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                      {plan.status}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-1">
                      {format(new Date(plan.date), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {plan.objectives && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Objectives</h4>
                    <p className="text-sm text-gray-700">{plan.objectives}</p>
                  </div>
                )}

                {plan.materials && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Materials</h4>
                    <p className="text-sm text-gray-700">{plan.materials}</p>
                  </div>
                )}

                {plan.activities && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Activities</h4>
                    <p className="text-sm text-gray-700">{plan.activities}</p>
                  </div>
                )}

                {plan.homework && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">Homework</h4>
                    <p className="text-sm text-blue-800">{plan.homework}</p>
                  </div>
                )}

                {plan.notes && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Notes</h4>
                    <p className="text-sm text-gray-700">{plan.notes}</p>
                  </div>
                )}

                {/* Attachments */}
                {plan.attachments.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Attachments</h4>
                    <div className="space-y-2">
                      {plan.attachments.map((attachment) => (
                        <div 
                          key={attachment.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-600" />
                            <span className="text-sm text-gray-900">{attachment.filename}</span>
                          </div>
                          <Button size="sm" variant="ghost" asChild>
                            <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t text-sm text-gray-600">
                  <span className="font-medium">Teacher:</span> {plan.teacher.firstName} {plan.teacher.lastName}
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredLessonPlans.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No lesson plans found</h3>
              <p className="text-gray-600">
                {searchQuery
                  ? 'Try adjusting your search'
                  : 'No lesson plans have been shared yet'}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
