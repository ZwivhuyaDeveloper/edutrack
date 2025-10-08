"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Settings, 
  Building, 
  FileText, 
  Shield,
  Upload,
  Download,
  Save,
  Edit,
  Eye,
  Search,
  Filter,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Camera,
  BarChart3,
  Activity,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'

interface School {
  id: string
  name: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country: string
  phone?: string
  email?: string
  website?: string
  logo?: string
  isActive: boolean
}

interface AuditLog {
  id: string
  entity: string
  entityId: string
  action: string
  changes?: any
  ipAddress?: string
  userAgent?: string
  createdAt: string
  actor: {
    firstName: string
    lastName: string
    email: string
    role: string
  }
}

interface Report {
  id: string
  name: string
  type: string
  description: string
  generatedAt: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  downloadUrl?: string
}

export default function PrincipalSettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [school, setSchool] = useState<School | null>(null)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('week')

  useEffect(() => {
    fetchData()
  }, [activeTab, dateFilter])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      
      switch (activeTab) {
        case 'profile':
          const schoolRes = await fetch('/api/principal/school')
          if (schoolRes.ok) {
            const schoolData = await schoolRes.json()
            setSchool(schoolData.school)
          }
          break
        case 'reports':
          const reportsRes = await fetch('/api/principal/reports')
          if (reportsRes.ok) {
            const reportsData = await reportsRes.json()
            setReports(reportsData.reports || [])
          }
          break
        case 'audit':
          const auditRes = await fetch(`/api/principal/audit-logs?period=${dateFilter}`)
          if (auditRes.ok) {
            const auditData = await auditRes.json()
            setAuditLogs(auditData.logs || [])
          }
          break
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveSchool = async (schoolData: Partial<School>) => {
    try {
      const response = await fetch('/api/principal/school', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schoolData)
      })

      if (response.ok) {
        toast.success('School profile updated successfully')
        setIsEditing(false)
        fetchData()
      } else {
        toast.error('Failed to update school profile')
      }
    } catch (error) {
      console.error('Error updating school:', error)
      toast.error('Failed to update school profile')
    }
  }

  const handleGenerateReport = async (reportType: string) => {
    try {
      const response = await fetch('/api/principal/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: reportType })
      })

      if (response.ok) {
        toast.success('Report generation started')
        fetchData()
      } else {
        toast.error('Failed to generate report')
      }
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error('Failed to generate report')
    }
  }

  const SchoolProfileTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>School Profile</CardTitle>
              <CardDescription>Manage your school's basic information</CardDescription>
            </div>
            <Button
              variant={isEditing ? "default" : "outline"}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
              {isEditing ? 'Save Changes' : 'Edit Profile'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {school && (
            <>
              {/* Logo Section */}
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={school.logo} />
                  <AvatarFallback className="text-2xl">
                    {school.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <div>
                    <Button variant="outline" size="sm">
                      <Camera className="h-4 w-4 mr-2" />
                      Upload Logo
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommended: 200x200px, PNG or JPG
                    </p>
                  </div>
                )}
              </div>

              {/* Basic Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">School Name</label>
                  <Input
                    value={school.name}
                    disabled={!isEditing}
                    onChange={(e) => setSchool({...school, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Country</label>
                  <Input
                    value={school.country}
                    disabled={!isEditing}
                    onChange={(e) => setSchool({...school, country: e.target.value})}
                  />
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Address Information
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">Street Address</label>
                    <Input
                      value={school.address || ''}
                      disabled={!isEditing}
                      placeholder="Enter street address"
                      onChange={(e) => setSchool({...school, address: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">City</label>
                    <Input
                      value={school.city || ''}
                      disabled={!isEditing}
                      placeholder="Enter city"
                      onChange={(e) => setSchool({...school, city: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">State/Province</label>
                    <Input
                      value={school.state || ''}
                      disabled={!isEditing}
                      placeholder="Enter state"
                      onChange={(e) => setSchool({...school, state: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">ZIP/Postal Code</label>
                    <Input
                      value={school.zipCode || ''}
                      disabled={!isEditing}
                      placeholder="Enter ZIP code"
                      onChange={(e) => setSchool({...school, zipCode: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Phone Number</label>
                    <Input
                      value={school.phone || ''}
                      disabled={!isEditing}
                      placeholder="Enter phone number"
                      onChange={(e) => setSchool({...school, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email Address</label>
                    <Input
                      value={school.email || ''}
                      disabled={!isEditing}
                      placeholder="Enter email address"
                      type="email"
                      onChange={(e) => setSchool({...school, email: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">Website</label>
                    <Input
                      value={school.website || ''}
                      disabled={!isEditing}
                      placeholder="https://school-website.com"
                      onChange={(e) => setSchool({...school, website: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => handleSaveSchool(school)}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const ReportsTab = () => (
    <div className="space-y-6">
      {/* Generate Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Reports</CardTitle>
          <CardDescription>Create comprehensive reports for your school</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { type: 'academic', name: 'Academic Report', desc: 'Student performance and grades' },
              { type: 'attendance', name: 'Attendance Report', desc: 'Attendance statistics and trends' },
              { type: 'financial', name: 'Financial Report', desc: 'Fee collection and revenue' },
              { type: 'enrollment', name: 'Enrollment Report', desc: 'Student enrollment data' },
              { type: 'teacher', name: 'Teacher Report', desc: 'Staff performance and workload' },
              { type: 'custom', name: 'Custom Report', desc: 'Build your own report' }
            ].map((report) => (
              <Card key={report.type} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{report.name}</CardTitle>
                  <CardDescription className="text-sm">{report.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full" 
                    onClick={() => handleGenerateReport(report.type)}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Generate
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Previously generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length > 0 ? (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{report.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {report.description} • Generated: {new Date(report.generatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      report.status === 'COMPLETED' ? 'default' :
                      report.status === 'PENDING' ? 'secondary' : 'destructive'
                    }>
                      {report.status}
                    </Badge>
                    {report.status === 'COMPLETED' && report.downloadUrl && (
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No reports generated yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const AuditTab = () => {
    const filteredLogs = auditLogs.filter(log => {
      let matches = true

      if (searchQuery) {
        matches = matches && (
          log.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
          `${log.actor.firstName} ${log.actor.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }

      if (actionFilter !== 'all') {
        matches = matches && log.action === actionFilter
      }

      return matches
    })

    return (
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search audit logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="CREATE">Create</SelectItem>
                  <SelectItem value="UPDATE">Update</SelectItem>
                  <SelectItem value="DELETE">Delete</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs */}
        <Card>
          <CardHeader>
            <CardTitle>System Audit Logs</CardTitle>
            <CardDescription>
              Track all system activities and changes ({filteredLogs.length} entries)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredLogs.length > 0 ? (
              <div className="space-y-4">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="flex items-start justify-between p-3 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <Activity className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">
                          {log.actor.firstName} {log.actor.lastName} {log.action.toLowerCase()}d {log.entity}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {log.actor.email} • {log.actor.role}
                        </div>
                        {log.ipAddress && (
                          <div className="text-xs text-muted-foreground">
                            IP: {log.ipAddress}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        log.action === 'CREATE' ? 'default' :
                        log.action === 'UPDATE' ? 'secondary' : 'destructive'
                      }>
                        {log.action}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Shield className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No audit logs found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">School Settings</h1>
          <p className="text-muted-foreground">
            Manage school profile, generate reports, and view system logs
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">School Profile</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          {isLoading ? (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="h-24 w-24 bg-muted animate-pulse rounded-full" />
                  <div className="space-y-2">
                    <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <SchoolProfileTab />
          )}
        </TabsContent>

        <TabsContent value="reports">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-48 bg-muted animate-pulse rounded" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <ReportsTab />
          )}
        </TabsContent>

        <TabsContent value="audit">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
                        <div className="space-y-2">
                          <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                          <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                        </div>
                      </div>
                      <div className="h-6 w-16 bg-muted animate-pulse rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <AuditTab />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
