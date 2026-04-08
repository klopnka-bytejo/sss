import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// This endpoint should be called by a cron job (e.g., Vercel Cron)
// to automatically release orders after 24 hours in "pending_review" status

export async function GET(req: NextRequest) {
  // Verify cron secret for security
  const authHeader = req.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = await createClient()
  
  // Find orders that have been in "completed_pending_review" for more than 24 hours
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  
  const { data: ordersToRelease, error: fetchError } = await supabase
    .from("orders")
    .select("id, pro_id, total_amount_cents, proof_submitted_at")
    .eq("status", "completed_pending_review")
    .lt("proof_submitted_at", twentyFourHoursAgo)
  
  if (fetchError) {
    console.error("Failed to fetch orders:", fetchError)
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  if (!ordersToRelease || ordersToRelease.length === 0) {
    return NextResponse.json({ message: "No orders to release", count: 0 })
  }

  const released: string[] = []
  const errors: string[] = []

  for (const order of ordersToRelease) {
    try {
      // 1. Update order status to "completed_released"
      const { error: updateError } = await supabase
        .from("orders")
        .update({ 
          status: "completed_released",
          released_at: new Date().toISOString()
        })
        .eq("id", order.id)

      if (updateError) throw updateError

      // 2. Calculate PRO payout (e.g., 70% of order total)
      const proPayoutRate = 0.70
      const proPayoutCents = Math.round(order.total_amount_cents * proPayoutRate)

      if (order.pro_id) {
        // 3. Get PRO's current wallet balance
        const { data: wallet, error: walletFetchError } = await supabase
          .from("wallets")
          .select("balance_cents")
          .eq("user_id", order.pro_id)
          .single()

        if (walletFetchError && walletFetchError.code !== "PGRST116") {
          throw walletFetchError
        }

        const currentBalance = wallet?.balance_cents || 0
        const newBalance = currentBalance + proPayoutCents

        // 4. Update or create wallet
        if (wallet) {
          const { error: walletUpdateError } = await supabase
            .from("wallets")
            .update({ 
              balance_cents: newBalance,
              updated_at: new Date().toISOString()
            })
            .eq("user_id", order.pro_id)

          if (walletUpdateError) throw walletUpdateError
        } else {
          const { error: walletCreateError } = await supabase
            .from("wallets")
            .insert({
              user_id: order.pro_id,
              balance_cents: proPayoutCents
            })

          if (walletCreateError) throw walletCreateError
        }

        // 5. Create wallet transaction log
        const { error: transactionError } = await supabase
          .from("wallet_transactions")
          .insert({
            wallet_id: order.pro_id,
            order_id: order.id,
            type: "earning",
            amount_cents: proPayoutCents,
            balance_before_cents: currentBalance,
            balance_after_cents: newBalance,
            description: `Payout for order #${order.id.substring(0, 8)}`,
            status: "completed"
          })

        if (transactionError) throw transactionError
      }

      // 6. Log audit entry
      await supabase.from("audit_logs").insert({
        action: "auto_release_order",
        entity_type: "order",
        entity_id: order.id,
        details: {
          pro_id: order.pro_id,
          payout_cents: order.pro_id ? Math.round(order.total_amount_cents * 0.70) : 0,
          release_reason: "24_hour_auto_release"
        }
      })

      released.push(order.id)
    } catch (error) {
      console.error(`Failed to release order ${order.id}:`, error)
      errors.push(order.id)
    }
  }

  return NextResponse.json({
    message: `Released ${released.length} orders`,
    released,
    errors,
    timestamp: new Date().toISOString()
  })
}

export async function POST(req: NextRequest) {
  // Allow manual trigger with admin auth
  return GET(req)
}
