/**
 * Comprehensive Permission System for EduTrack
 * Based on Prisma Schema and User Roles
 */

import { UserRole } from '@prisma/client'

// ============================================
// CLERK ORGANIZATION ROLES & PERMISSIONS
// ============================================

/**
 * Clerk Organization Roles
 * These are set when users join a school's Clerk organization
 */
export const CLERK_ORG_ROLES = {
  PRINCIPAL: 'org:admin',      // Full administrative access
  TEACHER: 'org:member',       // Teaching and grading permissions (using standard role)
  STUDENT: 'org:member',       // Student access (using standard role)
  PARENT: 'org:member',        // Parent/guardian access (using standard role)
  CLERK: 'org:member',         // Administrative staff (using standard role)
  ADMIN: 'org:admin',          // System administrator
} as const

/**
 * Clerk User Metadata
 * Stored in Clerk's publicMetadata for each user
 */
export interface ClerkUserMetadata {
  role: UserRole
  schoolId: string
  schoolName: string
  organizationId?: string
  permissions: string[]
  grade?: string              // For students
  department?: string         // For teachers
  employeeId?: string         // For staff
  isActive: boolean
}

// ============================================
// RESOURCE PERMISSIONS
// ============================================

/**
 * Permission Actions
 */
export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',          // Full CRUD
  APPROVE = 'approve',
  GRADE = 'grade',
  SUBMIT = 'submit',
  VIEW_ALL = 'view_all',      // View all records
  VIEW_OWN = 'view_own',      // View only own records
  VIEW_CLASS = 'view_class',  // View class records
}

/**
 * Resources in the system
 */
export enum Resource {
  // User Management
  USERS = 'users',
  STUDENTS = 'students',
  TEACHERS = 'teachers',
  PARENTS = 'parents',
  PRINCIPALS = 'principals',
  
  // Academic
  CLASSES = 'classes',
  SUBJECTS = 'subjects',
  ENROLLMENTS = 'enrollments',
  ASSIGNMENTS = 'assignments',
  ASSIGNMENT_SUBMISSIONS = 'assignment_submissions',
  GRADES = 'grades',
  GRADE_ITEMS = 'grade_items',
  GRADE_CATEGORIES = 'grade_categories',
  
  // Attendance
  ATTENDANCE = 'attendance',
  ATTENDANCE_SESSIONS = 'attendance_sessions',
  
  // Scheduling
  CLASS_MEETINGS = 'class_meetings',
  PERIODS = 'periods',
  ROOMS = 'rooms',
  TERMS = 'terms',
  
  // Communication
  MESSAGES = 'messages',
  CONVERSATIONS = 'conversations',
  ANNOUNCEMENTS = 'announcements',
  NOTIFICATIONS = 'notifications',
  
  // Resources & Content
  RESOURCES = 'resources',
  LESSON_PLANS = 'lesson_plans',
  
  // Events & Calendar
  EVENTS = 'events',
  
  // Financial
  FEE_RECORDS = 'fee_records',
  INVOICES = 'invoices',
  PAYMENTS = 'payments',
  STUDENT_ACCOUNTS = 'student_accounts',
  
  // School Management
  SCHOOL = 'school',
  REPORTS = 'reports',
  AUDIT_LOGS = 'audit_logs',
}

// ============================================
// ROLE-BASED PERMISSIONS
// ============================================

type PermissionMap = {
  [key in Resource]?: PermissionAction[]
}

/**
 * STUDENT PERMISSIONS
 * Students can view their own academic information and submit work
 */
