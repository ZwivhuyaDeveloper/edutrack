import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { RateLimiters } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting for search endpoints
    const rateLimitResult = await RateLimiters.search(request)
    if (!rateLimitResult.success) {
      return rateLimitResult.response
    }

    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const schoolId = searchParams.get('school')
    const role = searchParams.get('role')
    const search = searchParams.get('search')

    if (!schoolId) {
      return NextResponse.json({ error: 'School ID is required' }, { status: 400 })
    }

    if (!role || !['STUDENT', 'PARENT', 'TEACHER'].includes(role)) {
      return NextResponse.json({ error: 'Valid role is required' }, { status: 400 })
    }

    if (!search || search.trim().length < 2) {
      return NextResponse.json({ users: [] })
    }

    // Search for users in the same school with the specified role
    const users = await prisma.user.findMany({
      where: {
        schoolId,
        role: role as 'STUDENT' | 'PARENT' | 'TEACHER',
        isActive: true,
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true
      },
      take: 10 // Limit results
    })

    // Format the response
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role
    }))

    return NextResponse.json({ users: formattedUsers })
  } catch (error) {
    console.error('Error searching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
