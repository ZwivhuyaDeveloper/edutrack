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
      department,
      qualifications,
      address
    } = body

    // Find user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { teacherProfile: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Forbidden - Teacher access only' }, { status: 403 })
    }

    // Update teacher profile
    const updatedProfile = await prisma.teacherProfile.upsert({
      where: { teacherId: user.id },
      update: {
        department: department || null,
        qualifications: qualifications || null
      },
      create: {
        teacherId: user.id,
        department: department || null,
        qualifications: qualifications || null
      }
    })

    // Update clerk profile for additional fields
    await prisma.clerkProfile.upsert({
      where: { clerkId: user.id },
      update: {
        phone: phone || null,
        address: address || null,
        department: department || null
      },
      create: {
        clerkId: user.id,
        phone: phone || null,
        address: address || null,
        department: department || null
      }
    })

    return NextResponse.json({
      success: true,
      profile: updatedProfile
    })
  } catch (error) {
    console.error('Error updating teacher profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