export const STUDENT_PERMISSIONS: PermissionMap = {
  // Own Profile
  [Resource.USERS]: [PermissionAction.READ, PermissionAction.UPDATE],
  [Resource.STUDENTS]: [PermissionAction.VIEW_OWN],
  
  // Academic - View Only
  [Resource.CLASSES]: [PermissionAction.VIEW_OWN],
  [Resource.SUBJECTS]: [PermissionAction.VIEW_OWN],
  [Resource.ENROLLMENTS]: [PermissionAction.VIEW_OWN],
  
  // Assignments - View and Submit
  [Resource.ASSIGNMENTS]: [PermissionAction.VIEW_OWN, PermissionAction.READ],
  [Resource.ASSIGNMENT_SUBMISSIONS]: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.VIEW_OWN],
  
  // Grades - View Only
  [Resource.GRADES]: [PermissionAction.VIEW_OWN, PermissionAction.READ],
  [Resource.GRADE_ITEMS]: [PermissionAction.VIEW_OWN],
  
  // Attendance - View Own
  [Resource.ATTENDANCE]: [PermissionAction.VIEW_OWN],
  
  // Schedule - View Own
  [Resource.CLASS_MEETINGS]: [PermissionAction.VIEW_OWN],
  [Resource.PERIODS]: [PermissionAction.READ],
  [Resource.ROOMS]: [PermissionAction.READ],
  [Resource.TERMS]: [PermissionAction.READ],
  
  // Communication
  [Resource.MESSAGES]: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.VIEW_OWN],
  [Resource.CONVERSATIONS]: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.VIEW_OWN],
  [Resource.ANNOUNCEMENTS]: [PermissionAction.READ],
  [Resource.NOTIFICATIONS]: [PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.VIEW_OWN],
  
  // Resources - View Only
  [Resource.RESOURCES]: [PermissionAction.READ, PermissionAction.VIEW_CLASS],
  [Resource.LESSON_PLANS]: [PermissionAction.READ, PermissionAction.VIEW_CLASS],
  
  // Events
  [Resource.EVENTS]: [PermissionAction.READ],
  
  // Financial - View Own
  [Resource.FEE_RECORDS]: [PermissionAction.VIEW_OWN],
  [Resource.INVOICES]: [PermissionAction.VIEW_OWN],
  [Resource.STUDENT_ACCOUNTS]: [PermissionAction.VIEW_OWN],
}

/**
 * TEACHER PERMISSIONS
 * Teachers can manage their classes, grade students, and create content
 */
export const TEACHER_PERMISSIONS: PermissionMap = {
  // Profile
  [Resource.USERS]: [PermissionAction.READ, PermissionAction.UPDATE],
  [Resource.TEACHERS]: [PermissionAction.VIEW_OWN],
  
  // Students - View Class Students
  [Resource.STUDENTS]: [PermissionAction.VIEW_CLASS, PermissionAction.READ],
  
  // Academic - Manage Own Classes
  [Resource.CLASSES]: [PermissionAction.VIEW_CLASS, PermissionAction.READ],
  [Resource.SUBJECTS]: [PermissionAction.VIEW_CLASS, PermissionAction.READ],
  [Resource.ENROLLMENTS]: [PermissionAction.VIEW_CLASS, PermissionAction.READ],
  
  // Assignments - Full Control for Own Classes
  [Resource.ASSIGNMENTS]: [PermissionAction.MANAGE, PermissionAction.VIEW_CLASS],
  [Resource.ASSIGNMENT_SUBMISSIONS]: [PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.GRADE, PermissionAction.VIEW_CLASS],
  
  // Grades - Full Control for Own Classes
  [Resource.GRADES]: [PermissionAction.MANAGE, PermissionAction.VIEW_CLASS],
  [Resource.GRADE_ITEMS]: [PermissionAction.MANAGE, PermissionAction.VIEW_CLASS],
  [Resource.GRADE_CATEGORIES]: [PermissionAction.MANAGE, PermissionAction.VIEW_CLASS],
  
  // Attendance - Manage for Own Classes
  [Resource.ATTENDANCE]: [PermissionAction.MANAGE, PermissionAction.VIEW_CLASS],
  [Resource.ATTENDANCE_SESSIONS]: [PermissionAction.MANAGE, PermissionAction.VIEW_CLASS],
  
  // Schedule - View and Manage Own
  [Resource.CLASS_MEETINGS]: [PermissionAction.VIEW_CLASS, PermissionAction.READ],
  [Resource.PERIODS]: [PermissionAction.READ],
  [Resource.ROOMS]: [PermissionAction.READ],
  [Resource.TERMS]: [PermissionAction.READ],
  
  // Communication
  [Resource.MESSAGES]: [PermissionAction.MANAGE],
  [Resource.CONVERSATIONS]: [PermissionAction.MANAGE],
  [Resource.ANNOUNCEMENTS]: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.VIEW_CLASS],
  [Resource.NOTIFICATIONS]: [PermissionAction.MANAGE],
  
  // Resources - Create and Manage
  [Resource.RESOURCES]: [PermissionAction.MANAGE],
  [Resource.LESSON_PLANS]: [PermissionAction.MANAGE],
  
  // Events
  [Resource.EVENTS]: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE],
  
  // Reports - View Class Reports
  [Resource.REPORTS]: [PermissionAction.VIEW_CLASS, PermissionAction.CREATE],
}

