'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/app-layout'

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    // Get user role from API and redirect
    const checkRole = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          if (data.user?.role === 'pro') {
            router.push('/dashboard/pro')
          } else if (data.user?.role === 'admin') {
            router.push('/admin')
          } else {
            router.push('/dashboard/client')
          }
        } else {
          router.push('/auth/login')
        }
      } catch (error) {
        console.error('[v0] Check role error:', error)
        router.push('/auth/login')
      }
    }

    checkRole()
  }, [router])

  return (
    <AppLayout>
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    </AppLayout>
  )
}
