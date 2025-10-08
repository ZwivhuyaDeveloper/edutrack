"use client"

import { useState, useEffect, useCallback } from 'react'
import { SettingsLayout, ProfileSection, NotificationSettings, SecuritySettings } from '@/components/settings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Building,
  FileText, 
  Download,
  Save,
  Edit,
  Search,
  Calendar,
  Phone,
  MapPin,
  Camera,
  BarChart3,
  Activity,
  Shield,
  Loader2,
  Briefcase,
  GraduationCap
} from 'lucide-react'
import { toast } from 'sonner'

interface PrincipalProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar: string | null
  principalProfile: {
    employeeId: string | null
    phone: string | null
    address: string | null
    emergencyContact: string | null
    qualifications: string | null
    yearsOfExperience: number | null
    administrativeArea: string | null
    educationBackground: string | null
  } | null
  school: {
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
}

interface AuditLog {
  id: string
  entity: string
  entityId: string
  action: string
  changes?: Record<string, unknown>
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
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<PrincipalProfile | null>(null)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [isEditingSchool, setIsEditingSchool] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingSchool, setIsSavingSchool] = useState(false)
  const [loadingReports, setLoadingReports] = useState(false)
  const [loadingAuditLogs, setLoadingAuditLogs] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('week')
  const [profileFields, setProfileFields] = useState({
    phone: '',
    address: '',
    emergencyContact: '',
    qualifications: '',
    yearsOfExperience: '',
    administrativeArea: '',
    educationBackground: ''
  })
  const [schoolData, setSchoolData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: '',
    email: '',
    website: '',
    logo: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/users/me')
      if (!response.ok) throw new Error('Failed to fetch profile')
      
      const data = await response.json()
      setProfile(data.user)
      
      // Initialize profile fields
      setProfileFields({
        phone: data.user.principalProfile?.phone || '',
        address: data.user.principalProfile?.address || '',
        emergencyContact: data.user.principalProfile?.emergencyContact || '',
        qualifications: data.user.principalProfile?.qualifications || '',
        yearsOfExperience: data.user.principalProfile?.yearsOfExperience?.toString() || '',
        administrativeArea: data.user.principalProfile?.administrativeArea || '',
        educationBackground: data.user.principalProfile?.educationBackground || ''
      })

      // Initialize school data
      if (data.user.school) {
        setSchoolData({
          name: data.user.school.name || '',
          address: data.user.school.address || '',
          city: data.user.school.city || '',
          state: data.user.school.state || '',
          zipCode: data.user.school.zipCode || '',
          country: data.user.school.country || '',
          phone: data.user.school.phone || '',
          email: data.user.school.email || '',
          website: data.user.school.website || '',
          logo: data.user.school.logo || ''
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchReports = useCallback(async () => {
    setLoadingReports(true)
    try {
      const response = await fetch('/api/principal/reports')
      if (response.ok) {
        const data = await response.json()
        setReports(data.reports || [])
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
      toast.error('Failed to load reports')
    } finally {
      setLoadingReports(false)
    }
  }, [])

  const fetchAuditLogs = useCallback(async () => {
    setLoadingAuditLogs(true)
    try {
      const response = await fetch(`/api/principal/audit-logs?period=${dateFilter}`)
      if (response.ok) {
        const data = await response.json()
        setAuditLogs(data.logs || [])
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error)
      toast.error('Failed to load audit logs')
    } finally {
      setLoadingAuditLogs(false)
    }
  }, [dateFilter])

  // Load reports when profile is available
  useEffect(() => {
    if (profile) {
      fetchReports()
    }
  }, [profile, fetchReports])

  // Load audit logs when profile is available or date filter changes
  useEffect(() => {
    if (profile) {
      fetchAuditLogs()
    }
  }, [profile, dateFilter, fetchAuditLogs])

  const handleProfileSave = async () => {
    setIsSavingProfile(true)
    try {
      const response = await fetch('/api/dashboard/principal/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileFields)
      })

      if (!response.ok) throw new Error('Failed to update profile')
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error('Failed to update profile')
      throw error
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleNotificationUpdate = async (settings: Record<string, boolean>) => {
    try {
      const response = await fetch('/api/dashboard/principal/notifications/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (!response.ok) throw new Error('Failed to update notification settings')
    } catch (error) {
      throw error
    }
  }

  const handleSaveSchool = async () => {
    setIsSavingSchool(true)
    try {
      const response = await fetch('/api/principal/school', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schoolData)
      })

      if (response.ok) {
        toast.success('School profile updated successfully')
        setIsEditingSchool(false)
        fetchProfile()
      } else {
        toast.error('Failed to update school profile')
      }
    } catch (error) {
      console.error('Error updating school:', error)
      toast.error('Failed to update school profile')
    } finally {
      setIsSavingSchool(false)
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
        fetchReports()
      } else {
        toast.error('Failed to generate report')
      }
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error('Failed to generate report')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Profile not found</h2>
          <p className="text-gray-600 mt-2">Unable to load your profile</p>
        </div>
      </div>
    )
  }

  const notificationOptions = [
    {
      id: 'assignments',
      label: 'Assignments',
      description: 'Get notified about assignment activities',
      enabled: true
    },
    {
      id: 'attendance',
      label: 'Attendance',
      description: 'Attendance alerts and reports',
      enabled: true
    },
    {
      id: 'fees',
      label: 'Fees & Payments',
      description: 'Financial notifications and payment alerts',
      enabled: true
    },
    {
      id: 'staff',
      label: 'Staff Updates',
      description: 'Teacher and staff-related notifications',
      enabled: true
    },
    {
      id: 'announcements',
      label: 'System Announcements',
      description: 'Important system-wide announcements',
      enabled: true
    },
    {
      id: 'reports',
      label: 'Report Generation',
      description: 'Notifications when reports are ready',
      enabled: true
    },
    {
      id: 'events',
      label: 'Events',
      description: 'School events and calendar reminders',
      enabled: true
    }
  ]

  const SchoolManagementTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>School Profile</CardTitle>
              <CardDescription>Manage your school&apos;s basic information</CardDescription>
            </div>
            <Button
              variant={isEditingSchool ? "default" : "outline"}
              onClick={() => setIsEditingSchool(!isEditingSchool)}
            >
              {isEditingSchool ? <Save className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
              {isEditingSchool ? 'Save Changes' : 'Edit Profile'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {profile.school && (
            <>
              {/* Logo Section */}
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={schoolData.logo} />
                  <AvatarFallback className="text-2xl">
                    {schoolData.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                {isEditingSchool && (
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
                    value={schoolData.name}
                    disabled={!isEditingSchool}
                    onChange={(e) => setSchoolData({...schoolData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Country</label>
                  <Input
                    value={schoolData.country}
                    disabled={!isEditingSchool}
                    onChange={(e) => setSchoolData({...schoolData, country: e.target.value})}
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
                      value={schoolData.address}
                      disabled={!isEditingSchool}
                      placeholder="Enter street address"
                      onChange={(e) => setSchoolData({...schoolData, address: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">City</label>
                    <Input
                      value={schoolData.city}
                      disabled={!isEditingSchool}
                      placeholder="Enter city"
                      onChange={(e) => setSchoolData({...schoolData, city: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">State/Province</label>
                    <Input
                      value={schoolData.state}
                      disabled={!isEditingSchool}
                      placeholder="Enter state"
                      onChange={(e) => setSchoolData({...schoolData, state: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">ZIP/Postal Code</label>
                    <Input
                      value={schoolData.zipCode}
                      disabled={!isEditingSchool}
                      placeholder="Enter ZIP code"
                      onChange={(e) => setSchoolData({...schoolData, zipCode: e.target.value})}
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
                      value={schoolData.phone}
                      disabled={!isEditingSchool}
                      placeholder="Enter phone number"
                      onChange={(e) => setSchoolData({...schoolData, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email Address</label>
                    <Input
                      value={schoolData.email}
                      disabled={!isEditingSchool}
                      placeholder="Enter email address"
                      type="email"
                      onChange={(e) => setSchoolData({...schoolData, email: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">Website</label>
                    <Input
                      value={schoolData.website}
                      disabled={!isEditingSchool}
                      placeholder="https://school-website.com"
                      onChange={(e) => setSchoolData({...schoolData, website: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {isEditingSchool && (
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditingSchool(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveSchool} disabled={isSavingSchool}>
                    {isSavingSchool ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const ReportsTab = () => {
    return (
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
          {loadingReports ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : reports.length > 0 ? (
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
  }

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
            {loadingAuditLogs ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredLogs.length > 0 ? (
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
    <SettingsLayout
      title="Principal Settings"
      description="Manage your profile, school settings, reports, and system logs"
      tabs={[
        {
          value: 'profile',
          label: 'Profile',
          content: (
            <ProfileSection
              firstName={profile.firstName}
              lastName={profile.lastName}
              email={profile.email}
              avatar={profile.avatar}
              fields={[
                {
                  id: 'employeeId',
                  label: 'Employee ID',
                  value: profile.principalProfile?.employeeId || '',
                  disabled: true
                },
                {
                  id: 'phone',
                  label: 'Phone Number',
                  type: 'tel',
                  value: profileFields.phone,
                  icon: Phone,
                  onChange: (value) => setProfileFields({ ...profileFields, phone: value })
                },
                {
                  id: 'administrativeArea',
                  label: 'Administrative Area',
                  value: profileFields.administrativeArea,
                  icon: Briefcase,
                  placeholder: 'e.g., Academic Affairs, Operations',
                  onChange: (value) => setProfileFields({ ...profileFields, administrativeArea: value })
                },
                {
                  id: 'yearsOfExperience',
                  label: 'Years of Experience',
                  type: 'number',
                  value: profileFields.yearsOfExperience,
                  icon: Calendar,
                  onChange: (value) => setProfileFields({ ...profileFields, yearsOfExperience: value })
                },
                {
                  id: 'address',
                  label: 'Address',
                  type: 'textarea',
                  value: profileFields.address,
                  icon: MapPin,
                  onChange: (value) => setProfileFields({ ...profileFields, address: value })
                },
                {
                  id: 'emergencyContact',
                  label: 'Emergency Contact',
                  type: 'textarea',
                  value: profileFields.emergencyContact,
                  icon: Phone,
                  placeholder: 'Name and phone number',
                  onChange: (value) => setProfileFields({ ...profileFields, emergencyContact: value })
                },
                {
                  id: 'educationBackground',
                  label: 'Education Background',
                  type: 'textarea',
                  value: profileFields.educationBackground,
                  icon: GraduationCap,
                  placeholder: 'Degrees, institutions, specializations...',
                  onChange: (value) => setProfileFields({ ...profileFields, educationBackground: value })
                },
                {
                  id: 'qualifications',
                  label: 'Qualifications & Certifications',
                  type: 'textarea',
                  value: profileFields.qualifications,
                  icon: FileText,
                  placeholder: 'Professional certifications, licenses...',
                  onChange: (value) => setProfileFields({ ...profileFields, qualifications: value })
                }
              ]}
              onSave={handleProfileSave}
              isSaving={isSavingProfile}
              onAvatarUpload={() => toast.info('Avatar upload coming soon')}
            />
          )
        },
        {
          value: 'school',
          label: 'School',
          content: <SchoolManagementTab />
        },
        {
          value: 'reports',
          label: 'Reports',
          content: <ReportsTab />
        },
        {
          value: 'audit',
          label: 'Audit Logs',
          content: <AuditTab />
        },
        {
          value: 'notifications',
          label: 'Notifications',
          content: (
            <NotificationSettings
              options={notificationOptions}
              onUpdate={handleNotificationUpdate}
            />
          )
        },
        {
          value: 'security',
          label: 'Security',
          content: <SecuritySettings accountStatus="active" />
        }
      ]}
    />
  )
}
