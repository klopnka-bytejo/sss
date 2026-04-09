import { Suspense } from "react"
import { sql } from "@/lib/neon/server"
import { AppLayout } from "@/components/app-layout"
import { ServicesContent } from "@/components/services/services-content"
import type { Profile } from "@/lib/types"

interface PageProps {
  searchParams: Promise<{ category?: string; search?: string }>
}

export const metadata = {
  title: 'Browse Services | Elevate',
  description: 'Discover professional services from top experts',
}

export default async function ServicesPage({ searchParams }: PageProps) {
  const params = await searchParams
  
  let services: any[] = []

  try {
    // Fetch services with optional filters
    if (params.search && params.category) {
      services = await sql`
        SELECT * FROM services
        WHERE active = true 
          AND category = ${params.category}
          AND (title ILIKE ${'%' + params.search + '%'} OR description ILIKE ${'%' + params.search + '%'})
        ORDER BY created_at DESC
      `
    } else if (params.search) {
      services = await sql`
        SELECT * FROM services
        WHERE active = true 
          AND (title ILIKE ${'%' + params.search + '%'} OR description ILIKE ${'%' + params.search + '%'})
        ORDER BY created_at DESC
      `
    } else if (params.category) {
      services = await sql`
        SELECT * FROM services
        WHERE active = true AND category = ${params.category}
        ORDER BY created_at DESC
      `
    } else {
      services = await sql`
        SELECT * FROM services
        WHERE active = true
        ORDER BY created_at DESC
      `
    }
  } catch (error) {
    console.error('[v0] Database error:', error)
  }

  return (
    <AppLayout 
      breadcrumbs={[{ label: "Services" }]} 
      userRole="client"
      user={null}
    >
      <Suspense fallback={<div className="p-6">Loading...</div>}>
        <ServicesContent 
          services={services || []} 
          selectedCategory={params.category}
          search={params.search}
        />
      </Suspense>
    </AppLayout>
  )
}
