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

    // Mock activity data for MVP
    const activities = [
      {
        id: '1',
        type: 'enrollment',
        message: 'New student enrolled in Grade 10A',
        timestamp: '2 hours ago',
        user: 'John Doe'
      },
      {
        id: '2',
        type: 'assignment',
        message: 'Math assignment submitted by 25 students',
        timestamp: '3 hours ago',
        user: 'Ms. Smith'
      },
      {
        id: '3',
        type: 'payment',
        message: 'Fee payment received from 15 students',
        timestamp: '5 hours ago',
        user: 'Finance Dept'
      },
      {
        id: '4',
        type: 'announcement',
        message: 'New announcement posted for all classes',
        timestamp: '1 day ago',
        user: 'Principal'
      },
      {
        id: '5',
        type: 'enrollment',
        message: 'Teacher assigned to Grade 9B',
        timestamp: '2 days ago',
        user: 'Mr. Johnson'
      }
    ]

    return NextResponse.json({ activities })
  } catch (error) {
    console.error('Error fetching activity:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
