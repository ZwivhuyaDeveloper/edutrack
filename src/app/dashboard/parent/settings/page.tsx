"use client"

import { useState, useEffect } from 'react'
import { SettingsLayout, ProfileSection, NotificationSettings, SecuritySettings } from '@/components/settings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Phone, MapPin, Users, Loader2, UserPlus, Eye } from 'lucide-react'
import { toast } from 'sonner'

interface Child {
  id: string
  firstName: string
  lastName: string
  email: string
  grade: string | null
  studentIdNumber: string | null
  relationship: string
}

interface ParentProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar: string | null
  parentProfile: {
    phone: string | null
    address: string | null
    emergencyContact: string | null
  } | null
}

export default function ParentSettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<ParentProfile | null>(null)
  const [children, setChildren] = useState<Child[]>([])
  const [profileFields, setProfileFields] = useState({
    phone: '',
    address: '',
    emergencyContact: ''
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const profileResponse = await fetch('/api/users/me')
        if (!profileResponse.ok) throw new Error('Failed to fetch profile')
        
        const profileData = await profileResponse.json()
        setProfile(profileData.user)
        
        setProfileFields({
          phone: profileData.user.parentProfile?.phone || '',
          address: profileData.user.parentProfile?.address || '',
          emergencyContact: profileData.user.parentProfile?.emergencyContact || ''
        })

        const childrenResponse = await fetch('/api/dashboard/parent/children')
        if (childrenResponse.ok) {
          const childrenData = await childrenResponse.json()
          setChildren(childrenData.children || [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to load profile')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleProfileSave = async () => {
    try {
      const response = await fetch('/api/dashboard/parent/profile', {
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
      const response = await fetch('/api/dashboard/parent/notifications/settings', {
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
      description: 'Get notified about your children\'s assignments',
      enabled: true
    },
    {
      id: 'grades',
      label: 'Grades',
      description: 'Receive notifications when grades are posted',
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
      label: 'School Announcements',
      description: 'Important school-wide announcements',
      enabled: true
    },
    {
      id: 'messages',
      label: 'Messages',
      description: 'Direct messages from teachers and school staff',
      enabled: true
    },
    {
      id: 'events',
      label: 'Events',
      description: 'Upcoming events and calendar reminders',
      enabled: true
    }
  ]

  const ChildrenManagementTab = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Children & Dependents
            </CardTitle>
            <CardDescription>Manage your children&apos;s profiles and access</CardDescription>
          </div>
          <Button onClick={() => toast.info('Add child feature coming soon')}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Child
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {children.length > 0 ? (
          <div className="space-y-4">
            {children.map((child) => (
              <div key={child.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">
                      {child.firstName[0]}{child.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">
                      {child.firstName} {child.lastName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {child.studentIdNumber && `ID: ${child.studentIdNumber}`}
                      {child.grade && ` • Grade ${child.grade}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{child.relationship}</Badge>
                  <Button variant="outline" size="sm" onClick={() => toast.info('View child profile coming soon')}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Profile
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No children added</h3>
            <p className="text-gray-600 mb-4">
              Add your children to monitor their academic progress
            </p>
            <Button onClick={() => toast.info('Add child feature coming soon')}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Your First Child
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <SettingsLayout
      title="Profile & Settings"
      description="Manage your profile and family settings"
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
                  id: 'phone',
                  label: 'Phone Number',
                  type: 'tel',
                  value: profileFields.phone,
                  icon: Phone,
                  placeholder: '+1 (555) 000-0000',
                  onChange: (value) => setProfileFields({ ...profileFields, phone: value })
                },
                {
                  id: 'address',
                  label: 'Home Address',
                  type: 'textarea',
                  value: profileFields.address,
                  icon: MapPin,
                  placeholder: 'Enter your home address',
                  onChange: (value) => setProfileFields({ ...profileFields, address: value })
                },
                {
                  id: 'emergencyContact',
                  label: 'Emergency Contact',
                  type: 'textarea',
                  value: profileFields.emergencyContact,
                  icon: Phone,
                  placeholder: 'Name and phone number of emergency contact',
                  onChange: (value) => setProfileFields({ ...profileFields, emergencyContact: value })
                }
              ]}
              onSave={handleProfileSave}
              onAvatarUpload={() => toast.info('Avatar upload coming soon')}
            />
          )
        },
        {
          value: 'children',
          label: 'Children',
          content: <ChildrenManagementTab />
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
