import { ReactNode } from 'react'
import { AdminSidebar } from './admin-sidebar'
import { ThemeToggle } from '@/components/theme-toggle'

interface AdminLayoutProps {
  children: ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <AdminSidebar />
      <main className="flex-1 overflow-auto ml-0 md:ml-64">
        <div className="max-w-7xl mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
