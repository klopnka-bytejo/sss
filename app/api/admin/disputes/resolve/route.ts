import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { disputeId, resolution, adminNotes, refundPercentage } = await request.json()

    if (!disputeId || !resolution) {
      return NextResponse.json(
        { error: "Dispute ID and resolution are required" },
        { status: 400 }
      )
    }

    const validResolutions = ["favor_client", "favor_pro", "partial_refund", "no_action"]
    if (!validResolutions.includes(resolution)) {
      return NextResponse.json(
        { error: "Invalid resolution type" },
        { status: 400 }
      )
    }

    // Get the dispute with order info
    const { data: dispute, error: disputeError } = await supabase
      .from("disputes")
      .select(`
        *,
        order:orders(*)
      `)
      .eq("id", disputeId)
      .single()

    if (disputeError || !dispute) {
      return NextResponse.json({ error: "Dispute not found" }, { status: 404 })
    }

    if (dispute.status !== "open") {
      return NextResponse.json(
        { error: "Dispute has already been resolved" },
        { status: 400 }
      )
    }

    const order = dispute.order

    // Handle based on resolution type
    let newOrderStatus = "completed"
    let refundAmount = 0
    let proPayoutAmount = order.total_cents

    switch (resolution) {
      case "favor_client":
        // Full refund to client, no payout to PRO
        newOrderStatus = "refunded"
        refundAmount = order.total_cents
        proPayoutAmount = 0
        break

      case "favor_pro":
        // No refund, full payout to PRO
        newOrderStatus = "completed"
        refundAmount = 0
        proPayoutAmount = order.total_cents
        break

      case "partial_refund":
        // Partial refund based on percentage
        const percentage = refundPercentage || 50
        refundAmount = Math.floor(order.total_cents * (percentage / 100))
        proPayoutAmount = order.total_cents - refundAmount
        newOrderStatus = "completed"
        break

      case "no_action":
        // Return to previous state
        newOrderStatus = "pending_review"
        break
    }

    // Update dispute
    await supabase
      .from("disputes")
      .update({
        status: "resolved",
        resolution,
        admin_notes: adminNotes || null,
        resolved_by: user.id,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", disputeId)

    // Update order status
    await supabase
      .from("orders")
      .update({
        status: newOrderStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id)

    // Handle refund if needed
    if (refundAmount > 0) {
      // In production, process actual refund via Stripe
      console.log(`[REFUND] Processing refund of $${(refundAmount / 100).toFixed(2)} for order ${order.order_number}`)
      
      // Record transaction
      await supabase.from("transactions").insert({
        user_id: order.client_id,
        type: "refund",
        amount_cents: refundAmount,
        balance_after_cents: 0, // Client balance (if using wallet)
        reference_id: order.id,
        description: `Refund for order ${order.order_number}`,
      })
    }

    // Handle PRO payout if resolution favors PRO (partially or fully)
    if (proPayoutAmount > 0 && order.pro_id && resolution !== "no_action") {
      // Credit PRO's balance
      const { data: proProfile } = await supabase
        .from("profiles")
        .select("balance_cents")
        .eq("id", order.pro_id)
        .single()

      if (proProfile) {
        const platformFee = Math.floor(proPayoutAmount * 0.15) // 15% platform fee
        const proAmount = proPayoutAmount - platformFee
        const newBalance = proProfile.balance_cents + proAmount

        await supabase
          .from("profiles")
          .update({ balance_cents: newBalance })
          .eq("id", order.pro_id)

        await supabase.from("transactions").insert({
          user_id: order.pro_id,
          type: "payout",
          amount_cents: proAmount,
          balance_after_cents: newBalance,
          reference_id: order.id,
          description: `Dispute resolved payout for order ${order.order_number}`,
        })
      }
    }

    // Add system message to order chat
    await supabase.from("order_messages").insert({
      order_id: order.id,
      sender_id: user.id,
      message: `Dispute resolved: ${resolution.replace(/_/g, " ")}. ${adminNotes || ""}`,
      is_system: true,
    })

    // Log admin action
    await supabase.from("admin_audit_log").insert({
      admin_id: user.id,
      action: "dispute_resolved",
      target_type: "dispute",
      target_id: disputeId,
      details: { resolution, refundAmount, proPayoutAmount, adminNotes },
    })

    return NextResponse.json({
      success: true,
      message: "Dispute resolved successfully",
      resolution,
      refundAmount,
      proPayoutAmount,
    })
  } catch (error) {
    console.error("Dispute resolution error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
