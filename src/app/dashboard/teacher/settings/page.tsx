"use client"

import { useState, useEffect, useCallback } from 'react'
import { SettingsLayout, ProfileSection, NotificationSettings, SecuritySettings } from '@/components/settings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Phone, 
  Briefcase, 
  Calendar, 
  MapPin, 
  Loader2,
  Users,
  BookOpen,
  ClipboardList,
  BarChart3,
  Download,
  GraduationCap,
  MessageSquare
} from 'lucide-react'
import { toast } from 'sonner'

interface TeacherProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar: string | null
  teacherProfile: {
    employeeId: string | null
    department: string | null
    hireDate: string | null
    qualifications: string | null
    salary: number | null
    phone: string | null
    address: string | null
  } | null
  school: {
    id: string
    name: string
    address?: string
    city?: string
    state?: string
    country: string
    phone?: string
    email?: string
  }
}

interface ClassData {
  id: string
  name: string
  subject: string
  grade: string
  studentCount: number
  schedule: string
}

interface TeacherStats {
  totalStudents: number
  totalClasses: number
  pendingAssignments: number
  averageGrade: number
  attendanceRate: number
}

export default function TeacherSettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<TeacherProfile | null>(null)
  const [classes, setClasses] = useState<ClassData[]>([])
  const [stats, setStats] = useState<TeacherStats | null>(null)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [loadingStats, setLoadingStats] = useState(false)
  const [profileFields, setProfileFields] = useState({
    phone: '',
    department: '',
    employeeId: '',
    hireDate: '',
    qualifications: '',
    address: ''
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
        phone: data.user.teacherProfile?.phone || '',
        department: data.user.teacherProfile?.department || '',
        employeeId: data.user.teacherProfile?.employeeId || '',
        hireDate: data.user.teacherProfile?.hireDate || '',
        qualifications: data.user.teacherProfile?.qualifications || '',
        address: data.user.teacherProfile?.address || ''
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchClasses = useCallback(async () => {
    setLoadingClasses(true)
    try {
      const response = await fetch('/api/teacher/classes')
      if (response.ok) {
        const data = await response.json()
        setClasses(data.classes || [])
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
      toast.error('Failed to load classes')
    } finally {
      setLoadingClasses(false)
    }
  }, [])

  const fetchStats = useCallback(async () => {
    setLoadingStats(true)
    try {
      const response = await fetch('/api/teacher/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast.error('Failed to load statistics')
    } finally {
      setLoadingStats(false)
    }
  }, [])

  // Load classes and stats when profile is available
  useEffect(() => {
    if (profile) {
      fetchClasses()
      fetchStats()
    }
  }, [profile, fetchClasses, fetchStats])

  const handleProfileSave = async () => {
    setIsSavingProfile(true)
    try {
      const response = await fetch('/api/dashboard/teacher/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileFields)
      })

      if (!response.ok) throw new Error('Failed to update profile')
      toast.success('Profile updated successfully')
      await fetchProfile() // Refresh profile data
    } catch (error) {
      toast.error('Failed to update profile')
      throw error
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleNotificationUpdate = async (settings: Record<string, boolean>) => {
    try {
      const response = await fetch('/api/dashboard/teacher/notifications/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (!response.ok) throw new Error('Failed to update notification settings')
    } catch (error) {
      throw error
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
      label: 'Assignment Submissions',
      description: 'Get notified when students submit assignments',
      enabled: true
    },
    {
      id: 'grades',
      label: 'Grade Reminders',
      description: 'Reminders to grade pending assignments',
      enabled: true
    },
    {
      id: 'attendance',
      label: 'Attendance Alerts',
      description: 'Notifications about attendance issues',
      enabled: true
    },
    {
      id: 'messages',
      label: 'Messages',
      description: 'Direct messages from students and parents',
      enabled: true
    },
    {
      id: 'announcements',
      label: 'School Announcements',
      description: 'Important school-wide announcements',
      enabled: true
    },
    {
      id: 'events',
      label: 'Events & Meetings',
      description: 'Upcoming events and meeting reminders',
      enabled: true
    }
  ]

  const ClassesTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Classes</CardTitle>
          <CardDescription>Manage your assigned classes and students</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingClasses ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : classes.length > 0 ? (
            <div className="space-y-4">
              {classes.map((classItem) => (
                <div key={classItem.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{classItem.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {classItem.subject} • Grade {classItem.grade}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {classItem.studentCount} students • {classItem.schedule}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{classItem.studentCount} students</Badge>
                    <Button variant="outline" size="sm">
                      <Users className="h-4 w-4 mr-2" />
                      View Students
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No classes assigned yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )



  return (
    <SettingsLayout
      title="Teacher Settings"
      description="Manage your profile, classes, and teaching preferences"
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
                  value: profileFields.employeeId,
                  disabled: true
                },
                {
                  id: 'department',
                  label: 'Department',
                  value: profileFields.department,
                  icon: Briefcase,
                  placeholder: 'e.g., Mathematics, Science, English',
                  onChange: (value) => setProfileFields({ ...profileFields, department: value })
                },
                {
                  id: 'hireDate',
                  label: 'Hire Date',
                  type: 'date',
                  value: profileFields.hireDate,
                  icon: Calendar,
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
                  id: 'address',
                  label: 'Address',
                  type: 'textarea',
                  value: profileFields.address,
                  icon: MapPin,
                  onChange: (value) => setProfileFields({ ...profileFields, address: value })
                },
                {
                  id: 'qualifications',
                  label: 'Qualifications & Certifications',
                  type: 'textarea',
                  value: profileFields.qualifications,
                  icon: GraduationCap,
                  placeholder: 'Degrees, certifications, specializations, teaching credentials...',
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
          value: 'classes',
          label: 'Classes',
          content: <ClassesTab />
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
