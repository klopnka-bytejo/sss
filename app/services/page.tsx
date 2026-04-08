import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { AppLayout } from "@/components/app-layout"
import { ServicesContent } from "@/components/services/services-content"
import type { Profile, UserRole, Game } from "@/lib/types"

interface PageProps {
  searchParams: Promise<{ game?: string; category?: string }>
}

export default async function ServicesPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const params = await searchParams
  
  const { data: { user } } = await supabase.auth.getUser()

  let userProfile: Profile | null = null

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    userProfile = profile || {
      id: user.id,
      email: user.email || "",
      username: user.user_metadata?.username || null,
      avatar_url: null,
      role: (user.user_metadata?.role as UserRole) || "client",
      balance_cents: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }

  // Fetch games for filter
  const { data: games } = await supabase
    .from("games")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })

  // Build services query
  let servicesQuery = supabase
    .from("services")
    .select("*, game_info:games(*)")
    .eq("is_active", true)

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
