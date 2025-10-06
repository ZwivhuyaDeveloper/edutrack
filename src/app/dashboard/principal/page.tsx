"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PrincipalDashboardPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to principal home dashboard
    router.replace('/dashboard/principal/home')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
}
