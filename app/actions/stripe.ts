'use server'

import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function startCheckoutSession(serviceId: string, requirements?: Record<string, unknown>) {
  const supabase = await createClient()
  
  // Get the service details
  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('*, pro_profile:pro_profiles(*, profile:profiles(*))')
    .eq('id', serviceId)
    .single()

  if (serviceError || !service) {
    throw new Error(`Service not found`)
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('You must be logged in to checkout')
  }

  // Generate order number
  const orderNumber = `EG-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

  // Create the order first (pending payment)
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      client_id: user.id,
      pro_id: service.pro_id,
      service_id: service.id,
      status: 'pending',
      total_cents: service.price_cents,
      payment_method: 'stripe',
      payment_status: 'pending',
      requirements: requirements || {},
    })
    .select()
    .single()

  if (orderError || !order) {
    throw new Error('Failed to create order')
  }

  // Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded_page',
    redirect_on_completion: 'never',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: service.title,
            description: `${service.game} - ${service.category} service`,
          },
          unit_amount: service.price_cents,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    metadata: {
      order_id: order.id,
      order_number: orderNumber,
      service_id: service.id,
      client_id: user.id,
      pro_id: service.pro_id,
    },
  })

  // Update order with Stripe session ID
  await supabase
    .from('orders')
    .update({ stripe_payment_intent_id: session.id })
    .eq('id', order.id)

  return {
    clientSecret: session.client_secret,
    orderId: order.id,
    orderNumber: orderNumber,
  }
}

export async function confirmPayment(orderId: string) {
  const supabase = await createClient()
  
  // Update order status
  const { error } = await supabase
    .from('orders')
    .update({
      status: 'paid',
      payment_status: 'paid',
    })
    .eq('id', orderId)

  if (error) {
    throw new Error('Failed to confirm payment')
  }

  // Add system message to order
  await supabase
    .from('order_messages')
    .insert({
      order_id: orderId,
      message: 'Payment confirmed. Your order is now being processed.',
      is_system: true,
    })

  return { success: true }
}

export async function createDepositCheckout(amountCents: number) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('You must be logged in')
  }

  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded_page',
    redirect_on_completion: 'never',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Wallet Deposit',
            description: 'Add funds to your Elevate Gaming wallet',
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    metadata: {
      type: 'deposit',
      user_id: user.id,
      amount_cents: amountCents.toString(),
    },
  })

  return session.client_secret
}
