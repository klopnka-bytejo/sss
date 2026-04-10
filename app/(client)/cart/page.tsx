'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Star, Loader2, AlertCircle, ShoppingCart } from 'lucide-react'

interface Service {
  id: string
  title: string
  description: string
  category: string
  game: string
  price_cents: number
  delivery_time: string
  pro_id: string
  pro_name: string
  pro_avatar: string | null
  rating: number
  total_orders: number
  completion_rate: number
}

interface CartItem {
  service: Service
  quantity: number
  notes: string
}

export default function CartCheckoutPage() {
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [checkingOut, setCheckingOut] = useState(false)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        console.log('[v0] Fetching services...')
        const response = await fetch('/api/services')

        if (!response.ok) {
          setError(`Failed to fetch services: ${response.status}`)
          setLoading(false)
          return
        }

        const data = await response.json()
        console.log('[v0] Fetched services:', data.services?.length || 0)
        setServices(data.services || [])
        setError(null)
      } catch (error) {
        console.error('[v0] Error fetching services:', error)
        setError(`Error fetching services: ${error instanceof Error ? error.message : 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.pro_name?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  const addToCart = (service: Service) => {
    const existingItem = cart.find((item) => item.service.id === service.id)
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.service.id === service.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      )
    } else {
      setCart([...cart, { service, quantity: 1, notes: '' }])
    }
  }

  const removeFromCart = (serviceId: string) => {
    setCart(cart.filter((item) => item.service.id !== serviceId))
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  }

  const handleCheckout = async (item: CartItem) => {
    setCheckingOut(true)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: item.service.id,
          notes: item.notes,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('[v0] Order created:', data.order.order_number)
        removeFromCart(item.service.id)
        // In a real app, redirect to payment/order confirmation
        alert(`Order ${data.order.order_number} created successfully! Pending payment.`)
      } else {
        const error = await response.json()
        alert(error.error || 'Checkout failed')
      }
    } catch (error) {
      console.error('[v0] Error during checkout:', error)
      alert('Error during checkout')
    } finally {
      setCheckingOut(false)
    }
  }

  const categories = Array.from(new Set(services.map((s) => s.category)))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Services Marketplace */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Marketplace Services</h1>
              <p className="text-muted-foreground">Browse and add services to your cart</p>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 mt-0.5" />
                <div>
                  <p className="font-semibold">Error</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Search and Filter */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search services or PROs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredServices.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No services found
                </div>
              ) : (
                filteredServices.map((service) => (
                  <Card key={service.id} className="overflow-hidden hover:border-primary transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{service.title}</CardTitle>
                          <CardDescription className="line-clamp-2 mt-1">{service.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="outline">{service.category}</Badge>
                        <Badge variant="outline">{service.game}</Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* PRO Info */}
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={service.pro_avatar || undefined} />
                          <AvatarFallback>{service.pro_name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{service.pro_name}</p>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                            <span className="text-xs text-muted-foreground">
                              {service.rating?.toFixed(1) || 'N/A'} ({service.total_orders} orders)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Pricing and Delivery */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Price</p>
                          <p className="text-2xl font-bold">{formatCurrency(service.price_cents)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Delivery</p>
                          <p className="font-medium">{service.delivery_time}</p>
                        </div>
                      </div>

                      <Button onClick={() => addToCart(service)} className="w-full" variant="default">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add to Cart
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Shopping Cart</CardTitle>
                <CardDescription>{cart.length} item(s)</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {cart.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Your cart is empty</p>
                ) : (
                  <>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {cart.map((item) => (
                        <div key={item.service.id} className="border border-border/30 rounded-lg p-3 space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm line-clamp-1">{item.service.title}</p>
                              <p className="text-xs text-muted-foreground">{item.service.pro_name}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(item.service.id)}
                              className="h-6 w-6 p-0"
                            >
                              ×
                            </Button>
                          </div>

                          <Textarea
                            placeholder="Add notes for the PRO..."
                            value={item.notes}
                            onChange={(e) => {
                              setCart(
                                cart.map((cartItem) =>
                                  cartItem.service.id === item.service.id
                                    ? { ...cartItem, notes: e.target.value }
                                    : cartItem
                                )
                              )
                            }}
                            className="text-xs h-16"
                          />

                          <div className="flex items-center justify-between">
                            <span className="font-semibold">{formatCurrency(item.service.price_cents)}</span>
                            <Button
                              onClick={() => handleCheckout(item)}
                              disabled={checkingOut}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {checkingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Checkout'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {cart.length > 0 && (
                      <div className="border-t pt-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Subtotal:</span>
                          <span className="font-semibold">
                            {formatCurrency(cart.reduce((sum, item) => sum + item.service.price_cents, 0))}
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
