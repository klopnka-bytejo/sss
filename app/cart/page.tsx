'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/lib/contexts/cart-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { X, Plus, Minus, ArrowLeft } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getTotal, getItemCount } = useCart()
  const total = getTotal()
  const count = getItemCount()

  if (count === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Your Cart is Empty</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">No items in your cart yet. Browse our services to get started.</p>
            <Button asChild className="w-full">
              <Link href="/">Continue Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <h1 className="text-3xl font-bold">Shopping Cart</h1>
            <div className="space-y-4">
              {items.map((item) => (
                <Card key={item.serviceId}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{formatCurrency(item.price_cents)} per item</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.serviceId, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.serviceId, parseInt(e.target.value) || 1)}
                          className="w-12 text-center"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.serviceId, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.serviceId)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(item.price_cents * item.quantity)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Cart Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Platform Fee</span>
                    <span>{formatCurrency(Math.round(total * 0.05))}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(total + Math.round(total * 0.05))}</span>
                  </div>
                </div>

                <Button asChild className="w-full" size="lg">
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>

                <Button variant="outline" className="w-full" onClick={clearCart}>
                  Clear Cart
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
