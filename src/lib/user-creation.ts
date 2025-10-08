// User creation helper with proper error handling and redirects
import { toast } from 'sonner'

export interface CreateUserData {
  role: string
  schoolId: string
  firstName: string
  lastName: string
  email: string
  grade?: string
  department?: string
  studentProfile?: any
  teacherProfile?: any
  parentProfile?: any
  principalProfile?: any
}

export interface ApiError {
  error: string
  field?: string
  code?: string
}

export async function createUser(userData: CreateUserData): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    console.log('Creating user with data:', userData)
    
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    const result = await response.json()

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 409) {
        const apiError = result as ApiError
        
        if (apiError.code === 'DUPLICATE_EMAIL') {
          toast.error('Email already exists', {
            description: 'A user with this email address already exists. Please use a different email or check if the user is already registered.',
            duration: 5000,
          })
          return { success: false, error: 'duplicate_email' }
        }
      }
      
      if (response.status === 400) {
        toast.error('Configuration Error', {
          description: result.error || 'The school is not properly configured for user creation.',
          duration: 5000,
        })
        return { success: false, error: 'configuration_error' }
      }

      // Generic error
      toast.error('Failed to create user', {
        description: result.error || 'An unexpected error occurred. Please try again.',
        duration: 5000,
      })
      return { success: false, error: result.error || 'unknown_error' }
    }

    // Success
    toast.success('User created successfully', {
      description: `${userData.firstName} ${userData.lastName} has been added as a ${userData.role.toLowerCase()}.`,
      duration: 3000,
    })

    return { success: true, user: result.user }
  } catch (error) {
    console.error('Error creating user:', error)
    toast.error('Network Error', {
      description: 'Failed to connect to the server. Please check your connection and try again.',
      duration: 5000,
    })
    return { success: false, error: 'network_error' }
  }
}

// Helper for handling post-creation redirects (following memory pattern)
export function handlePostCreationRedirect(userRole: string, isModal = false) {
  if (isModal) {
    // If in a modal, just close it and refresh the page/data
    window.location.reload()
  } else {
    // Follow the established pattern from memories - use window.location.replace
    switch (userRole.toLowerCase()) {
      case 'teacher':
        window.location.replace('/dashboard/principal/people?tab=teachers&created=true')
        break
      case 'student':
        window.location.replace('/dashboard/principal/people?tab=students&created=true')
        break
      case 'parent':
        window.location.replace('/dashboard/principal/people?tab=parents&created=true')
        break
      default:
        window.location.replace('/dashboard/principal/people?created=true')
    }
  }
}

// Helper for form validation before submission
export function validateUserData(data: Partial<CreateUserData>): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!data.firstName?.trim()) errors.push('First name is required')
  if (!data.lastName?.trim()) errors.push('Last name is required')
  if (!data.email?.trim()) errors.push('Email is required')
  if (!data.role) errors.push('Role is required')
  if (!data.schoolId) errors.push('School ID is required')
  
  // Email format validation
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Please enter a valid email address')
  }
  
  // Role-specific validation
  if (data.role === 'TEACHER') {
    if (!data.department?.trim()) errors.push('Department is required for teachers')
    if (data.teacherProfile && !data.teacherProfile.employeeId?.trim()) {
      errors.push('Employee ID is required for teachers')
    }
  }
  
  if (data.role === 'STUDENT') {
    if (!data.grade?.trim()) errors.push('Grade is required for students')
  }
  
  return { isValid: errors.length === 0, errors }
}
