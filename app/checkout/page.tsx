'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/contexts/cart-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import Link from 'next/link'

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotal, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phone: '',
    notes: '',
  })

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <ThemeToggle />
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Add services to your cart to proceed with checkout.</p>
            <Button asChild>
              <Link href="/services">Browse Services</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePlaceOrder = async () => {
    if (!formData.email || !formData.fullName) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          items,
          billingInfo: formData,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to place order')
        setLoading(false)
        return
      }

      setOrderPlaced(true)
      setOrderId(data.order.id)
      clearCart()
    } catch (err) {
      setError('An error occurred while placing your order')
      setLoading(false)
    }
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <ThemeToggle />
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Order Placed Successfully!</h2>
            <p className="text-muted-foreground mb-4">
              Your order has been submitted. Our admins will review and assign a PRO to handle your request.
            </p>
            <p className="text-sm font-mono bg-muted p-3 rounded mb-6">{orderId}</p>
            <div className="space-y-2">
              <Button asChild className="w-full gradient-primary">
                <Link href="/dashboard/client/orders">View My Orders</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/services">Continue Shopping</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const total = getTotal()

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <ThemeToggle />
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Checkout</h1>
            <p className="text-muted-foreground">Review your items and complete your order</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Order Summary */}
            <div className="md:col-span-2">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item) => (
                    <div key={item.serviceId} className="flex items-center justify-between pb-4 border-b border-border/50 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                        <p className="text-xs text-muted-foreground mt-1">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">{formatCurrency(item.price_cents * item.quantity)}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Billing Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Billing Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">
                      {error}
                    </div>
                  )}

                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 123-4567"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Additional Notes</Label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Any special requirements or preferences..."
                      disabled={loading}
                      className="w-full px-3 py-2 bg-muted border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      rows={3}
                    />
                  </div>

                  <Button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="w-full gradient-primary"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Place Order - ${formatCurrency(total)}`
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Order Total */}
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Total</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatCurrency(0)}</span>
                  </div>
                  <div className="border-t border-border pt-4 flex items-center justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold text-gradient">{formatCurrency(total)}</span>
                  </div>

                  <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded">
                    Payment is secured. Your order will be assigned to a verified PRO once confirmed.
                  </div>

                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/services">Continue Shopping</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
