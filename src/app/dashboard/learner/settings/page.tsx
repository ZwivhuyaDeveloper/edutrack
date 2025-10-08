"use client"

import { useState, useEffect } from 'react'
import { SettingsLayout, ProfileSection, NotificationSettings, SecuritySettings } from '@/components/settings'
import { Phone, MapPin, Calendar, AlertCircle, Loader2, GraduationCap } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface StudentProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar: string | null
  studentProfile: {
    dateOfBirth: string | null
    grade: string | null
    studentIdNumber: string | null
    emergencyContact: string | null
    medicalInfo: string | null
    address: string | null
  } | null
}

export default function LearnerSettingsPage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [profileFields, setProfileFields] = useState({
    dateOfBirth: '',
    grade: '',
    studentIdNumber: '',
    address: '',
    emergencyContact: '',
    medicalInfo: ''
  })

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch('/api/users/me')
        if (!response.ok) throw new Error('Failed to fetch profile')
        
        const data = await response.json()
        setProfile(data.user)
        
        // Initialize profile fields
        setProfileFields({
          dateOfBirth: data.user.studentProfile?.dateOfBirth 
            ? format(new Date(data.user.studentProfile.dateOfBirth), 'yyyy-MM-dd') 
            : '',
          grade: data.user.studentProfile?.grade || '',
          studentIdNumber: data.user.studentProfile?.studentIdNumber || '',
          address: data.user.studentProfile?.address || '',
          emergencyContact: data.user.studentProfile?.emergencyContact || '',
          medicalInfo: data.user.studentProfile?.medicalInfo || ''
        })
      } catch (error) {
        console.error('Error fetching profile:', error)
        toast.error('Failed to load profile')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleProfileSave = async () => {
    try {
      const response = await fetch('/api/dashboard/student/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileFields)
      })

      if (!response.ok) throw new Error('Failed to update profile')
    } catch (error) {
      throw error
    }
  }

  const handleNotificationUpdate = async (settings: Record<string, boolean>) => {
    try {
      const response = await fetch('/api/dashboard/student/notifications/settings', {
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
      label: 'Assignments',
      description: 'Get notified about new assignments and due dates',
      enabled: true
    },
    {
      id: 'grades',
      label: 'Grades',
      description: 'Receive notifications when new grades are posted',
      enabled: true
    },
    {
      id: 'attendance',
      label: 'Attendance',
      description: 'Get alerts about attendance records',
      enabled: true
    },
    {
      id: 'fees',
      label: 'Fees & Payments',
      description: 'Notifications about invoices and payment reminders',
      enabled: true
    },
    {
      id: 'announcements',
      label: 'Announcements',
      description: 'School and class announcements',
      enabled: true
    },
    {
      id: 'messages',
      label: 'Messages',
      description: 'Direct messages from teachers and classmates',
      enabled: true
    },
    {
      id: 'events',
      label: 'Events',
      description: 'Upcoming events and calendar reminders',
      enabled: true
    }
  ]

  return (
    <SettingsLayout
      title="Profile & Settings"
      description="Manage your personal information and preferences"
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
                  id: 'studentIdNumber',
                  label: 'Student ID',
                  value: profileFields.studentIdNumber,
                  disabled: true
                },
                {
                  id: 'grade',
                  label: 'Grade',
                  value: profileFields.grade,
                  icon: GraduationCap,
                  disabled: true
                },
                {
                  id: 'dateOfBirth',
                  label: 'Date of Birth',
                  type: 'date',
                  value: profileFields.dateOfBirth,
                  icon: Calendar,
                  onChange: (value) => setProfileFields({ ...profileFields, dateOfBirth: value })
                },
                {
                  id: 'address',
                  label: 'Address',
                  type: 'textarea',
                  value: profileFields.address,
                  icon: MapPin,
                  placeholder: 'Enter your home address',
                  onChange: (value) => setProfileFields({ ...profileFields, address: value })
                },
                {
                  id: 'emergencyContact',
                  label: 'Emergency Contact',
                  value: profileFields.emergencyContact,
                  icon: Phone,
                  placeholder: 'Name and phone number',
                  onChange: (value) => setProfileFields({ ...profileFields, emergencyContact: value })
                },
                {
                  id: 'medicalInfo',
                  label: 'Medical Information',
                  type: 'textarea',
                  value: profileFields.medicalInfo,
                  icon: AlertCircle,
                  placeholder: 'Allergies, medications, conditions, etc.',
                  onChange: (value) => setProfileFields({ ...profileFields, medicalInfo: value })
                }
              ]}
              onSave={handleProfileSave}
              onAvatarUpload={() => toast.info('Avatar upload coming soon')}
            />
          )
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
