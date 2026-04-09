import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { sql } from "@/lib/neon/server"
import { 
  Gamepad2, 
  Shield, 
  Zap, 
  Trophy, 
  Users, 
  Star,
  ArrowRight,
  CheckCircle2,
  Search,
  Clock,
  TrendingUp,
  Play
} from "lucide-react"

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

export default async function LandingPage() {
  let games: any[] = []
  let services: any[] = []

  try {
    // Fetch games from Neon database
    games = await sql`
      SELECT * FROM games 
      WHERE is_active = true 
      ORDER BY sort_order ASC 
      LIMIT 8
    `
    
    // Fetch popular services
    services = await sql`
      SELECT * FROM services 
      WHERE is_active = true 
      ORDER BY created_at DESC 
      LIMIT 6
    `
  } catch (error) {
    console.error('Database error:', error)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg gradient-primary">
              <Gamepad2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">Elevate</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/games" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50">
              Games
            </Link>
            <Link href="/services" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50">
              Services
            </Link>
            <Link href="/become-pro" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50">
              Become a PRO
            </Link>
            <Link href="/about" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50">
              About
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

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <Badge variant="secondary" className="mb-4 text-xs px-3 py-1 border border-border/50">
              <TrendingUp className="h-3 w-3 mr-1.5" />
              Trusted by 10,000+ gamers
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
              Gaming Services
              <span className="text-gradient block mt-1">Marketplace</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Connect with verified PROs for boosting, coaching, and account services across all major games.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search services, games, or PROs..." 
                className="pl-11 pr-4 h-12 bg-card/80 border-border/50 text-base"
              />
            </div>
          </div>

          {/* Quick Categories */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            <Button variant="secondary" size="sm" className="gap-2" asChild>
              <Link href="/services?category=boosting">
                <Trophy className="h-4 w-4" />
                Rank Boosting
              </Link>
            </Button>
            <Button variant="secondary" size="sm" className="gap-2" asChild>
              <Link href="/services?category=coaching">
                <Users className="h-4 w-4" />
                Coaching
              </Link>
            </Button>
            <Button variant="secondary" size="sm" className="gap-2" asChild>
              <Link href="/services?category=account">
                <Zap className="h-4 w-4" />
                Account Services
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="py-12 border-y border-border/30 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Browse by Game</h2>
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" asChild>
              <Link href="/games">
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {games?.map((game) => (
              <Link
                key={game.id}
                href={`/games/${game.slug}`}
                className="group flex flex-col items-center gap-2 p-3 rounded-xl bg-card/50 border border-border/30 hover:border-primary/50 hover:bg-card transition-all duration-200"
              >
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-secondary">
                  {game.logo_url ? (
                    <Image
                      src={game.logo_url}
                      alt={game.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Gamepad2 className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <span className="text-xs font-medium text-center line-clamp-1">{game.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-1">Popular Services</h2>
              <p className="text-muted-foreground text-sm">Most requested services this week</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/services">
                Browse All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services?.map((service) => (
              <Link key={service.id} href={`/services/${service.id}`}>
                <Card className="h-full glass glass-hover group cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="secondary" className="text-xs">
                        {service.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-warning">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <span className="text-xs font-medium">4.9</span>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {service.description}
                    </p>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span>1-3 days</span>
                      </div>
                      <div className="text-lg font-bold text-gradient">
                        {formatCurrency(service.base_price_cents)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-card/30 border-y border-border/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-2">How It Works</h2>
            <p className="text-muted-foreground mb-4">Get started in 3 simple steps</p>
            <Button variant="link" className="text-primary p-0" asChild>
              <Link href="/how-it-works">
                Learn more about our process
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Choose a Service",
                description: "Browse our marketplace and find the perfect service for your needs.",
                icon: Search
              },
              {
                step: "02", 
                title: "Place Your Order",
                description: "Customize your order, select add-ons, and checkout securely.",
                icon: Shield
              },
              {
                step: "03",
                title: "Track Progress",
                description: "Chat with your PRO and track your order in real-time.",
                icon: Play
              }
            ].map((item) => (
              <div key={item.step} className="relative p-6 rounded-xl bg-card/50 border border-border/30">
                <div className="absolute -top-3 left-6 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded">
                  {item.step}
                </div>
                <div className="mt-2">
                  <item.icon className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            {[
              { value: "10K+", label: "Orders Completed" },
              { value: "500+", label: "Verified PROs" },
              { value: "4.9", label: "Average Rating" },
              { value: "24/7", label: "Live Support" },
            ].map((stat) => (
              <div key={stat.label} className="p-6">
                <div className="text-3xl font-bold text-gradient mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-card/30 border-y border-border/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold mb-2">Why Choose Elevate?</h2>
              <p className="text-muted-foreground">The safest way to get gaming services</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: Shield, title: "Secure Payments", desc: "Your payment is protected until the order is complete" },
                { icon: CheckCircle2, title: "Verified PROs", desc: "All service providers are vetted and verified" },
                { icon: Clock, title: "Fast Delivery", desc: "Most orders completed within 24-48 hours" },
                { icon: Users, title: "24/7 Support", desc: "Get help anytime with our dedicated support team" },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 p-4 rounded-xl bg-card/50 border border-border/30">
                  <div className="p-2 rounded-lg bg-primary/10 h-fit">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-0.5">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-3">Ready to Level Up?</h2>
            <p className="text-muted-foreground mb-6">
              Join thousands of gamers who trust Elevate for their gaming services.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="gradient-primary border-0" asChild>
                <Link href="/auth/register">
                  Create Free Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/services">Browse Services</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Gamepad2 className="h-5 w-5 text-primary" />
                <span className="font-semibold">Elevate</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The premier marketplace for gaming services.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-sm">Services</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/games" className="hover:text-foreground transition-colors">Browse Games</Link></li>
                <li><Link href="/services" className="hover:text-foreground transition-colors">All Services</Link></li>
                <li><Link href="/become-pro" className="hover:text-foreground transition-colors">Become a PRO</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-sm">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
                <li><Link href="/refund-policy" className="hover:text-foreground transition-colors">Refund Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link></li>
                <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link></li>
                <li><Link href="/auth/admin" className="hover:text-foreground transition-colors text-muted-foreground/50">Admin</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-6 border-t border-border/30 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Elevate Gaming. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
