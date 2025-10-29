"use client"

import { useState, useEffect } from 'react'
import { useUser, SignUp } from '@clerk/nextjs'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, ArrowLeft, UserPlus, Users, UserCheck, Building2, Search, Shield, Mail, Briefcase, GraduationCap } from 'lucide-react'
import { toast } from 'sonner'
import { createUser, validateUserData } from '@/lib/user-creation'
import logo from '@/assets/logo_teal.png'


interface School {
  id: string
  name: string
  city: string
  state: string
  country: string
  _count: {
    users: number
  }
}

export default function Page() {
  const [step, setStep] = useState<'role' | 'profile' | 'relationship' | 'school' | 'school-setup' | 'complete'>('role')
  const [selectedRole, setSelectedRole] = useState<'STUDENT' | 'TEACHER' | 'PARENT' | 'PRINCIPAL' | 'SCHOOL' | 'CLERK'>('STUDENT')
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const [schools, setSchools] = useState<School[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [recheckProfile, setRecheckProfile] = useState(0)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [hasCheckedProfile, setHasCheckedProfile] = useState(false)
  const [relationshipData, setRelationshipData] = useState({
    searchTerm: '',
    selectedRelationship: null as { id: string; name: string; email: string; role: string } | null,
    relationshipType: 'PARENT' as 'PARENT' | 'GUARDIAN' | 'GRANDPARENT' | 'SIBLING',
    searchResults: [] as { id: string; name: string; email: string; role: string }[]
  })
  const { user, isLoaded } = useUser()
  const [isRateLimited, setIsRateLimited] = useState(false)

  // Role-specific profile data (name and email come from Clerk, not here)
  const [profileData, setProfileData] = useState({
    // Student fields
    student: {
      dateOfBirth: '',
      grade: '',
      studentIdNumber: '',
      emergencyContact: '',
      medicalInfo: '',
      address: ''
    },
    // Teacher fields
    teacher: {
      employeeId: '',
      department: '',
      hireDate: '',
      qualifications: ''
    },
    // Parent fields
    parent: {
      phone: '',
      address: '',
      emergencyContact: ''
    },
    // Principal fields
    principal: {
      employeeId: '',
      hireDate: '',
      phone: '',
      address: '',
      emergencyContact: '',
      qualifications: '',
      yearsOfExperience: '',
      previousSchool: '',
      educationBackground: '',
      salary: '',
      administrativeArea: ''
    }
  })

  // Check if user is authenticated and has completed profile
  useEffect(() => {
    async function checkUserProfile() {
        if (hasCheckedProfile && recheckProfile === 0) {
        console.log('[sign-up] Skipping duplicate profile check')
        return
      }
      console.log('[sign-up] useEffect triggered - isLoaded:', isLoaded, 'user:', !!user)
      
      if (isLoaded && user) {
        try {
          console.log('[sign-up] Checking user profile for:', user.primaryEmailAddress?.emailAddress)

          // Use AbortController for faster timeout
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 5000) // 5s timeout
          
          const response = await fetch('/api/users/me', { 
            signal: controller.signal,
            cache: 'no-store' // Ensure fresh data
          })
          clearTimeout(timeoutId)

          console.log('[sign-up] Response status:', response.status)
          
          if (response.ok) {
            const data = await response.json()
            console.log('[sign-up] User has profile:', data.user)
            console.log('[sign-up] User role:', data.user?.role)
            console.log('[sign-up] Dashboard route:', data.user?.dashboardRoute)
            
            // User has completed profile, redirect to dashboard
            console.log('[sign-up] Redirecting to /dashboard')
            setIsRedirecting(true)
            
            // Use replace instead of href to avoid back button issues
            window.location.replace('/dashboard')
            return
          } else if (response.status === 404) {
            // User authenticated but no profile - show role selection
            console.log('[sign-up] User not found in DB (404), showing role selection')
            setStep('role')
          } else {
            console.log('[sign-up] Unexpected response status:', response.status)
            const errorText = await response.text()
            console.log('[sign-up] Error response:', errorText)
            setStep('role')
          }
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            console.warn('[sign-up] Profile check timed out, showing role selection')
          } else {
            console.error('[sign-up] Error checking user profile:', error)
          }
          setStep('role')
        }
      } else if (isLoaded && !user) {
        console.log('[sign-up] User not authenticated, staying on sign-up page')
        setHasCheckedProfile(true)
      }
    }

    checkUserProfile()
  }, [isLoaded, user, recheckProfile, hasCheckedProfile, isRateLimited, isRedirecting])

  // Fetch schools when school selection step is reached
  useEffect(() => {
    if (step === 'school') {
      fetchSchools()
    }
  }, [step])

  const fetchSchools = async () => {
    try {
      const response = await fetch('/api/schools')
      
      if (!response.ok) {
        console.error('Failed to fetch schools:', response.status, response.statusText)
        toast.error('Failed to load schools')
        return
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Response is not JSON:', contentType)
        toast.error('Invalid response from server')
        return
      }

      const data = await response.json()
      
      if (data.schools && Array.isArray(data.schools)) {
        setSchools(data.schools)
      } else {
        console.error('Invalid schools data:', data)
        toast.error('Invalid data received')
      }
    } catch (error) {
      console.error('Error fetching schools:', error)
      toast.error('Failed to load schools. Please try again.')
    }
  }

  const handleRoleSelect = (role: 'STUDENT' | 'TEACHER' | 'PARENT' | 'PRINCIPAL' | 'SCHOOL' | 'CLERK') => {
    console.log('Role selected:', role)
    setSelectedRole(role)
    if (role === 'SCHOOL') {
      setStep('school-setup')
    } else {
      // All other roles need profile information
      setStep('profile')
    }
  }

  const handleProfileSubmit = async () => {
    // Validate role-specific required fields
    if (selectedRole === 'STUDENT') {
      if (!profileData.student.grade.trim()) {
        toast.error('Grade is required for students')
        return
      }
    } else if (selectedRole === 'TEACHER') {
      if (!profileData.teacher.department.trim()) {
        toast.error('Department is required for teachers')
        return
      }
    }

    // For Principals, create the profile immediately and redirect to school setup
    if (selectedRole === 'PRINCIPAL') {
      setIsLoading(true)
      setError('')
      
      try {
        console.log('Creating principal profile with data:', profileData.principal)
        console.log('Clerk user data:', {
          firstName: user?.firstName,
          lastName: user?.lastName,
          email: user?.primaryEmailAddress?.emailAddress,
          fullName: user?.fullName
        })

        // Extract names with fallbacks
        const firstName = user?.firstName || user?.fullName?.split(' ')[0] || ''
        const lastName = user?.lastName || user?.fullName?.split(' ').slice(1).join(' ') || ''
        const email = user?.primaryEmailAddress?.emailAddress || ''

        // Validate required fields
        if (!firstName.trim()) {
          toast.error('First name is required. Please update your Clerk profile.')
          return
        }
        if (!lastName.trim()) {
          toast.error('Last name is required. Please update your Clerk profile.')
          return
        }
        if (!email.trim()) {
          toast.error('Email is required. Please update your Clerk profile.')
          return
        }
        
        // Create a temporary principal profile record with minimal school data
        // Note: cleanProfileData is defined later in the component, so we'll clean manually here
        const cleanPrincipalProfile = (profile: typeof profileData.principal) => {
          return {
            employeeId: profile.employeeId?.trim() || undefined,
            hireDate: profile.hireDate?.trim() || undefined,
            phone: profile.phone?.trim() || undefined,
            address: profile.address?.trim() || undefined,
            emergencyContact: profile.emergencyContact?.trim() || undefined,
            qualifications: profile.qualifications?.trim() || undefined,
            yearsOfExperience: profile.yearsOfExperience?.trim() ? parseInt(profile.yearsOfExperience.trim()) : undefined,
            previousSchool: profile.previousSchool?.trim() || undefined,
            educationBackground: profile.educationBackground?.trim() || undefined,
            salary: profile.salary?.trim() ? parseFloat(profile.salary.trim()) : undefined,
            administrativeArea: profile.administrativeArea?.trim() || undefined,
          }
        }
        
        const principalData = {
          role: 'PRINCIPAL',
          schoolId: 'temp', // Will be updated when school is created
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          principalProfile: cleanPrincipalProfile(profileData.principal)
        }
        
        // Store the profile data for school setup page
        sessionStorage.setItem('pendingPrincipalProfile', JSON.stringify(principalData))
        
        toast.success('Profile information saved! Redirecting to school setup...')
        
        setTimeout(() => {
          window.location.replace('/setup-school')
        }, 1000)

      } catch (error) {
        console.error('Failed to save principal profile:', error)
        const errorMessage = error instanceof Error ? error.message : 'Failed to save profile'
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    } else {
      // All other roles go to school selection
      setStep('school')
    }
  }

  // Search for existing users to create relationships
  const searchUsers = async (searchTerm: string, targetRole: 'STUDENT' | 'PARENT', schoolId?: string) => {
    if (!searchTerm.trim()) return

    // Use provided schoolId or selectedSchool
    const searchSchoolId = schoolId || selectedSchool?.id
    if (!searchSchoolId) {
      console.warn('No school selected for user search')
      return
    }

    try {
      const response = await fetch(`/api/users/search?school=${searchSchoolId}&role=${targetRole}&search=${encodeURIComponent(searchTerm)}`)
      
      if (response.ok) {
        const data = await response.json()
        setRelationshipData(prev => ({
          ...prev,
          searchResults: data.users || []
        }))
      } else {
        console.error('Failed to search users')
        setRelationshipData(prev => ({
          ...prev,
          searchResults: []
        }))
      }
    } catch (error) {
      console.error('Error searching users:', error)
      setRelationshipData(prev => ({
        ...prev,
        searchResults: []
      }))
    }
  }

  const handleSchoolSetup = async () => {
    setIsLoading(true)
    setError('')

    try {
      // For school role, we don't need to create a user record yet
      // The school setup page will handle creating the principal user
      toast.success('Redirecting to school setup...')
      setStep('complete')

      setTimeout(() => {
        // Use replace to avoid back button issues
        window.location.replace('/setup-school')
      }, 1500)
    } catch (error) {
      console.error('School setup error:', error)
      setError(error instanceof Error ? error.message : 'School setup failed')
      toast.error('School setup failed')
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to clean profile data - convert empty strings to undefined
  const cleanProfileData = <T extends Record<string, unknown>>(data: T): Partial<T> => {
    const cleaned: Record<string, unknown> = {}
    for (const key in data) {
      const value = data[key]
      if (typeof value === 'string') {
        const trimmed = value.trim()
        cleaned[key] = trimmed === '' ? undefined : trimmed
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        cleaned[key] = cleanProfileData(value as Record<string, unknown>)
      } else {
        cleaned[key] = value
      }
    }
    return cleaned as Partial<T>
  }

  const completeUserRegistration = async () => {
    if (!selectedSchool) {
      toast.error('Please select a school')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      console.log('Clerk user data for registration:', {
        firstName: user?.firstName,
        lastName: user?.lastName,
        email: user?.primaryEmailAddress?.emailAddress,
        fullName: user?.fullName
      })

      // Extract names with fallbacks
      const firstName = user?.firstName || user?.fullName?.split(' ')[0] || ''
      const lastName = user?.lastName || user?.fullName?.split(' ').slice(1).join(' ') || ''
      const email = user?.primaryEmailAddress?.emailAddress || ''

      // Validate required fields
      if (!firstName.trim()) {
        toast.error('First name is required. Please update your Clerk profile.')
        setIsLoading(false)
        return
      }
      if (!lastName.trim()) {
        toast.error('Last name is required. Please update your Clerk profile.')
        setIsLoading(false)
        return
      }
      if (!email.trim()) {
        toast.error('Email is required. Please update your Clerk profile.')
        setIsLoading(false)
        return
      }

      // Prepare user data for creation with cleaned profile data
      const userData = {
        role: selectedRole,
        schoolId: selectedSchool.id,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        // Include role-specific profile data - cleaned to remove empty strings
        ...(selectedRole === 'STUDENT' && {
          grade: profileData.student.grade?.trim() || undefined,
          studentProfile: cleanProfileData({
            dateOfBirth: profileData.student.dateOfBirth,
            studentIdNumber: profileData.student.studentIdNumber,
            emergencyContact: profileData.student.emergencyContact,
            medicalInfo: profileData.student.medicalInfo,
            address: profileData.student.address,
          })
        }),
        ...(selectedRole === 'TEACHER' && {
          department: profileData.teacher.department?.trim() || undefined,
          teacherProfile: cleanProfileData({
            employeeId: profileData.teacher.employeeId,
            hireDate: profileData.teacher.hireDate,
            qualifications: profileData.teacher.qualifications,
          })
        }),
        ...(selectedRole === 'PARENT' && {
          parentProfile: cleanProfileData({
            phone: profileData.parent.phone,
            address: profileData.parent.address,
            emergencyContact: profileData.parent.emergencyContact,
          })
        }),
        ...(selectedRole === 'PRINCIPAL' && {
          principalProfile: cleanProfileData({
            employeeId: profileData.principal.employeeId,
            hireDate: profileData.principal.hireDate,
            phone: profileData.principal.phone,
            address: profileData.principal.address,
            emergencyContact: profileData.principal.emergencyContact,
            qualifications: profileData.principal.qualifications,
            yearsOfExperience: profileData.principal.yearsOfExperience ? parseInt(profileData.principal.yearsOfExperience) : undefined,
            previousSchool: profileData.principal.previousSchool,
            educationBackground: profileData.principal.educationBackground,
            salary: profileData.principal.salary ? parseFloat(profileData.principal.salary) : undefined,
            administrativeArea: profileData.principal.administrativeArea,
          })
        }),
        // Include relationship data if selected
        ...(relationshipData.selectedRelationship && {
          relationshipUserId: relationshipData.selectedRelationship.id,
          relationshipType: relationshipData.relationshipType
        })
      }

      // Validate data before submission (especially important for teachers)
      const validation = validateUserData(userData)
      if (!validation.isValid) {
        // Show validation errors and stop loading
        validation.errors.forEach(error => toast.error(error))
        setIsLoading(false)
        return
      }

      // Use the enhanced user creation helper
      const result = await createUser(userData)

      if (result.success) {
        // Success - show completion step first
        setStep('complete')
        setRecheckProfile(prev => prev + 1)
        
        // Use the established redirect pattern from memories
        setTimeout(() => {
          window.location.replace('/dashboard')
        }, 1500)
      } else {
        // Error handling is done in createUser, but we should handle specific cases
        switch (result.error) {
          case 'duplicate_email':
            setError('A user with this email already exists. Please check if you already have an account.')
            break
          case 'configuration_error':
            setError('School configuration issue. Please contact your school administrator.')
            break
          case 'network_error':
            setError('Connection failed. Please check your internet and try again.')
            break
          default:
            setError('Registration failed. Please try again or contact support.')
        }
        setIsLoading(false)
      }

    } catch (error) {
      console.error('Registration error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete registration'
      setError(errorMessage)
      toast.error('Unexpected error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  const handleSchoolSubmit = async () => {
    if (!selectedSchool) {
      toast.error('Please select a school')
      return
    }

    // For PARENT and STUDENT roles, go to relationship step first
    if (selectedRole === 'PARENT' || selectedRole === 'STUDENT') {
      setStep('relationship')
      return
    }

    // For other roles, complete registration directly
    await completeUserRegistration()
  }

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.state.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!isLoaded || isRedirecting) {
    return (
      <div className="font-sans min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          {isRedirecting && <p className="text-gray-600">Redirecting to dashboard...</p>}
        </div>
      </div>
    )
  }

  // Show Clerk SignUp if user is not authenticated
  if (!user) {
    return (
      <div className="font-sans min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-zinc-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 h-full justify-center items-center">

          <Card className="text-center h-full w-full font-sans border border-primary bg-primary p-7 rounded-3xl  justify-center items-center">
            <div className="flex flex-col justify-center items-center">
              <div className="mx-auto w-18 h-18 p-3 bg-white rounded-xl flex items-center justify-center mb-4">
                <Image 
                  src={logo} 
                  alt="EduTrack AI Logo" 
                  width={45} 
                  height={45} 
                  className="object-contain"
                />
              </div>
              <h1 className="text-3xl font-bold text-gray-100 mb-2">
                Join EduTrack AI Software
              </h1>
              <p className="text-gray-200">
                Create your account to get started with the application process.
              </p>

              <div className="mt-6 p-4 bg-white/20   rounded-lg border border-white/20">
                <p className="text-sm text-white text-center">
                  <strong>Next Steps:</strong> After creating your account, you&apos;ll select your role and complete your profile.
                </p>
              </div>
            </div>

          </Card>

          <div className="max-w-md mx-auto flex h-full flex-col justify-center items-center">

            <SignUp 
              appearance={{
                elements: {
                  // Root card styling
                  rootBox: {
                    width: 'w-full',
                    height: 'h-full',
                    border: 'none',
                  },
                  // Card styling
                  card: {
                    shadow: 'shadow-sm',
                    border: 'border',
                    spaceY: 'space-y-1',
                    borderColor: 'border-zinc-200',
                    borderRadiusBottom: '0',
                    backgroundColor: 'bg-white',
                  },
                  
                  // Header styling
                  headerTitle: {
                    fontSize: '2xl',
                    fontWeight: 'bold',
                    color: '#006372',
                  },
                  headerSubtitle: 'text-gray-600 text-sm mt-2',
                  
                  // Form container
                  formContainer: 'space-y-2',
                  
                  // Form fields
                  formFieldLabel: 'text-sm font-medium text-gray-700',
                  formFieldInput: 'border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg px-4 py-2.5 transition-all duration-200',
                  formFieldInputShowPasswordButton: 'text-gray-500 hover:text-gray-700',
                  
                  // Primary button (Sign Up)
                  formButtonPrimary: {
                    borderBlockWidth: '0px',
                    backgroundColor: '#006372',
                    "&:hover": {
                      backgroundColor: '#006372',
                      opacity: 0.8,
                    },
                    color: '#FFFFFF',
                  },
                  
                  // Social buttons
                  socialButtonsBlockButton: {
                    flexDirection: 'row',
                    borderBlockWidth: '0px',
                    backgroundColor: '#fff',
                    "&:hover": {
                      backgroundColor: '#fff',
                      opacity: 0.8,
                    },
                    color: '#006372',
                  },
                  socialButtonsBlockButtonText: 'text-gray-700 font-medium',
                  socialButtonsProviderIcon: 'w-5 h-5',
                  
                  // Profile image upload styling
                  avatarBox: 'w-24 h-24 mx-auto mb-4',
                  avatarImage: 'rounded-full border-4 border-primary/20',
                  fileDropAreaBox: 'border-2 border-dashed border-primary/30 rounded-lg p-4 hover:border-primary/50 transition-colors',
                  fileDropAreaButtonPrimary: 'bg-primary hover:bg-primary/90 text-white rounded-lg px-4 py-2 normal-case font-medium',
                  fileDropAreaIcon: 'text-primary',
                  fileDropAreaFooterHint: 'text-xs text-gray-500',
                  fileDropAreaButtonSecondary: 'text-red-600 hover:text-red-700 text-sm font-medium',
                  
                  // Divider
                  dividerLine: 'bg-gray-300',
                  dividerText: 'text-gray-500 text-sm',
                  
                  // Footer links
                  footer: 'mt-6',
                  footerAction: 'text-sm',
                  footerActionText: 'text-gray-600',
                  footerActionLink: 'text-primary hover:text-primary/80 font-semibold transition-colors duration-200',
                  
                  // Form field row
                  formFieldRow: 'space-y-2',
                  
                  // Error messages
                  formFieldErrorText: 'text-red-600 text-sm mt-1',
                  
                  // OTP input (for verification)
                  otpCodeFieldInput: 'border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg',
                  
                  // Verification
                  identityPreviewText: 'text-gray-700',
                  identityPreviewEditButton: 'text-primary hover:text-primary/80',
                  
                  // Form buttons
                  formResendCodeLink: 'text-primary hover:text-primary/80 font-medium',
                  
                  // Internal card
                  main: 'px-2 py-6',
                },
                layout: {
                  socialButtonsPlacement: 'top',
                  socialButtonsVariant: 'blockButton',
                  termsPageUrl: '/terms',
                  privacyPageUrl: '/privacy',
                  unsafe_disableDevelopmentModeWarnings: true,
                },
              }}
              routing="path"
              path="/sign-up"
              signInUrl="/sign-in"
              forceRedirectUrl="/sign-up" // Force redirect to continue profile setup after Clerk auth
            />
          </div>
        </div>
      </div>
    )
  }

  if (step === 'role') {
    return (
      <div className="font-sans min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <UserPlus className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Choose Your Role
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Select the role that best describes you. This helps us personalize your experience and provide relevant features.
            </p>
          </div>

          {/* Role Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Student Role */}
            <button
              onClick={() => handleRoleSelect('STUDENT')}
              className="group relative bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-blue-400 hover:shadow-lg transition-all duration-300 text-left"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <GraduationCap className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Student</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Access courses, track progress, submit assignments, and view grades
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">Learning</span>
                    <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">Assignments</span>
                    <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">Progress</span>
                  </div>
                </div>
                <ArrowLeft className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all rotate-180" />
              </div>
            </button>

            {/* Parent Role */}
            <button
              onClick={() => handleRoleSelect('PARENT')}
              className="group relative bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-green-400 hover:shadow-lg transition-all duration-300 text-left"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Parent/Guardian</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Monitor children&apos;s progress, communicate with teachers, view reports
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-full">Monitoring</span>
                    <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-full">Reports</span>
                    <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-full">Communication</span>
                  </div>
                </div>
                <ArrowLeft className="h-5 w-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all rotate-180" />
              </div>
            </button>

            {/* Teacher Role */}
            <button
              onClick={() => handleRoleSelect('TEACHER')}
              className="group relative bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-purple-400 hover:shadow-lg transition-all duration-300 text-left"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <Briefcase className="h-8 w-8 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Teacher</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Manage classes, create assignments, grade work, track attendance
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded-full">Classes</span>
                    <span className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded-full">Grading</span>
                    <span className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded-full">Attendance</span>
                  </div>
                </div>
                <ArrowLeft className="h-5 w-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all rotate-180" />
              </div>
            </button>

            {/* Principal Role */}
            <button
              onClick={() => handleRoleSelect('PRINCIPAL')}
              className="group relative bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-orange-400 hover:shadow-lg transition-all duration-300 text-left"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                  <Shield className="h-8 w-8 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Principal/Admin</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Oversee school operations, manage staff, view analytics and reports
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-1 bg-orange-50 text-orange-700 rounded-full">Management</span>
                    <span className="text-xs px-2 py-1 bg-orange-50 text-orange-700 rounded-full">Analytics</span>
                    <span className="text-xs px-2 py-1 bg-orange-50 text-orange-700 rounded-full">Oversight</span>
                  </div>
                </div>
                <ArrowLeft className="h-5 w-5 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all rotate-180" />
              </div>
            </button>
          </div>

          {/* Administrative Staff (Clerk) - Full Width */}
          <button
            onClick={() => handleRoleSelect('CLERK')}
            className="group relative w-full bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 p-6 hover:border-indigo-400 hover:shadow-lg transition-all duration-300 text-left"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                <Building2 className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-gray-900">Administrative Staff (Clerk)</h3>
                  <span className="text-xs px-2 py-1 bg-indigo-600 text-white rounded-full font-semibold">Staff</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Join as administrative staff. Manage student records, process fees and payments, handle registrations, and support school operations.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full">Fee Management</span>
                  <span className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full">Records</span>
                  <span className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full">Payments</span>
                  <span className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full">Administration</span>
                </div>
              </div>
              <ArrowLeft className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all rotate-180" />
            </div>
          </button>

          {/* Info Section */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Need help choosing?</h4>
                <p className="text-sm text-gray-600">
                  Your role determines your dashboard features and permissions. You can contact support at{' '}
                  <a href="mailto:support@edutrack.ai" className="text-primary hover:underline font-medium">
                    support@edutrack.ai
                  </a>
                  {' '}if you&apos;re unsure which role to select.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
    
  if (step === 'profile') {
    console.log('Rendering profile step for role:', selectedRole)
    console.log('Current step:', step)
    return (
      <div className="min-h-screen font-sans flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className='gap-3'>
        <div className="mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep('role')}
            className="p-1 gap-2 text-md text-semibold"
          >
            <ArrowLeft className="h-6 w-6" />
            Back
          </Button>

        </div>
        <Card className="w-full font-sans max-w-2xl">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-2xl font-bold flex items-center">
                {selectedRole === 'STUDENT' && (
                  <>
                    <GraduationCap className="h-7 w-7 text-blue-600 mr-2" />
                    Student Information
                  </>
                )}
                {selectedRole === 'TEACHER' && (
                  <>
                    <Briefcase className="h-7 w-7 text-purple-600 mr-2" />
                    Teacher Information
                  </>
                )}
                {selectedRole === 'PARENT' && (
                  <>
                    <Users className="h-7 w-7 text-green-600 mr-2" />
                    Parent Information
                  </>
                )}
                {selectedRole === 'PRINCIPAL' && (
                  <>
                    <Shield className="h-7 w-7 text-orange-600 mr-2" />
                    Principal Information
                  </>
                )}
              </CardTitle>
            </div>
            <CardDescription>
              Please provide your {selectedRole.toLowerCase()} specific information to complete registration.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Display Clerk User Info */}
            {user && (
              <div className="bg-blue-50 font-sans border border-primary/20 rounded-lg p-4">
                <h4 className="font-semibold text-primary/80 mb-2">Account Information (from Clerk)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-primary">
                  <div>
                    <span className="font-medium">Name:</span> {user.firstName} {user.lastName}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {user.primaryEmailAddress?.emailAddress}
                  </div>
                </div>
                <p className="text-xs text-primary/80 mt-2">
                  ℹ️ This information is managed by your Edutrack account and cannot be changed here.
                </p>
              </div>
            )}

            {/* Student Fields */}
            {selectedRole === 'STUDENT' && (
              <div className="space-y-4 font-sans">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-lg font-semibold">Student Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-2">
                      Grade *
                    </label>
                    <Input
                      id="grade"
                      type="text"
                      value={profileData.student.grade}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        student: { ...prev.student, grade: e.target.value }
                      }))}
                      placeholder="e.g., Grade 10A"
                      className="w-full active:outline-none focus:outline-none active:ring-0 focus:ring-0 ring-0 ring-white/20"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="studentIdNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      Student ID Number
                    </label>
                    <Input
                      id="studentIdNumber"
                      type="text"
                      value={profileData.student.studentIdNumber}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        student: { ...prev.student, studentIdNumber: e.target.value }
                      }))}
                      placeholder="Student ID"
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={profileData.student.dateOfBirth}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      student: { ...prev.student, dateOfBirth: e.target.value }
                    }))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="studentAddress" className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <Input
                    id="studentAddress"
                    type="text"
                    value={profileData.student.address}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      student: { ...prev.student, address: e.target.value }
                    }))}
                    placeholder="Student address"
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact
                  </label>
                  <Input
                    id="emergencyContact"
                    type="text"
                    value={profileData.student.emergencyContact}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      student: { ...prev.student, emergencyContact: e.target.value }
                    }))}
                    placeholder="Emergency contact name and phone"
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="medicalInfo" className="block text-sm font-medium text-gray-700 mb-2">
                    Medical Information
                  </label>
                  <Input
                    id="medicalInfo"
                    type="text"
                    value={profileData.student.medicalInfo}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      student: { ...prev.student, medicalInfo: e.target.value }
                    }))}
                    placeholder="Any medical conditions or allergies"
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* Teacher Fields */}
            {selectedRole === 'TEACHER' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <UserCheck className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold">Teacher Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="teacherEmployeeId" className="block text-sm font-medium text-gray-700 mb-2">
                      Employee ID
                    </label>
                    <Input
                      id="teacherEmployeeId"
                      type="text"
                      value={profileData.teacher.employeeId}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        teacher: { ...prev.teacher, employeeId: e.target.value }
                      }))}
                      placeholder="Employee ID"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                      Department *
                    </label>
                    <Input
                      id="department"
                      type="text"
                      value={profileData.teacher.department}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        teacher: { ...prev.teacher, department: e.target.value }
                      }))}
                      placeholder="e.g., Mathematics"
                      className="w-full"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="hireDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Hire Date
                  </label>
                  <Input
                    id="hireDate"
                    type="date"
                    value={profileData.teacher.hireDate}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      teacher: { ...prev.teacher, hireDate: e.target.value }
                    }))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="qualifications" className="block text-sm font-medium text-gray-700 mb-2">
                    Qualifications
                  </label>
                  <Input
                    id="qualifications"
                    type="text"
                    value={profileData.teacher.qualifications}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      teacher: { ...prev.teacher, qualifications: e.target.value }
                    }))}
                    placeholder="Degrees, certifications, etc."
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* Parent Fields */}
            {selectedRole === 'PARENT' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold">Parent Details</h3>
                </div>

                <div>
                  <label htmlFor="parentPhone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <Input
                    id="parentPhone"
                    type="tel"
                    value={profileData.parent.phone}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      parent: { ...prev.parent, phone: e.target.value }
                    }))}
                    placeholder="(555) 123-4567"
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="parentAddress" className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <Input
                    id="parentAddress"
                    type="text"
                    value={profileData.parent.address}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      parent: { ...prev.parent, address: e.target.value }
                    }))}
                    placeholder="Parent address"
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="parentEmergencyContact" className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact
                  </label>
                  <Input
                    id="parentEmergencyContact"
                    type="text"
                    value={profileData.parent.emergencyContact}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      parent: { ...prev.parent, emergencyContact: e.target.value }
                    }))}
                    placeholder="Alternative emergency contact"
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* Principal Fields */}
            {selectedRole === 'PRINCIPAL' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <UserCheck className="h-5 w-5 text-orange-600" />
                  <h3 className="text-lg font-semibold">Principal Details</h3>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="principalEmployeeId" className="block text-sm font-medium text-gray-700 mb-2">
                      Employee ID
                    </label>
                    <Input
                      id="principalEmployeeId"
                      type="text"
                      value={profileData.principal.employeeId}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        principal: { ...prev.principal, employeeId: e.target.value }
                      }))}
                      placeholder="Employee ID"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="principalHireDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Hire Date
                    </label>
                    <Input
                      id="principalHireDate"
                      type="date"
                      value={profileData.principal.hireDate}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        principal: { ...prev.principal, hireDate: e.target.value }
                      }))}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="principalPhone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <Input
                      id="principalPhone"
                      type="tel"
                      value={profileData.principal.phone}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        principal: { ...prev.principal, phone: e.target.value }
                      }))}
                      placeholder="(555) 123-4567"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="principalAddress" className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <Input
                      id="principalAddress"
                      type="text"
                      value={profileData.principal.address}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        principal: { ...prev.principal, address: e.target.value }
                      }))}
                      placeholder="Principal address"
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="principalEmergencyContact" className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact
                  </label>
                  <Input
                    id="principalEmergencyContact"
                    type="text"
                    value={profileData.principal.emergencyContact}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      principal: { ...prev.principal, emergencyContact: e.target.value }
                    }))}
                    placeholder="Emergency contact name and phone"
                    className="w-full"
                  />
                </div>

                {/* Professional Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="principalQualifications" className="block text-sm font-medium text-gray-700 mb-2">
                      Qualifications
                    </label>
                    <Input
                      id="principalQualifications"
                      type="text"
                      value={profileData.principal.qualifications}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        principal: { ...prev.principal, qualifications: e.target.value }
                      }))}
                      placeholder="Degrees, certifications, licenses"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="principalYearsOfExperience" className="block text-sm font-medium text-gray-700 mb-2">
                      Years of Experience
                    </label>
                    <Input
                      id="principalYearsOfExperience"
                      type="number"
                      value={profileData.principal.yearsOfExperience}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        principal: { ...prev.principal, yearsOfExperience: e.target.value }
                      }))}
                      placeholder="Years in education administration"
                      className="w-full"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="principalPreviousSchool" className="block text-sm font-medium text-gray-700 mb-2">
                      Previous School/Position
                    </label>
                    <Input
                      id="principalPreviousSchool"
                      type="text"
                      value={profileData.principal.previousSchool}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        principal: { ...prev.principal, previousSchool: e.target.value }
                      }))}
                      placeholder="Previous school and position"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="principalEducationBackground" className="block text-sm font-medium text-gray-700 mb-2">
                      Education Background
                    </label>
                    <Input
                      id="principalEducationBackground"
                      type="text"
                      value={profileData.principal.educationBackground}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        principal: { ...prev.principal, educationBackground: e.target.value }
                      }))}
                      placeholder="Highest degree and institution"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="principalSalary" className="block text-sm font-medium text-gray-700 mb-2">
                      Annual Salary (Optional)
                    </label>
                    <Input
                      id="principalSalary"
                      type="number"
                      value={profileData.principal.salary}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        principal: { ...prev.principal, salary: e.target.value }
                      }))}
                      placeholder="Annual salary"
                      className="w-full"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label htmlFor="principalAdministrativeArea" className="block text-sm font-medium text-gray-700 mb-2">
                      Administrative Area
                    </label>
                    <Input
                      id="principalAdministrativeArea"
                      type="text"
                      value={profileData.principal.administrativeArea}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        principal: { ...prev.principal, administrativeArea: e.target.value }
                      }))}
                      placeholder="e.g., Academic Affairs, Student Services"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Fallback for debugging - if no role section matches */}
            {(!selectedRole || (selectedRole !== 'STUDENT' && selectedRole !== 'TEACHER' && selectedRole !== 'PARENT' && selectedRole !== 'PRINCIPAL')) && (
              <div className="text-center py-8 text-red-500">
                <p>No matching role section found!</p>
                <p>Selected role: {selectedRole}</p>
                <p>Available roles: STUDENT, TEACHER, PARENT, PRINCIPAL</p>
              </div>
            )}
            <Button
              onClick={handleProfileSubmit}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Continue to {selectedRole === 'PRINCIPAL' ? 'School Setup' : 'School Selection'}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
        </div>
      </div>
    )
  }

  if (step === 'relationship') {
    const targetRole = selectedRole === 'PARENT' ? 'STUDENT' : 'PARENT'
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-2xl">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep('profile')}
                className="p-1"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-2xl font-bold">
                {selectedRole === 'PARENT' ? 'Connect with Your Child' : 'Connect with Your Parent/Guardian'}
              </CardTitle>
            </div>
            <CardDescription>
              {selectedRole === 'PARENT' 
                ? 'Search for your child who is already registered as a student, or skip this step to add them later.'
                : 'Search for your parent or guardian who is already registered, or skip this step to add them later.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="relationshipType" className="block text-sm font-medium text-gray-700 mb-2">
                  Relationship Type
                </label>
                <select
                  id="relationshipType"
                  value={relationshipData.relationshipType}
                  onChange={(e) => setRelationshipData(prev => ({
                    ...prev,
                    relationshipType: e.target.value as 'PARENT' | 'GUARDIAN' | 'GRANDPARENT' | 'SIBLING'
                  }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="PARENT">Parent</option>
                  <option value="GUARDIAN">Guardian</option>
                  <option value="GRANDPARENT">Grandparent</option>
                  <option value="SIBLING">Sibling</option>
                </select>
              </div>

              <div>
                <label htmlFor="userSearch" className="block text-sm font-medium text-gray-700 mb-2">
                  Search for {targetRole === 'STUDENT' ? 'Student' : 'Parent/Guardian'}
                </label>
                <div className="relative">
                  <Input
                    id="userSearch"
                    type="text"
                    value={relationshipData.searchTerm}
                    onChange={(e) => {
                      const value = e.target.value
                      setRelationshipData(prev => ({
                        ...prev,
                        searchTerm: value
                      }))
                      // Debounce search
                      if (value.length >= 2) {
                        setTimeout(() => searchUsers(value, targetRole), 300)
                      } else {
                        setRelationshipData(prev => ({
                          ...prev,
                          searchResults: []
                        }))
                      }
                    }}
                    placeholder={`Search by name or email...`}
                    className="w-full active:outline-none focus:outline-none"
                  />
                  <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {relationshipData.searchResults.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Select {targetRole === 'STUDENT' ? 'Student' : 'Parent/Guardian'}
                  </label>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {relationshipData.searchResults.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => setRelationshipData(prev => ({
                          ...prev,
                          selectedRelationship: user
                        }))}
                        className={`w-full p-4 text-left border rounded-lg cursor-pointer transition-colors ${
                          relationshipData.selectedRelationship?.id === user.id
                            ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100'
                            : 'hover:bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-xs text-gray-500 capitalize">{user.role.toLowerCase()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {relationshipData.selectedRelationship && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <UserCheck className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">
                        Selected: {relationshipData.selectedRelationship.name}
                      </p>
                      <p className="text-sm text-green-600">
                        {relationshipData.relationshipType} relationship will be created
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  // Skip relationship and complete registration
                  setRelationshipData({
                    searchTerm: '',
                    selectedRelationship: null,
                    relationshipType: 'PARENT',
                    searchResults: []
                  })
                  completeUserRegistration()
                }}
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  'Skip & Complete Registration'
                )}
              </Button>
              <Button
                onClick={() => completeUserRegistration()}
                className="flex-1"
                disabled={!relationshipData.selectedRelationship || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  'Complete Registration'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
    
  if (step === 'school-setup') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep('profile')}
                className="p-1"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-2xl font-bold">School Setup</CardTitle>
            </div>
            <CardDescription>
              You&apos;re about to set up a new school. You&apos;ll be redirected to the school creation form.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-900">School Administrator</h3>
                  <p className="text-sm text-blue-700">
                    You&apos;ll be able to create and manage your school after setup.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleSchoolSetup}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up School...
                </>
              ) : (
                'Continue to School Setup'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  if (step === 'school') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-2xl">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep('profile')}
                className="p-1"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-2xl font-bold">Select Your School</CardTitle>
            </div>
            <CardDescription>
              Choose the school you belong to.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search schools by name, city, or state..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* School List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredSchools.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No schools found matching your search.' : 'No schools available.'}
                </div>
              ) : (
                filteredSchools.map((school) => (
                  <button
                    key={school.id}
                    onClick={() => setSelectedSchool(school)}
                    className={`w-full p-4 text-left border rounded-lg transition-colors ${
                      selectedSchool?.id === school.id
                        ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100'
                        : 'hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-gray-900">{school.name}</h3>
                          <p className="text-sm text-gray-500">
                            {school.city}, {school.state} {school.country}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {school._count.users} user{school._count.users !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      {selectedSchool?.id === school.id && (
                        <div className="bg-blue-100 text-blue-600 rounded-full p-1">
                          <UserCheck className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSchoolSubmit}
              className="w-full"
              disabled={!selectedSchool || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Completing Registration...
                </>
              ) : (
                'Complete Registration'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === 'complete') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Registration Complete!</CardTitle>
            <CardDescription>
              Your account has been created successfully. Redirecting to dashboard...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }
}
