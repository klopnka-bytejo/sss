'use client'

import React from "react"

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { AppHeader } from '@/components/app-header'
import { ThemeToggle } from '@/components/theme-toggle'
import type { UserRole, Profile } from '@/lib/types'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface AppLayoutProps {
  children: React.ReactNode
  breadcrumbs?: BreadcrumbItem[]
  userRole?: UserRole
  user?: Profile | null
}

export function AppLayout({ children, breadcrumbs, userRole = 'client', user }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <ThemeToggle />
      <AppSidebar userRole={userRole} />
      <SidebarInset>
        <AppHeader breadcrumbs={breadcrumbs} user={user} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
