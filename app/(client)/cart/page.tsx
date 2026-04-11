'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/theme-toggle'
import { toast } from 'sonner'
import { 
  ShoppingCart, 
  Trash2, 
  ArrowRight, 
  ArrowLeft,
  Gamepad2,
  Plus,
  Minus,
  ShoppingBag,
  Sparkles,
  LogIn
} from 'lucide-react'

interface CartItem {
  id: string
  type: 'game' | 'service'
  name: string
  price: number
  quantity: number
  gameName?: string
  pro_name?: string
}

export default function CartPage() {
  const router = useRouter()
  const [items, setItems] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
    loadCart()
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      setUser(data.user)
    } catch {
      setUser(null)
    }
  }

  const handleCheckout = () => {
    if (!user) {
      toast('Sign in required', {
        description: 'You need to sign in to complete your checkout.',
        action: {
          label: 'Sign In',
          onClick: () => router.push('/auth/login?redirect=/checkout'),
        },
        icon: <LogIn className="h-4 w-4" />,
        duration: 5000,
      })
      return
    }
    router.push('/checkout')
  }

  const loadCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    setItems(cart)
  }

  const calculateSubtotal = () => {
    return items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  }

  const calculateTax = () => {
    return calculateSubtotal() * 0.1
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const removeItem = (id: string, type: string) => {
    const updated = items.filter(item => !(item.id === id && item.type === type))
    setItems(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
  }

  const updateQuantity = (id: string, type: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id, type)
      return
    }

    const updated = items.map(item =>
      item.id === id && item.type === type ? { ...item, quantity } : item
    )
    setItems(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
  }

  const clearCart = () => {
    setItems([])
    localStorage.removeItem('cart')
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  if (!mounted) return null

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
            <Link href="/browse-services" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50">
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
                {items.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full gradient-primary text-xs flex items-center justify-center text-primary-foreground font-medium">
                    {items.length}
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

      {/* Main Content */}
      <main className="pt-16 min-h-screen">
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-20 right-1/4 w-[300px] h-[300px] bg-accent/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Back Button & Title */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/games">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Shopping Cart</h1>
              <p className="text-sm text-muted-foreground">
                {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
          </div>

          {items.length === 0 ? (
            /* Empty Cart State */
            <div className="max-w-md mx-auto text-center py-16">
              <div className="mb-6 relative">
                <div className="w-24 h-24 mx-auto rounded-full bg-secondary/50 flex items-center justify-center">
                  <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="absolute top-0 right-1/3 p-1.5 rounded-full bg-primary/20">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
              </div>
              <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">
                Browse our games and services to find something you like!
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" asChild>
                  <Link href="/games">
                    <Gamepad2 className="mr-2 h-4 w-4" />
                    Browse Games
                  </Link>
                </Button>
                <Button className="gradient-primary border-0" asChild>
                  <Link href="/browse-services">
                    Browse Services
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            /* Cart with Items */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-3">
                {items.map((item, idx) => (
                  <div 
                    key={`${item.id}-${item.type}-${idx}`}
                    className="glass rounded-xl p-4 flex items-center gap-4 group hover:border-border transition-colors"
                  >
                    {/* Item Icon */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
                      {item.type === 'game' ? (
                        <Gamepad2 className="h-6 w-6 text-primary-foreground" />
                      ) : (
                        <Sparkles className="h-6 w-6 text-primary-foreground" />
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              {item.type}
                            </Badge>
                            {item.gameName && (
                              <span className="text-xs text-muted-foreground truncate">
                                {item.gameName}
                              </span>
                            )}
                            {item.pro_name && (
                              <span className="text-xs text-muted-foreground truncate">
                                by {item.pro_name}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="font-bold text-sm flex-shrink-0">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 rounded-full"
                            onClick={() => updateQuantity(item.id, item.type, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 rounded-full"
                            onClick={() => updateQuantity(item.id, item.type, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <span className="text-xs text-muted-foreground ml-2">
                            {formatPrice(item.price)} each
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeItem(item.id, item.type)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Clear Cart Button */}
                <div className="flex justify-end pt-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={clearCart}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    Clear Cart
                  </Button>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="glass rounded-xl p-5 sticky top-24">
                  <h2 className="font-semibold mb-4">Order Summary</h2>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatPrice(calculateSubtotal())}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax (10%)</span>
                      <span>{formatPrice(calculateTax())}</span>
                    </div>
                    <div className="border-t border-border/50 pt-3 flex justify-between font-semibold text-base">
                      <span>Total</span>
                      <span className="text-gradient">{formatPrice(calculateTotal())}</span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <Button
                      onClick={handleCheckout}
                      className="w-full gradient-primary border-0 h-11"
                    >
                      Proceed to Checkout
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Link href="/games" className="block">
                      <Button variant="outline" className="w-full">
                        Continue Shopping
                      </Button>
                    </Link>
                  </div>

                  <p className="text-[10px] text-muted-foreground text-center mt-4">
                    Secure checkout powered by Stripe
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 border-t border-border/30">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Elevate Gaming. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
