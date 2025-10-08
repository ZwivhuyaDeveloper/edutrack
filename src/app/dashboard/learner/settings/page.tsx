"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  User, 
  Bell,
  Shield,
  Loader2,
  Save,
  Upload,
  Mail,
  Phone,
  MapPin,
  Calendar,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

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

interface NotificationSettings {
  assignments: boolean
  grades: boolean
  attendance: boolean
  fees: boolean
  announcements: boolean
  messages: boolean
  events: boolean
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    assignments: true,
    grades: true,
    attendance: true,
    fees: true,
    announcements: true,
    messages: true,
    events: true
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch('/api/dashboard/student/profile')
        if (!response.ok) throw new Error('Failed to fetch profile')
        const data = await response.json()
        setProfile(data)
        
        // Load notification settings if available
        if (data.notificationSettings) {
          setNotificationSettings(data.notificationSettings)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch('/api/dashboard/student/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })

      if (!response.ok) throw new Error('Failed to update profile')

      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleNotificationUpdate = async () => {
    setIsSaving(true)

    try {
      const response = await fetch('/api/dashboard/student/notifications/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationSettings)
      })

      if (!response.ok) throw new Error('Failed to update notification settings')

      toast.success('Notification settings updated successfully')
    } catch (error) {
      toast.error('Failed to update notification settings')
    } finally {
      setIsSaving(false)
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
        <Card>
          <CardHeader>
            <CardTitle>Profile not found</CardTitle>
            <CardDescription>Unable to load your profile</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile & Settings</h1>
        <p className="text-gray-600 mt-1">Manage your personal information and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Personal Information
              </CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile.avatar || undefined} />
                    <AvatarFallback className="text-2xl">
                      {profile.firstName[0]}{profile.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button type="button" variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Photo
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">
                      JPG, PNG or GIF. Max size 2MB.
                    </p>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                      disabled
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      className="pl-10"
                      disabled
                    />
                  </div>
                </div>

                {/* Student Profile Info */}
                {profile.studentProfile && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="studentId">Student ID</Label>
                        <Input
                          id="studentId"
                          value={profile.studentProfile.studentIdNumber || ''}
                          disabled
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="grade">Grade</Label>
                        <Input
                          id="grade"
                          value={profile.studentProfile.grade || ''}
                          disabled
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={profile.studentProfile.dateOfBirth ? format(new Date(profile.studentProfile.dateOfBirth), 'yyyy-MM-dd') : ''}
                          onChange={(e) => setProfile({
                            ...profile,
                            studentProfile: {
                              ...profile.studentProfile!,
                              dateOfBirth: e.target.value
                            }
                          })}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Textarea
                          id="address"
                          value={profile.studentProfile.address || ''}
                          onChange={(e) => setProfile({
                            ...profile,
                            studentProfile: {
                              ...profile.studentProfile!,
                              address: e.target.value
                            }
                          })}
                          className="pl-10"
                          rows={3}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emergencyContact">Emergency Contact</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="emergencyContact"
                          value={profile.studentProfile.emergencyContact || ''}
                          onChange={(e) => setProfile({
                            ...profile,
                            studentProfile: {
                              ...profile.studentProfile!,
                              emergencyContact: e.target.value
                            }
                          })}
                          className="pl-10"
                          placeholder="Name and phone number"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="medicalInfo">Medical Information</Label>
                      <div className="relative">
                        <AlertCircle className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Textarea
                          id="medicalInfo"
                          value={profile.studentProfile.medicalInfo || ''}
                          onChange={(e) => setProfile({
                            ...profile,
                            studentProfile: {
                              ...profile.studentProfile!,
                              medicalInfo: e.target.value
                            }
                          })}
                          className="pl-10"
                          rows={3}
                          placeholder="Allergies, medications, conditions, etc."
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-end">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
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
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Choose what notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="assignments">Assignments</Label>
                    <p className="text-sm text-gray-500">
                      Get notified about new assignments and due dates
                    </p>
                  </div>
                  <Switch
                    id="assignments"
                    checked={notificationSettings.assignments}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({ ...notificationSettings, assignments: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="grades">Grades</Label>
                    <p className="text-sm text-gray-500">
                      Receive notifications when new grades are posted
                    </p>
                  </div>
                  <Switch
                    id="grades"
                    checked={notificationSettings.grades}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({ ...notificationSettings, grades: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="attendance">Attendance</Label>
                    <p className="text-sm text-gray-500">
                      Get alerts about attendance records
                    </p>
                  </div>
                  <Switch
                    id="attendance"
                    checked={notificationSettings.attendance}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({ ...notificationSettings, attendance: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="fees">Fees & Payments</Label>
                    <p className="text-sm text-gray-500">
                      Notifications about invoices and payment reminders
                    </p>
                  </div>
                  <Switch
                    id="fees"
                    checked={notificationSettings.fees}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({ ...notificationSettings, fees: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="announcements">Announcements</Label>
                    <p className="text-sm text-gray-500">
                      School and class announcements
                    </p>
                  </div>
                  <Switch
                    id="announcements"
                    checked={notificationSettings.announcements}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({ ...notificationSettings, announcements: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="messages">Messages</Label>
                    <p className="text-sm text-gray-500">
                      Direct messages from teachers and classmates
                    </p>
                  </div>
                  <Switch
                    id="messages"
                    checked={notificationSettings.messages}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({ ...notificationSettings, messages: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="events">Events</Label>
                    <p className="text-sm text-gray-500">
                      Upcoming events and calendar reminders
                    </p>
                  </div>
                  <Switch
                    id="events"
                    checked={notificationSettings.events}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({ ...notificationSettings, events: checked })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleNotificationUpdate} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Preferences
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Security Settings
              </CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> Password and authentication settings are managed through your school&apos;s authentication system.
                  Please contact your school administrator for password resets or security concerns.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Account Status</Label>
                <div className="flex items-center gap-2">
                  <Badge variant="default">Active</Badge>
                  <span className="text-sm text-gray-600">Your account is active and in good standing</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
