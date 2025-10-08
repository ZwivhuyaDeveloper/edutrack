import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Mock alerts data for MVP
    const alerts = [
      {
        id: '1',
        type: 'warning',
        title: 'Low Attendance Alert',
        message: 'Grade 10B has attendance below 85% this week',
        priority: 'high'
      },
      {
        id: '2',
        type: 'info',
        title: 'Upcoming Event',
        message: 'Parent-Teacher meeting scheduled for next week',
        priority: 'medium'
      },
      {
        id: '3',
        type: 'warning',
        title: 'Pending Fees',
        message: '45 students have pending fee payments',
        priority: 'medium'
      }
    ]

    return NextResponse.json({ alerts })
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