/**
 * PARENT PERMISSIONS
 * Parents can view their children's academic information
 */
export const PARENT_PERMISSIONS: PermissionMap = {
  // Profile
  [Resource.USERS]: [PermissionAction.READ, PermissionAction.UPDATE],
  [Resource.PARENTS]: [PermissionAction.VIEW_OWN],
  
  // Children - View Only
  [Resource.STUDENTS]: [PermissionAction.VIEW_OWN], // Own children only
  
  // Academic - View Children's Data
  [Resource.CLASSES]: [PermissionAction.VIEW_OWN],
  [Resource.SUBJECTS]: [PermissionAction.VIEW_OWN],
  [Resource.ENROLLMENTS]: [PermissionAction.VIEW_OWN],
  
  // Assignments - View Children's
  [Resource.ASSIGNMENTS]: [PermissionAction.VIEW_OWN, PermissionAction.READ],
  [Resource.ASSIGNMENT_SUBMISSIONS]: [PermissionAction.VIEW_OWN, PermissionAction.READ],
  
  // Grades - View Children's
  [Resource.GRADES]: [PermissionAction.VIEW_OWN, PermissionAction.READ],
  [Resource.GRADE_ITEMS]: [PermissionAction.VIEW_OWN],
  
  // Attendance - View Children's
  [Resource.ATTENDANCE]: [PermissionAction.VIEW_OWN, PermissionAction.READ],
  
  // Schedule - View Children's
  [Resource.CLASS_MEETINGS]: [PermissionAction.VIEW_OWN],
  [Resource.PERIODS]: [PermissionAction.READ],
  [Resource.TERMS]: [PermissionAction.READ],
  
  // Communication - With Teachers
  [Resource.MESSAGES]: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.VIEW_OWN],
  [Resource.CONVERSATIONS]: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.VIEW_OWN],
  [Resource.ANNOUNCEMENTS]: [PermissionAction.READ],
  [Resource.NOTIFICATIONS]: [PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.VIEW_OWN],
  
  // Events
  [Resource.EVENTS]: [PermissionAction.READ],
  
  // Financial - View Children's
  [Resource.FEE_RECORDS]: [PermissionAction.VIEW_OWN],
  [Resource.INVOICES]: [PermissionAction.VIEW_OWN],
  [Resource.PAYMENTS]: [PermissionAction.CREATE, PermissionAction.VIEW_OWN],
  [Resource.STUDENT_ACCOUNTS]: [PermissionAction.VIEW_OWN],
}

/**
 * PRINCIPAL PERMISSIONS
 * Principals have full administrative access to their school
 */
