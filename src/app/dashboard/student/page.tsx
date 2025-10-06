"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function StudentDashboardPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to student home dashboard
    router.replace('/dashboard/learner/home')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
}
