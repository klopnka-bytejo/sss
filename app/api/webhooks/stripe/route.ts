import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Use service role for webhook processing
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    // In production, use STRIPE_WEBHOOK_SECRET to verify
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } else {
      // For development, parse the event directly
      event = JSON.parse(body) as Stripe.Event
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.payment_status === 'paid') {
          const metadata = session.metadata
          
          if (metadata?.type === 'deposit') {
            // Handle wallet deposit
            const userId = metadata.user_id
            const amountCents = parseInt(metadata.amount_cents || '0')
            
            // Get or create wallet
            const { data: wallet } = await supabase
              .from('wallets')
              .select('id, balance')
              .eq('user_id', userId)
              .single()
            
            if (wallet) {
              // Update wallet balance
              await supabase
                .from('wallets')
                .update({ balance: wallet.balance + amountCents })
                .eq('id', wallet.id)
              
              // Create transaction record
              await supabase.from('wallet_transactions').insert({
                user_id: userId,
                wallet_id: wallet.id,
                type: 'deposit',
                amount: amountCents,
                balance_after: wallet.balance + amountCents,
                description: 'Wallet deposit via Stripe',
                status: 'completed',
              })
            }
          } else if (metadata?.order_id) {
            // Handle order payment
            const orderId = metadata.order_id
            
            // Update order status to paid
            await supabase
              .from('orders')
              .update({
                status: 'paid',
                payment_status: 'paid',
                paid_at: new Date().toISOString(),
              })
              .eq('id', orderId)
            
            // Create system message
            await supabase.from('order_messages').insert({
              order_id: orderId,
              content: 'Payment confirmed! Your order is now waiting for a PRO to accept it.',
              is_system: true,
            })
            
            // Log to audit
            await supabase.from('audit_logs').insert({
              action: 'payment_completed',
              entity_type: 'order',
              entity_id: orderId,
              details: {
                payment_intent: session.payment_intent,
                amount: session.amount_total,
              },
            })
          }
        }
        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = session.metadata?.order_id
        
        if (orderId) {
          // Mark order as payment failed
          await supabase
            .from('orders')
            .update({
              status: 'cancelled',
              payment_status: 'failed',
            })
            .eq('id', orderId)
            .eq('status', 'pending')
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('Payment failed:', paymentIntent.id)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
