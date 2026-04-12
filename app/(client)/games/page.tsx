'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
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
  Users,
  X,
  Clock,
  Plus,
  Minus,
  CheckCircle
} from 'lucide-react'

interface Game {
  id: string
  name: string
  slug: string
  description: string
  logo_url?: string
  banner_url?: string
}

interface Service {
  id: string
  title: string
  description: string
  price_cents: number
  duration_minutes: number
  category?: string
  pro_name?: string
  pro_avatar?: string
}

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [cartCount, setCartCount] = useState(0)
  
  // Service panel state
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [loadingServices, setLoadingServices] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchGames()
    updateCartCount()
  }, [])

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        // Check if click was on a game card
        const target = event.target as HTMLElement
        if (!target.closest('[data-game-card]')) {
          closePanel()
        }
      }
    }

    if (selectedGame) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [selectedGame])

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

  const fetchServicesForGame = async (game: Game) => {
    setLoadingServices(true)
    setSelectedGame(game)
    setSelectedService(null)
    setQuantity(1)
    setAddedToCart(false)
    
    try {
      const response = await fetch(`/api/game-services?slug=${game.slug}`)
      if (!response.ok) throw new Error('Failed to fetch services')
      const data = await response.json()
      setServices(data.services || [])
      if (data.services && data.services.length > 0) {
        setSelectedService(data.services[0])
      }
    } catch (err) {
      setServices([])
    } finally {
      setLoadingServices(false)
    }
  }

  const closePanel = () => {
    setSelectedGame(null)
    setServices([])
    setSelectedService(null)
    setAddedToCart(false)
  }

  const addToCart = () => {
    if (!selectedService || !selectedGame) return

    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const cartItem = {
      id: selectedService.id,
      type: 'service',
      name: selectedService.title,
      price: selectedService.price_cents / 100,
      quantity,
      gameSlug: selectedGame.slug,
      gameName: selectedGame.name,
      pro_name: selectedService.pro_name
    }

    cart.push(cartItem)
    localStorage.setItem('cart', JSON.stringify(cart))
    updateCartCount()
    setAddedToCart(true)
    
    setTimeout(() => {
      setAddedToCart(false)
    }, 2000)
  }

  const filteredGames = games.filter(game => 
    game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    game.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
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
            <Link href="/games" className="px-4 py-2 text-sm text-foreground font-medium transition-colors rounded-lg bg-secondary/50">
              Games
            </Link>
            <Link href="/browse-services" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50">
              Services
            </Link>
            <Link href="/become-pro" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50">
              Become a PRO
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="w-px h-5 bg-border/50 hidden sm:block" />
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

      {/* Main Content with optional sidebar */}
      <div className="flex min-h-screen">
        {/* Games Section */}
        <div className={`flex-1 transition-all duration-500 ease-out ${selectedGame ? 'sm:mr-[400px] lg:mr-[440px]' : ''}`}>
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
                  Select your game to explore services from verified PROs.
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
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredGames.map((game) => (
                    <div 
                      key={game.id} 
                      data-game-card
                      className={`glass group overflow-hidden cursor-pointer transition-all duration-300 rounded-xl ${
                        selectedGame?.id === game.id 
                          ? 'ring-2 ring-primary scale-[1.02]' 
                          : 'hover:scale-[1.01] hover:border-border'
                      }`}
                      onClick={() => fetchServicesForGame(game)}
                    >
                      {/* Game Banner/Image */}
                      <div className="relative h-24 sm:h-28 overflow-hidden">
                        {game.banner_url ? (
                          <img 
                            src={game.banner_url} 
                            alt={game.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                        ) : (
                          <div className="w-full h-full gradient-primary opacity-80 flex items-center justify-center">
                            <Gamepad2 className="h-8 w-8 text-primary-foreground/80" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

                        {/* Selected indicator */}
                        {selectedGame?.id === game.id && (
                          <div className="absolute top-2 right-2 p-0.5 rounded-full gradient-primary">
                            <CheckCircle className="h-3 w-3 text-primary-foreground" />
                          </div>
                        )}
                      </div>

                      <div className="p-3">
                        <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1 mb-1">
                          {game.name}
                        </h3>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Users className="h-3 w-3" />
                            <span>50+ PROs</span>
                          </div>
                          <div className="flex items-center gap-0.5 text-warning text-[10px]">
                            <Star className="h-2.5 w-2.5 fill-current" />
                            <span>4.9</span>
                          </div>
                        </div>
                      </div>
                    </div>
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

        {/* Services Slide Panel */}
        <div 
          ref={panelRef}
          className={`fixed top-16 right-0 bottom-0 w-full sm:w-[400px] lg:w-[440px] z-40 transform transition-transform duration-500 ease-out ${
            selectedGame ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="h-full glass border-l border-border/30 flex flex-col overflow-hidden">
            {/* Panel Header */}
            <div className="flex-shrink-0 p-4 border-b border-border/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  {selectedGame?.logo_url ? (
                    <div className="p-1.5 rounded-lg bg-card/80 flex-shrink-0">
                      <img src={selectedGame.logo_url} alt="" className="h-7 w-7 object-contain" />
                    </div>
                  ) : (
                    <div className="p-1.5 rounded-lg gradient-primary flex-shrink-0">
                      <Gamepad2 className="h-5 w-5 text-primary-foreground" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold truncate">{selectedGame?.name}</h2>
                    <p className="text-xs text-muted-foreground">Select a service</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={closePanel} className="rounded-full flex-shrink-0 h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Services List */}
            <div className="flex-1 overflow-y-auto p-4">
              {loadingServices ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : services.length === 0 ? (
                <div className="text-center py-12">
                  <Gamepad2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No services available for this game yet.</p>
                  <p className="text-sm text-muted-foreground mt-2">Check back soon!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {services.map((service) => (
                    <div 
                      key={service.id}
                      className={`p-3 rounded-xl cursor-pointer transition-all duration-200 border ${
                        selectedService?.id === service.id 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border/50 hover:border-border hover:bg-secondary/30'
                      }`}
                      onClick={() => {
                        setSelectedService(service)
                        setQuantity(1)
                        setAddedToCart(false)
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate">{service.title}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {service.description}
                          </p>
                        </div>
                        <span className="font-bold text-sm text-primary flex-shrink-0">
                          {formatPrice(service.price_cents)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2">
                        {service.category && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {service.category}
                          </Badge>
                        )}
                        {service.duration_minutes && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" />
                            {service.duration_minutes}m
                          </span>
                        )}
                        {selectedService?.id === service.id && (
                          <CheckCircle className="h-3.5 w-3.5 text-primary ml-auto" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Action Bar */}
            {selectedService && (
              <div className="flex-shrink-0 p-4 border-t border-border/30 bg-card/90 backdrop-blur-xl">
                <div className="space-y-3">
                  {/* Quantity and Total Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 rounded-full"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center font-semibold text-sm">{quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 rounded-full"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className="text-xl font-bold text-gradient">
                      {formatPrice(selectedService.price_cents * quantity)}
                    </span>
                  </div>

                  {/* Add to Cart Button */}
                  <Button 
                    onClick={addToCart}
                    disabled={addedToCart}
                    className={`w-full h-11 text-sm font-semibold transition-all duration-300 ${
                      addedToCart 
                        ? 'bg-green-600 hover:bg-green-600' 
                        : 'gradient-primary border-0'
                    }`}
                  >
                    {addedToCart ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Added to Cart!
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add to Cart
                      </>
                    )}
                  </Button>

                  {/* View Cart Link */}
                  {cartCount > 0 && (
                    <Link href="/cart" className="block">
                      <Button variant="outline" size="sm" className="w-full">
                        View Cart ({cartCount})
                        <ArrowRight className="ml-2 h-3 w-3" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Overlay for mobile */}
        {selectedGame && (
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
            onClick={closePanel}
          />
        )}
      </div>
    </div>
  )
}
