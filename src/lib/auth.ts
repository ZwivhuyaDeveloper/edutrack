import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

/**
 * Get the current authenticated user with their profile and school info
 */
export async function getCurrentUser() {
  const { userId } = await auth()
  
  console.log('[getCurrentUser] Clerk userId:', userId)
  
  if (!userId) {
    console.log('[getCurrentUser] No userId from Clerk auth()')
    return null
  }

  let user
  try {
    user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
            country: true,
            logo: true,
            isActive: true,
            clerkOrganizationId: true,
          }
        },
        studentProfile: true,
        teacherProfile: true,
        parentProfile: true,
        principalProfile: true,
        clerkProfile: true
      }
    })
  } catch (error) {
    console.error('[getCurrentUser] Database connection error:', error)
    if (error instanceof Error && error.message.includes('Server has closed the connection')) {
      console.log('[getCurrentUser] Retrying database connection...')
      // Retry once after 1 second delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      user = await prisma.user.findUnique({
        where: { clerkId: userId },
        include: {
          school: {
            select: {
              id: true,
              name: true,
              city: true,
              state: true,
              country: true,
              logo: true,
              isActive: true,
              clerkOrganizationId: true,
            }
          },
          studentProfile: true,
          teacherProfile: true,
          parentProfile: true,
          principalProfile: true,
          clerkProfile: true
        }
      })
      console.log('[getCurrentUser] Retry successful')
    } else {
      console.error('[getCurrentUser] Non-connection error, rethrowing:', error)
      throw error
    }
  }

  console.log('[getCurrentUser] User found in DB:', user ? `Yes (${user.email})` : 'No')

  return user
}

/**
 * Check if user has a specific role
 */
export async function hasRole(role: UserRole | UserRole[]): Promise<boolean> {
  const user = await getCurrentUser()
  
  if (!user) {
    return false
  }

  const roles = Array.isArray(role) ? role : [role]
  return roles.includes(user.role)
}

/**
 * Check if user has any of the specified roles
 */
export async function hasAnyRole(roles: UserRole[]): Promise<boolean> {
  return hasRole(roles)
}

/**
 * Check if user has all of the specified roles (for future multi-role support)
 */
export async function hasAllRoles(roles: UserRole[]): Promise<boolean> {
  const user = await getCurrentUser()
  
  if (!user) {
    return false
  }

  // Currently users have single role, but this can be extended
  return roles.includes(user.role)
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  return user
}

/**
 * Require specific role - throws error if user doesn't have role
 */
export async function requireRole(role: UserRole | UserRole[]) {
  const user = await requireAuth()
  const roles = Array.isArray(role) ? role : [role]
  
  if (!roles.includes(user.role)) {
    throw new Error('Forbidden: Insufficient permissions')
  }

  return user
}

/**
 * Check if user belongs to a specific school
 */
export async function belongsToSchool(schoolId: string): Promise<boolean> {
  const user = await getCurrentUser()
  
  if (!user) {
    return false
  }

  return user.schoolId === schoolId
}

/**
 * Require user to belong to specific school
 */
export async function requireSchool(schoolId: string) {
  const user = await requireAuth()
  
  if (user.schoolId !== schoolId) {
    throw new Error('Forbidden: Access denied to this school')
  }

  return user
}

/**
 * Get user's role-specific profile
 */
export async function getUserProfile() {
  const user = await getCurrentUser()
  
  if (!user) {
    return null
  }

  switch (user.role) {
    case 'STUDENT':
      return user.studentProfile
    case 'TEACHER':
      return user.teacherProfile
    case 'PARENT':
      return user.parentProfile
    case 'PRINCIPAL':
      return user.principalProfile
    case 'CLERK':
      return user.clerkProfile
    case 'ADMIN':
      return null // Admins don't have specific profile
    default:
      return null
  }
}

/**
 * Permission definitions for different roles
 */
