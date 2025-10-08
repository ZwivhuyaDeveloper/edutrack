"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  MessageSquare, 
  Send, 
  Plus, 
  Search, 
  Filter,
  Bell,
  Users,
  Mail,
  Phone,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Reply,
  Forward,
  Archive,
  Star,
  AlertCircle,
  CheckCircle,
  Clock,
  Megaphone,
  UserPlus,
  FileText
} from 'lucide-react'
import { toast } from 'sonner'

interface Message {
  id: string
  content: string
  status: 'SENT' | 'DELIVERED' | 'READ'
  sentAt: string
  sender: {
    firstName: string
    lastName: string
    avatar?: string
    role: string
  }
  recipient?: {
    firstName: string
    lastName: string
    avatar?: string
    role: string
  }
  conversation: {
    id: string
    title?: string
    isGroup: boolean
  }
}

interface Announcement {
  id: string
  title: string
  content: string
  scope: 'SCHOOL' | 'CLASS' | 'SUBJECT' | 'USER'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  publishedAt?: string
  expiresAt?: string
  createdAt: string
}

interface Notification {
  id: string
  title: string
  content: string
  type: 'ASSIGNMENT' | 'GRADE' | 'ATTENDANCE' | 'FEE' | 'ANNOUNCEMENT' | 'MESSAGE' | 'EVENT' | 'SYSTEM'
  isRead: boolean
  createdAt: string
  data?: any
}

interface CommunicationStats {
  totalMessages: number
  unreadMessages: number
  totalAnnouncements: number
  activeNotifications: number
  responseRate: number
  engagementRate: number
}

