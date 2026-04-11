'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/theme-toggle'
import { 
  Gamepad2, 
  ShoppingCart, 
  AlertCircle, 
  Search,
  ArrowRight,
  Loader2,
  TrendingUp,
  Star,
  Users
} from 'lucide-react'

interface Game {
  id: string
  name: string
  slug: string
  description: string
  logo_url?: string
  banner_url?: string
}

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    fetchGames()
    updateCartCount()
  }, [])

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    setCartCount(cart.reduce((sum: number, item: any) => sum + item.quantity, 0))
  }

  const fetchGames = async () => {
    try {
      const response = await fetch('/api/games')
      if (!response.ok) throw new Error('Failed to fetch games')
      const data = await response.json()
      setGames(data.games || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching games')
    } finally {
      setLoading(false)
    }
  }

  const filteredGames = games.filter(game => 
    game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    game.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      <ThemeToggle />
      
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
            <Link href="/games" className="px-4 py-2 text-sm text-foreground font-medium transition-colors rounded-lg bg-secondary/50">
              Games
            </Link>
            <Link href="/services" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50">
              Services
            </Link>
            <Link href="/become-pro" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50">
              Become a PRO
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/cart">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full gradient-primary text-xs flex items-center justify-center text-primary-foreground font-medium">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
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
      <section className="relative pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-accent/10 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <Badge variant="secondary" className="mb-4 text-xs px-3 py-1 border border-border/50">
              <TrendingUp className="h-3 w-3 mr-1.5" />
              {games.length}+ Games Available
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Browse
              <span className="text-gradient"> Games</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Select your game and find the perfect service from our verified PROs.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search games..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-4 h-12 bg-card/80 border-border/50 text-base"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Games Grid */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          {error && (
            <div className="glass border-destructive/50 text-destructive p-4 rounded-xl mb-8 flex items-center max-w-lg mx-auto">
              <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredGames.length === 0 ? (
            <Card className="glass max-w-lg mx-auto">
              <CardContent className="p-12 text-center">
                <Gamepad2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? 'No games match your search.' : 'No games available at this time.'}
                </p>
                {searchQuery && (
                  <Button variant="outline" onClick={() => setSearchQuery('')}>
                    Clear Search
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredGames.map((game) => (
                <Card key={game.id} className="glass glass-hover group overflow-hidden cursor-pointer">
                  {/* Game Banner/Image */}
                  <div className="relative h-36 overflow-hidden">
                    {game.banner_url ? (
                      <img 
                        src={game.banner_url} 
                        alt={game.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="w-full h-full gradient-primary opacity-80 flex items-center justify-center">
                        <Gamepad2 className="h-12 w-12 text-primary-foreground/80" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                    
                    {/* Logo overlay */}
                    {game.logo_url && (
                      <div className="absolute bottom-3 left-3 p-1.5 rounded-lg bg-card/80 backdrop-blur-sm">
                        <img src={game.logo_url} alt="" className="h-8 w-8 object-contain" />
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                        {game.name}
                      </h3>
                      <div className="flex items-center gap-1 text-warning">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <span className="text-xs font-medium">4.9</span>
                      </div>
                    </div>
                    
                    {game.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {game.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        <span>50+ PROs</span>
                      </div>
                      <Button 
                        size="sm" 
                        className="gradient-primary border-0 h-8"
                        asChild
                      >
                        <Link href={`/games/${game.slug}`}>
                          View Services
                          <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 border-t border-border/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-3">{"Can't find your game?"}</h2>
            <p className="text-muted-foreground mb-6">
              {"We're constantly adding new games. Let us know what you'd like to see!"}
            </p>
            <Button variant="outline" asChild>
              <Link href="/contact">
                Request a Game
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Elevate Gaming. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
