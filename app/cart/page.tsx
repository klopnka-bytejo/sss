"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/utils"
import { 
  ShoppingCart, 
  Trash2, 
  ArrowRight, 
  Gamepad2,
  Package,
  AlertCircle,
  RefreshCw
} from "lucide-react"

type CartItem = {
  id: string
  service_id: string
  quantity: number
  selected_options: Record<string, unknown>
  calculated_price_cents: number
  requirements: Record<string, unknown>
  service?: {
    id: string
    title: string
    description: string
    game: string
    price_cents: number
    base_price_cents: number
    price_type: string
    game_info?: {
      name: string
      logo_url: string
    }
  }
}

export default function CartPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/cart')
      if (res.ok) {
        const data = await res.json()
        setCartItems(data.items || [])
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeItem = async (itemId: string) => {
    setRemoving(itemId)
    try {
      const res = await fetch(`/api/cart?id=${itemId}`, { method: 'DELETE' })
      if (res.ok) {
        setCartItems(items => items.filter(item => item.id !== itemId))
      }
    } catch (error) {
      console.error('Error removing item:', error)
    } finally {
      setRemoving(null)
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.calculated_price_cents, 0)

  const proceedToCheckout = () => {
    if (cartItems.length === 1) {
      router.push(`/checkout/${cartItems[0].service_id}`)
    } else {
      // For multiple items, we'd need a multi-item checkout
      // For now, redirect to first item
      router.push(`/checkout/${cartItems[0].service_id}`)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Gamepad2 className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">Elevate Gaming</span>
            </Link>
            <nav className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="/services">Continue Shopping</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <ShoppingCart className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Your Cart</h1>
              <p className="text-muted-foreground">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>

          {loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="text-muted-foreground mt-4">Loading your cart...</p>
              </CardContent>
            </Card>
          ) : cartItems.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
                <p className="text-muted-foreground mb-6">
                  Browse our services and add something to your cart
                </p>
                <Button asChild>
                  <Link href="/services">Browse Services</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map(item => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {item.service?.game_info?.logo_url && (
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={item.service.game_info.logo_url}
                              alt={item.service.game_info.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold truncate">
                                {item.service?.title}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {item.service?.game}
                              </p>
                            </div>
                            <p className="font-bold text-lg">
                              {formatCurrency(item.calculated_price_cents)}
                            </p>
                          </div>
                          
                          {/* Selected Options */}
                          {Object.keys(item.selected_options).length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {Object.entries(item.selected_options).map(([key, value]) => (
                                <Badge key={key} variant="secondary" className="text-xs">
                                  {key}: {String(value)}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-end mt-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeItem(item.id)}
                          disabled={removing === item.id}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          {removing === item.id ? 'Removing...' : 'Remove'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Order Summary */}
              <div>
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Platform Fee</span>
                      <span className="text-green-500">Included</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="text-lg">{formatCurrency(subtotal)}</span>
                    </div>

                    <div className="p-3 rounded-lg bg-muted/50 flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <p className="text-xs text-muted-foreground">
                        You will need to sign in or create an account to complete your purchase.
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={proceedToCheckout}
                    >
                      Proceed to Checkout
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
