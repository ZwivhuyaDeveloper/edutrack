import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.role !== 'PARENT') {
      return NextResponse.json({ error: 'Forbidden - Parent access only' }, { status: 403 })
    }

    // Get children relationships
    const relationships = await prisma.parentChildRelationship.findMany({
      where: { parentId: user.id },
      include: {
        child: {
          include: {
            studentProfile: true
          }
        }
      }
    })

    const children = relationships.map(rel => ({
      id: rel.child.id,
      firstName: rel.child.firstName,
      lastName: rel.child.lastName,
      email: rel.child.email,
      grade: rel.child.studentProfile?.grade || null,
      studentIdNumber: rel.child.studentProfile?.studentIdNumber || null,
      relationship: rel.relationship
    }))

    return NextResponse.json({
      success: true,
      children
    })
  } catch (error) {
    console.error('Error fetching children:', error)
    return NextResponse.json(
      { error: 'Failed to fetch children' },
      { status: 500 }
    )
  }
}
