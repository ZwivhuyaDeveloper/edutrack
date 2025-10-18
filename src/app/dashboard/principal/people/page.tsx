"use client"

import { Suspense, useCallback, useEffect, useState } from 'react'
import { PageSkeletonWithTabs } from '@/components/dashboard-skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  DollarSign,
  Eye,
  Download,
  Upload,
  GraduationCap
} from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface UserProfile {
  phone?: string
  address?: string
  employeeId?: string
  department?: string
  qualifications?: string
}

interface UserCount {
  classSubjects?: number
  enrollments?: number
  childRelationships?: number
}

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  avatar?: string
  isActive: boolean
  createdAt: string
  profile?: UserProfile
  _count?: UserCount
}

interface UserStats {
  totalTeachers: number
  totalStudents: number
  totalParents: number
  totalStaff: number
  activeUsers: number
  newThisMonth: number
}

export default function PrincipalPeoplePage() {
  const [activeTab, setActiveTab] = useState('teachers')
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats>({
    totalTeachers: 0,
    totalStudents: 0,
    totalParents: 0,
    totalStaff: 0,
    activeUsers: 0,
    newThisMonth: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  useEffect(() => {
    fetchUsers()
    fetchStats()
  }, [activeTab])

  useEffect(() => {
    filterUsers()
  }, [users, searchQuery, statusFilter])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/principal/users?role=${activeTab.slice(0, -1).toUpperCase()}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/principal/users/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const filterUsers = useCallback(() => {
    let filtered = users

    if (searchQuery) {
      filtered = filtered.filter(user => 
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => 
        statusFilter === 'active' ? user.isActive : !user.isActive
      )
    }

    setFilteredUsers(filtered)
  }, [users, searchQuery, statusFilter])

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return

    try {
      const response = await fetch(`/api/principal/users/${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('User deactivated successfully')
        fetchUsers()
      } else {
        toast.error('Failed to deactivate user')
      }
    } catch (error) {
      console.error('Error deactivating user:', error)
      toast.error('Failed to deactivate user')
    }
  }

  const handleBulkImport = () => {
    // TODO: Implement bulk import functionality
    toast.info('Bulk import feature coming soon')
  }

  const handleExportUsers = () => {
    // TODO: Implement export functionality
    toast.info('Export feature coming soon')
  }

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'teacher': return GraduationCap
      case 'student': return BookOpen
      case 'parent': return Users
      default: return Users
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'teacher': return 'default'
      case 'student': return 'secondary'
      case 'parent': return 'outline'
      default: return 'outline'
    }
  }

  const UserCard = ({ user }: { user: User }) => {
    const Icon = getRoleIcon(user.role)
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={user.avatar} />
                <AvatarFallback>
                  {user.firstName[0]}{user.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">
                  {user.firstName} {user.lastName}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getRoleBadgeColor(user.role)}>
                {user.role}
              </Badge>
              <Badge variant={user.isActive ? 'default' : 'secondary'}>
                {user.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Icon className="h-4 w-4" />
                <span>
                  {user.role === 'TEACHER' && user._count?.classSubjects 
                    ? `${user._count.classSubjects} classes`
                    : user.role === 'STUDENT' && user._count?.enrollments
                    ? `${user._count.enrollments} classes`
                    : user.role === 'PARENT' && user._count?.childRelationships
                    ? `${user._count.childRelationships} children`
                    : 'No assignments'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedUser(user)
                  setIsViewModalOpen(true)
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = `/dashboard/principal/people/${user.id}/edit`}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteUser(user.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const AddUserModal = () => (
    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New {activeTab.slice(0, -1)}</DialogTitle>
          <DialogDescription>
            Create a new {activeTab.slice(0, -1).toLowerCase()} account
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">First Name</label>
              <Input placeholder="Enter first name" />
            </div>
            <div>
              <label className="text-sm font-medium">Last Name</label>
              <Input placeholder="Enter last name" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input type="email" placeholder="Enter email address" />
          </div>
          <div>
            <label className="text-sm font-medium">Phone</label>
            <Input type="tel" placeholder="Enter phone number" />
          </div>
          {activeTab === 'students' && (
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
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast.success('User created successfully')
              setIsAddModalOpen(false)
              fetchUsers()
            }}>
              Create {activeTab.slice(0, -1)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  const ViewUserModal = () => (
    <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
      <DialogContent className="max-w-2xl">
        {selectedUser && (
          <>
            <DialogHeader>
              <DialogTitle>
                {selectedUser.firstName} {selectedUser.lastName}
              </DialogTitle>
              <DialogDescription>
                {selectedUser.role} Profile Details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.avatar} />
                  <AvatarFallback className="text-lg">
                    {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={getRoleBadgeColor(selectedUser.role)}>
                      {selectedUser.role}
                    </Badge>
                    <Badge variant={selectedUser.isActive ? 'default' : 'secondary'}>
                      {selectedUser.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Contact Information</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{selectedUser.email}</span>
                    </div>
                    {selectedUser.profile?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{selectedUser.profile.phone}</span>
                      </div>
                    )}
                    {selectedUser.profile?.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{selectedUser.profile.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Account Details</h4>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="text-muted-foreground">Created: </span>
                      {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status: </span>
                      {selectedUser.isActive ? 'Active' : 'Inactive'}
                    </div>
                    {selectedUser.profile?.employeeId && (
                      <div>
                        <span className="text-muted-foreground">Employee ID: </span>
                        {selectedUser.profile.employeeId}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedUser.role === 'TEACHER' && selectedUser.profile && (
                <div className="space-y-2">
                  <h4 className="font-medium">Teaching Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {selectedUser.profile.department && (
                      <div>
                        <span className="text-muted-foreground">Department: </span>
                        {selectedUser.profile.department}
                      </div>
                    )}
                    {selectedUser.profile.qualifications && (
                      <div>
                        <span className="text-muted-foreground">Qualifications: </span>
                        {selectedUser.profile.qualifications}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setIsViewModalOpen(false)
                  window.location.href = `/dashboard/principal/people/${selectedUser.id}/edit`
                }}>
                  Edit Profile
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="space-y-6">
      <div className='p-5 bg-white rounded-3xl mt-3 gap-2'>
              {/* Header */}
        <div className="flex items-center mb-3 justify-between">
          <div>

          </div>
          {/*
          <div>
            <h1 className="text-3xl font-bold tracking-tight">People Management</h1>
            <p className="text-muted-foreground">
              Manage teachers, students, parents, and staff members
            </p>
          </div>
          */}
          <div className="flex items-center gap-2">
            <Button variant="outline" className='bg-zinc-100 shadow-none border-none hover:bg-zinc-200' onClick={handleBulkImport}>
              <Upload className="h-4 text-primary w-4 mr-2" />
              Bulk Import
            </Button>
            <Button variant="outline" className='bg-zinc-100 shadow-none border-none hover:bg-zinc-200' onClick={handleExportUsers}>
              <Download className="h-4 text-primary w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add {activeTab.slice(0, -1)}
            </Button>
          </div>
        </div>

      {/* Stats Cards */}
      <div className="grid space-x-3 md:grid-cols-2 mb-3 lg:grid-cols-4">
        <Card className='bg-zinc-100 border-none shadow-none'>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teachers</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTeachers}</div>
            <p className="text-xs text-muted-foreground">Active faculty</p>
          </CardContent>
        </Card>

        <Card className='bg-zinc-100 border-none shadow-none'>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Enrolled students</p>
          </CardContent>
        </Card>

        <Card className='bg-zinc-100 border-none shadow-none'>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalParents}</div>
            <p className="text-xs text-muted-foreground">Parent accounts</p>
          </CardContent>
        </Card>

        <Card className='bg-zinc-100 border-none shadow-none'>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newThisMonth}</div>
            <p className="text-xs text-muted-foreground">Recent additions</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className='mb-3 shadow-none border-none bg-zinc-100'>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white shadow-none border-none"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-fit bg-primary text-background border-none shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full shadow-none border-0 grid-cols-4">
          <TabsTrigger className='shadow-none border-none' value="teachers">Teachers</TabsTrigger>
          <TabsTrigger className='shadow-none border-none' value="students">Students</TabsTrigger>
          <TabsTrigger className='shadow-none border-none' value="parents">Parents</TabsTrigger>
          <TabsTrigger className='shadow-none border-none' value="staff">Staff</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 shadow-none border-0">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className='shadow-none border-0'>
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
          ) : filteredUsers.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredUsers.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          ) : (
            <Card className='shadow-none border-dotted bg-zinc-100 border-3 border-zinc-200'>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No {activeTab} found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchQuery 
                    ? `No ${activeTab} match your search criteria.`
                    : `No ${activeTab} have been added yet.`
                  }
                </p>
                <Button onClick={() => setIsAddModalOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add {activeTab.slice(0, -1)}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <AddUserModal />
      <ViewUserModal />
      </div>
    </div>
  )
}
