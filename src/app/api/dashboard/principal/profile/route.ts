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
      emergencyContact,
      qualifications,
      yearsOfExperience,
      administrativeArea,
      educationBackground
    } = body

    // Find user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { principalProfile: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.role !== 'PRINCIPAL') {
      return NextResponse.json({ error: 'Forbidden - Principal access only' }, { status: 403 })
    }

    // Update principal profile
    const updatedProfile = await prisma.principalProfile.upsert({
      where: { principalId: user.id },
      update: {
        phone: phone || null,
        address: address || null,
        emergencyContact: emergencyContact || null,
        qualifications: qualifications || null,
        yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience) : null,
        administrativeArea: administrativeArea || null,
        educationBackground: educationBackground || null
      },
      create: {
        principalId: user.id,
        phone: phone || null,
        address: address || null,
        emergencyContact: emergencyContact || null,
        qualifications: qualifications || null,
        yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience) : null,
        administrativeArea: administrativeArea || null,
        educationBackground: educationBackground || null
      }
    })

    return NextResponse.json({
      success: true,
      profile: updatedProfile
    })
  } catch (error) {
    console.error('Error updating principal profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
