'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingCart, Trash2, ArrowRight, AlertCircle } from 'lucide-react'

interface CartItem {
  id: string
  type: 'game' | 'service'
  name: string
  price: number
  quantity: number
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([])
  const [total, setTotal] = useState(0)

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    setItems(cart)
    calculateTotal(cart)
  }

  const calculateTotal = (cartItems: CartItem[]) => {
    const sum = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
    setTotal(sum)
  }

  const removeItem = (id: string, type: string) => {
    const updated = items.filter(item => !(item.id === id && item.type === type))
    setItems(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
    calculateTotal(updated)
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
    calculateTotal(updated)
  }

  const clearCart = () => {
    setItems([])
    localStorage.removeItem('cart')
    setTotal(0)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

        {items.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Your cart is empty</p>
              <div className="flex gap-4 justify-center">
                <Link href="/games">
                  <Button variant="outline">Browse Games</Button>
                </Link>
                <Link href="/services">
                  <Button variant="outline">Browse Services</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {items.map((item) => (
                <Card key={`${item.id}-${item.type}`}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.type}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.type, item.quantity - 1)}
                        >
                          −
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.type, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                      <div className="text-right min-w-24">
                        <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id, item.type)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-lg">
                  <span>Subtotal:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span>Tax:</span>
                  <span>${(total * 0.1).toFixed(2)}</span>
                </div>
                <div className="border-t pt-4 flex justify-between text-xl font-bold">
                  <span>Total:</span>
                  <span>${(total * 1.1).toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={clearCart}
                className="flex-1"
              >
                Clear Cart
              </Button>
              <Link href="/checkout" className="flex-1">
                <Button className="w-full">
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
