import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// This endpoint releases payouts for completed orders after the 24-hour hold
// In production, this would be triggered by a Vercel Cron job

export async function GET(request: NextRequest) {
  try {
    // Use service role for admin operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Find orders that are pending_review and past their hold time
    const { data: ordersToRelease, error: fetchError } = await supabase
      .from("orders")
      .select("*, service:services(*)")
      .eq("status", "pending_review")
      .lte("completed_at_hold", new Date().toISOString())

    if (fetchError) {
      console.error("Error fetching orders:", fetchError)
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
    }

    if (!ordersToRelease || ordersToRelease.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: "No payouts to release",
        released: 0 
      })
    }

    let releasedCount = 0

    for (const order of ordersToRelease) {
      try {
        // Calculate PRO earnings (85% of total)
        const proEarnings = Math.floor(order.total_cents * 0.85)
        
        // Get the PRO who completed this order
        const proId = order.pro_id
        if (!proId) continue

        // Get current PRO balance
        const { data: proProfile } = await supabase
          .from("profiles")
          .select("balance_cents")
          .eq("id", proId)
          .single()

        const newBalance = (proProfile?.balance_cents || 0) + proEarnings

        // Update PRO balance
        await supabase
          .from("profiles")
          .update({ balance_cents: newBalance })
          .eq("id", proId)

        // Record transaction for PRO
        await supabase.from("transactions").insert({
          user_id: proId,
          type: "order_earning",
          amount_cents: proEarnings,
          balance_after_cents: newBalance,
          reference_id: order.id,
          description: `Earnings from order ${order.order_number}`,
        })

        // Update order status to completed
        await supabase
          .from("orders")
          .update({
            status: "completed",
            payout_released_at: new Date().toISOString(),
          })
          .eq("id", order.id)

        // Add system message
        await supabase.from("order_messages").insert({
          order_id: order.id,
          sender_id: proId,
          message: `Payout of $${(proEarnings / 100).toFixed(2)} has been released to your wallet.`,
          is_system: true,
        })

        releasedCount++
        console.log(`[PAYOUT] Released $${(proEarnings / 100).toFixed(2)} for order ${order.order_number}`)
      } catch (orderError) {
        console.error(`Error processing order ${order.id}:`, orderError)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Released ${releasedCount} payouts`,
      released: releasedCount,
    })
  } catch (error) {
    console.error("Payout release error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Also allow POST for manual triggering
export async function POST(request: NextRequest) {
  return GET(request)
}