export const PERMISSIONS = {
  // Student permissions
  STUDENT: {
    canViewOwnGrades: true,
    canViewOwnAttendance: true,
    canSubmitAssignments: true,
    canViewOwnSchedule: true,
    canAccessResources: true,
    canSendMessages: true,
    canViewOwnFees: true
  },
  
  // Teacher permissions
  TEACHER: {
    canManageGrades: true,
    canManageAttendance: true,
    canCreateAssignments: true,
    canManageLessonPlans: true,
    canViewClassAnalytics: true,
    canManageResources: true,
    canMessageParents: true,
    canMessageStudents: true,
    canViewSchedule: true
  },
  
  // Parent permissions
  PARENT: {
    canViewChildGrades: true,
    canViewChildAttendance: true,
    canViewChildAssignments: true,
    canMessageTeachers: true,
    canViewChildSchedule: true,
    canViewChildFees: true,
    canMakePayments: true
  },
  
  // Principal permissions
  PRINCIPAL: {
    canManageStaff: true,
    canViewAllAnalytics: true,
    canManageClasses: true,
    canManageSubjects: true,
    canManageTerms: true,
    canViewFinancials: true,
    canManageEvents: true,
    canCreateAnnouncements: true,
    canAccessAuditLogs: true,
    canManageSchedule: true
  },
  
  // Clerk permissions
  CLERK: {
    canManageStudents: true,
    canManageEnrollments: true,
    canManageFees: true,
    canProcessPayments: true,
    canManageAttendance: true,
    canGenerateReports: true,
    canManageInventory: true,
    canViewFinancials: true
  },
  
  // Admin permissions (super user)
  ADMIN: {
    canManageSchools: true,
    canManageAllUsers: true,
    canAccessAllData: true,
    canManageSystem: true,
    canViewAuditLogs: true,
    canManagePermissions: true
  }
} as const

/**
 * Check if user has a specific permission
 */
export async function hasPermission(permission: string): Promise<boolean> {
  const user = await getCurrentUser()
  
  if (!user) {
    return false
  }

  const rolePermissions = PERMISSIONS[user.role]
  
  if (!rolePermissions) {
    return false
  }

  return permission in rolePermissions && rolePermissions[permission as keyof typeof rolePermissions] === true
}

/**
 * Get default dashboard route
 * All roles use the main /dashboard which dynamically loads role-specific content
 */
export function getDashboardRoute(): string {
  return '/dashboard'
}

/**
 * Check if user can access a specific resource
 */
export async function canAccessResource(resourceOwnerId: string): Promise<boolean> {
  const user = await getCurrentUser()
  
  if (!user) {
    return false
  }

  // Admins and principals can access all resources in their school
  if (user.role === 'ADMIN' || user.role === 'PRINCIPAL') {
    return true
  }

  // Users can access their own resources
  if (user.id === resourceOwnerId) {
    return true
  }

  return false
}

/**
 * Check if user can manage another user
 */
export async function canManageUser(targetUserId: string): Promise<boolean> {
  const user = await getCurrentUser()
  
  if (!user) {
    return false
  }

  // Admins can manage all users
  if (user.role === 'ADMIN') {
    return true
  }

  // Get target user
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { schoolId: true, role: true }
  })

  if (!targetUser) {
    return false
  }

  // Must be in same school
  if (user.schoolId !== targetUser.schoolId) {
    return false
  }

  // Principals can manage teachers, clerks, students, and parents in their school
  if (user.role === 'PRINCIPAL') {
    return ['TEACHER', 'CLERK', 'STUDENT', 'PARENT'].includes(targetUser.role)
  }

  // Clerks can manage students and parents
  if (user.role === 'CLERK') {
    return ['STUDENT', 'PARENT'].includes(targetUser.role)
  }

  return false
}

/**
 * Validate school access for API routes
 */
