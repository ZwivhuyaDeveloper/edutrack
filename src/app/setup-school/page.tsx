"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, ArrowLeft, CheckCircle, School, User, Building2, Phone, Globe, UserCheck } from 'lucide-react'
import { toast } from 'sonner'

interface PrincipalProfileData {
  employeeId: string
  hireDate: string
  phone: string
  address: string
  emergencyContact: string
  qualifications: string
  yearsOfExperience: string
  previousSchool: string
  educationBackground: string
  salary: string
  administrativeArea: string
}

interface SchoolFormData {
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
  email: string
  website: string
}

export default function SchoolSetupPage() {
  const [formData, setFormData] = useState<SchoolFormData>({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    phone: '',
    email: '',
    website: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [loadingStep, setLoadingStep] = useState('')
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)
  const [createdSchool, setCreatedSchool] = useState<{name: string} | null>(null)
  const [redirectCountdown, setRedirectCountdown] = useState(10)
  const { user, isLoaded } = useUser()
  const [principalProfile, setPrincipalProfile] = useState<PrincipalProfileData | null>(null)
  const router = useRouter()

  // Check if user is authenticated and verify they should be here
  useEffect(() => {
    async function checkAuth() {
      if (!isLoaded) return
      
      if (!user) {
        window.location.replace('/sign-in')
        return
      }

      // Skip auth check if we're showing success or currently loading (user just completed setup)
      if (showSuccess || isLoading) {
        setIsCheckingAuth(false)
        return
      }

      try {
        // Check if user already has a profile
        const response = await fetch('/api/users/me')
        if (response.ok) {
          // User already has profile, redirect to dashboard
          window.location.replace('/dashboard')
          return
        } else if (response.status === 404) {
          // User doesn't have profile yet, this is correct - they should be here
          setIsCheckingAuth(false)
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [isLoaded, user, router, showSuccess, isLoading])

  // Load principal data from session storage on mount
  useEffect(() => {
    try {
      const savedData = sessionStorage.getItem('principalProfileData')
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        setPrincipalProfile(parsedData)
        console.log('Loaded principal profile data from session storage:', parsedData)
      } else {
        console.warn('No principal profile data found in session storage.')
      }
    } catch (error) {
      console.error('Failed to load principal profile data:', error)
    }
  }, [])

  // Countdown timer for automatic redirect
  useEffect(() => {
    if (showSuccess && redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (showSuccess && redirectCountdown === 0) {
      window.location.replace('/dashboard')
    }
  }, [showSuccess, redirectCountdown])

  const handleInputChange = (field: keyof SchoolFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateForm = (): string => {
    if (!formData.name.trim()) return 'School name is required'
    if (!formData.city.trim()) return 'City is required'
    if (!formData.state.trim()) return 'State is required'
    if (formData.email && !formData.email.includes('@')) return 'Valid email is required'
    if (formData.website && !formData.website.startsWith('http')) return 'Website must start with http:// or https://'
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      toast.error(validationError)
      return
    }

    setIsLoading(true)
    setError('')
    setLoadingStep('Creating school and organization...')

    try {
      // Step 1: Create school directly in database
      const schoolResponse = await fetch('/api/schools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          address: formData.address || undefined,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode || undefined,
          country: formData.country,
          phone: formData.phone || undefined,
          email: formData.email || undefined,
          website: formData.website || undefined,
        }),
      })

      const schoolData = await schoolResponse.json()

      if (!schoolResponse.ok) {
        console.error('School creation failed:', {
          status: schoolResponse.status,
          statusText: schoolResponse.statusText,
          error: schoolData.error,
          data: schoolData
        })

        // Handle specific error cases
        if (schoolResponse.status === 409) {
          const errorMsg = schoolData.error || 'A record with this information already exists.'
          if (errorMsg.includes('email')) {
            throw new Error('Your email address is already associated with another account. Please sign in with a different account or contact support.')
          }
          throw new Error(errorMsg)
        } else if (schoolResponse.status === 403) {
          throw new Error(schoolData.error || 'You do not have permission to create a school.')
        } else if (schoolResponse.status === 400) {
          throw new Error(schoolData.error || 'Invalid school information provided.')
        } else if (schoolResponse.status === 500) {
          // Server error - might be database or Clerk organization issue
          const errorMsg = schoolData.error || 'Server error occurred while creating school.'
          
          // Check for specific database errors
          if (errorMsg.includes('clerkOrganizationId') || errorMsg.includes('column') || errorMsg.includes('database')) {
            throw new Error('Database configuration issue detected. Please ensure the database is properly migrated and try again.')
          }
          
          // Check for Clerk organization errors
          if (errorMsg.includes('organization') || errorMsg.includes('Clerk') || errorMsg.includes('Unprocessable Entity')) {
            throw new Error('There was an issue setting up your school organization. This might be due to the school name format. Please try a simpler school name or contact support.')
          }
          
          throw new Error(`Server error: ${errorMsg}`)
        }
        throw new Error(schoolData.error || 'Failed to create school. Please try again.')
      }

      const schoolId = schoolData.school.id

      // Step 2: Create/Update principal user profile with the new school
      setLoadingStep('Setting up your principal profile...')
      
      const principalProfileData = {
        role: 'PRINCIPAL',
        schoolId: schoolId,
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.primaryEmailAddress?.emailAddress || '',
        principalProfile: {
          employeeId: principalProfile?.employeeId,
          hireDate: principalProfile?.hireDate || undefined,
          phone: principalProfile?.phone,
          address: principalProfile?.address,
          emergencyContact: principalProfile?.emergencyContact,
          qualifications: principalProfile?.qualifications,
          yearsOfExperience: principalProfile?.yearsOfExperience ? parseInt(principalProfile.yearsOfExperience) : undefined,
          previousSchool: principalProfile?.previousSchool,
          educationBackground: principalProfile?.educationBackground,
          salary: principalProfile?.salary ? parseFloat(principalProfile.salary) : undefined,
          administrativeArea: principalProfile?.administrativeArea,
        }
      }
      
      console.log('Sending principal profile data:', JSON.stringify(principalProfileData, null, 2))
      
      const userResponse = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(principalProfileData),
      })

      const userData = await userResponse.json()

      if (!userResponse.ok) {
        throw new Error(userData.error || 'Failed to create principal profile')
      }

      // Show success step instead of immediate redirect
      setLoadingStep('Finalizing setup...')
      
      // Small delay to show the "Finalizing setup..." message
      setTimeout(() => {
        setCreatedSchool({ name: schoolData.school.name })
        setShowSuccess(true)
        setRedirectCountdown(10) // Reset countdown
        setIsLoading(false) // Stop loading when success is shown
        setLoadingStep('')
        
        toast.success('School and principal profile created successfully! Welcome to EduTrack.')
      }, 1000)

    } catch (error) {
      console.error('School creation error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create school'
      setError(errorMessage)
      toast.error(errorMessage)
      setIsLoading(false)
      setLoadingStep('')
    }
  }

  if (!isLoaded || isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Success step - show after school creation
  if (showSuccess && createdSchool) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-2xl">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-green-800">School Created Successfully!</CardTitle>
            <CardDescription className="text-lg">
              Welcome to EduTrack! Your school and principal profile have been set up.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <School className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-800">School Details</h3>
              </div>
              <p className="text-green-700">
                <strong>{createdSchool.name}</strong> has been created and configured with Clerk organization integration.
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <User className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-800">Your Role</h3>
              </div>
              <p className="text-blue-700">
                You have been registered as the <strong>Principal</strong> of {createdSchool.name}. You can now manage teachers, students, and school operations.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">What&apos;s Next?</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-green-500" />
                  <span>Add teachers and staff to your school</span>
                </li>
                <li className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-green-500" />
                  <span>Set up classes and subjects</span>
                </li>
                <li className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-green-500" />
                  <span>Invite students and parents to join</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 mb-2">
                Automatically redirecting to dashboard in <strong>{redirectCountdown}</strong> seconds...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`bg-primary h-2 rounded-full transition-all duration-1000 ease-linear`}
                  style={{ width: `${((10 - redirectCountdown) / 10) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                onClick={() => window.location.replace('/dashboard')}
                className="flex-1"
                size="lg"
              >
                Go to Dashboard Now
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.replace('/profile')}
                size="lg"
              >
                View Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.replace('/sign-up')}
              className="p-1"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-2xl font-bold">Create Your School & Principal Profile</CardTitle>
          </div>
          <CardDescription>
            Set up your school information and your principal profile. You&apos;ll be registered as the school&apos;s principal and can manage students, teachers, and school settings.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* School Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">School Information</h3>
              </div>

              {/* School Name */}
              <div>
                <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700 mb-2">
                  School Name *
                </label>
                <Input
                  id="schoolName"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your school name"
                  className="w-full"
                  required
                />
              </div>

              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <Input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Street address"
                  className="w-full"
                />
              </div>

              {/* City and State Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <Input
                    id="city"
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="City"
                    className="w-full"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <Input
                    id="state"
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="State/Province"
                    className="w-full"
                    required
                  />
                </div>
              </div>

              {/* Zip Code and Country Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP/Postal Code
                  </label>
                  <Input
                    id="zipCode"
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    placeholder="ZIP/Postal Code"
                    className="w-full"
                  />
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <Input
                    id="country"
                    type="text"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    placeholder="Country"
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Phone className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold">Contact Information</h3>
              </div>

              {/* Phone and Email Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                    className="w-full"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    School Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="school@example.com"
                    className="w-full"
                  />
                </div>
              </div>

              {/* Website */}
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://school-website.com"
                    className="pl-10 w-full"
                  />
                </div>
              </div>
            </div>


            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {loadingStep || 'Creating School...'}
                </>
              ) : (
                <>
                  <Building2 className="mr-2 h-4 w-4" />
                  Create School & Continue
                </>
              )}
            </Button>

            <p className="text-sm text-gray-500 text-center">
              * Required fields
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
