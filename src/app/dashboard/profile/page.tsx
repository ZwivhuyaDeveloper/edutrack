/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  User,
  Mail,
  Building2,
  Calendar,
  Shield,
  LogOut,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Edit,
  Save,
  X,
  GraduationCap,
  Briefcase,
  Users,
  Phone,
  MapPin,
  Award,
  Clock,
  FileText,
  IdCard
} from 'lucide-react'
import { toast } from 'sonner'

interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  isActive: boolean
  school: {
    id: string
    name: string
    city?: string
    state?: string
    country?: string
  }
  createdAt: string
  updatedAt: string
  profile?: any
  avatar?: string | null
  fullName?: string
}

export default function ProfilePage() {
  const { user: clerkUser, isLoaded } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editedData, setEditedData] = useState({
    firstName: '',
    lastName: '',
  })

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch('/api/users/me')
        if (response.ok) {
          const data = await response.json()
          setProfile(data.user)
          setEditedData({
            firstName: data.user.firstName,
            lastName: data.user.lastName,
          })
        } else {
          toast.error('Failed to load profile')
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        toast.error('Failed to load profile')
      } finally {
        setIsLoading(false)
      }
    }

    if (isLoaded && clerkUser) {
      fetchProfile()
    }
  }, [isLoaded, clerkUser])

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('Failed to sign out')
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Update Clerk user
      await clerkUser?.update({
        firstName: editedData.firstName,
        lastName: editedData.lastName,
      })

      // Update database
      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: editedData.firstName,
          lastName: editedData.lastName,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.user)
        setIsEditing(false)
        toast.success('Profile updated successfully')
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedData({
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
    })
    setIsEditing(false)
  }

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      STUDENT: 'bg-blue-100 text-blue-800 border-blue-300',
      TEACHER: 'bg-purple-100 text-purple-800 border-purple-300',
      PARENT: 'bg-green-100 text-green-800 border-green-300',
      PRINCIPAL: 'bg-orange-100 text-orange-800 border-orange-300',
      CLERK: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      ADMIN: 'bg-red-100 text-red-800 border-red-300',
    }
    return colors[role] || 'bg-gray-100 text-gray-800 border-gray-300'
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'STUDENT':
        return <GraduationCap className="h-5 w-5" />
      case 'TEACHER':
        return <Briefcase className="h-5 w-5" />
      case 'PARENT':
        return <Users className="h-5 w-5" />
      case 'PRINCIPAL':
        return <Shield className="h-5 w-5" />
      case 'CLERK':
        return <FileText className="h-5 w-5" />
      case 'ADMIN':
        return <Shield className="h-5 w-5" />
      default:
        return <User className="h-5 w-5" />
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
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
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>Failed to load profile</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account settings</p>
        </div>
        <Button
          variant="destructive"
          onClick={handleLogout}
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Your account details</CardDescription>
              </div>
              {!isEditing ? (
                <Button variant="outline" onClick={() => setIsEditing(true)} className="gap-2">
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCancel} className="gap-2">
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-4">
              <Avatar className="h-24 w-24 border-4 border-primary/10">
                <AvatarImage src={clerkUser?.imageUrl} alt={profile.firstName} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {getInitials(profile.firstName, profile.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900">
                  {profile.firstName} {profile.lastName}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <div className={`p-1.5 rounded-lg ${getRoleBadgeColor(profile.role).replace('text-', 'bg-').replace('bg-', 'bg-').replace('-100', '-200/50')}`}>
                    {getRoleIcon(profile.role)}
                  </div>
                  <Badge className={`${getRoleBadgeColor(profile.role)} border font-semibold`}>
                    {profile.role}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-2 text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{profile.email}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Editable Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                {isEditing ? (
                  <Input
                    id="firstName"
                    value={editedData.firstName}
                    onChange={(e) => setEditedData({ ...editedData, firstName: e.target.value })}
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>{profile.firstName}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                {isEditing ? (
                  <Input
                    id="lastName"
                    value={editedData.lastName}
                    onChange={(e) => setEditedData({ ...editedData, lastName: e.target.value })}
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>{profile.lastName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Read-only Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{profile.email}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>School</Label>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <span>
                    {profile.school.name}
                    {profile.school.city && profile.school.state && 
                      ` • ${profile.school.city}, ${profile.school.state}`
                    }
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Member Since</Label>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{new Date(profile.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role-Specific Information Card */}
        {profile.profile && Object.keys(profile.profile).length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getRoleIcon(profile.role)}
                {profile.role} Information
              </CardTitle>
              <CardDescription>Role-specific details and information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Student Profile */}
                {profile.role === 'STUDENT' && (
                  <>
                    {profile.profile.studentIdNumber && (
                      <div className="space-y-1 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <IdCard className="h-4 w-4" />
                          <Label className="text-xs font-medium">Student ID</Label>
                        </div>
                        <p className="text-gray-900 font-semibold">{profile.profile.studentIdNumber}</p>
                      </div>
                    )}
                    {profile.profile.dateOfBirth && (
                      <div className="space-y-1 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Calendar className="h-4 w-4" />
                          <Label className="text-xs font-medium">Date of Birth</Label>
                        </div>
                        <p className="text-gray-900 font-semibold">
                          {new Date(profile.profile.dateOfBirth).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {profile.profile.address && (
                      <div className="space-y-1 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <MapPin className="h-4 w-4" />
                          <Label className="text-xs font-medium">Address</Label>
                        </div>
                        <p className="text-gray-900 font-semibold">{profile.profile.address}</p>
                      </div>
                    )}
                    {profile.profile.emergencyContact && (
                      <div className="space-y-1 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Phone className="h-4 w-4" />
                          <Label className="text-xs font-medium">Emergency Contact</Label>
                        </div>
                        <p className="text-gray-900 font-semibold">{profile.profile.emergencyContact}</p>
                      </div>
                    )}
                  </>
                )}

                {/* Teacher Profile */}
                {profile.role === 'TEACHER' && (
                  <>
                    {profile.profile.employeeId && (
                      <div className="space-y-1 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <IdCard className="h-4 w-4" />
                          <Label className="text-xs font-medium">Employee ID</Label>
                        </div>
                        <p className="text-gray-900 font-semibold">{profile.profile.employeeId}</p>
                      </div>
                    )}
                    {profile.profile.hireDate && (
                      <div className="space-y-1 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Calendar className="h-4 w-4" />
                          <Label className="text-xs font-medium">Hire Date</Label>
                        </div>
                        <p className="text-gray-900 font-semibold">
                          {new Date(profile.profile.hireDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {profile.profile.qualifications && (
                      <div className="space-y-1 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Award className="h-4 w-4" />
                          <Label className="text-xs font-medium">Qualifications</Label>
                        </div>
                        <p className="text-gray-900 font-semibold">{profile.profile.qualifications}</p>
                      </div>
                    )}
                    {profile.profile.yearsOfExperience && (
                      <div className="space-y-1 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Clock className="h-4 w-4" />
                          <Label className="text-xs font-medium">Experience</Label>
                        </div>
                        <p className="text-gray-900 font-semibold">{profile.profile.yearsOfExperience} years</p>
                      </div>
                    )}
                  </>
                )}

                {/* Parent Profile */}
                {profile.role === 'PARENT' && (
                  <>
                    {profile.profile.phone && (
                      <div className="space-y-1 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Phone className="h-4 w-4" />
                          <Label className="text-xs font-medium">Phone Number</Label>
                        </div>
                        <p className="text-gray-900 font-semibold">{profile.profile.phone}</p>
                      </div>
                    )}
                    {profile.profile.address && (
                      <div className="space-y-1 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <MapPin className="h-4 w-4" />
                          <Label className="text-xs font-medium">Address</Label>
                        </div>
                        <p className="text-gray-900 font-semibold">{profile.profile.address}</p>
                      </div>
                    )}
                    {profile.profile.emergencyContact && (
                      <div className="space-y-1 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Phone className="h-4 w-4" />
                          <Label className="text-xs font-medium">Emergency Contact</Label>
                        </div>
                        <p className="text-gray-900 font-semibold">{profile.profile.emergencyContact}</p>
                      </div>
                    )}
                  </>
                )}

                {/* Principal Profile */}
                {profile.role === 'PRINCIPAL' && (
                  <>
                    {profile.profile.employeeId && (
                      <div className="space-y-1 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <IdCard className="h-4 w-4" />
                          <Label className="text-xs font-medium">Employee ID</Label>
                        </div>
                        <p className="text-gray-900 font-semibold">{profile.profile.employeeId}</p>
                      </div>
                    )}
                    {profile.profile.phone && (
                      <div className="space-y-1 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Phone className="h-4 w-4" />
                          <Label className="text-xs font-medium">Phone Number</Label>
                        </div>
                        <p className="text-gray-900 font-semibold">{profile.profile.phone}</p>
                      </div>
                    )}
                    {profile.profile.qualifications && (
                      <div className="space-y-1 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Award className="h-4 w-4" />
                          <Label className="text-xs font-medium">Qualifications</Label>
                        </div>
                        <p className="text-gray-900 font-semibold">{profile.profile.qualifications}</p>
                      </div>
                    )}
                    {profile.profile.yearsOfExperience && (
                      <div className="space-y-1 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Clock className="h-4 w-4" />
                          <Label className="text-xs font-medium">Experience</Label>
                        </div>
                        <p className="text-gray-900 font-semibold">{profile.profile.yearsOfExperience} years</p>
                      </div>
                    )}
                    {profile.profile.administrativeArea && (
                      <div className="space-y-1 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Building2 className="h-4 w-4" />
                          <Label className="text-xs font-medium">Administrative Area</Label>
                        </div>
                        <p className="text-gray-900 font-semibold">{profile.profile.administrativeArea}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Account Status Card */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                {profile.isActive ? (
                  <Badge className="bg-green-100 text-green-800 border-green-200 border gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Active
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800 border-red-200 border gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Inactive
                  </Badge>
                )}
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Role</span>
                <Badge className={`${getRoleBadgeColor(profile.role)} border`}>
                  {profile.role}
                </Badge>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">User ID</span>
                <span className="text-xs text-gray-500 font-mono">{profile.id.slice(0, 8)}...</span>
              </div>
            </CardContent>
          </Card>

          {/* Security Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security
              </CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href={clerkUser?.primaryEmailAddress?.emailAddress ? 
                  `https://accounts.clerk.dev/user/security` : '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Change Password
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href={clerkUser?.primaryEmailAddress?.emailAddress ? 
                  `https://accounts.clerk.dev/user/security` : '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Two-Factor Authentication
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  Signing out will end your current session. You&apos;ll need to sign in again to access your account.
                </AlertDescription>
              </Alert>
              <Button
                variant="destructive"
                className="w-full mt-4 gap-2"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
