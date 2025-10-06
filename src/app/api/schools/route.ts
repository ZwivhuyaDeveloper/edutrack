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
      include: { principalProfile: true }
    })

    if (existingUser && existingUser.role === 'PRINCIPAL') {
      return NextResponse.json(
        { error: 'User is already a principal of a school' },
        { status: 400 }
      )
    }

    // Step 1: Create Clerk organization for the school
    let clerkOrganizationId: string | null = null
    try {
      const { clerkClient } = await import('@clerk/nextjs/server')
      const { CLERK_ORG_ROLES, getPermissionStrings } = await import('@/lib/permissions')
      
      const organization = await (await clerkClient()).organizations.createOrganization({
        name: validatedData.name,
        slug: validatedData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        createdBy: userId,
      })
      clerkOrganizationId = organization.id

      // Add the creator (principal) as an admin member
      await (await clerkClient()).organizations.createOrganizationMembership({
        organizationId: organization.id,
        userId,
        role: CLERK_ORG_ROLES.PRINCIPAL,
      })
      
      // Update principal's metadata
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
      // Continue without Clerk organization if it fails
    }

    // Step 2: Create school in database with Clerk organization ID
    const school = await prisma.school.create({
      data: {
        ...validatedData,
        clerkOrganizationId
      }
    })

    // Create or update user with principal role
    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {
        role: 'PRINCIPAL',
        schoolId: school.id,
        firstName: existingUser?.firstName || '',
        lastName: existingUser?.lastName || '',
        email: existingUser?.email || ''
      },
      create: {
        clerkId: userId,
        email: '', // Will be updated from Clerk webhook
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

    return NextResponse.json({ school, user }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating school:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
