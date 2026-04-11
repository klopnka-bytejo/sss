'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import {
  ShoppingCart,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  Trash2,
  CreditCard,
  Wallet,
  DollarSign
} from 'lucide-react'

interface CartItem {
  id: string
  type: 'game' | 'service'
  name: string
  price: number
  quantity: number
  gameName?: string
  serviceName?: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const [items, setItems] = useState<CartItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState('credit_card')
  const [loading, setLoading] = useState(false)
  const [orderCreated, setOrderCreated] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')

  useEffect(() => {
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

  const removeItem = (id: string, type: string) => {
    const updated = items.filter(item => !(item.id === id && item.type === type))
    setItems(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
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
        
        // Redirect after 3 seconds
        setTimeout(() => {
          router.push('/dashboard/client/orders')
        }, 3000)
      } else {
        alert(data.error || 'Failed to create order')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Error during checkout')
    } finally {
      setLoading(false)
    }
  }

  const subtotal = calculateSubtotal()
  const tax = calculateTax()
  const total = calculateTotal()

  if (orderCreated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="glass max-w-md w-full text-center">
          <CardContent className="p-12">
            <div className="mb-6">
              <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-muted-foreground mb-4">
              Your order <span className="font-semibold text-foreground">{orderNumber}</span> has been created successfully.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Redirecting to your orders...
            </p>
            <Link href="/dashboard/client/orders">
              <Button className="w-full gradient-primary border-0">
                View Your Orders
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/cart" className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="font-semibold">Back to Cart</span>
          </Link>
          <h1 className="text-xl font-bold">Checkout</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {items.length === 0 ? (
            <Card className="glass max-w-lg mx-auto">
              <CardContent className="p-12 text-center">
                <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Your cart is empty</p>
                <Button variant="outline" asChild>
                  <Link href="/games">Continue Shopping</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Order Items */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
                  <div className="space-y-3">
                    {items.map((item, idx) => (
                      <Card key={idx} className="glass">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="font-semibold">{item.name}</h3>
                              {item.gameName && (
                                <p className="text-sm text-muted-foreground">{item.gameName}</p>
                              )}
                            </div>
                            <Badge variant="secondary">{item.type}</Badge>
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t border-border/50">
                            <span className="text-sm text-muted-foreground">×{item.quantity}</span>
                            <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id, item.type)}
                              className="ml-auto"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <h2 className="text-xl font-bold mb-4">Payment Method</h2>
                  <Card className="glass">
                    <CardContent className="p-6">
                      <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                        <div className="flex items-center space-x-2 mb-4 p-4 rounded-lg hover:bg-secondary/50 cursor-pointer">
                          <RadioGroupItem value="credit_card" id="credit_card" />
                          <Label htmlFor="credit_card" className="flex-1 cursor-pointer flex items-center gap-3">
                            <CreditCard className="h-5 w-5" />
                            <div>
                              <p className="font-medium">Credit Card</p>
                              <p className="text-xs text-muted-foreground">Visa, Mastercard, Amex</p>
                            </div>
                          </Label>
                        </div>

                        <div className="flex items-center space-x-2 mb-4 p-4 rounded-lg hover:bg-secondary/50 cursor-pointer">
                          <RadioGroupItem value="paypal" id="paypal" />
                          <Label htmlFor="paypal" className="flex-1 cursor-pointer flex items-center gap-3">
                            <Wallet className="h-5 w-5" />
                            <div>
                              <p className="font-medium">PayPal</p>
                              <p className="text-xs text-muted-foreground">Fast and secure payment</p>
                            </div>
                          </Label>
                        </div>

                        <div className="flex items-center space-x-2 p-4 rounded-lg hover:bg-secondary/50 cursor-pointer">
                          <RadioGroupItem value="cash" id="cash" />
                          <Label htmlFor="cash" className="flex-1 cursor-pointer flex items-center gap-3">
                            <DollarSign className="h-5 w-5" />
                            <div>
                              <p className="font-medium">Cash</p>
                              <p className="text-xs text-muted-foreground">Pay when service is delivered</p>
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Order Summary Sidebar */}
              <div>
                <Card className="glass sticky top-24">
                  <CardHeader>
                    <CardTitle>Order Total</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span className="font-medium">${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax (10%):</span>
                        <span className="font-medium">${tax.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="border-t border-border/50 pt-4">
                      <div className="flex justify-between text-lg font-bold mb-4">
                        <span>Total:</span>
                        <span className="text-gradient">${total.toFixed(2)}</span>
                      </div>

                      <Button
                        onClick={handleCheckout}
                        disabled={loading || items.length === 0}
                        className="w-full gradient-primary border-0 h-12"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            Complete Order
                          </>
                        )}
                      </Button>

                      <p className="text-xs text-muted-foreground text-center mt-4">
                        By placing an order, you agree to our Terms of Service and Privacy Policy.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
