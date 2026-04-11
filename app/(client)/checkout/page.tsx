'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

interface CartItem {
  id: string
  type: 'game' | 'service'
  name: string
  price: number
  quantity: number
}

export default function CheckoutPage() {
  const router = useRouter()
  const [items, setItems] = useState<CartItem[]>([])
  const [total, setTotal] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('credit_card')
  const [processing, setProcessing] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderId, setOrderId] = useState<string>('')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    if (cart.length === 0) {
      router.push('/cart')
      return
    }
    setItems(cart)
    const sum = cart.reduce((acc: number, item: CartItem) => acc + item.price * item.quantity, 0)
    setTotal(sum)
  }

  const handleCheckout = async () => {
    if (!paymentMethod) {
      setError('Please select a payment method')
      return
    }

    setProcessing(true)
    setError('')

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          items,
          paymentMethod
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order')
      }

      setOrderId(data.order.order_number)
      setOrderPlaced(true)
      localStorage.removeItem('cart')

      setTimeout(() => {
        router.push(`/dashboard/client/orders`)
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order')
    } finally {
      setProcessing(false)
    }
  }

  if (items.length === 0 && !orderPlaced) {
    return <div className="p-8 text-center">Loading...</div>
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Order Placed Successfully!</h2>
            <p className="text-muted-foreground mb-2">Order #{orderId}</p>
            <p className="text-sm text-muted-foreground mb-6">
              Redirecting to your orders...
            </p>
            <Button asChild className="w-full">
              <a href="/dashboard/client/orders">View My Orders</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Order Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item) => (
              <div key={`${item.id}-${item.type}`} className="flex justify-between">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
            <div className="border-t pt-3">
              <div className="flex justify-between mb-1">
                <span>Subtotal:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-3">
                <span>Tax:</span>
                <span>${(total * 0.1).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>${(total * 1.1).toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>Select your preferred payment method (mock payment)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent">
              <input
                type="radio"
                name="payment"
                value="cash"
                checked={paymentMethod === 'cash'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <div>
                <p className="font-medium">Cash Payment</p>
                <p className="text-sm text-muted-foreground">Pay cash on delivery</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent">
              <input
                type="radio"
                name="payment"
                value="credit_card"
                checked={paymentMethod === 'credit_card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <div>
                <p className="font-medium">Credit Card</p>
                <p className="text-sm text-muted-foreground">Visa, Mastercard (mock)</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent">
              <input
                type="radio"
                name="payment"
                value="paypal"
                checked={paymentMethod === 'paypal'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <div>
                <p className="font-medium">PayPal</p>
                <p className="text-sm text-muted-foreground">PayPal account (mock)</p>
              </div>
            </label>
          </CardContent>
        </Card>

        {/* Terms */}
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This is a mock checkout system. No actual payment will be processed.
          </AlertDescription>
        </Alert>

        {/* Actions */}
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            disabled={processing}
            className="flex-1"
          >
            Back to Cart
          </Button>
          <Button 
            onClick={handleCheckout}
            disabled={processing}
            className="flex-1"
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Confirm Order - $${(total * 1.1).toFixed(2)}`
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
