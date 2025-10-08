"use client"

import { useRouter } from 'next/navigation'
import { useUser, useClerk } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, Home, LogOut, Shield, Info } from 'lucide-react'

interface UserData {
  role?: string
  dashboardRoute?: string
  permissions?: Record<string, boolean>
}

export default function UnauthorizedPage() {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchUserData() {
      if (!isLoaded || !user) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch('/api/users/me')
        if (response.ok) {
          const data = await response.json()
          setUserData(data.user)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [user, isLoaded])

  const handleGoHome = () => {
    if (userData?.dashboardRoute) {
      router.push(userData.dashboardRoute)
    } else {
      router.push('/dashboard')
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  const getRoleDisplayName = (role?: string) => {
    if (!role) return 'Unknown'
    return role.charAt(0) + role.slice(1).toLowerCase()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-900">Access Denied</CardTitle>
          <CardDescription className="text-base">
            You do not have the required permissions to access this resource.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* User Information */}
          {user && !isLoading && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-semibold text-gray-700">Current User</span>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Name:</span> {user.fullName || 'N/A'}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {user.primaryEmailAddress?.emailAddress || 'N/A'}
                </p>
                {userData?.role && (
                  <p>
                    <span className="font-medium">Role:</span>{' '}
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-xs font-medium">
                      {getRoleDisplayName(userData.role)}
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Information Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This page or feature requires specific permissions that your current role does not have. 
              Please contact your school administrator if you believe you should have access.
            </AlertDescription>
          </Alert>

          {/* Common Reasons */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Common Reasons:</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Insufficient role permissions</li>
              <li>Attempting to access another school&apos;s data</li>
              <li>Feature restricted to specific roles</li>
              <li>Account not fully set up</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-2">
            <Button onClick={handleGoHome} className="w-full" size="lg">
              <Home className="mr-2 h-4 w-4" />
              Go to My Dashboard
            </Button>
            <Button variant="outline" onClick={handleLogout} className="w-full" size="lg">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>

          {/* Help Text */}
          <p className="text-xs text-center text-gray-500">
            Need help? Contact your school administrator or IT support.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
