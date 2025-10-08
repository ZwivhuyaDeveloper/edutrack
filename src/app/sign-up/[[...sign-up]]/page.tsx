"use client"

import { useState, useEffect } from 'react'
import { useUser, SignUp } from '@clerk/nextjs'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, ArrowLeft, UserPlus, Users, UserCheck, Building2, Search } from 'lucide-react'
import { toast } from 'sonner'

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
        
        // Create a temporary principal profile record with minimal school data
        const principalData = {
          role: 'PRINCIPAL',
          schoolId: 'temp', // Will be updated when school is created
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          email: user?.primaryEmailAddress?.emailAddress || '',
          principalProfile: {
            employeeId: profileData.principal.employeeId || null,
            hireDate: profileData.principal.hireDate || null,
            phone: profileData.principal.phone || null,
            address: profileData.principal.address || null,
            emergencyContact: profileData.principal.emergencyContact || null,
            qualifications: profileData.principal.qualifications || null,
            yearsOfExperience: profileData.principal.yearsOfExperience && profileData.principal.yearsOfExperience.trim() ? parseInt(profileData.principal.yearsOfExperience) : null,
            previousSchool: profileData.principal.previousSchool || null,
            educationBackground: profileData.principal.educationBackground || null,
            salary: profileData.principal.salary && profileData.principal.salary.trim() ? parseFloat(profileData.principal.salary) : null,
            administrativeArea: profileData.principal.administrativeArea || null,
          }
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

  const completeUserRegistration = async () => {
    if (!selectedSchool) {
      toast.error('Please select a school')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Update user with school and role information
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: selectedRole,
          schoolId: selectedSchool.id,
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          email: user?.primaryEmailAddress?.emailAddress || '',
          // Include role-specific profile data
          ...(selectedRole === 'STUDENT' && {
            grade: profileData.student.grade,
            studentProfile: {
              dateOfBirth: profileData.student.dateOfBirth,
              studentIdNumber: profileData.student.studentIdNumber,
              emergencyContact: profileData.student.emergencyContact,
              medicalInfo: profileData.student.medicalInfo,
              address: profileData.student.address,
            }
          }),
          ...(selectedRole === 'TEACHER' && {
            department: profileData.teacher.department,
            teacherProfile: {
              employeeId: profileData.teacher.employeeId,
              hireDate: profileData.teacher.hireDate,
              qualifications: profileData.teacher.qualifications,
            }
          }),
          ...(selectedRole === 'PARENT' && {
            parentProfile: {
              phone: profileData.parent.phone,
              address: profileData.parent.address,
              emergencyContact: profileData.parent.emergencyContact,
            }
          }),
          ...(selectedRole === 'PRINCIPAL' && {
            principalProfile: {
              employeeId: profileData.principal.employeeId || null,
              hireDate: profileData.principal.hireDate || null,
              phone: profileData.principal.phone || null,
              address: profileData.principal.address || null,
              emergencyContact: profileData.principal.emergencyContact || null,
              qualifications: profileData.principal.qualifications || null,
              yearsOfExperience: profileData.principal.yearsOfExperience && profileData.principal.yearsOfExperience.trim() ? parseInt(profileData.principal.yearsOfExperience) : null,
              previousSchool: profileData.principal.previousSchool || null,
              educationBackground: profileData.principal.educationBackground || null,
              salary: profileData.principal.salary && profileData.principal.salary.trim() ? parseFloat(profileData.principal.salary) : null,
              administrativeArea: profileData.principal.administrativeArea || null,
            }
          }),
          // Include relationship data if selected
          ...(relationshipData.selectedRelationship && {
            relationshipUserId: relationshipData.selectedRelationship.id,
            relationshipType: relationshipData.relationshipType
          })
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete registration')
      }

      toast.success('Registration completed successfully!')
      setStep('complete')
      
      // Trigger profile recheck and redirect to dashboard
      setRecheckProfile(prev => prev + 1)
      setTimeout(() => {
        // Use replace to avoid back button issues and ensure clean redirect
        window.location.replace('/dashboard')
      }, 1500)

    } catch (error) {
      console.error('Registration error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete registration'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
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
      <div className="font-sans min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md flex flex-col justify-center items-center">
          <div className="text-center justify-center items-center mb-8">
            <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
              <Image 
                src="/logo_white.png" 
                alt="EduTrack AI Logo" 
                width={40} 
                height={40} 
                className="object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Join EduTrack AI Software
            </h1>
            <p className="text-gray-600">
              Create your account to get started with the application process.
            </p>
          </div>

          <SignUp 
            appearance={{
              elements: {
                // Root card styling
                rootBox: 'w-full',
                card: 'shadow-2xl border border-gray-200 rounded-2xl bg-white',
                
                // Header styling
                headerTitle: 'text-2xl font-bold text-gray-900',
                headerSubtitle: 'text-gray-600 text-sm mt-2',
                
                // Form container
                formContainer: 'space-y-4',
                
                // Form fields
                formFieldLabel: 'text-sm font-medium text-gray-700 mb-1.5',
                formFieldInput: 'border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg px-4 py-2.5 transition-all duration-200',
                formFieldInputShowPasswordButton: 'text-gray-500 hover:text-gray-700',
                
                // Primary button (Sign Up)
                formButtonPrimary: 'bg-primary hover:bg-primary/90 text-white font-semibold normal-case rounded-lg py-2.5 transition-all duration-200 shadow-sm hover:shadow-md',
                
                // Social buttons
                socialButtonsBlockButton: 'border-gray-300 hover:bg-gray-50 hover:border-gray-400 rounded-lg transition-all duration-200 normal-case font-medium',
                socialButtonsBlockButtonText: 'text-gray-700 font-medium',
                socialButtonsProviderIcon: 'w-5 h-5',
                
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
                main: 'px-8 py-6',
              },
              layout: {
                socialButtonsPlacement: 'top',
                socialButtonsVariant: 'blockButton',
                termsPageUrl: '/terms',
                privacyPageUrl: '/privacy',
              },
            }}
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            forceRedirectUrl="/sign-up" // Force redirect to continue profile setup after Clerk auth
          />

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 text-center">
              <strong>Next Steps:</strong> After creating your account, you&apos;ll select your role and complete your profile.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'role') {
    return (
      <div className="font-sans min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full font-sans max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Choose Your Role</CardTitle>
            <CardDescription className="text-center">
              Select the role that best describes you to continue registration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-blue-50 hover:border-blue-200"
                onClick={() => handleRoleSelect('STUDENT')}
              >
                <Image 
                  src="/logo_white.png" 
                  alt="EduTrack AI Logo" 
                  width={32} 
                  height={32} 
                  className="object-contain"
                />
                <span className="font-semibold">Student/Learner</span>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-green-50 hover:border-green-200"
                onClick={() => handleRoleSelect('PARENT')}
              >
                <Users className="h-8 w-8 text-green-600" />
                <span className="font-semibold">Parent/Guardian</span>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-purple-50 hover:border-purple-200"
                onClick={() => handleRoleSelect('TEACHER')}
              >
                <UserCheck className="h-8 w-8 text-purple-600" />
                <span className="font-semibold">Teacher</span>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-red-50 hover:border-red-200"
                onClick={() => handleRoleSelect('PRINCIPAL')}
              >
                <UserCheck className="h-8 w-8 text-orange-600" />
                <span className="font-semibold">Principal/Admin</span>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-indigo-50 hover:border-indigo-200"
                onClick={() => handleRoleSelect('SCHOOL')}
              >
                <Building2 className="h-8 w-8 text-indigo-600" />
                <span className="font-semibold">School Administrator</span>
              </Button>
            </div>
          </CardContent>
        </Card>
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

