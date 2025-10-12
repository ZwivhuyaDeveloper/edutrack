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
  GraduationCap,
  X,
  Mail,
  Globe,
  CheckCircle2
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
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

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
      toast.success('Profile updated successfully', {
        description: 'Your profile information has been saved.'
      })
      await fetchProfile() // Refresh profile data
    } catch (error) {
      toast.error('Failed to update profile', {
        description: 'Please try again or contact support.'
      })
      throw error
    } finally {
      setIsSavingProfile(false)
    }
  }

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB')
      return
    }

    setUploadingAvatar(true)
    try {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64String = reader.result as string
        setAvatarPreview(base64String)
        
        // Update avatar via API
        const response = await fetch('/api/users/me', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatar: base64String })
        })

        if (response.ok) {
          toast.success('Avatar updated successfully')
          await fetchProfile()
        } else {
          toast.error('Failed to update avatar')
        }
        setUploadingAvatar(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast.error('Failed to upload avatar')
      setUploadingAvatar(false)
    }
  }

  // Handle school logo upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB')
      return
    }

    setUploadingLogo(true)
    try {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setLogoPreview(base64String)
        setSchoolData(prev => ({ ...prev, logo: base64String }))
        toast.success('Logo uploaded successfully')
        setUploadingLogo(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading logo:', error)
      toast.error('Failed to upload logo')
      setUploadingLogo(false)
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
    if (!profile?.school?.id) {
      toast.error('School ID not found')
      return
    }

    setIsSavingSchool(true)
    try {
      const response = await fetch(`/api/schools/${profile.school.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: schoolData.name,
          address: schoolData.address || null,
          city: schoolData.city || null,
          state: schoolData.state || null,
          zipCode: schoolData.zipCode || null,
          country: schoolData.country,
          phone: schoolData.phone || null,
          email: schoolData.email || null,
          website: schoolData.website || null,
          logo: schoolData.logo || null
        })
      })

      if (response.ok) {
        toast.success('School profile updated successfully', {
          description: 'All changes have been saved to the database.'
        })
        setIsEditingSchool(false)
        setLogoPreview(null)
        await fetchProfile()
      } else {
        const errorData = await response.json()
        toast.error('Failed to update school profile', {
          description: errorData.error || 'Please try again.'
        })
      }
    } catch (error) {
      console.error('Error updating school:', error)
      toast.error('Failed to update school profile', {
        description: 'Network error. Please check your connection.'
      })
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
      <Card className="border-2">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Building className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">School Profile</CardTitle>
                <CardDescription>Manage your school&apos;s information and branding</CardDescription>
              </div>
            </div>
            {!isEditingSchool && (
              <Button
                variant="outline"
                onClick={() => setIsEditingSchool(true)}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          {profile.school && (
            <>
              {/* Logo Section */}
              <div className="flex items-start gap-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed">
                <Avatar className="h-28 w-28 border-4 border-white shadow-lg">
                  <AvatarImage src={logoPreview || schoolData.logo} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                    {schoolData.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-semibold text-lg mb-2">School Logo</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Upload your school&apos;s logo. This will appear on documents, reports, and your school profile.
                  </p>
                  {isEditingSchool && (
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        id="logo-upload"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        aria-label="Upload school logo"
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => document.getElementById('logo-upload')?.click()}
                        disabled={uploadingLogo}
                      >
                        {uploadingLogo ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Camera className="h-4 w-4 mr-2" />
                            Upload Logo
                          </>
                        )}
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        PNG, JPG (max 2MB, 200x200px recommended)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Basic Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Building className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      School Name *
                    </label>
                    <Input
                      value={schoolData.name}
                      disabled={!isEditingSchool}
                      onChange={(e) => setSchoolData({...schoolData, name: e.target.value})}
                      className="font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Country</label>
                    <Input
                      value={schoolData.country}
                      disabled={!isEditingSchool}
                      onChange={(e) => setSchoolData({...schoolData, country: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Address Information
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium">Street Address</label>
                    <Input
                      value={schoolData.address}
                      disabled={!isEditingSchool}
                      placeholder={schoolData.address || "Enter street address"}
                      onChange={(e) => setSchoolData({...schoolData, address: e.target.value})}
                    />
                    {isEditingSchool && profile.school?.address && (
                      <p className="text-xs text-muted-foreground">Current: {profile.school.address}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">City</label>
                    <Input
                      value={schoolData.city}
                      disabled={!isEditingSchool}
                      placeholder={schoolData.city || "Enter city"}
                      onChange={(e) => setSchoolData({...schoolData, city: e.target.value})}
                    />
                    {isEditingSchool && profile.school?.city && (
                      <p className="text-xs text-muted-foreground">Current: {profile.school.city}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">State/Province</label>
                    <Input
                      value={schoolData.state}
                      disabled={!isEditingSchool}
                      placeholder={schoolData.state || "Enter state"}
                      onChange={(e) => setSchoolData({...schoolData, state: e.target.value})}
                    />
                    {isEditingSchool && profile.school?.state && (
                      <p className="text-xs text-muted-foreground">Current: {profile.school.state}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">ZIP/Postal Code</label>
                    <Input
                      value={schoolData.zipCode}
                      disabled={!isEditingSchool}
                      placeholder={schoolData.zipCode || "Enter ZIP code"}
                      onChange={(e) => setSchoolData({...schoolData, zipCode: e.target.value})}
                    />
                    {isEditingSchool && profile.school?.zipCode && (
                      <p className="text-xs text-muted-foreground">Current: {profile.school.zipCode}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Contact Information</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      Phone Number
                    </label>
                    <Input
                      value={schoolData.phone}
                      disabled={!isEditingSchool}
                      placeholder={schoolData.phone || "+1 (555) 123-4567"}
                      onChange={(e) => setSchoolData({...schoolData, phone: e.target.value})}
                    />
                    {isEditingSchool && profile.school?.phone && (
                      <p className="text-xs text-muted-foreground">Current: {profile.school.phone}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      Email Address
                    </label>
                    <Input
                      value={schoolData.email}
                      disabled={!isEditingSchool}
                      placeholder={schoolData.email || "contact@school.edu"}
                      type="email"
                      onChange={(e) => setSchoolData({...schoolData, email: e.target.value})}
                    />
                    {isEditingSchool && profile.school?.email && (
                      <p className="text-xs text-muted-foreground">Current: {profile.school.email}</p>
                    )}
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      Website
                    </label>
                    <Input
                      value={schoolData.website}
                      disabled={!isEditingSchool}
                      placeholder={schoolData.website || "https://school-website.com"}
                      onChange={(e) => setSchoolData({...schoolData, website: e.target.value})}
                    />
                    {isEditingSchool && profile.school?.website && (
                      <p className="text-xs text-muted-foreground">Current: {profile.school.website}</p>
                    )}
                  </div>
                </div>
              </div>

              {isEditingSchool && (
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditingSchool(false)
                      setLogoPreview(null)
                      fetchProfile() // Reset to original data
                    }}
                    disabled={isSavingSchool}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveSchool} 
                    disabled={isSavingSchool}
                    className="min-w-[140px]"
                  >
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
              onAvatarUpload={() => document.getElementById('avatar-upload')?.click()}
              avatarUploadElement={
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  aria-label="Upload avatar"
                />
              }
              uploadingAvatar={uploadingAvatar}
              avatarPreview={avatarPreview}
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
