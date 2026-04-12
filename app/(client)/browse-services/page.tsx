'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ClientHeader } from '@/components/client-header'
import {
  Search,
  ShoppingCart,
  AlertCircle,
  Loader2,
  Star,
  Clock,
  User,
  ArrowRight,
  Briefcase
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

export default function BrowseServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
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
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching services')
    } finally {
      setLoading(false)
    }
  }

  const categories = Array.from(new Set(services.map(s => s.category).filter(Boolean)))

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.pro_name?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const addToCart = (service: Service) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    cart.push({
      id: service.id,
      type: 'service',
      name: service.title,
      price: service.price_cents / 100,
      quantity: 1,
      pro_name: service.pro_name
    })
    localStorage.setItem('cart', JSON.stringify(cart))
    updateCartCount()
    alert(`${service.title} added to cart!`)
  }

  return (
    <div className="min-h-screen bg-background">
      <ClientHeader 
        title="Services"
        breadcrumbs={[{ label: 'Services', href: '/browse-services' }]}
      />

      {/* Hero Section */}
      <section className="relative py-12 pt-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-accent/10 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <Badge variant="secondary" className="mb-4 text-xs px-3 py-1 border border-border/50">
              <Briefcase className="h-3 w-3 mr-1.5" />
              {services.length}+ Services Available
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Browse
              <span className="text-gradient"> Services</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Find the perfect service from verified PROs. Boosting, coaching, duo queue, and more.
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

      {/* Filters & Services */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="mb-8 flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('all')}
                className={selectedCategory === 'all' ? 'gradient-primary border-0' : ''}
              >
                All Categories
              </Button>
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? 'gradient-primary border-0' : ''}
                >
                  {category}
                </Button>
              ))}
            </div>
          )}

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
          ) : filteredServices.length === 0 ? (
            <Card className="glass max-w-lg mx-auto">
              <CardContent className="p-12 text-center">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? 'No services match your search.' : 'No services available.'}
                </p>
                {searchQuery && (
                  <Button variant="outline" onClick={() => setSearchQuery('')}>
                    Clear Search
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredServices.map((service) => (
                <Card key={service.id} className="glass glass-hover group overflow-hidden flex flex-col">
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <div className="mb-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                          {service.title}
                        </h3>
                        {service.category && (
                          <Badge variant="secondary" className="ml-2">
                            {service.category}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {service.description}
                      </p>
                    </div>

                    <div className="flex-1" />

                    {/* PRO Info */}
                    <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg mb-4 -mx-6 -mb-6 px-6 py-3">
                      {service.pro_avatar ? (
                        <img src={service.pro_avatar} alt="" className="h-10 w-10 rounded-full" />
                      ) : (
                        <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                          {service.pro_name?.slice(0, 1) || 'P'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{service.pro_name || 'Anonymous PRO'}</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                          <span className="text-xs font-medium">4.9</span>
                        </div>
                      </div>
                    </div>

                    {/* Service Details */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 pb-4 border-b border-border/50">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{service.duration_minutes} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-foreground">${(service.price_cents / 100).toFixed(2)}</span>
                      </div>
                    </div>

                    <Button 
                      onClick={() => addToCart(service)}
                      className="w-full gradient-primary border-0"
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
