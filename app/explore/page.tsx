import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { sql } from "@/lib/neon/server"
import { 
  Gamepad2, 
  Search,
  Filter,
  Star,
  Clock,
  Shield,
  ArrowRight,
  Trophy,
  Users,
  Zap,
  CheckCircle,
  Package,
  MessageSquare,
  CreditCard
} from "lucide-react"

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

export default async function ExplorePage() {
  let games: any[] = []
  let services: any[] = []
  
  try {
    games = await sql`
      SELECT * FROM games 
      WHERE is_active = true 
      ORDER BY sort_order ASC
    `
    
    services = await sql`
      SELECT * FROM services 
      WHERE is_active = true 
      ORDER BY created_at DESC
    `
  } catch (error) {
    console.error('[v0] Database error:', error)
  }

  const boostingServices = services?.filter(s => s.category === 'boosting') || []
  const coachingServices = services?.filter(s => s.category === 'coaching') || []
  const accountServices = services?.filter(s => s.category === 'account') || []

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/30">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg gradient-primary">
              <Gamepad2 className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">Elevate</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/games" className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50">
              Games
            </Link>
            <Link href="/browse-services" className="px-3 py-1.5 text-sm text-foreground font-medium rounded-lg bg-secondary/50">
              Services
            </Link>
            <Link href="/faq" className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50">
              FAQ
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button size="sm" className="gradient-primary border-0" asChild>
              <Link href="/auth/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Games Filter */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-20">
              <Card className="glass border-border/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filter by Game
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <Link
                    href="/explore"
                    className="flex items-center gap-3 p-2 rounded-lg bg-primary/10 text-primary text-sm font-medium"
                  >
                    <Gamepad2 className="h-4 w-4" />
                    All Games
                  </Link>
                  {games?.map((game) => (
                    <Link
                      key={game.id}
                      href={`/games/${game.slug}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {game.logo_url ? (
                        <Image
                          src={game.logo_url}
                          alt={game.name}
                          width={20}
                          height={20}
                          className="rounded"
                        />
                      ) : (
                        <Gamepad2 className="h-4 w-4" />
                      )}
                      {game.name}
                    </Link>
                  ))}
                </CardContent>
              </Card>

              {/* How Orders Work - Preview */}
              <Card className="glass border-border/30 mt-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">How Orders Work</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="flex gap-3">
                    <div className="p-1.5 rounded-lg bg-primary/10 h-fit">
                      <CreditCard className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">1. Secure Payment</p>
                      <p className="text-muted-foreground">Pay safely, funds held until complete</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="p-1.5 rounded-lg bg-primary/10 h-fit">
                      <Package className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">2. PRO Accepts</p>
                      <p className="text-muted-foreground">Verified PRO takes your order</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="p-1.5 rounded-lg bg-primary/10 h-fit">
                      <MessageSquare className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">3. Track & Chat</p>
                      <p className="text-muted-foreground">Real-time updates and messaging</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="p-1.5 rounded-lg bg-primary/10 h-fit">
                      <CheckCircle className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">4. Complete</p>
                      <p className="text-muted-foreground">PRO delivers proof, you confirm</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search services..." 
                className="pl-10 bg-card/50 border-border/30"
              />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="all" className="space-y-6">
              <TabsList className="bg-card/50 border border-border/30 p-1">
                <TabsTrigger value="all" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  All Services
                </TabsTrigger>
                <TabsTrigger value="boosting" className="gap-2">
                  <Trophy className="h-4 w-4" />
                  Boosting
                </TabsTrigger>
                <TabsTrigger value="coaching" className="gap-2">
                  <Users className="h-4 w-4" />
                  Coaching
                </TabsTrigger>
                <TabsTrigger value="account" className="gap-2">
                  <Zap className="h-4 w-4" />
                  Account
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {services?.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="boosting" className="space-y-4">
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {boostingServices.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="coaching" className="space-y-4">
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {coachingServices.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="account" className="space-y-4">
                {accountServices.length > 0 ? (
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {accountServices.map((service) => (
                      <ServiceCard key={service.id} service={service} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No account services available at the moment.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>

      {/* Bottom CTA */}
      <section className="py-12 border-t border-border/30 bg-card/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-xl font-bold mb-2">Ready to place an order?</h2>
          <p className="text-muted-foreground mb-4 text-sm">Create a free account to get started</p>
          <Button className="gradient-primary border-0" asChild>
            <Link href="/auth/register">
              Create Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

function ServiceCard({ service }: { service: any }) {
  return (
    <Link href={`/services/${service.id}`}>
      <Card className="h-full glass glass-hover group cursor-pointer border-border/30">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <Badge variant="secondary" className="text-xs capitalize">
              {service.category}
            </Badge>
            <div className="flex items-center gap-1 text-warning">
              <Star className="h-3 w-3 fill-current" />
              <span className="text-xs font-medium">4.9</span>
            </div>
          </div>
          
          <h3 className="font-medium mb-1 group-hover:text-primary transition-colors line-clamp-1">
            {service.title}
          </h3>
          
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {service.description || `Professional ${service.category} service for ${service.game}`}
          </p>

          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="text-xs font-normal">
              <Gamepad2 className="h-3 w-3 mr-1" />
              {service.game}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-border/30">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>1-3 days</span>
            </div>
            <div className="text-base font-bold text-gradient">
              {formatCurrency(service.base_price_cents || 0)}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
