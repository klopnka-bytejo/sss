import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { sql } from '@/lib/neon/server'
import Stripe from 'stripe'

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
    console.error('[v0] Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.payment_status === 'paid') {
          const metadata = session.metadata
          
          if (metadata?.order_id) {
            // Handle order payment
            const orderId = metadata.order_id
            
            // Update order status to paid
            await sql`
              UPDATE orders 
              SET status = 'paid', payment_status = 'paid', updated_at = NOW()
              WHERE id = ${orderId}
            `
            
            // Create system message
            await sql`
              INSERT INTO order_messages (order_id, message, is_system, created_at)
              VALUES (
                ${orderId}, 
                'Payment confirmed! Your order is now waiting for a PRO to accept it.',
                true,
                NOW()
              )
            `
            
            // Log to audit
            await sql`
              INSERT INTO admin_audit_log (admin_id, action, entity_type, entity_id, details, created_at)
              VALUES (
                NULL,
                'payment_completed',
                'order',
                ${orderId},
                ${JSON.stringify({ 
                  payment_intent: session.payment_intent,
                  amount: session.amount_total 
                })},
                NOW()
              )
            `
          }
        }
        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = session.metadata?.order_id
        
        if (orderId) {
          // Mark order as payment failed
          await sql`
            UPDATE orders 
            SET status = 'cancelled', payment_status = 'failed', updated_at = NOW()
            WHERE id = ${orderId} AND status = 'pending'
          `
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('[v0] Payment failed:', paymentIntent.id)
        break
      }

      default:
        console.log(`[v0] Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[v0] Webhook processing error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
