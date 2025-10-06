import { NextResponse } from 'next/server'
import { getCurrentUser, getDashboardRoute, PERMISSIONS } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
    const dashboardRoute = getDashboardRoute(user.role)

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
