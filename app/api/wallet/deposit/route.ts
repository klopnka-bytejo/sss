import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import Stripe from "stripe"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { amountCents } = body

    if (!amountCents || amountCents < 500) {
      return NextResponse.json(
        { error: "Minimum deposit is $5.00" },
        { status: 400 }
      )
    }

    if (amountCents > 100000) {
      return NextResponse.json(
        { error: "Maximum deposit is $1,000.00" },
        { status: 400 }
      )
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, email, display_name")
      .eq("id", user.id)
      .single()

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-02-24.acacia",
    })

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Wallet Deposit",
              description: `Add $${(amountCents / 100).toFixed(2)} to your wallet`,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "wallet_deposit",
        userId: user.id,
        amountCents: amountCents.toString(),
      },
      customer_email: profile?.email || user.email,
      success_url: `${baseUrl}/wallet?deposit=success`,
      cancel_url: `${baseUrl}/wallet?deposit=cancelled`,
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error("Wallet deposit error:", error)
    return NextResponse.json(
      { error: "Failed to create deposit session" },
      { status: 500 }
    )
  }
}
