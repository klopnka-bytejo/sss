'use client'

import { useCallback, useState } from 'react'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { startCheckoutSession, confirmPayment } from '@/app/actions/stripe'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface ServiceCheckoutProps {
  serviceId: string
  serviceName: string
  priceInCents: number
  requirements?: Record<string, unknown>
}

export default function ServiceCheckout({ 
  serviceId, 
  serviceName, 
  priceInCents,
  requirements 
}: ServiceCheckoutProps) {
  const [checkoutState, setCheckoutState] = useState<'loading' | 'checkout' | 'success'>('loading')
  const [orderInfo, setOrderInfo] = useState<{ orderId: string; orderNumber: string } | null>(null)

  const fetchClientSecret = useCallback(async () => {
    const result = await startCheckoutSession(serviceId, requirements)
    setOrderInfo({ orderId: result.orderId, orderNumber: result.orderNumber })
    setCheckoutState('checkout')
    return result.clientSecret
  }, [serviceId, requirements])

  const handleComplete = useCallback(async () => {
    if (orderInfo) {
      await confirmPayment(orderInfo.orderId)
      setCheckoutState('success')
    }
  }, [orderInfo])

  if (checkoutState === 'success') {
    return (
      <Card className="bg-card/50 border-primary/20">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
          <p className="text-muted-foreground mb-2">
            Your order <span className="text-primary font-mono">{orderInfo?.orderNumber}</span> has been placed.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Our PRO will start working on your order shortly.
          </p>
          <div className="flex gap-4">
            <Button asChild>
              <Link href={`/orders`}>View My Orders</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/services">Browse More Services</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Checkout: {serviceName}</span>
          <span className="text-primary">${(priceInCents / 100).toFixed(2)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div id="checkout" className="min-h-[400px]">
          <EmbeddedCheckoutProvider
            stripe={stripePromise}
            options={{ 
              fetchClientSecret,
              onComplete: handleComplete,
            }}
          >
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      </CardContent>
    </Card>
  )
}

// Wallet deposit checkout
export function WalletDepositCheckout({ 
  amountCents,
  onSuccess 
}: { 
  amountCents: number
  onSuccess?: () => void 
}) {
  const [checkoutState, setCheckoutState] = useState<'checkout' | 'success'>('checkout')

  const fetchClientSecret = useCallback(async () => {
    const { createDepositCheckout } = await import('@/app/actions/stripe')
    return createDepositCheckout(amountCents)
  }, [amountCents])

  const handleComplete = useCallback(() => {
    setCheckoutState('success')
    onSuccess?.()
  }, [onSuccess])

  if (checkoutState === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-xl font-bold mb-2">Deposit Successful!</h2>
        <p className="text-muted-foreground">
          ${(amountCents / 100).toFixed(2)} has been added to your wallet.
        </p>
      </div>
    )
  }

  return (
    <div id="wallet-checkout" className="min-h-[400px]">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ 
          fetchClientSecret,
          onComplete: handleComplete,
        }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