export default function PrincipalCommunicationPage() {
  const [activeTab, setActiveTab] = useState('messages')
  const [messages, setMessages] = useState<Message[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState<CommunicationStats>({
    totalMessages: 0,
    unreadMessages: 0,
    totalAnnouncements: 0,
    activeNotifications: 0,
    responseRate: 0,
    engagementRate: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false)
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  useEffect(() => {
    fetchData()
    fetchStats()
  }, [activeTab])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      let endpoint = ''
      
      switch (activeTab) {
        case 'messages':
          endpoint = '/api/principal/messages'
          break
        case 'announcements':
          endpoint = '/api/principal/announcements'
          break
        case 'notifications':
          endpoint = '/api/principal/notifications'
          break
      }

      const response = await fetch(endpoint)
      if (response.ok) {
        const data = await response.json()
        
        switch (activeTab) {
          case 'messages':
            setMessages(data.messages || [])
            break
          case 'announcements':
            setAnnouncements(data.announcements || [])
            break
          case 'notifications':
            setNotifications(data.notifications || [])
            break
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/principal/communication/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleSendMessage = async (messageData: any) => {
    try {
      const response = await fetch('/api/principal/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      })

      if (response.ok) {
        toast.success('Message sent successfully')
        setIsComposeModalOpen(false)
        fetchData()
      } else {
        toast.error('Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    }
  }

  const handleCreateAnnouncement = async (announcementData: any) => {
    try {
      const response = await fetch('/api/principal/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcementData)
      })

      if (response.ok) {
        toast.success('Announcement created successfully')
        setIsAnnouncementModalOpen(false)
        fetchData()
      } else {
        toast.error('Failed to create announcement')
      }
    } catch (error) {
      console.error('Error creating announcement:', error)
      toast.error('Failed to create announcement')
    }
  }

  const MessageCard = ({ message }: { message: Message }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={message.sender.avatar} />
              <AvatarFallback>
                {message.sender.firstName[0]}{message.sender.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">
                {message.sender.firstName} {message.sender.lastName}
              </div>
              <div className="text-sm text-muted-foreground">
                {message.recipient 
                  ? `To: ${message.recipient.firstName} ${message.recipient.lastName}`
                  : message.conversation.isGroup 
                    ? `Group: ${message.conversation.title || 'Untitled'}`
                    : 'Direct message'
                }
              </div>
            </div>
          </div>
          <div className="text-right">
            <Badge variant={
              message.status === 'READ' ? 'default' : 
              message.status === 'delivered' ? 'secondary' : 'outline'
            }>
              {message.status}
            </Badge>
            <div className="text-xs text-muted-foreground mt-1">
              {new Date(message.sentAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm line-clamp-2">{message.content}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedItem(message)
                setIsViewModalOpen(true)
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // TODO: Implement reply functionality
                toast.info('Reply feature coming soon')
              }}
            >
              <Reply className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // TODO: Implement forward functionality
                toast.info('Forward feature coming soon')
              }}
            >
              <Forward className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = `/dashboard/principal/communication/messages/${message.conversation.id}`}
          >
            View Conversation
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const AnnouncementCard = ({ announcement }: { announcement: Announcement }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{announcement.title}</CardTitle>
            <CardDescription>
              {announcement.scope} announcement
            </CardDescription>
          </div>
          <div className="text-right">
            <Badge variant={
              announcement.priority === 'urgent' ? 'destructive' :
              announcement.priority === 'high' ? 'secondary' :
              announcement.priority === 'normal' ? 'default' : 'outline'
            }>
              {announcement.priority}
            </Badge>
            {announcement.publishedAt && (
              <div className="text-xs text-muted-foreground mt-1">
                Published: {new Date(announcement.publishedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm line-clamp-3">{announcement.content}</p>
        
        {announcement.expiresAt && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Expires: {new Date(announcement.expiresAt).toLocaleDateString()}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedItem(announcement)
                setIsViewModalOpen(true)
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = `/dashboard/principal/communication/announcements/${announcement.id}/edit`}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // TODO: Implement delete functionality
                toast.info('Delete feature coming soon')
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = `/dashboard/principal/communication/announcements/${announcement.id}`}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const NotificationCard = ({ notification }: { notification: Notification }) => {
    const getTypeIcon = (type: string) => {
      switch (type) {
        case 'ASSIGNMENT': return FileText
        case 'GRADE': return CheckCircle
        case 'ATTENDANCE': return Users
        case 'FEE': return AlertCircle
        case 'ANNOUNCEMENT': return Megaphone
        case 'MESSAGE': return MessageSquare
        case 'EVENT': return Calendar
        default: return Bell
      }
    }

    const Icon = getTypeIcon(notification.type)

    return (
      <Card className={`hover:shadow-md transition-shadow ${!notification.isRead ? 'border-blue-200 bg-blue-50' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${!notification.isRead ? 'bg-blue-100' : 'bg-muted'}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <div className="font-medium">{notification.title}</div>
                <div className="text-sm text-muted-foreground">
                  {notification.type} notification
                </div>
              </div>
            </div>
            <div className="text-right">
              {!notification.isRead && (
                <Badge variant="default" className="mb-1">New</Badge>
              )}
              <div className="text-xs text-muted-foreground">
                {new Date(notification.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm line-clamp-2">{notification.content}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedItem(notification)
                  setIsViewModalOpen(true)
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>
              {!notification.isRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    try {
                      await fetch(`/api/principal/notifications/${notification.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ isRead: true })
                      })
                      fetchData()
                    } catch (error) {
                      toast.error('Failed to mark as read')
                    }
                  }}
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const ComposeMessageModal = () => (
    <Dialog open={isComposeModalOpen} onOpenChange={setIsComposeModalOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Compose Message</DialogTitle>
          <DialogDescription>
            Send a message to teachers, students, or parents
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Recipients</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select recipients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-teachers">All Teachers</SelectItem>
                <SelectItem value="all-students">All Students</SelectItem>
                <SelectItem value="all-parents">All Parents</SelectItem>
                <SelectItem value="grade-1">Grade 1 Students & Parents</SelectItem>
                <SelectItem value="custom">Custom Selection</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium">Subject</label>
            <Input placeholder="Enter message subject" />
          </div>
          
          <div>
            <label className="text-sm font-medium">Message</label>
            <Textarea 
              placeholder="Type your message here..."
              className="min-h-32"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsComposeModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast.success('Message sent successfully')
              setIsComposeModalOpen(false)
              fetchData()
            }}>
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  const CreateAnnouncementModal = () => (
    <Dialog open={isAnnouncementModalOpen} onOpenChange={setIsAnnouncementModalOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Announcement</DialogTitle>
          <DialogDescription>
            Create a new announcement for your school community
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input placeholder="Enter announcement title" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Scope</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SCHOOL">Entire School</SelectItem>
                  <SelectItem value="CLASS">Specific Class</SelectItem>
                  <SelectItem value="SUBJECT">Subject Teachers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Priority</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Content</label>
            <Textarea 
              placeholder="Enter announcement content..."
              className="min-h-32"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Expiry Date (Optional)</label>
            <Input type="datetime-local" />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAnnouncementModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast.success('Announcement created successfully')
              setIsAnnouncementModalOpen(false)
              fetchData()
            }}>
              <Megaphone className="h-4 w-4 mr-2" />
              Create Announcement
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Communication Center</h1>
          <p className="text-muted-foreground">
            Manage messages, announcements, and notifications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsComposeModalOpen(true)}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Compose Message
          </Button>
          <Button onClick={() => setIsAnnouncementModalOpen(true)}>
            <Megaphone className="h-4 w-4 mr-2" />
            New Announcement
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMessages}</div>
            <p className="text-xs text-muted-foreground">All conversations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unreadMessages}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Announcements</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAnnouncements}</div>
            <p className="text-xs text-muted-foreground">Active announcements</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeNotifications}</div>
            <p className="text-xs text-muted-foreground">System notifications</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search communications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="space-y-4">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-muted animate-pulse rounded-full" />
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : messages.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {messages.map((message) => (
                <MessageCard key={message.id} message={message} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No messages found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Start a conversation with your school community.
                </p>
                <Button onClick={() => setIsComposeModalOpen(true)}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Compose Message
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="announcements" className="space-y-4">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="h-4 w-40 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : announcements.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {announcements.map((announcement) => (
                <AnnouncementCard key={announcement.id} announcement={announcement} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No announcements found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first announcement to communicate with your school.
                </p>
                <Button onClick={() => setIsAnnouncementModalOpen(true)}>
                  <Megaphone className="h-4 w-4 mr-2" />
                  Create Announcement
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
                      <div className="space-y-2">
                        <div className="h-4 w-40 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <NotificationCard key={notification.id} notification={notification} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                <p className="text-muted-foreground text-center">
                  System notifications will appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <ComposeMessageModal />
      <CreateAnnouncementModal />
    </div>
  )
}
