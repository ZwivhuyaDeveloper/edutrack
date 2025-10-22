import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUser, getDashboardRoute, PERMISSIONS } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { RateLimiters } from '@/lib/rate-limit'
import { cache, CacheKeys } from '@/lib/cache'
import { secureLog } from '@/lib/secure-logger'

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await RateLimiters.readOnly(request)
    if (!rateLimitResult.success) {
      return rateLimitResult.response
    }
    // First check if user is authenticated with Clerk
    const { userId } = await auth()
    
    secureLog.auth('GET /api/users/me', userId)
    
    if (!userId) {
      secureLog.auth('No userId found - returning 401')
      return NextResponse.json({ error: 'Unauthorized - Not authenticated with Clerk' }, { status: 401 })
    }
    
    const user = await getCurrentUser()
    
    secureLog.db('User lookup', { found: !!user })
    
    if (!user) {
      secureLog.auth('User authenticated but not in database', userId)
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 })
    }

    // Get role-specific profile
    let profile = null
    switch (user.role) {
      case 'STUDENT':
        profile = user.studentProfile
        break
      case 'TEACHER':
        profile = user.teacherProfile
        break
      case 'PARENT':
        profile = user.parentProfile
        break
      case 'PRINCIPAL':
        profile = user.principalProfile
        break
      case 'CLERK':
        profile = user.clerkProfile
        break
    }

    // Get user permissions based on role
    const permissions = PERMISSIONS[user.role] || {}

    // Get default dashboard route
    const dashboardRoute = getDashboardRoute()

    // Return comprehensive user data
    return NextResponse.json({
      user: {
        id: user.id,
        clerkId: user.clerkId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
        role: user.role,
        avatar: user.avatar,
        isActive: user.isActive,
        school: user.school,
        profile,
        permissions,
        dashboardRoute,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await RateLimiters.write(request)
    if (!rateLimitResult.success) {
      return rateLimitResult.response
    }

    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { firstName, lastName, avatar } = body

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { clerkId: userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(avatar !== undefined && { avatar }),
      },
      include: {
        school: true,
        studentProfile: true,
        teacherProfile: true,
        parentProfile: true,
        principalProfile: true,
      }
    })

    // Invalidate cache after update
    cache.invalidate(CacheKeys.user(userId))

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        clerkId: updatedUser.clerkId,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        fullName: `${updatedUser.firstName} ${updatedUser.lastName}`,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        isActive: updatedUser.isActive,
        school: updatedUser.school,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      }
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
