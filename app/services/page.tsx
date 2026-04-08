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

    // Build services query with filters
    let query = `
      SELECT s.*, g.name as game_name
      FROM services s
      LEFT JOIN games g ON s.game_id = g.id
      WHERE s.is_active = true
    `
    
    const values: any[] = []
    
    if (params.game) {
      query += ` AND g.slug = $${values.length + 1}`
      values.push(params.game)
    }
    
    if (params.category) {
      query += ` AND s.category = $${values.length + 1}`
      values.push(params.category)
    }
    
    query += ` ORDER BY s.created_at DESC`
    
    services = values.length > 0 
      ? await sql(query, values) 
      : await sql(query)
  } catch (error) {
    console.error('Database error:', error)
  }

  // Apply game filter
  if (params.game) {
    const game = games?.find(g => g.slug === params.game)
    if (game) {
      servicesQuery = servicesQuery.eq("game_id", game.id)
    }
  }

  // Apply category filter
  if (params.category) {
    servicesQuery = servicesQuery.eq("category", params.category)
  }

  const { data: services } = await servicesQuery.order("created_at", { ascending: false })

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
