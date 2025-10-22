"use client"

import { useState, useEffect } from 'react'
import { useUser, useSignUp } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, ArrowLeft, UserPlus, Users, UserCheck, Building2, Search, Mail, Lock, User as UserIcon, Eye, EyeOff, GraduationCap, Briefcase, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { createUser, validateUserData } from '@/lib/user-creation'
import logo from '@/assets/logo_teal.png'
import banner from '@/assets/bottom_hero.png'

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
  const [selectedRole, setSelectedRole] = useState<'STUDENT' | 'TEACHER' | 'PARENT' | 'PRINCIPAL' | 'SCHOOL'>('STUDENT')
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const [schools, setSchools] = useState<School[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [recheckProfile, setRecheckProfile] = useState(0)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [relationshipData, setRelationshipData] = useState({
    searchTerm: '',
    selectedRelationship: null as { id: string; name: string; email: string; role: string } | null,
    relationshipType: 'PARENT' as 'PARENT' | 'GUARDIAN' | 'GRANDPARENT' | 'SIBLING',
    searchResults: [] as { id: string; name: string; email: string; role: string }[]
  })
  const { user, isLoaded } = useUser()
  const { signUp, isLoaded: signUpLoaded, setActive } = useSignUp()
  
  // Sign-up form state
  const [signUpForm, setSignUpForm] = useState({
    firstName: '',
    lastName: '',
    emailAddress: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [code, setCode] = useState('')
  const [signUpError, setSignUpError] = useState('')
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null)
  const [attemptCount, setAttemptCount] = useState(0)
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
      console.log('[sign-up] useEffect triggered - isLoaded:', isLoaded, 'user:', !!user)
      
      if (isLoaded && user) {
        try {
          console.log('[sign-up] Checking user profile for:', user.primaryEmailAddress?.emailAddress)
          const response = await fetch('/api/users/me')
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
          console.error('[sign-up] Error checking user profile:', error)
          setStep('role')
        }
      } else if (isLoaded && !user) {
        console.log('[sign-up] User not authenticated, staying on sign-up page')
      }
    }

    checkUserProfile()
  }, [isLoaded, user, recheckProfile])

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

  const handleRoleSelect = (role: 'STUDENT' | 'TEACHER' | 'PARENT' | 'PRINCIPAL' | 'SCHOOL') => {
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

  // Input sanitization helper
  const sanitizeInput = (input: string): string => {
    return input.trim().replace(/[<>"']/g, '')
  }

  // Password strength checker
  const checkPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    const isLongEnough = password.length >= 8
    
    const strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar, isLongEnough].filter(Boolean).length
    
    if (strength <= 2) return 'weak'
    if (strength <= 4) return 'medium'
    return 'strong'
  }

  // Handle sign-up form submission with security measures
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!signUpLoaded || !signUp) return
    
    // Rate limiting check (client-side)
    if (isRateLimited) {
      toast.error('Too many attempts. Please wait a moment before trying again.')
      return
    }
    
    if (attemptCount >= 5) {
      setIsRateLimited(true)
      toast.error('Too many sign-up attempts. Please wait 5 minutes.')
      setTimeout(() => {
        setIsRateLimited(false)
        setAttemptCount(0)
      }, 300000) // 5 minutes
      return
    }
    
    // Input validation
    const firstName = sanitizeInput(signUpForm.firstName)
    const lastName = sanitizeInput(signUpForm.lastName)
    const emailAddress = signUpForm.emailAddress.trim().toLowerCase()
    
    if (!firstName || firstName.length < 2) {
      setSignUpError('First name must be at least 2 characters')
      return
    }
    
    if (!lastName || lastName.length < 2) {
      setSignUpError('Last name must be at least 2 characters')
      return
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailAddress)) {
      setSignUpError('Please enter a valid email address')
      return
    }
    
    // Password strength validation
    const strength = checkPasswordStrength(signUpForm.password)
    if (strength === 'weak') {
      setSignUpError('Password is too weak. Use at least 8 characters with uppercase, lowercase, numbers, and special characters.')
      return
    }
    
    setIsLoading(true)
    setSignUpError('')
    setAttemptCount(prev => prev + 1)
    
    try {
      // Start the sign-up process with sanitized inputs
      await signUp.create({
        firstName,
        lastName,
        emailAddress,
        password: signUpForm.password,
      })
      
      // Send email verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      
      // Show verification step
      setVerifying(true)
      setAttemptCount(0) // Reset on success
      toast.success('Verification code sent to your email!')
    } catch (err: unknown) {
      console.error('Sign-up error:', err)
      const error = err as { errors?: Array<{ message: string; code?: string }> }
      const errorMessage = error.errors?.[0]?.message || 'Failed to create account'
      const errorCode = error.errors?.[0]?.code
      
      // Don't expose sensitive error details
      if (errorCode === 'form_password_pwned') {
        setSignUpError('This password has been compromised in a data breach. Please choose a different password.')
      } else if (errorMessage.toLowerCase().includes('email')) {
        setSignUpError('This email is already registered or invalid. Please use a different email.')
      } else {
        setSignUpError('Unable to create account. Please check your information and try again.')
      }
      
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Handle email verification with security measures
  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!signUpLoaded || !signUp) return
    
    // Validate code format (6 digits)
    const codeRegex = /^\d{6}$/
    if (!codeRegex.test(code)) {
      setSignUpError('Verification code must be 6 digits')
      return
    }
    
    setIsLoading(true)
    setSignUpError('')
    
    try {
      // Verify the email code
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: code.trim(),
      })
      
      if (completeSignUp.status === 'complete') {
        // Set the active session
        await setActive({ session: completeSignUp.createdSessionId })
        
        toast.success('Account created successfully!')
        
        // Clear sensitive form data
        setSignUpForm({
          firstName: '',
          lastName: '',
          emailAddress: '',
          password: '',
        })
        setCode('')
        
        // Trigger profile check to show role selection
        setRecheckProfile(prev => prev + 1)
      } else {
        console.error('Sign-up not complete:', completeSignUp)
        setSignUpError('Verification incomplete. Please try again.')
      }
    } catch (err: unknown) {
      console.error('Verification error:', err)
      const error = err as { errors?: Array<{ message: string }> }
      const errorMessage = error.errors?.[0]?.message || 'Invalid verification code'
      
      // Generic error message for security
      setSignUpError('Invalid or expired verification code. Please try again.')
      toast.error('Verification failed')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle OAuth sign-up (Google, LinkedIn, etc.)
  const handleOAuthSignUp = async (provider: 'google' | 'linkedin') => {
    if (!signUpLoaded || !signUp) return
    
    try {
      const strategy = provider === 'google' ? 'oauth_google' : 'oauth_linkedin'
      await signUp.authenticateWithRedirect({
        strategy: strategy as 'oauth_google' | 'oauth_linkedin',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/sign-up',
      })
    } catch (err: unknown) {
      console.error('OAuth error:', err)
      const error = err as { errors?: Array<{ message: string }> }
      const errorMessage = error.errors?.[0]?.message || 'Failed to sign up with OAuth'
      setSignUpError(errorMessage)
      toast.error('Failed to connect. Please try again.')
    }
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
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 justify-center items-center">

          <div className='w-full hidden md:block lg:block h-full'>
            <div className='w-full bg-primary hidden rounded-3xl h-200'/>
            <Image
              src={banner}
              alt="EduTrack AI Logo"
              width={1000}
              height={1000}
              quality={100}
              className="object-cover w-full  h-200 rounded-3xl"
            />
          </div>

          <div className="text-center font-sans pb-10 bg-primary backdrop-blur-sm p-7 rounded-3xl left-0 lg:left-60 relative md:absolute lg:absolute justify-center items-center mb-8">

            <div className="mx-auto w-18 h-18 p-2 bg-white rounded-lg flex items-center justify-center mb-4">
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

          </div>

          <div className="max-w-md mx-auto flex flex-col justify-center items-center">
            <Card className="w-full shadow-none border bg-white border-zinc-200 rounded-2xl">
              <CardHeader className="px-8 py-3 space-y-0">
                <CardTitle className="text-2xl font-bold text-primary">
                  {verifying ? 'Verify your email' : 'Create your account'}
                </CardTitle>
                <CardDescription className="text-gray-600 font-medium text-sm mt-2">
                  {verifying 
                    ? 'Enter the verification code sent to your email' 
                    : 'Sign up to get started with EduTrack AI Software'}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="px-8 py-6 space-y-3">
                {signUpError && (
                  <Alert variant="destructive">
                    <AlertDescription className="text-red-600 text-sm">
                      {signUpError}
                    </AlertDescription>
                  </Alert>
                )}
                
                {!verifying ? (
                  <form onSubmit={handleSignUpSubmit} className="space-y-4 font-sans">
                    {/* OAuth Buttons */}
                    <div className="space-y-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleOAuthSignUp('google')}
                        className="w-full border-gray-300 hover:bg-gray-50 hover:border-gray-400 rounded-lg transition-all duration-200 font-medium py-2.5"
                      >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        Continue with Google
                      </Button>
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleOAuthSignUp('linkedin')}
                        className="w-full border-gray-300 hover:bg-gray-50 hover:border-gray-400 rounded-lg transition-all duration-200 font-medium py-2.5"
                      >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="#0A66C2">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        Continue with LinkedIn
                      </Button>
                    </div>
                    
                    {/* Divider */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 font-sans">
                      <div className="space-y-2">
                        <label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                          First name
                        </label>
                        <div className="relative">
                          <UserIcon className="absolute hidden left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="firstName"
                            type="text"
                            required
                            value={signUpForm.firstName}
                            onChange={(e) => setSignUpForm(prev => ({ ...prev, firstName: e.target.value }))}
                            className="pl-10 border-gray-300 placeholder:text-gray-400 font-medium  focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg px-4 py-2.5 transition-all duration-200"
                            placeholder="John"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                          Last name
                        </label>
                        <div className="relative">
                          <UserIcon className="absolute hidden left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="lastName"
                            type="text"
                            required
                            value={signUpForm.lastName}
                            onChange={(e) => setSignUpForm(prev => ({ ...prev, lastName: e.target.value }))}
                            className="pl-10 border-gray-300 placeholder:text-gray-400 font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg px-4 py-2.5 transition-all duration-200"
                            placeholder="Doe"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email address
                      </label>
                      <div className="relative">
                        <Mail className="absolute hidden left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          required
                          value={signUpForm.emailAddress}
                          onChange={(e) => setSignUpForm(prev => ({ ...prev, emailAddress: e.target.value }))}
                          className="pl-10 border-gray-300 placeholder:text-gray-400  font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg px-4 py-2.5 transition-all duration-200"
                          placeholder="john.doe@example.com"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="password" className="text-sm font-medium text-gray-700">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute hidden left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={8}
                          value={signUpForm.password}
                          onChange={(e) => {
                            const newPassword = e.target.value
                            setSignUpForm(prev => ({ ...prev, password: newPassword }))
                            if (newPassword.length > 0) {
                              setPasswordStrength(checkPasswordStrength(newPassword))
                            } else {
                              setPasswordStrength(null)
                            }
                          }}
                          className="pl-10 pr-10 border-gray-300 placeholder:text-gray-400 font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg px-4 py-2.5 transition-all duration-200"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {passwordStrength && (
                        <div className="space-y-1">
                          <div className="flex gap-1">
                            <div className={`h-1 flex-1 rounded ${passwordStrength === 'weak' ? 'bg-red-500' : passwordStrength === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                            <div className={`h-1 flex-1 rounded ${passwordStrength === 'medium' || passwordStrength === 'strong' ? passwordStrength === 'medium' ? 'bg-yellow-500' : 'bg-green-500' : 'bg-gray-200'}`} />
                            <div className={`h-1 flex-1 rounded ${passwordStrength === 'strong' ? 'bg-green-500' : 'bg-gray-200'}`} />
                          </div>
                          <p className={`text-xs ${passwordStrength === 'weak' ? 'text-red-600' : passwordStrength === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>
                            Password strength: {passwordStrength}
                          </p>
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        Use 8+ characters with uppercase, lowercase, numbers, and symbols
                      </p>
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg py-2.5 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        'Continue'
                      )}
                    </Button>
                    
                    <div className="text-center text-sm mt-4">
                      <span className="text-gray-600">Already have an account? </span>
                      <Link href="/sign-in" className="text-primary hover:text-primary/80 font-semibol transition-colors duration-200">
                        Sign in
                      </Link>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyEmail} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="code" className="text-sm font-medium text-gray-700">
                        Verification code
                      </label>
                      <Input
                        id="code"
                        type="text"
                        required
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg px-4 py-2.5 transition-all duration-200 text-center text-lg tracking-widest"
                        placeholder="000000"
                        maxLength={6}
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg py-2.5 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        'Verify email'
                      )}
                    </Button>
                    
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setVerifying(false)}
                        className="text-sm text-primary hover:text-primary/80 font-medium"
                      >
                        Back to sign up
                      </button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

          <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-sm text-primary text-center">
              <strong>Next Steps:</strong> After creating your account, you&apos;ll select your role and complete your profile.
            </p>
          </div>
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

          {/* School Administrator - Full Width */}
          <button
            onClick={() => handleRoleSelect('SCHOOL')}
            className="group relative w-full bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 p-6 hover:border-indigo-400 hover:shadow-lg transition-all duration-300 text-left"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                <Building2 className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-gray-900">School Administrator</h3>
                  <span className="text-xs px-2 py-1 bg-indigo-600 text-white rounded-full font-semibold">New School</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Register your school on EduTrack AI. Set up your institution, manage all users, configure settings, and access full administrative controls.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full">School Setup</span>
                  <span className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full">Full Access</span>
                  <span className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full">User Management</span>
                  <span className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full">Configuration</span>
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
        <Card className="w-full font-sans max-w-2xl">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep('role')}
                className="p-1"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-2xl font-bold">
                {selectedRole === 'STUDENT' && 'Student Information'}
                {selectedRole === 'TEACHER' && 'Teacher Information'}
                {selectedRole === 'PARENT' && 'Parent Information'}
                {selectedRole === 'PRINCIPAL' && 'Principal Information'}
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
              <div className="bg-blue-50 font-sans border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Account Information (from Clerk)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-800">
                  <div>
                    <span className="font-medium">Name:</span> {user.firstName} {user.lastName}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {user.primaryEmailAddress?.emailAddress}
                  </div>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  ℹ️ This information is managed by your Clerk account and cannot be changed here.
                </p>
              </div>
            )}

            {/* Student Fields */}
            {selectedRole === 'STUDENT' && (
              <div className="space-y-4 font-sans">
                <div className="flex items-center gap-2 mb-4">
                  <Image 
                    src="/logo_white.png" 
                    alt="EduTrack AI Logo" 
                    width={20} 
                    height={20} 
                    className="object-contain"
                  />
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
                      placeholder="e.g., 10th Grade"
                      className="w-full"
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

            {/* Debug info - remove this later */}
            <div className="text-xs text-gray-500 text-center mt-4">
              Debug: Step: {step}, Role: {selectedRole}
            </div>
          </CardContent>
        </Card>
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
                    className="w-full"
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
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          relationshipData.selectedRelationship?.id === user.id
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
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

