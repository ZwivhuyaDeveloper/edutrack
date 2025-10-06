import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createUserSchema = z.object({
  role: z.enum(['STUDENT', 'TEACHER', 'PARENT', 'PRINCIPAL']),
  schoolId: z.string().min(1, 'School is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  // Optional fields for role-specific profiles
  grade: z.string().optional(), // For students
  department: z.string().optional(), // For teachers
  parentChildRelationships: z.array(z.string()).optional(), // For parents/students
  // Student profile fields
  studentProfile: z.object({
    dateOfBirth: z.string().optional(),
    studentIdNumber: z.string().optional(),
    emergencyContact: z.string().optional(),
    medicalInfo: z.string().optional(),
    address: z.string().optional(),
  }).optional(),
  // Teacher profile fields
  teacherProfile: z.object({
    employeeId: z.string().optional(),
    hireDate: z.string().optional(),
    qualifications: z.string().optional(),
  }).optional(),
  // Parent profile fields
  parentProfile: z.object({
    phone: z.string().optional(),
    address: z.string().optional(),
    emergencyContact: z.string().optional(),
  }).optional(),
  // Principal profile fields
  principalProfile: z.object({
    employeeId: z.string().optional(),
    hireDate: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    emergencyContact: z.string().optional(),
    qualifications: z.string().optional(),
    yearsOfExperience: z.number().int().positive().optional(),
    previousSchool: z.string().optional(),
    educationBackground: z.string().optional(),
    salary: z.number().positive().optional(),
    administrativeArea: z.string().optional(),
  }).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current user to check permissions
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { school: true }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Only principals and teachers can view users in their school
    if (!['PRINCIPAL', 'TEACHER'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const search = searchParams.get('search')

    const users = await prisma.user.findMany({
      where: {
        schoolId: currentUser.schoolId,
        isActive: true,
        ...(role && { role: role as 'STUDENT' | 'TEACHER' | 'PARENT' | 'PRINCIPAL' }),
        ...(search && {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        })
      },
      include: {
        school: {
          select: {
            id: true,
            name: true
          }
        },
        studentProfile: true,
        teacherProfile: true,
        parentProfile: true,
        principalProfile: true
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' }
      ]
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createUserSchema.parse(body)

    // Check if this is a self-registration (user doesn't exist yet)
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { school: true }
    })

    // If user doesn't exist, this is self-registration - allow it
    const isSelfRegistration = !currentUser

    if (!isSelfRegistration) {
      // Existing user creating another user - only principals can do this
      if (currentUser.role !== 'PRINCIPAL') {
        return NextResponse.json({ error: 'Only principals can create users' }, { status: 403 })
      }

      // Verify school exists and user has access to it
      if (validatedData.schoolId !== currentUser.schoolId) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    const school = await prisma.school.findUnique({
      where: {
        id: validatedData.schoolId
      }
    })

    if (!school) {
      return NextResponse.json({ error: 'School not found or access denied' }, { status: 404 })
    }

    // Check if email already exists
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUserByEmail && existingUserByEmail.clerkId !== userId) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 })
    }

    // For self-registration, check if user with this clerkId already exists
    if (isSelfRegistration) {
      const existingUserByClerkId = await prisma.user.findUnique({
        where: { clerkId: userId }
      })

      if (existingUserByClerkId) {
        return NextResponse.json({ error: 'User already registered' }, { status: 400 })
      }
    }

    // Step 1: Add user to Clerk organization and set metadata
    if (isSelfRegistration && school.clerkOrganizationId) {
      try {
        const { clerkClient } = await import('@clerk/nextjs/server')
        const { getClerkOrgRole, getPermissionStrings } = await import('@/lib/permissions')
        
        // Add to organization with role-based permissions
        await (await clerkClient()).organizations.createOrganizationMembership({
          organizationId: school.clerkOrganizationId,
          userId,
          role: getClerkOrgRole(validatedData.role),
        })
        
        // Update user's public metadata with permissions
        await (await clerkClient()).users.updateUserMetadata(userId, {
          publicMetadata: {
            role: validatedData.role,
            schoolId: validatedData.schoolId,
            schoolName: school.name,
            organizationId: school.clerkOrganizationId,
            permissions: getPermissionStrings(validatedData.role),
            isActive: true,
            ...(validatedData.grade && { grade: validatedData.grade }),
            ...(validatedData.department && { department: validatedData.department }),
          }
        })
        
        console.log(`Added user ${userId} to Clerk organization ${school.clerkOrganizationId} with role ${validatedData.role}`)
      } catch (clerkError) {
        console.error('Error adding user to Clerk organization:', clerkError)
        // Continue with user creation even if Clerk organization membership fails
      }
    }

    // Step 2: Create user in database
    const user = await prisma.user.create({
      data: {
        clerkId: isSelfRegistration ? userId : '', // Use Clerk ID for self-registration
        email: validatedData.email,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        role: validatedData.role,
        schoolId: validatedData.schoolId,
        isActive: isSelfRegistration // Activate immediately for self-registration
      }
    })

    // Create role-specific profile
    switch (validatedData.role) {
      case 'STUDENT':
        await prisma.studentProfile.create({
          data: {
            studentId: user.id,
            grade: validatedData.grade || null,
            dateOfBirth: validatedData.studentProfile?.dateOfBirth ? new Date(validatedData.studentProfile.dateOfBirth) : null,
            studentIdNumber: validatedData.studentProfile?.studentIdNumber || null,
            emergencyContact: validatedData.studentProfile?.emergencyContact || null,
            medicalInfo: validatedData.studentProfile?.medicalInfo || null,
            address: validatedData.studentProfile?.address || null,
          }
        })
        break
      case 'TEACHER':
        await prisma.teacherProfile.create({
          data: {
            teacherId: user.id,
            department: validatedData.department || null,
            employeeId: validatedData.teacherProfile?.employeeId || null,
            hireDate: validatedData.teacherProfile?.hireDate ? new Date(validatedData.teacherProfile.hireDate) : null,
            qualifications: validatedData.teacherProfile?.qualifications || null,
          }
        })
        break
      case 'PARENT':
        await prisma.parentProfile.create({
          data: {
            parentId: user.id,
            phone: validatedData.parentProfile?.phone || null,
            address: validatedData.parentProfile?.address || null,
            emergencyContact: validatedData.parentProfile?.emergencyContact || null,
          }
        })
        break
      case 'PRINCIPAL':
        await prisma.principalProfile.create({
          data: {
            principalId: user.id,
            employeeId: validatedData.principalProfile?.employeeId || null,
            hireDate: validatedData.principalProfile?.hireDate ? new Date(validatedData.principalProfile.hireDate) : null,
            phone: validatedData.principalProfile?.phone || null,
            address: validatedData.principalProfile?.address || null,
            emergencyContact: validatedData.principalProfile?.emergencyContact || null,
            qualifications: validatedData.principalProfile?.qualifications || null,
            yearsOfExperience: validatedData.principalProfile?.yearsOfExperience || null,
            previousSchool: validatedData.principalProfile?.previousSchool || null,
            educationBackground: validatedData.principalProfile?.educationBackground || null,
            salary: validatedData.principalProfile?.salary || null,
            administrativeArea: validatedData.principalProfile?.administrativeArea || null,
          }
        })
        break
    }

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
