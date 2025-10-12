import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUser, getDashboardRoute, PERMISSIONS } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // First check if user is authenticated with Clerk
    const { userId } = await auth()
    
    console.log('[/api/users/me] Clerk userId:', userId)
    
    if (!userId) {
      console.log('[/api/users/me] No Clerk userId found - returning 401')
      return NextResponse.json({ error: 'Unauthorized - Not authenticated with Clerk' }, { status: 401 })
    }
    
    const user = await getCurrentUser()
    
    console.log('[/api/users/me] Database user found:', user ? 'Yes' : 'No')
    
    if (!user) {
      console.log('[/api/users/me] User authenticated with Clerk but not found in database')
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

export async function PATCH(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { firstName, lastName, avatar } = body

    // Update user in database
    let updatedUser
    try {
      updatedUser = await prisma.user.update({
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
    } catch (error) {
      console.error('[/api/users/me PATCH] Database connection error:', error)
      if (error instanceof Error && error.message.includes('Server has closed the connection')) {
        console.log('[/api/users/me PATCH] Retrying database connection...')
        // Retry once after 1 second delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        updatedUser = await prisma.user.update({
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
        console.log('[/api/users/me PATCH] Retry successful')
      } else {
        console.error('[/api/users/me PATCH] Non-connection error, rethrowing:', error)
        throw error
      }
    }

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
