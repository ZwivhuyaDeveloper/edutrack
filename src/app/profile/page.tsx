"use client"

import { useState, useEffect } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, User, Mail, Building2, Calendar, GraduationCap, Briefcase, Users, Shield, ArrowLeft, LogOut } from 'lucide-react'
import { toast } from 'sonner'

interface UserProfile {
  id: string
  clerkId: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  role: string
  avatar: string | null
  isActive: boolean
  school: {
    id: string
    name: string
    city: string
    state: string
    country: string
  } | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profile: any
  createdAt: string
  updatedAt: string
}

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const { user: clerkUser, isLoaded } = useUser()
  const { signOut } = useClerk()

  const handleLogout = async () => {
    try {
      await signOut()
      window.location.replace('/')
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('Failed to sign out')
    }
  }

  useEffect(() => {
    async function fetchProfile() {
      if (!isLoaded) return

      if (!clerkUser) {
        window.location.replace('/sign-in')
        return
      }

      try {
        const response = await fetch('/api/users/me')
        
        if (response.ok) {
          const data = await response.json()
          setUserProfile(data.user)
        } else if (response.status === 404) {
          toast.error('Profile not found. Please complete registration.')
          window.location.replace('/sign-up')
          return
        } else if (response.status === 401) {
          toast.error('Please sign in to view your profile.')
          window.location.replace('/sign-in')
          return
        } else {
          throw new Error('Failed to load profile')
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        setError('Failed to load profile')
        toast.error('Failed to load profile')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [isLoaded, clerkUser])

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'STUDENT':
        return <GraduationCap className="h-5 w-5 text-blue-600" />
      case 'TEACHER':
        return <Briefcase className="h-5 w-5 text-purple-600" />
      case 'PARENT':
        return <Users className="h-5 w-5 text-green-600" />
      case 'PRINCIPAL':
        return <Shield className="h-5 w-5 text-orange-600" />
      case 'CLERK':
        return <User className="h-5 w-5 text-indigo-600" />
      case 'ADMIN':
        return <Shield className="h-5 w-5 text-red-600" />
      default:
        return <User className="h-5 w-5 text-gray-600" />
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'STUDENT':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'TEACHER':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'PARENT':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'PRINCIPAL':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'CLERK':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      case 'ADMIN':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (isLoading || !isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
            <CardDescription>
              Unable to load your profile. Please try again or contact support.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.replace('/dashboard')} className="w-full">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => window.location.replace('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">View and manage your account information</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Profile Overview Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your personal and account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar and Basic Info */}
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={userProfile.avatar || clerkUser?.imageUrl} alt={userProfile.fullName} />
                <AvatarFallback className="text-2xl">
                  {userProfile.firstName[0]}{userProfile.lastName[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{userProfile.fullName}</h2>
                <div className="flex items-center gap-2 mt-2">
                  {getRoleIcon(userProfile.role)}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(userProfile.role)}`}>
                    {userProfile.role}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-3 text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{userProfile.email}</span>
                </div>
              </div>
            </div>

            {/* Account Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
              {/* School Information */}
              {userProfile.school && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-700 font-medium">
                    <Building2 className="h-4 w-4" />
                    <span>School</span>
                  </div>
                  <div className="ml-6">
                    <p className="font-semibold text-gray-900">{userProfile.school.name}</p>
                    <p className="text-sm text-gray-600">
                      {userProfile.school.city}, {userProfile.school.state}, {userProfile.school.country}
                    </p>
                  </div>
                </div>
              )}

              {/* Account Status */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-700 font-medium">
                  <User className="h-4 w-4" />
                  <span>Account Status</span>
                </div>
                <div className="ml-6">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    userProfile.isActive 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {userProfile.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Member Since */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-700 font-medium">
                  <Calendar className="h-4 w-4" />
                  <span>Member Since</span>
                </div>
                <div className="ml-6">
                  <p className="text-gray-900">
                    {new Date(userProfile.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Last Updated */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-700 font-medium">
                  <Calendar className="h-4 w-4" />
                  <span>Last Updated</span>
                </div>
                <div className="ml-6">
                  <p className="text-gray-900">
                    {new Date(userProfile.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role-Specific Profile Card */}
        {userProfile.profile && (
          <Card>
            <CardHeader>
              <CardTitle>
                {userProfile.role === 'STUDENT' && 'Student Information'}
                {userProfile.role === 'TEACHER' && 'Teacher Information'}
                {userProfile.role === 'PARENT' && 'Parent Information'}
                {userProfile.role === 'PRINCIPAL' && 'Principal Information'}
                {userProfile.role === 'CLERK' && 'Clerk Information'}
              </CardTitle>
              <CardDescription>Role-specific details and information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Student Profile */}
                {userProfile.role === 'STUDENT' && userProfile.profile && (
                  <>
                    {userProfile.profile.studentIdNumber && (
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Student ID</label>
                        <p className="text-gray-900">{userProfile.profile.studentIdNumber}</p>
                      </div>
                    )}
                    {userProfile.profile.dateOfBirth && (
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                        <p className="text-gray-900">
                          {new Date(userProfile.profile.dateOfBirth).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {userProfile.profile.address && (
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Address</label>
                        <p className="text-gray-900">{userProfile.profile.address}</p>
                      </div>
                    )}
                    {userProfile.profile.emergencyContact && (
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Emergency Contact</label>
                        <p className="text-gray-900">{userProfile.profile.emergencyContact}</p>
                      </div>
                    )}
                  </>
                )}

                {/* Teacher Profile */}
                {userProfile.role === 'TEACHER' && userProfile.profile && (
                  <>
                    {userProfile.profile.employeeId && (
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Employee ID</label>
                        <p className="text-gray-900">{userProfile.profile.employeeId}</p>
                      </div>
                    )}
                    {userProfile.profile.hireDate && (
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Hire Date</label>
                        <p className="text-gray-900">
                          {new Date(userProfile.profile.hireDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {userProfile.profile.qualifications && (
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Qualifications</label>
                        <p className="text-gray-900">{userProfile.profile.qualifications}</p>
                      </div>
                    )}
                  </>
                )}

                {/* Parent Profile */}
                {userProfile.role === 'PARENT' && userProfile.profile && (
                  <>
                    {userProfile.profile.phone && (
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Phone Number</label>
                        <p className="text-gray-900">{userProfile.profile.phone}</p>
                      </div>
                    )}
                    {userProfile.profile.address && (
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Address</label>
                        <p className="text-gray-900">{userProfile.profile.address}</p>
                      </div>
                    )}
                    {userProfile.profile.emergencyContact && (
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Emergency Contact</label>
                        <p className="text-gray-900">{userProfile.profile.emergencyContact}</p>
                      </div>
                    )}
                  </>
                )}

                {/* Principal Profile */}
                {userProfile.role === 'PRINCIPAL' && userProfile.profile && (
                  <>
                    {userProfile.profile.employeeId && (
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Employee ID</label>
                        <p className="text-gray-900">{userProfile.profile.employeeId}</p>
                      </div>
                    )}
                    {userProfile.profile.phone && (
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Phone Number</label>
                        <p className="text-gray-900">{userProfile.profile.phone}</p>
                      </div>
                    )}
                    {userProfile.profile.qualifications && (
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Qualifications</label>
                        <p className="text-gray-900">{userProfile.profile.qualifications}</p>
                      </div>
                    )}
                    {userProfile.profile.yearsOfExperience && (
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Years of Experience</label>
                        <p className="text-gray-900">{userProfile.profile.yearsOfExperience} years</p>
                      </div>
                    )}
                    {userProfile.profile.administrativeArea && (
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Administrative Area</label>
                        <p className="text-gray-900">{userProfile.profile.administrativeArea}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="mt-6 flex gap-4">
          <Button onClick={() => window.location.replace('/dashboard')} variant="outline" className="w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
