"use client"

import { useState, useEffect } from 'react'
import { ResourceCard } from '@/components/dashboard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Search, Upload } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function TeacherResourcesPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('ALL')
  const [resources, setResources] = useState<any[]>([])

  useEffect(() => {
    async function fetchResources() {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/dashboard/teacher/resources')
        // const data = await response.json()

        // Mock data
        setResources([
          {
            id: '1',
            title: 'Algebra Worksheet',
            description: 'Practice problems for quadratic equations',
            type: 'DOCUMENT' as const,
            url: '/resources/algebra-worksheet.pdf',
            fileSize: 245000,
            tags: ['Mathematics', 'Grade 10', 'Algebra'],
            author: { name: 'You' }
          },
          {
            id: '2',
            title: 'Physics Lab Video',
            description: 'Demonstration of Newton\'s laws',
            type: 'VIDEO' as const,
            url: 'https://example.com/video',
            fileSize: 15000000,
            tags: ['Physics', 'Grade 11', 'Mechanics'],
            author: { name: 'You' }
          }
        ])
      } catch (error) {
        console.error('Error fetching resources:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchResources()
  }, [])

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'ALL' || resource.type === filterType
    return matchesSearch && matchesType
  })

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-64" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resource Library</h1>
          <p className="text-gray-600 mt-1">Upload and share instructional materials</p>
        </div>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload Resource
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="DOCUMENT">Documents</SelectItem>
            <SelectItem value="VIDEO">Videos</SelectItem>
            <SelectItem value="PRESENTATION">Presentations</SelectItem>
            <SelectItem value="LINK">Links</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map(resource => (
          <ResourceCard key={resource.id} {...resource} />
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Upload className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <p>No resources found</p>
        </div>
      )}
    </div>
  )
}