export const PRINCIPAL_PERMISSIONS: PermissionMap = {
  // User Management - Full Control
  [Resource.USERS]: [PermissionAction.MANAGE],
  [Resource.STUDENTS]: [PermissionAction.MANAGE],
  [Resource.TEACHERS]: [PermissionAction.MANAGE],
  [Resource.PARENTS]: [PermissionAction.MANAGE],
  [Resource.PRINCIPALS]: [PermissionAction.VIEW_OWN],
  
  // Academic - Full Control
  [Resource.CLASSES]: [PermissionAction.MANAGE],
  [Resource.SUBJECTS]: [PermissionAction.MANAGE],
  [Resource.ENROLLMENTS]: [PermissionAction.MANAGE],
  [Resource.ASSIGNMENTS]: [PermissionAction.VIEW_ALL, PermissionAction.READ],
  [Resource.ASSIGNMENT_SUBMISSIONS]: [PermissionAction.VIEW_ALL, PermissionAction.READ],
  [Resource.GRADES]: [PermissionAction.VIEW_ALL, PermissionAction.READ],
  [Resource.GRADE_ITEMS]: [PermissionAction.VIEW_ALL],
  [Resource.GRADE_CATEGORIES]: [PermissionAction.VIEW_ALL],
  
  // Attendance - View All
  [Resource.ATTENDANCE]: [PermissionAction.VIEW_ALL, PermissionAction.READ],
  [Resource.ATTENDANCE_SESSIONS]: [PermissionAction.VIEW_ALL, PermissionAction.READ],
  
  // Schedule - Full Control
  [Resource.CLASS_MEETINGS]: [PermissionAction.MANAGE],
  [Resource.PERIODS]: [PermissionAction.MANAGE],
  [Resource.ROOMS]: [PermissionAction.MANAGE],
  [Resource.TERMS]: [PermissionAction.MANAGE],
  
  // Communication - Full Control
  [Resource.MESSAGES]: [PermissionAction.MANAGE],
  [Resource.CONVERSATIONS]: [PermissionAction.MANAGE],
  [Resource.ANNOUNCEMENTS]: [PermissionAction.MANAGE],
  [Resource.NOTIFICATIONS]: [PermissionAction.MANAGE],
  
  // Resources - Full Control
  [Resource.RESOURCES]: [PermissionAction.MANAGE],
  [Resource.LESSON_PLANS]: [PermissionAction.VIEW_ALL, PermissionAction.READ],
  
  // Events - Full Control
  [Resource.EVENTS]: [PermissionAction.MANAGE],
  
  // Financial - View Only (Clerk manages)
  [Resource.FEE_RECORDS]: [PermissionAction.VIEW_ALL, PermissionAction.READ],
  [Resource.INVOICES]: [PermissionAction.VIEW_ALL, PermissionAction.READ],
  [Resource.PAYMENTS]: [PermissionAction.VIEW_ALL, PermissionAction.READ],
  [Resource.STUDENT_ACCOUNTS]: [PermissionAction.VIEW_ALL, PermissionAction.READ],
  
  // School Management
  [Resource.SCHOOL]: [PermissionAction.MANAGE],
  [Resource.REPORTS]: [PermissionAction.MANAGE],
  [Resource.AUDIT_LOGS]: [PermissionAction.READ, PermissionAction.VIEW_ALL],
}

/**
 * CLERK (Administrative Staff) PERMISSIONS
 * Clerks manage student records, fees, and administrative tasks
 */
export const CLERK_PERMISSIONS: PermissionMap = {
  // Profile
  [Resource.USERS]: [PermissionAction.READ, PermissionAction.UPDATE],
  
  // Students - Manage Records
  [Resource.STUDENTS]: [PermissionAction.MANAGE],
  [Resource.ENROLLMENTS]: [PermissionAction.MANAGE],
  
  // Academic - View Only
  [Resource.CLASSES]: [PermissionAction.READ, PermissionAction.VIEW_ALL],
  [Resource.SUBJECTS]: [PermissionAction.READ, PermissionAction.VIEW_ALL],
  [Resource.GRADES]: [PermissionAction.READ, PermissionAction.VIEW_ALL],
  
  // Attendance - View and Record
  [Resource.ATTENDANCE]: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.VIEW_ALL],
  [Resource.ATTENDANCE_SESSIONS]: [PermissionAction.READ, PermissionAction.VIEW_ALL],
  
  // Communication
  [Resource.MESSAGES]: [PermissionAction.CREATE, PermissionAction.READ],
  [Resource.ANNOUNCEMENTS]: [PermissionAction.CREATE, PermissionAction.READ],
  [Resource.NOTIFICATIONS]: [PermissionAction.CREATE, PermissionAction.READ],
  
  // Financial - Full Control
  [Resource.FEE_RECORDS]: [PermissionAction.MANAGE],
  [Resource.INVOICES]: [PermissionAction.MANAGE],
  [Resource.PAYMENTS]: [PermissionAction.MANAGE],
  [Resource.STUDENT_ACCOUNTS]: [PermissionAction.MANAGE],
  
  // Reports
  [Resource.REPORTS]: [PermissionAction.CREATE, PermissionAction.READ],
}

/**
 * ADMIN (System Administrator) PERMISSIONS
 * Full system access
 */
