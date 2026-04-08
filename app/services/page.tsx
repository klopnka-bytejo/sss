import { Suspense } from "react"
import { sql } from "@/lib/neon/server"
import { AppLayout } from "@/components/app-layout"
import { ServicesContent } from "@/components/services/services-content"
import type { Profile, UserRole, Game } from "@/lib/types"

interface PageProps {
  searchParams: Promise<{ game?: string; category?: string }>
}

export default async function ServicesPage({ searchParams }: PageProps) {
  const params = await searchParams
  
  let userProfile: Profile | null = null
  let games: any[] = []
  let services: any[] = []

  try {
    // Fetch games for filter
    games = await sql`
      SELECT * FROM games
      WHERE is_active = true
      ORDER BY sort_order ASC
    `

    // Fetch services with optional filters
    if (params.game && params.category) {
      services = await sql`
        SELECT s.*, g.name as game_name
        FROM services s
        LEFT JOIN games g ON s.game_id = g.id
        WHERE s.is_active = true 
          AND g.slug = ${params.game}
          AND s.category = ${params.category}
        ORDER BY s.created_at DESC
      `
    } else if (params.game) {
      services = await sql`
        SELECT s.*, g.name as game_name
        FROM services s
        LEFT JOIN games g ON s.game_id = g.id
        WHERE s.is_active = true AND g.slug = ${params.game}
        ORDER BY s.created_at DESC
      `
    } else if (params.category) {
      services = await sql`
        SELECT s.*, g.name as game_name
        FROM services s
        LEFT JOIN games g ON s.game_id = g.id
        WHERE s.is_active = true AND s.category = ${params.category}
        ORDER BY s.created_at DESC
      `
    } else {
      services = await sql`
        SELECT s.*, g.name as game_name
        FROM services s
        LEFT JOIN games g ON s.game_id = g.id
        WHERE s.is_active = true
        ORDER BY s.created_at DESC
      `
    }
  } catch (error) {
    console.error('[v0] Database error:', error)
  }

  return (
    <AppLayout 
      breadcrumbs={[{ label: "Services" }]} 
      userRole={userProfile?.role || "client"}
      user={userProfile}
    >
      <Suspense fallback={<div className="p-6">Loading...</div>}>
        <ServicesContent 
          services={services || []} 
          games={games || []}
          user={userProfile}
          selectedGame={params.game}
          selectedCategory={params.category}
        />
      </Suspense>
    </AppLayout>
  )
}
