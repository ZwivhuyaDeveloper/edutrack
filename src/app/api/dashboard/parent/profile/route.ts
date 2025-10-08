import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      phone,
      address,
      emergencyContact
    } = body

    // Find user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { parentProfile: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.role !== 'PARENT') {
      return NextResponse.json({ error: 'Forbidden - Parent access only' }, { status: 403 })
    }

    // Update parent profile
    const updatedProfile = await prisma.parentProfile.upsert({
      where: { parentId: user.id },
      update: {
        phone: phone || null,
        address: address || null,
        emergencyContact: emergencyContact || null
      },
      create: {
        parentId: user.id,
        phone: phone || null,
        address: address || null,
        emergencyContact: emergencyContact || null
      }
    })

    return NextResponse.json({
      success: true,
      profile: updatedProfile
    })
  } catch (error) {
    console.error('Error updating parent profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
