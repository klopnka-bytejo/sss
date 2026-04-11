'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ShoppingCart, 
  ArrowLeft,
  AlertCircle,
  Loader2,
  Star,
  Clock,
  User,
  Plus,
  Minus
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

export default function GameDetailsPage() {
  const params = useParams()
  const gameSlug = params.id as string

  const [game, setGame] = useState<any>(null)
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    fetchGameAndServices()
  }, [gameSlug])

  useEffect(() => {
    if (selectedService) {
      fetchServiceOptions(selectedService.id)
    }
  }, [selectedService])

  const fetchGameAndServices = async () => {
    try {
      const response = await fetch(`/api/game-services?slug=${gameSlug}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Game not found')
          setGame(null)
        } else {
          throw new Error(`HTTP ${response.status}`)
        }
        setLoading(false)
        return
      }
      
      const data = await response.json()
      
      setGame(data.game)
      setServices(data.services || [])
      
      if (data.services && data.services.length > 0) {
        setSelectedService(data.services[0])
      }
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching services'
      setError(message)
      setGame(null)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = () => {
    if (!selectedService) return

    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const cartItem = {
      id: selectedService.id,
      type: 'service',
      name: selectedService.title,
      price: selectedService.price_cents / 100,
      quantity,
      gameSlug,
      gameName: game?.name,
      pro_name: selectedService.pro_name
    }

    cart.push(cartItem)
    localStorage.setItem('cart', JSON.stringify(cart))
    alert(`${selectedService.title} added to cart!`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/games">
            <Button variant="ghost" className="mb-8">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Games
            </Button>
          </Link>
          <Card className="glass">
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
              <p className="text-muted-foreground">Game not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/games" className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="font-semibold">Back to Games</span>
          </Link>
          <h1 className="text-xl font-bold">{game.name}</h1>
          <Link href="/cart">
            <Button variant="ghost" size="sm">
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </header>

      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Services List */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-6">Available Services</h2>
              
              {error && (
                <div className="glass border-destructive/50 text-destructive p-4 rounded-xl mb-6 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-3" />
                  <span>{error}</span>
                </div>
              )}

              {services.length === 0 ? (
                <Card className="glass">
                  <CardContent className="p-12 text-center text-muted-foreground">
                    No services available for this game
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {services.map((service) => (
                    <Card
                      key={service.id}
                      className={`glass glass-hover cursor-pointer transition-all ${
                        selectedService?.id === service.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedService(service)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{service.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
                          </div>
                          <Badge variant="secondary" className="ml-4">
                            ${(service.price_cents / 100).toFixed(2)}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-muted-foreground pt-3 border-t border-border/50">
                          {service.pro_name && (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span>{service.pro_name}</span>
                            </div>
                          )}
                          {service.duration_minutes && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{service.duration_minutes} min</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-warning text-warning" />
                            <span>4.9</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Service Builder & Checkout */}
            {selectedService && (
              <div className="lg:col-span-1">
                <Card className="glass sticky top-24">
                  <CardHeader>
                    <CardTitle className="text-lg">{selectedService.title}</CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Quantity */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Quantity</label>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-semibold">{quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setQuantity(quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="space-y-2 pt-4 border-t border-border/50">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Base Price:</span>
                        <span className="font-medium">${(selectedService.price_cents / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Quantity:</span>
                        <span className="font-medium">×{quantity}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-2 border-t border-border/50">
                        <span>Total:</span>
                        <span className="text-gradient">${((selectedService.price_cents / 100) * quantity).toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <Button
                      onClick={addToCart}
                      className="w-full gradient-primary border-0 h-12"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>

                    {/* Continue Shopping */}
                    <Button
                      variant="outline"
                      className="w-full"
                      asChild
                    >
                      <Link href="/games">
                        Browse More Games
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