export const ADMIN_PERMISSIONS: PermissionMap = {
  // Everything - Full Control
  [Resource.USERS]: [PermissionAction.MANAGE],
  [Resource.STUDENTS]: [PermissionAction.MANAGE],
  [Resource.TEACHERS]: [PermissionAction.MANAGE],
  [Resource.PARENTS]: [PermissionAction.MANAGE],
  [Resource.PRINCIPALS]: [PermissionAction.MANAGE],
  [Resource.CLASSES]: [PermissionAction.MANAGE],
  [Resource.SUBJECTS]: [PermissionAction.MANAGE],
  [Resource.ENROLLMENTS]: [PermissionAction.MANAGE],
  [Resource.ASSIGNMENTS]: [PermissionAction.MANAGE],
  [Resource.ASSIGNMENT_SUBMISSIONS]: [PermissionAction.MANAGE],
  [Resource.GRADES]: [PermissionAction.MANAGE],
  [Resource.GRADE_ITEMS]: [PermissionAction.MANAGE],
  [Resource.GRADE_CATEGORIES]: [PermissionAction.MANAGE],
  [Resource.ATTENDANCE]: [PermissionAction.MANAGE],
  [Resource.ATTENDANCE_SESSIONS]: [PermissionAction.MANAGE],
  [Resource.CLASS_MEETINGS]: [PermissionAction.MANAGE],
  [Resource.PERIODS]: [PermissionAction.MANAGE],
  [Resource.ROOMS]: [PermissionAction.MANAGE],
  [Resource.TERMS]: [PermissionAction.MANAGE],
  [Resource.MESSAGES]: [PermissionAction.MANAGE],
  [Resource.CONVERSATIONS]: [PermissionAction.MANAGE],
  [Resource.ANNOUNCEMENTS]: [PermissionAction.MANAGE],
  [Resource.NOTIFICATIONS]: [PermissionAction.MANAGE],
  [Resource.RESOURCES]: [PermissionAction.MANAGE],
  [Resource.LESSON_PLANS]: [PermissionAction.MANAGE],
  [Resource.EVENTS]: [PermissionAction.MANAGE],
  [Resource.FEE_RECORDS]: [PermissionAction.MANAGE],
  [Resource.INVOICES]: [PermissionAction.MANAGE],
  [Resource.PAYMENTS]: [PermissionAction.MANAGE],
  [Resource.STUDENT_ACCOUNTS]: [PermissionAction.MANAGE],
  [Resource.SCHOOL]: [PermissionAction.MANAGE],
  [Resource.REPORTS]: [PermissionAction.MANAGE],
  [Resource.AUDIT_LOGS]: [PermissionAction.MANAGE],
}

// ============================================
// PERMISSION HELPERS
// ============================================

/**
 * Get permissions for a specific role
 */
export function getPermissionsForRole(role: UserRole): PermissionMap {
  switch (role) {
    case 'STUDENT':
      return STUDENT_PERMISSIONS
    case 'TEACHER':
      return TEACHER_PERMISSIONS
    case 'PARENT':
      return PARENT_PERMISSIONS
    case 'PRINCIPAL':
      return PRINCIPAL_PERMISSIONS
    case 'CLERK':
      return CLERK_PERMISSIONS
    case 'ADMIN':
      return ADMIN_PERMISSIONS
    default:
      return {}
  }
}

/**
 * Check if a role has permission for a resource and action
 */
export function hasPermission(
  role: UserRole,
  resource: Resource,
  action: PermissionAction
): boolean {
  const permissions = getPermissionsForRole(role)
  const resourcePermissions = permissions[resource]
  
  if (!resourcePermissions) return false
  
  // MANAGE permission includes all actions
  if (resourcePermissions.includes(PermissionAction.MANAGE)) return true
  
  return resourcePermissions.includes(action)
}

/**
 * Get Clerk organization role for a user role
 */
export function getClerkOrgRole(role: UserRole): string {
  switch (role) {
    case 'PRINCIPAL':
      return CLERK_ORG_ROLES.PRINCIPAL
    case 'TEACHER':
      return CLERK_ORG_ROLES.TEACHER
    case 'STUDENT':
      return CLERK_ORG_ROLES.STUDENT
    case 'PARENT':
      return CLERK_ORG_ROLES.PARENT
    case 'CLERK':
      return CLERK_ORG_ROLES.CLERK
    case 'ADMIN':
      return CLERK_ORG_ROLES.ADMIN
    default:
      return 'org:member'
  }
}

/**
 * Get permission list as string array for Clerk metadata
 */
export function getPermissionStrings(role: UserRole): string[] {
  const permissions = getPermissionsForRole(role)
  const permissionStrings: string[] = []
  
  Object.entries(permissions).forEach(([resource, actions]) => {
    actions?.forEach(action => {
      permissionStrings.push(`${resource}:${action}`)
    })
  })
  
  return permissionStrings
}
