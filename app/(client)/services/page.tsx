'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/theme-toggle'
import { 
  Gamepad2, 
  ShoppingCart, 
  Search,
  ArrowRight,
  Loader2,
  Clock,
  User,
  Star,
  Zap
} from 'lucide-react'

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

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    fetchServices()
    updateCartCount()
  }, [])

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    setCartCount(cart.reduce((sum: number, item: any) => sum + item.quantity, 0))
  }

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/game-services')
      if (!response.ok) throw new Error('Failed to fetch services')
      const data = await response.json()
      setServices(data.services || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching services')
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (service: Service) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingItem = cart.find((item: any) => item.id === service.id && item.type === 'service')
    
    if (existingItem) {
      existingItem.quantity += 1
    } else {
      cart.push({
        id: service.id,
        type: 'service',
        name: service.title,
        price: service.price_cents / 100,
        quantity: 1
      })
    }
    
    localStorage.setItem('cart', JSON.stringify(cart))
    updateCartCount()
  }

  const filteredServices = services.filter(service => 
    service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.category?.toLowerCase().includes(searchQuery.toLowerCase())
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
            <Link href="/games" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50">
              Games
            </Link>
            <Link href="/services" className="px-4 py-2 text-sm text-foreground font-medium transition-colors rounded-lg bg-secondary/50">
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
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <Badge variant="secondary" className="mb-4 text-xs px-3 py-1 border border-border/50">
              <Zap className="h-3 w-3 mr-1.5" />
              All Services
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Browse
              <span className="text-gradient"> Services</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Find the perfect service from our verified gaming PROs.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search services..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-4 h-12 bg-card/80 border-border/50 text-base"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredServices.length === 0 ? (
            <Card className="glass max-w-lg mx-auto">
              <CardContent className="p-12 text-center">
                <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Services Available</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery 
                    ? 'No services match your search.' 
                    : 'Services will appear here when PROs create them.'}
                </p>
                <div className="flex gap-3 justify-center">
                  {searchQuery && (
                    <Button variant="outline" onClick={() => setSearchQuery('')}>
                      Clear Search
                    </Button>
                  )}
                  <Button asChild className="gradient-primary border-0">
                    <Link href="/games">Browse Games</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredServices.map((service) => (
                <Card key={service.id} className="glass glass-hover group overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                          {service.title}
                        </h3>
                        {service.category && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {service.category}
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gradient">
                          ${(service.price_cents / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    
                    {service.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {service.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                      {service.pro_name && (
                        <div className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          <span>{service.pro_name}</span>
                        </div>
                      )}
                      {service.duration_minutes && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{service.duration_minutes} min</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                        <span>4.9</span>
                      </div>
                    </div>

                    <Button 
                      className="w-full gradient-primary border-0"
                      onClick={() => addToCart(service)}
                    >
                      Add to Cart
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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
