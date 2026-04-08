import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { amountCents, method, payoutDetails } = await request.json()

    if (!amountCents || !method || !payoutDetails) {
      return NextResponse.json(
        { error: "Amount, method, and payout details are required" },
        { status: 400 }
      )
    }

    // Minimum withdrawal is $10
    if (amountCents < 1000) {
      return NextResponse.json(
        { error: "Minimum withdrawal is $10" },
        { status: 400 }
      )
    }

    // Get user profile to check balance
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("balance_cents, role")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    if (profile.role !== "pro") {
      return NextResponse.json(
        { error: "Only PROs can request withdrawals" },
        { status: 403 }
      )
    }

    if (profile.balance_cents < amountCents) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      )
    }

    // Create withdrawal request
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from("withdrawals")
      .insert({
        pro_id: user.id,
        amount_cents: amountCents,
        method,
        payout_details: payoutDetails,
        status: "pending",
      })
      .select()
      .single()

    if (withdrawalError) {
      console.error("Withdrawal error:", withdrawalError)
      return NextResponse.json(
        { error: "Failed to create withdrawal request" },
        { status: 500 }
      )
    }

    // Deduct from balance
    const newBalance = profile.balance_cents - amountCents
    await supabase
      .from("profiles")
      .update({ balance_cents: newBalance })
      .eq("id", user.id)

    // Record transaction
    await supabase.from("transactions").insert({
      user_id: user.id,
      type: "withdrawal",
      amount_cents: -amountCents,
      balance_after_cents: newBalance,
      reference_id: withdrawal.id,
      description: `Withdrawal via ${method}`,
    })

    // Log notification (in production, send actual email)
    console.log(`[EMAIL] Withdrawal request submitted:`)
    console.log(`  Amount: $${(amountCents / 100).toFixed(2)}`)
    console.log(`  Method: ${method}`)
    console.log(`  Details: ${JSON.stringify(payoutDetails)}`)

    return NextResponse.json({
      success: true,
      withdrawalId: withdrawal.id,
      message: "Withdrawal request submitted successfully",
    })
  } catch (error) {
    console.error("Withdrawal error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
