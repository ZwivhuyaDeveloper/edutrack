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
      dateOfBirth,
      address,
      emergencyContact,
      medicalInfo
    } = body

    // Find user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { studentProfile: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Forbidden - Student access only' }, { status: 403 })
    }

    // Update student profile
    const updatedProfile = await prisma.studentProfile.upsert({
      where: { studentId: user.id },
      update: {
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        address: address || null,
        emergencyContact: emergencyContact || null,
        medicalInfo: medicalInfo || null
      },
      create: {
        studentId: user.id,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        address: address || null,
        emergencyContact: emergencyContact || null,
        medicalInfo: medicalInfo || null
      }
    })

    return NextResponse.json({
      success: true,
      profile: updatedProfile
    })
  } catch (error) {
    console.error('Error updating student profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
