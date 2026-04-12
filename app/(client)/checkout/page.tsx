'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { ClientHeader } from '@/components/client-header'
import {
  ShoppingCart,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Gamepad2,
  CreditCard,
  Wallet,
  Banknote,
  Lock,
  Sparkles,
  ArrowRight
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

export default function CheckoutPage() {
  const router = useRouter()
  const [items, setItems] = useState<CartItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState('credit_card')
  const [loading, setLoading] = useState(false)
  const [orderCreated, setOrderCreated] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadCart()
  }, [])

  const loadCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    setItems(cart)
  }

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  const calculateTax = () => {
    return calculateSubtotal() * 0.1
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const handleCheckout = async () => {
    if (items.length === 0) return

    setLoading(true)
    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          items,
          paymentMethod,
          totalCents: Math.round(calculateTotal() * 100)
        })
      })

      const data = await response.json()

      if (response.ok) {
        setOrderNumber(data.order.order_number)
        setOrderCreated(true)
        localStorage.removeItem('cart')
        
        setTimeout(() => {
          router.push('/dashboard/client/orders')
        }, 3000)
      } else {
        alert(data.error || 'Failed to create order')
      }
    } catch (error) {
      alert('Error during checkout')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  // Order Success State
  if (orderCreated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <ClientHeader 
          title="Order Confirmation"
          breadcrumbs={[{ label: 'Orders', href: '/dashboard/client/orders' }]}
        />
        
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[150px]" />
        </div>

        <div className="relative z-10 glass rounded-2xl max-w-md w-full text-center p-8 mt-20">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-muted-foreground">
              Your order <span className="font-semibold text-foreground">{orderNumber}</span> has been placed successfully.
            </p>
          </div>
          
          <div className="glass rounded-xl p-4 mb-6 text-left">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">What happens next?</p>
                <p className="text-xs text-muted-foreground">A PRO will be assigned shortly</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              You&apos;ll receive a notification when your order is accepted. Track progress in your dashboard.
            </p>
          </div>

          <div className="space-y-3">
            <Link href="/dashboard/client/orders" className="block">
              <Button className="w-full gradient-primary border-0">
                View Your Orders
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/games" className="block">
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            Redirecting to your orders in 3 seconds...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <ClientHeader 
        title="Checkout"
        breadcrumbs={[
          { label: 'Cart', href: '/cart' },
          { label: 'Checkout', href: '/checkout' }
        ]}
      />

      {/* Main Content */}
      <main className="pt-20 min-h-screen">
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-20 right-1/4 w-[300px] h-[300px] bg-accent/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8">
          {items.length === 0 ? (
            /* Empty State */
            <div className="max-w-md mx-auto text-center py-16">
              <div className="w-20 h-20 mx-auto rounded-full bg-secondary/50 flex items-center justify-center mb-6">
                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No items to checkout</h2>
              <p className="text-muted-foreground mb-6">
                Add some services to your cart first
              </p>
              <Button className="gradient-primary border-0" asChild>
                <Link href="/games">Browse Games</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 max-w-5xl mx-auto">
              {/* Main Content */}
              <div className="lg:col-span-3 space-y-6">
                {/* Order Items */}
                <div className="glass rounded-xl p-5">
                  <h2 className="font-semibold mb-4 flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Order Items ({items.length})
                  </h2>
                  <div className="space-y-3">
                    {items.map((item, idx) => (
                      <div 
                        key={`${item.id}-${idx}`}
                        className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30"
                      >
                        <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                          {item.type === 'game' ? (
                            <Gamepad2 className="h-5 w-5 text-primary-foreground" />
                          ) : (
                            <Sparkles className="h-5 w-5 text-primary-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.name}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              {item.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">×{item.quantity}</span>
                          </div>
                        </div>
                        <span className="font-semibold text-sm">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="glass rounded-xl p-5">
                  <h2 className="font-semibold mb-4 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Payment Method
                  </h2>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2">
                    <label 
                      htmlFor="credit_card"
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === 'credit_card' 
                          ? 'bg-primary/10 border border-primary' 
                          : 'bg-secondary/30 border border-transparent hover:border-border'
                      }`}
                    >
                      <RadioGroupItem value="credit_card" id="credit_card" />
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">Credit Card</p>
                        <p className="text-xs text-muted-foreground">Visa, Mastercard, Amex</p>
                      </div>
                    </label>

                    <label 
                      htmlFor="paypal"
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === 'paypal' 
                          ? 'bg-primary/10 border border-primary' 
                          : 'bg-secondary/30 border border-transparent hover:border-border'
                      }`}
                    >
                      <RadioGroupItem value="paypal" id="paypal" />
                      <Wallet className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">PayPal</p>
                        <p className="text-xs text-muted-foreground">Fast and secure</p>
                      </div>
                    </label>

                    <label 
                      htmlFor="cash"
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === 'cash' 
                          ? 'bg-primary/10 border border-primary' 
                          : 'bg-secondary/30 border border-transparent hover:border-border'
                      }`}
                    >
                      <RadioGroupItem value="cash" id="cash" />
                      <Banknote className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">Pay Later</p>
                        <p className="text-xs text-muted-foreground">Pay when service completes</p>
                      </div>
                    </label>
                  </RadioGroup>
                </div>
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-2">
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
                    <div className="border-t border-border/50 pt-3 flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span className="text-gradient">{formatPrice(calculateTotal())}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleCheckout}
                    disabled={loading || items.length === 0}
                    className="w-full gradient-primary border-0 h-12 mt-6"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Complete Order
                      </>
                    )}
                  </Button>

                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    <span>Secure 256-bit SSL encryption</span>
                  </div>

                  <p className="text-[10px] text-muted-foreground text-center mt-4">
                    By completing your order, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
