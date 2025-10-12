import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createSchoolSchema = z.object({
  name: z.string().min(1, 'School name is required'),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().default('US'),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  logo: z.string().optional(), // Base64 encoded image string
})

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    const schools = await prisma.school.findMany({
      where: {
        isActive: true,
        clerkOrganizationId: {
          not: null // Only show schools that are properly configured for registration
        },
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { city: { contains: search, mode: 'insensitive' } },
            { state: { contains: search, mode: 'insensitive' } }
          ]
        })
      },
      select: {
        id: true,
        name: true,
        city: true,
        state: true,
        country: true,
        _count: {
          select: {
            users: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({ schools })
  } catch (error) {
    console.error('Error fetching schools:', error)
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
    const validatedData = createSchoolSchema.parse(body)

    // Check if user is already a principal of another school
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { 
        principalProfile: true,
        clerkProfile: true,
        school: true 
      }
    })

    console.log(`[POST /api/schools] Existing user check for ${userId}:`, {
      exists: !!existingUser,
      role: existingUser?.role,
      schoolId: existingUser?.schoolId,
      schoolName: existingUser?.school?.name,
      hasPrincipalProfile: !!existingUser?.principalProfile,
      hasClerkProfile: !!existingUser?.clerkProfile
    })

    if (existingUser && existingUser.role === 'PRINCIPAL' && existingUser.schoolId) {
      return NextResponse.json(
        { error: `You are already the principal of ${existingUser.school?.name || 'another school'}. Each principal can only manage one school.` },
        { status: 400 }
      )
    }

    // Only allow school creation if user doesn't exist (new principal) or is not already assigned a role
    if (existingUser && existingUser.role && existingUser.role !== 'PRINCIPAL') {
      return NextResponse.json(
        { error: 'Only principals can create schools. Please contact your administrator.' },
        { status: 403 }
      )
    }

    // Step 1: Create Clerk organization for the school
    let clerkOrganizationId: string | null = null
    try {
      const { clerkClient } = await import('@clerk/nextjs/server')
      const { CLERK_ORG_ROLES, getPermissionStrings } = await import('@/lib/permissions')
      
      // Create a valid slug for Clerk organization
      const baseSlug = validatedData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
        .substring(0, 50) // Limit length
      
      // Ensure slug is not empty and has minimum length
      const slug = baseSlug || `school-${Date.now()}`
      
      const organization = await (await clerkClient()).organizations.createOrganization({
        name: validatedData.name,
        slug: slug,
        createdBy: userId,
      })
      clerkOrganizationId = organization.id

      // Add the creator (principal) as an admin member
      await (await clerkClient()).organizations.createOrganizationMembership({
        organizationId: organization.id,
        userId,
        role: CLERK_ORG_ROLES.PRINCIPAL,
      })
      
      // Update principal's metadata (will be updated again after school creation with schoolId)
      await (await clerkClient()).users.updateUserMetadata(userId, {
        publicMetadata: {
          role: 'PRINCIPAL',
          schoolId: '', // Will be updated after school creation
          schoolName: validatedData.name,
          organizationId: organization.id,
          permissions: getPermissionStrings('PRINCIPAL'),
          isActive: true,
        }
      })
      
      console.log(`Created Clerk organization ${organization.id} for school ${validatedData.name}`)
    } catch (clerkError) {
      console.error('Error creating Clerk organization:', clerkError)
      
      // Log specific error details for debugging
      if (clerkError && typeof clerkError === 'object') {
        if ('status' in clerkError) {
          console.error('Clerk error status:', clerkError.status)
        }
        if ('errors' in clerkError) {
          console.error('Clerk error details:', clerkError.errors)
        }
      }
      
      // Continue without Clerk organization if it fails
      console.warn(`Continuing school creation without Clerk organization for ${validatedData.name}`)
    }

    // Step 2: Create school in database with Clerk organization ID
    const school = await prisma.school.create({
      data: {
        ...validatedData,
        clerkOrganizationId
      }
    })

    // Get user's email from Clerk
    let userEmail = existingUser?.email || ''
    if (!userEmail) {
      try {
        const { clerkClient } = await import('@clerk/nextjs/server')
        const clerkUser = await (await clerkClient()).users.getUser(userId)
        userEmail = clerkUser.emailAddresses[0]?.emailAddress || ''
      } catch (clerkError) {
        console.error('Error fetching user email from Clerk:', clerkError)
      }
    }

    // Check if email is already taken by another user
    if (userEmail) {
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email: userEmail },
        select: {
          id: true,
          clerkId: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          school: {
            select: {
              name: true
            }
          }
        }
      })
      
      if (existingUserByEmail && existingUserByEmail.clerkId !== userId) {
        console.error(`Email conflict: ${userEmail} is already used by user ${existingUserByEmail.clerkId} (${existingUserByEmail.firstName} ${existingUserByEmail.lastName}, ${existingUserByEmail.role} at ${existingUserByEmail.school?.name})`)
        return NextResponse.json(
          { error: `The email ${userEmail} is already registered to another user. Please sign in with a different Clerk account or contact support.` },
          { status: 409 }
        )
      }
    }

    // Create or update user with principal role
    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {
        role: 'PRINCIPAL',
        schoolId: school.id,
        firstName: existingUser?.firstName || '',
        lastName: existingUser?.lastName || ''
        // Don't update email to avoid unique constraint conflicts
      },
      create: {
        clerkId: userId,
        email: userEmail,
        firstName: '',
        lastName: '',
        role: 'PRINCIPAL',
        schoolId: school.id
      },
      include: {
        school: true,
        principalProfile: true
      }
    })

    // Create principal profile if it doesn't exist
    if (!user.principalProfile) {
      await prisma.principalProfile.create({
        data: {
          principalId: user.id
        }
      })
    }

    // Update Clerk metadata with the actual school ID
    if (clerkOrganizationId) {
      try {
        const { clerkClient } = await import('@clerk/nextjs/server')
        const { getPermissionStrings } = await import('@/lib/permissions')
        
        await (await clerkClient()).users.updateUserMetadata(userId, {
          publicMetadata: {
            role: 'PRINCIPAL',
            schoolId: school.id,
            schoolName: school.name,
            organizationId: clerkOrganizationId,
            permissions: getPermissionStrings('PRINCIPAL'),
            isActive: true,
          }
        })
        
        console.log(`Updated principal metadata with school ID: ${school.id}`)
      } catch (clerkError) {
        console.error('Error updating principal metadata:', clerkError)
      }
    }

    return NextResponse.json({ school, user }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    // Handle Prisma unique constraint violations
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2002') {
        // Check if it's an email constraint violation
        const errorMessage = error.toString()
        if (errorMessage.includes('email')) {
          return NextResponse.json(
            { error: 'A user with this email already exists. Please use a different email or contact support.' },
            { status: 409 }
          )
        }
        return NextResponse.json(
          { error: 'A record with this information already exists.' },
          { status: 409 }
        )
      }
    }

    console.error('Error creating school:', error)
    return NextResponse.json(
      { error: 'Failed to create school. Please try again or contact support.' },
      { status: 500 }
    )
  }
}
