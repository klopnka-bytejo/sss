import { sql } from "@/lib/neon/server"
import { AppLayout } from "@/components/app-layout"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Gamepad2 } from "lucide-react"

export default async function GamesPage() {
  let games: any[] = []
  let gameServiceCounts: Record<string, number> = {}
  
  try {
    games = await sql`
      SELECT * FROM games 
      WHERE is_active = true 
      ORDER BY sort_order ASC
    `
    
    // Get service counts per game
    const serviceCounts = await sql`
      SELECT game_id, COUNT(*)::int as count 
      FROM services 
      WHERE is_active = true 
      GROUP BY game_id
    `
    
    gameServiceCounts = (serviceCounts || []).reduce((acc: Record<string, number>, s: any) => {
      acc[s.game_id] = s.count
      return acc
    }, {})
  } catch (error) {
    console.error('[v0] Database error:', error)
  }

  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="container relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                <Gamepad2 className="h-3 w-3 mr-1" />
                Phase 1 Launch Games
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Choose Your Game
              </h1>
              <p className="text-lg text-muted-foreground">
                Select a game to browse available boosting, coaching, and account services
              </p>
            </div>
          </div>
        </section>

        {/* Games Grid */}
        <section className="container py-12">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {(games || []).map((game) => (
              <Link key={game.id} href={`/games/${game.slug}`}>
                <Card className="group h-full overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                  <div className="relative aspect-video overflow-hidden">
                    {game.logo_url ? (
                      <Image
                        src={game.logo_url}
                        alt={game.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                        <Gamepad2 className="h-16 w-16 text-primary/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-foreground mb-1">
                        {game.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {game.short_description}
                      </p>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                        {gameServiceCounts[game.id] || 0} Services
                      </Badge>
                      <span className="text-sm text-muted-foreground flex items-center gap-1 group-hover:text-primary transition-colors">
                        Browse
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {(!games || games.length === 0) && (
            <div className="text-center py-20">
              <Gamepad2 className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Games Available</h3>
              <p className="text-muted-foreground">
                Check back soon for available games and services.
              </p>
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  )
}
