import { createClient } from "@/lib/supabase/server"
import { AppLayout } from "@/components/app-layout"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft, 
  ArrowRight,
  Gamepad2, 
  Trophy, 
  Zap, 
  Users,
  ShoppingCart
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

const categoryIcons: Record<string, typeof Trophy> = {
  boosting: Zap,
  coaching: Users,
  account: Trophy,
}

const categoryColors: Record<string, string> = {
  boosting: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  coaching: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  account: "bg-amber-500/20 text-amber-400 border-amber-500/30",
}

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  
  // Get game info
  const { data: game, error } = await supabase
    .from("games")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()
  
  if (error || !game) {
    notFound()
  }
  
  // Get services for this game
  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("game_id", game.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
  
  // Group services by category
  const servicesByCategory = (services || []).reduce((acc, service) => {
    const cat = service.category || "other"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(service)
    return acc
  }, {} as Record<string, typeof services>)

  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0">
            {game.banner_url ? (
              <Image
                src={game.banner_url}
                alt={game.name}
                fill
                className="object-cover opacity-30"
              />
            ) : game.logo_url ? (
              <Image
                src={game.logo_url}
                alt={game.name}
                fill
                className="object-cover opacity-20 blur-xl"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/70" />
          </div>
          
          <div className="container relative z-10">
            <Link 
              href="/games"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Games
            </Link>
            
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Game Logo */}
              <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-2 border-primary/30 shadow-xl shadow-primary/20 flex-shrink-0">
                {game.logo_url ? (
                  <Image
                    src={game.logo_url}
                    alt={game.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                    <Gamepad2 className="h-16 w-16 text-primary" />
                  </div>
                )}
              </div>
              
              {/* Game Info */}
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold mb-3">
                  {game.name}
                </h1>
                <p className="text-lg text-muted-foreground mb-4 max-w-2xl">
                  {game.short_description || game.long_description}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Badge className="bg-primary/20 text-primary border-primary/30">
                    {(services || []).length} Services Available
                  </Badge>
                  <Badge variant="outline">Phase 1 Launch</Badge>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services by Category */}
        <section className="container py-12">
          {Object.entries(servicesByCategory).map(([category, catServices]) => {
            const Icon = categoryIcons[category] || Trophy
            return (
              <div key={category} className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-2 rounded-lg ${categoryColors[category] || 'bg-muted'}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-bold capitalize">{category}</h2>
                  <Badge variant="secondary">{catServices?.length || 0}</Badge>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {(catServices || []).map((service) => (
                    <Card 
                      key={service.id} 
                      className="group overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:bg-card/80 transition-all duration-300"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                            {service.title}
                          </CardTitle>
                          <Badge 
                            variant="outline" 
                            className={categoryColors[service.category] || ''}
                          >
                            {service.category}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {service.description && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {service.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground">Starting at</p>
                            <p className="text-xl font-bold text-primary">
                              {formatCurrency(service.price_cents)}
                            </p>
                          </div>
                          
                          <Link href={`/services/${service.id}`}>
                            <Button size="sm" className="gap-2">
                              <ShoppingCart className="h-4 w-4" />
                              View
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}

          {(!services || services.length === 0) && (
            <div className="text-center py-20">
              <Gamepad2 className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Services Yet</h3>
              <p className="text-muted-foreground mb-6">
                Services for {game.name} are coming soon.
              </p>
              <Link href="/games">
                <Button variant="outline">Browse Other Games</Button>
              </Link>
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  )
}
