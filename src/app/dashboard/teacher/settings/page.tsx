"use client"

import { useState, useEffect } from 'react'
import { ProfileFormSection } from '@/components/dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Mail, Phone, Briefcase, Upload, Save } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export default function TeacherSettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    employeeId: '',
    department: '',
    qualifications: ''
  })
  const [notifications, setNotifications] = useState({
    assignments: true,
    grades: true,
    messages: true,
    announcements: true
  })

  useEffect(() => {
    async function fetchProfile() {
      try {
        // TODO: Replace with actual API call
        setProfile({
          firstName: 'John',
          lastName: 'Teacher',
          email: 'john.teacher@school.com',
          phone: '+1234567890',
          employeeId: 'EMP001',
          department: 'Mathematics',
          qualifications: 'M.Sc. Mathematics'
        })
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // TODO: Implement save API call
      toast.success('Settings saved successfully')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile & Settings</h1>
          <p className="text-gray-600 mt-1">Manage your profile and preferences</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Profile Picture */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src="" />
              <AvatarFallback className="text-2xl">
                {profile.firstName[0]}{profile.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload Photo
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                JPG, PNG or GIF. Max size 2MB.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <ProfileFormSection
        title="Personal Information"
        icon={User}
        columns={2}
        fields={[
          {
            id: 'firstName',
            label: 'First Name',
            value: profile.firstName,
            onChange: (value) => setProfile({ ...profile, firstName: value })
          },
          {
            id: 'lastName',
            label: 'Last Name',
            value: profile.lastName,
            onChange: (value) => setProfile({ ...profile, lastName: value })
          },
          {
            id: 'email',
            label: 'Email',
            type: 'email',
            value: profile.email,
            icon: Mail,
            disabled: true
          },
          {
            id: 'phone',
            label: 'Phone',
            type: 'tel',
            value: profile.phone,
            icon: Phone,
            onChange: (value) => setProfile({ ...profile, phone: value })
          }
        ]}
      />

      {/* Professional Information */}
      <ProfileFormSection
        title="Professional Information"
        icon={Briefcase}
        columns={2}
        fields={[
          {
            id: 'employeeId',
            label: 'Employee ID',
            value: profile.employeeId,
            disabled: true
          },
          {
            id: 'department',
            label: 'Department',
            value: profile.department,
            onChange: (value) => setProfile({ ...profile, department: value })
          },
          {
            id: 'qualifications',
            label: 'Qualifications',
            type: 'textarea',
            value: profile.qualifications,
            onChange: (value) => setProfile({ ...profile, qualifications: value })
          }
        ]}
      />

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="assignments">Assignment Submissions</Label>
            <Switch
              id="assignments"
              checked={notifications.assignments}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, assignments: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="grades">Grade Updates</Label>
            <Switch
              id="grades"
              checked={notifications.grades}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, grades: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="messages">New Messages</Label>
            <Switch
              id="messages"
              checked={notifications.messages}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, messages: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="announcements">School Announcements</Label>
            <Switch
              id="announcements"
              checked={notifications.announcements}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, announcements: checked })
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
