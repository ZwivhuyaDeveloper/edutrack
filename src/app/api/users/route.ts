import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { User } from '@prisma/client'
import { z } from 'zod'

// Helper function to create or update user profile based on role
async function createOrUpdateUserProfile(user: User, validatedData: CreateUserType) {
  switch (validatedData.role) {
    case 'STUDENT':
      await prisma.studentProfile.upsert({
        where: { studentId: user.id },
        create: {
          studentId: user.id,
          grade: validatedData.grade || null,
          dateOfBirth: validatedData.studentProfile?.dateOfBirth ? new Date(validatedData.studentProfile.dateOfBirth) : null,
          studentIdNumber: validatedData.studentProfile?.studentIdNumber || null,
          emergencyContact: validatedData.studentProfile?.emergencyContact || null,
          medicalInfo: validatedData.studentProfile?.medicalInfo || null,
          address: validatedData.studentProfile?.address || null,
        },
        update: {
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
      await prisma.teacherProfile.upsert({
        where: { teacherId: user.id },
        create: {
          teacherId: user.id,
          department: validatedData.department || null,
          employeeId: validatedData.teacherProfile?.employeeId || null,
          hireDate: validatedData.teacherProfile?.hireDate ? new Date(validatedData.teacherProfile.hireDate) : null,
          qualifications: validatedData.teacherProfile?.qualifications || null,
        },
        update: {
          department: validatedData.department || null,
          employeeId: validatedData.teacherProfile?.employeeId || null,
          hireDate: validatedData.teacherProfile?.hireDate ? new Date(validatedData.teacherProfile.hireDate) : null,
          qualifications: validatedData.teacherProfile?.qualifications || null,
        }
      })
      break
    case 'PARENT':
      await prisma.parentProfile.upsert({
        where: { parentId: user.id },
        create: {
          parentId: user.id,
          phone: validatedData.parentProfile?.phone || null,
          address: validatedData.parentProfile?.address || null,
          emergencyContact: validatedData.parentProfile?.emergencyContact || null,
        },
        update: {
          phone: validatedData.parentProfile?.phone || null,
          address: validatedData.parentProfile?.address || null,
          emergencyContact: validatedData.parentProfile?.emergencyContact || null,
        }
      })
      break
    case 'PRINCIPAL':
      console.log('Creating/Updating Principal Profile with data:', JSON.stringify(validatedData.principalProfile, null, 2))
      await prisma.principalProfile.upsert({
        where: { principalId: user.id },
        create: {
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
        },
        update: {
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
      console.log('Principal Profile created/updated successfully')
      break
  }
}

// Helper function to create or update ClerkProfile
async function createOrUpdateClerkProfile(user: User, validatedData: CreateUserType, userId: string) {
  try {
    await prisma.clerkProfile.upsert({
      where: { clerkId: user.id },
      create: {
        clerkId: user.id,
        employeeId: validatedData.principalProfile?.employeeId || validatedData.teacherProfile?.employeeId || null,
        department: validatedData.department || null,
        hireDate: validatedData.principalProfile?.hireDate ? new Date(validatedData.principalProfile.hireDate) : 
                 validatedData.teacherProfile?.hireDate ? new Date(validatedData.teacherProfile.hireDate) : null,
        phone: validatedData.principalProfile?.phone || validatedData.parentProfile?.phone || null,
        address: validatedData.principalProfile?.address || validatedData.parentProfile?.address || null,
      },
      update: {
        employeeId: validatedData.principalProfile?.employeeId || validatedData.teacherProfile?.employeeId || null,
        department: validatedData.department || null,
        hireDate: validatedData.principalProfile?.hireDate ? new Date(validatedData.principalProfile.hireDate) : 
                 validatedData.teacherProfile?.hireDate ? new Date(validatedData.teacherProfile.hireDate) : null,
        phone: validatedData.principalProfile?.phone || validatedData.parentProfile?.phone || null,
        address: validatedData.principalProfile?.address || validatedData.parentProfile?.address || null,
      }
    })
    console.log(`Created/Updated ClerkProfile for user ${user.id} with Clerk ID ${userId}`)
  } catch (error) {
    console.error('Error creating/updating ClerkProfile:', error)
    console.error('ClerkProfile data:', {
      clerkId: user.id,
      employeeId: validatedData.principalProfile?.employeeId,
      department: validatedData.department,
      phone: validatedData.principalProfile?.phone,
      address: validatedData.principalProfile?.address,
    })
  }
}

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
  // Relationship fields
  relationshipUserId: z.string().optional(), // ID of user to create relationship with
  relationshipType: z.enum(['PARENT', 'GUARDIAN', 'GRANDPARENT', 'SIBLING']).optional(), // Type of relationship
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

type CreateUserType = z.infer<typeof createUserSchema>

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
    console.log('Received request body:', JSON.stringify(body, null, 2))
    
    const validatedData = createUserSchema.parse(body)
    console.log('Validated data:', JSON.stringify(validatedData, null, 2))

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

    if (existingUserByEmail) {
      // If this is self-registration and the existing user has the same clerkId, update/create profiles
      if (isSelfRegistration && existingUserByEmail.clerkId === userId) {
        console.log(`User with email ${validatedData.email} and clerkId ${userId} already exists, updating profiles`)
        
        // Use the existing user for profile creation
        const user = existingUserByEmail
        
        // Create/Update role-specific profile
        await createOrUpdateUserProfile(user, validatedData)
        
        // Create/Update ClerkProfile if needed
        await createOrUpdateClerkProfile(user, validatedData, userId)
        
        return NextResponse.json({ 
          user: {
            id: existingUserByEmail.id,
            email: existingUserByEmail.email,
            role: existingUserByEmail.role,
            schoolId: existingUserByEmail.schoolId
          }
        })
      }
      
      // If the existing user has a different clerkId or no clerkId, it's a conflict
      if (existingUserByEmail.clerkId !== userId) {
        return NextResponse.json({ 
          error: 'A user with this email address already exists. Please use a different email or sign in with your existing account.' 
        }, { status: 409 })
      }
    }

    // For self-registration, check if user with this clerkId already exists
    if (isSelfRegistration) {
      const existingUserByClerkId = await prisma.user.findUnique({
        where: { clerkId: userId }
      })

      if (existingUserByClerkId) {
        console.log(`User with clerkId ${userId} already exists, returning existing user`)
        return NextResponse.json({ 
          user: {
            id: existingUserByClerkId.id,
            email: existingUserByClerkId.email,
            role: existingUserByClerkId.role,
            schoolId: existingUserByClerkId.schoolId
          }
        })
      }
    }

    // Step 1: Add user to Clerk organization and set metadata
    if (isSelfRegistration) {
      if (!school.clerkOrganizationId) {
        console.warn(`School ${school.name} (${school.id}) does not have a Clerk organization ID. User will be created without organization membership.`)
        return NextResponse.json(
          { error: `School "${school.name}" is not properly configured for new registrations. Please contact your administrator or choose a different school.` },
          { status: 400 }
        )
      }

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
        return NextResponse.json(
          { error: 'Failed to add user to school organization. Please try again or contact support.' },
          { status: 500 }
        )
      }
    }

    // Step 2: Create user in database
    let user
    try {
      user = await prisma.user.create({
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
    } catch (error) {
      // Handle unique constraint violations
      if (error instanceof Error && 'code' in error && error.code === 'P2002') {
        console.error('Unique constraint violation during user creation:', error)
        
        // Check if it's an email constraint violation
        if ('meta' in error && Array.isArray(error.meta) && error.meta.includes('email')) {
          return NextResponse.json({ 
            error: 'A user with this email address already exists. Please use a different email or sign in with your existing account.' 
          }, { status: 409 })
        }
        
        // Check if it's a clerkId constraint violation
        if ('meta' in error && Array.isArray(error.meta) && error.meta.includes('clerkId')) {
          return NextResponse.json({ 
            error: 'User account already exists. Please try signing in instead.' 
          }, { status: 409 })
        }
        
        // Generic unique constraint error
        return NextResponse.json({ 
          error: 'A user with this information already exists. Please check your details and try again.' 
        }, { status: 409 })
      }
      
      // Re-throw other errors
      throw error
    }

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
        console.log('Creating Principal Profile with data:', JSON.stringify(validatedData.principalProfile, null, 2))
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
        console.log('Principal Profile created successfully')
        break
    }

    // Step 2.5: Create ClerkProfile for self-registration users
    if (isSelfRegistration && userId) {
      try {
        await prisma.clerkProfile.create({
          data: {
            clerkId: user.id, // Use the database user ID as foreign key
            employeeId: validatedData.principalProfile?.employeeId || validatedData.teacherProfile?.employeeId || null,
            department: validatedData.department || null,
            hireDate: validatedData.principalProfile?.hireDate ? new Date(validatedData.principalProfile.hireDate) : 
                     validatedData.teacherProfile?.hireDate ? new Date(validatedData.teacherProfile.hireDate) : null,
            phone: validatedData.principalProfile?.phone || validatedData.parentProfile?.phone || null,
            address: validatedData.principalProfile?.address || validatedData.parentProfile?.address || null,
          }
        })
        console.log(`Created ClerkProfile for user ${user.id} with Clerk ID ${userId}`)
      } catch (error) {
        console.error('Error creating ClerkProfile:', error)
        console.error('ClerkProfile creation failed with data:', {
          clerkId: user.id,
          employeeId: validatedData.principalProfile?.employeeId,
          department: validatedData.department,
          phone: validatedData.principalProfile?.phone,
          address: validatedData.principalProfile?.address,
        })
        // Don't fail the entire request if ClerkProfile creation fails
      }
    }

    // Step 3: Create parent-child relationship if specified
    if (validatedData.relationshipUserId && validatedData.relationshipType) {
      try {
        // Verify the relationship user exists and is in the same school
        const relationshipUser = await prisma.user.findUnique({
          where: { 
            id: validatedData.relationshipUserId,
            schoolId: validatedData.schoolId,
            isActive: true
          }
        })

        if (!relationshipUser) {
          console.warn(`Relationship user ${validatedData.relationshipUserId} not found or not in same school`)
        } else {
          // Determine parent and child based on roles
          let parentId: string
          let childId: string

          if (validatedData.role === 'PARENT' && relationshipUser.role === 'STUDENT') {
            parentId = user.id
            childId = relationshipUser.id
          } else if (validatedData.role === 'STUDENT' && relationshipUser.role === 'PARENT') {
            parentId = relationshipUser.id
            childId = user.id
          } else {
            console.warn(`Invalid relationship: ${validatedData.role} cannot have ${validatedData.relationshipType} relationship with ${relationshipUser.role}`)
            // Still continue, just don't create the relationship
            return NextResponse.json({ user }, { status: 201 })
          }

          // Create the relationship
          await prisma.parentChildRelationship.create({
            data: {
              parentId,
              childId,
              relationship: validatedData.relationshipType
            }
          })

          console.log(`Created ${validatedData.relationshipType} relationship between ${parentId} and ${childId}`)
        }
      } catch (relationshipError) {
        console.error('Error creating relationship:', relationshipError)
        // Don't fail the user creation if relationship creation fails
      }
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
