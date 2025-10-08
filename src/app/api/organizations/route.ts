import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { getClerkOrgRole } from '@/lib/permissions'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, slug, userRole = 'PRINCIPAL' } = body

    if (!name) {
      return NextResponse.json({ error: 'Organization name is required' }, { status: 400 })
    }

    // Create a valid slug for Clerk organization (same logic as schools route)
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      .substring(0, 50) // Limit length
    
    // Ensure slug is not empty and has minimum length
    const finalSlug = slug || baseSlug || `org-${Date.now()}`

    console.log(`[POST /api/organizations] Creating organization: ${name} with slug: ${finalSlug}`)

    // Create organization in Clerk
    const organization = await (await clerkClient()).organizations.createOrganization({
      name,
      slug: finalSlug,
      createdBy: userId,
    })

    // Add the creator as an admin member with appropriate role
    const clerkRole = getClerkOrgRole(userRole as any)
    await (await clerkClient()).organizations.createOrganizationMembership({
      organizationId: organization.id,
      userId,
      role: clerkRole,
    })

    console.log(`[POST /api/organizations] Created organization ${organization.id} with role ${clerkRole}`)

    return NextResponse.json({
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating organization:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create organization' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all organizations
    const { data: organizations } = await (await clerkClient()).organizations.getOrganizationList({
      limit: 100,
    })

    return NextResponse.json({
      organizations: organizations.map(org => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
        membersCount: org.membersCount,
      }))
    })

  } catch (error) {
    console.error('Error fetching organizations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch organizations' },
      { status: 500 }
    )
  }
}
