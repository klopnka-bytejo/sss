import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const VALID_TRANSITIONS: Record<string, string[]> = {
  paid: ["assigned"],
  assigned: ["in_progress"],
  in_progress: ["pending_review", "on_hold"],
  pending_review: ["released", "disputed"],
  on_hold: ["in_progress", "cancelled"],
  disputed: ["refunded", "released"],
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { orderId, status } = await request.json()

    if (!orderId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get current order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, service:services(*)")
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check if user is the PRO or an admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    const isAdmin = profile?.role === "admin"
    const isPro = order.pro_id === user.id

    if (!isAdmin && !isPro) {
      return NextResponse.json({ error: "Not authorized to update this order" }, { status: 403 })
    }

    // Validate status transition (admins can override)
    if (!isAdmin) {
      const allowedTransitions = VALID_TRANSITIONS[order.status] || []
      if (!allowedTransitions.includes(status)) {
        return NextResponse.json({ 
          error: `Cannot transition from ${order.status} to ${status}` 
        }, { status: 400 })
      }
    }

    // Update order status
    const updateData: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
    }

    // Set started_at when starting progress
    if (status === "in_progress" && !order.started_at) {
      updateData.started_at = new Date().toISOString()
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId)

    if (updateError) {
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
    }

    // Log the action
    await supabase.from("audit_logs").insert({
      action: "order_status_change",
      user_id: user.id,
      target_type: "order",
      target_id: orderId,
      metadata: {
        from_status: order.status,
        to_status: status,
      },
    })

    return NextResponse.json({ success: true, status })

  } catch (error) {
    console.error("Error updating order status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
