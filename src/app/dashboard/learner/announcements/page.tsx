"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Bell, 
  Search,
  Loader2,
  AlertCircle,
  Info,
  AlertTriangle,
  Megaphone
} from 'lucide-react'
import { format } from 'date-fns'

interface Announcement {
  id: string
  title: string
  content: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  scope: 'SCHOOL' | 'CLASS' | 'SUBJECT' | 'USER'
  publishedAt: string | null
  createdAt: string
  school: {
    name: string
  }
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPriority, setFilterPriority] = useState<string>('all')

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const response = await fetch('/api/dashboard/student/announcements')
        if (!response.ok) throw new Error('Failed to fetch announcements')
        const data = await response.json()
        setAnnouncements(data)
      } catch (error) {
        console.error('Error fetching announcements:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnnouncements()
  }, [])

  const getPriorityConfig = (priority: Announcement['priority']) => {
    switch (priority) {
      case 'urgent':
        return {
          icon: AlertCircle,
          color: 'bg-red-100 text-red-800 border-red-200',
          label: 'Urgent'
        }
      case 'high':
        return {
          icon: AlertTriangle,
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          label: 'High'
        }
      case 'normal':
        return {
          icon: Info,
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          label: 'Normal'
        }
      case 'low':
        return {
          icon: Info,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          label: 'Low'
        }
    }
  }

  const getScopeLabel = (scope: Announcement['scope']) => {
    switch (scope) {
      case 'SCHOOL':
        return 'School-wide'
      case 'CLASS':
        return 'Class'
      case 'SUBJECT':
        return 'Subject'
      case 'USER':
        return 'Personal'
    }
  }

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = 
      announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesPriority = filterPriority === 'all' || announcement.priority === filterPriority

    return matchesSearch && matchesPriority
  })

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
        <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
        <p className="text-gray-600 mt-1">Stay updated with school and class announcements</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search announcements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilterPriority('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterPriority === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterPriority('urgent')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterPriority === 'urgent'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Urgent
          </button>
          <button
            onClick={() => setFilterPriority('high')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterPriority === 'high'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            High
          </button>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.map((announcement) => {
          const priorityConfig = getPriorityConfig(announcement.priority)
          const PriorityIcon = priorityConfig.icon

          return (
            <Card 
              key={announcement.id}
              className={`hover:shadow-lg transition-shadow ${
                announcement.priority === 'urgent' ? 'border-red-300 border-2' :
                announcement.priority === 'high' ? 'border-orange-300 border-2' : ''
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      announcement.priority === 'urgent' ? 'bg-red-100' :
                      announcement.priority === 'high' ? 'bg-orange-100' :
                      'bg-blue-100'
                    }`}>
                      <Megaphone className={`h-5 w-5 ${
                        announcement.priority === 'urgent' ? 'text-red-600' :
                        announcement.priority === 'high' ? 'text-orange-600' :
                        'text-blue-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{announcement.title}</CardTitle>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`${priorityConfig.color} border`} variant="secondary">
                          <PriorityIcon className="h-3 w-3 mr-1" />
                          {priorityConfig.label}
                        </Badge>
                        <Badge variant="outline">
                          {getScopeLabel(announcement.scope)}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {format(
                            new Date(announcement.publishedAt || announcement.createdAt),
                            'MMM d, yyyy • h:mm a'
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">From:</span> {announcement.school.name}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredAnnouncements.length === 0 && (
        <div className="text-center py-12">
          <Bell className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No announcements found</h3>
          <p className="text-gray-600">
            {searchQuery || filterPriority !== 'all'
              ? 'Try adjusting your filters'
              : 'There are no announcements at this time'}
          </p>
        </div>
      )}
    </div>
  )
}
