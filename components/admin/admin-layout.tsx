'use client'

import { ReactNode } from 'react'
import { AdminSidebar } from './admin-sidebar'
import { ThemeToggle } from '@/components/theme-toggle'

interface AdminLayoutProps {
  children: ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <ThemeToggle />
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