export async function validateSchoolAccess(schoolId: string) {
  const user = await requireAuth()
  
  // Admins can access any school
  if (user.role === 'ADMIN') {
    return user
  }

  // Others must belong to the school
  if (user.schoolId !== schoolId) {
    throw new Error('Forbidden: Access denied to this school')
  }

  return user
}

/**
 * Check if user has complete profile setup
 */
export async function hasCompleteProfile(): Promise<boolean> {
  const user = await getCurrentUser()
  
  if (!user) {
    return false
  }

  // Check if user has role-specific profile
  switch (user.role) {
    case 'STUDENT':
      return !!user.studentProfile
    case 'TEACHER':
      return !!user.teacherProfile
    case 'PARENT':
      return !!user.parentProfile
    case 'PRINCIPAL':
      return !!user.principalProfile
    case 'CLERK':
      return !!user.clerkProfile
    case 'ADMIN':
      return true // Admins don't need specific profiles
    default:
      return false
  }
}

/**
 * Get user with full profile data for display
 */
export async function getUserWithFullProfile() {
  const user = await getCurrentUser()
  
  if (!user) {
    return null
  }

  // Return user with computed full name and profile
  return {
    ...user,
    fullName: `${user.firstName} ${user.lastName}`.trim(),
    profile: await getUserProfile()
  }
}

/**
 * Enhanced teacher-specific authentication and validation
 */
export async function requireTeacher() {
  const user = await requireAuth()
  
  if (user.role !== 'TEACHER') {
    throw new Error('Forbidden: Teacher access required')
  }

  // Validate teacher has complete profile
  if (!user.teacherProfile) {
    throw new Error('Teacher profile incomplete. Please complete your profile setup.')
  }

  return {
    ...user,
    profile: user.teacherProfile
  }
}

/**
 * Get teacher with department and qualifications
 */
export async function getTeacherProfile() {
  const user = await getCurrentUser()
  
  if (!user || user.role !== 'TEACHER') {
    return null
  }

  return {
    ...user,
    fullName: `${user.firstName} ${user.lastName}`.trim(),
    profile: user.teacherProfile,
    department: user.teacherProfile?.department || 'Unassigned',
    qualifications: user.teacherProfile?.qualifications || 'Not specified',
    employeeId: user.teacherProfile?.employeeId || 'Not assigned',
    hireDate: user.teacherProfile?.hireDate || null
  }
}

/**
 * Validate teacher profile completeness for dashboard access
 */
export async function validateTeacherProfileComplete(): Promise<{ isComplete: boolean; missingFields: string[] }> {
  const user = await getCurrentUser()
  
  if (!user || user.role !== 'TEACHER') {
    return { isComplete: false, missingFields: ['Not a teacher'] }
  }

  const missingFields: string[] = []
  
  if (!user.teacherProfile) {
    return { isComplete: false, missingFields: ['Teacher profile not created'] }
  }

  // Check required fields for teachers
  if (!user.teacherProfile.department) {
    missingFields.push('Department')
  }
  
  if (!user.teacherProfile.employeeId) {
    missingFields.push('Employee ID')
  }

  // Optional but recommended fields
  if (!user.teacherProfile.qualifications) {
    missingFields.push('Qualifications (recommended)')
  }

  return {
    isComplete: missingFields.length === 0,
    missingFields
  }
}

/**
 * Check if teacher belongs to school and has proper organization membership
 */
export async function validateTeacherSchoolAccess(schoolId?: string): Promise<{ hasAccess: boolean; reason?: string }> {
  const user = await getCurrentUser()
  
  if (!user || user.role !== 'TEACHER') {
    return { hasAccess: false, reason: 'Not a teacher' }
  }

  if (!user.school) {
    return { hasAccess: false, reason: 'No school assigned' }
  }

  if (schoolId && user.schoolId !== schoolId) {
    return { hasAccess: false, reason: 'Access denied to this school' }
  }

  if (!user.school.clerkOrganizationId) {
    return { hasAccess: false, reason: 'School not properly configured with Clerk organization' }
  }

  return { hasAccess: true }
}
