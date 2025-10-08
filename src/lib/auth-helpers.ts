/**
 * Authentication and Authorization Helpers
 * For use in API routes and server components
 */

import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { hasPermission, Resource, PermissionAction } from './permissions'

/**
 * Get authenticated user with role and school information
 */
export async function getAuthenticatedUser() {
  const { userId } = await auth()
  
  if (!userId) {
    return null
  }

  try {
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        school: true,
        studentProfile: true,
        teacherProfile: true,
        parentProfile: true,
        principalProfile: true,
      }
    })

    if (!user) {
      return null
    }

    return {
      id: user.id,
      clerkId: user.clerkId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      schoolId: user.schoolId,
      school: user.school,
      isActive: user.isActive,
      studentProfile: user.studentProfile,
      teacherProfile: user.teacherProfile,
      parentProfile: user.parentProfile,
      principalProfile: user.principalProfile,
    }
  } catch (error) {
    console.error('Error fetching authenticated user:', error)
    return null
  }
}

/**
 * Require authentication - returns user or error response
 */
export async function requireAuth() {
  const user = await getAuthenticatedUser()
  
  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  return { user, error: null }
}

/**
 * Require specific role(s)
 */
export async function requireRole(allowedRoles: UserRole | UserRole[]) {
  const { user, error } = await requireAuth()
  
  if (error) {
    return { user: null, error }
  }

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
  
  if (!roles.includes(user!.role)) {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      )
    }
  }

  return { user, error: null }
}

/**
 * Require specific permission
 */
export async function requirePermission(
  resource: Resource,
  action: PermissionAction
) {
  const { user, error } = await requireAuth()
  
  if (error) {
    return { user: null, error }
  }

  if (!hasPermission(user!.role, resource, action)) {
    return {
      user: null,
      error: NextResponse.json(
        { error: `Forbidden: Missing ${resource}:${action} permission` },
        { status: 403 }
      )
    }
  }

  return { user, error: null }
}

/**
 * Check if user belongs to the same school as the resource
 */
export async function requireSameSchool(resourceSchoolId: string) {
  const { user, error } = await requireAuth()
  
  if (error) {
    return { user: null, error }
  }

  if (user!.schoolId !== resourceSchoolId) {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Forbidden: Cannot access resources from another school' },
        { status: 403 }
      )
    }
  }

  return { user, error: null }
}

/**
 * Check if teacher owns/teaches the class
 */
export async function requireTeacherOwnsClass(classId: string) {
  const { user, error } = await requireRole('TEACHER')
  
  if (error) {
    return { user: null, error }
  }

  const classSubject = await prisma.classSubject.findFirst({
    where: {
      classId: classId,
      teacherId: user!.id
    }
  })

  if (!classSubject) {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Forbidden: You do not teach this class' },
        { status: 403 }
      )
    }
  }

  return { user, error: null }
}

/**
 * Check if student is enrolled in class
 */
export async function requireStudentInClass(classId: string) {
  const { user, error } = await requireRole('STUDENT')
  
  if (error) {
    return { user: null, error }
  }

  const enrollment = await prisma.enrollment.findFirst({
    where: {
      classId: classId,
      studentId: user!.id,
      status: 'ACTIVE'
    }
  })

  if (!enrollment) {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Forbidden: You are not enrolled in this class' },
        { status: 403 }
      )
    }
  }

  return { user, error: null }
}

/**
 * Check if parent has access to student
 */
export async function requireParentOfStudent(studentId: string) {
  const { user, error } = await requireRole('PARENT')
  
  if (error) {
    return { user: null, error }
  }

  const relationship = await prisma.parentChildRelationship.findFirst({
    where: {
      parentId: user!.id,
      childId: studentId
    }
  })

  if (!relationship) {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Forbidden: You are not the parent/guardian of this student' },
        { status: 403 }
      )
    }
  }

  return { user, error: null }
}

/**
 * Get user's children (for parents)
 */
export async function getParentChildren() {
  const { user, error } = await requireRole('PARENT')
  
  if (error) {
    return { children: null, error }
  }

  const relationships = await prisma.parentChildRelationship.findMany({
    where: { parentId: user!.id },
    include: {
      child: {
        include: {
          studentProfile: true
        }
      }
    }
  })

  const children = relationships.map(rel => rel.child)

  return { children, error: null }
}

/**
 * Get teacher's classes
 */
export async function getTeacherClasses() {
  const { user, error } = await requireRole('TEACHER')
  
  if (error) {
    return { classes: null, error }
  }

  const classSubjects = await prisma.classSubject.findMany({
    where: { teacherId: user!.id },
    include: {
      class: {
        include: {
          enrollments: {
            include: {
              student: true
            }
          }
        }
      },
      subject: true
    }
  })

  return { classSubjects, error: null }
}

/**
 * Update user metadata in Clerk
 */
export async function updateUserMetadata(
  userId: string,
  metadata: Record<string, any>
) {
  try {
    await (await clerkClient()).users.updateUserMetadata(userId, {
      publicMetadata: metadata
    })
    return { success: true, error: null }
  } catch (error) {
    console.error('Error updating user metadata:', error)
    return { success: false, error }
  }
}

/**
 * Check if user is active
 */
export async function requireActiveUser() {
  const { user, error } = await requireAuth()
  
  if (error) {
    return { user: null, error }
  }

  if (!user!.isActive) {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Account is inactive. Please contact your administrator.' },
        { status: 403 }
      )
    }
  }

  return { user, error: null }
}
