import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { orderId, reason, description } = await request.json()

    if (!orderId || !reason || !description) {
      return NextResponse.json(
        { error: "Order ID, reason, and description are required" },
        { status: 400 }
      )
    }

    // Get the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Only the client can file a dispute
    if (order.client_id !== user.id) {
      return NextResponse.json(
        { error: "Only the client can file a dispute" },
        { status: 403 }
      )
    }

    // Check if order is in a disputable state
    const disputableStatuses = ["in_progress", "pending_review", "completed"]
    if (!disputableStatuses.includes(order.status)) {
      return NextResponse.json(
        { error: "This order cannot be disputed" },
        { status: 400 }
      )
    }

    // Check if a dispute already exists for this order
    const { data: existingDispute } = await supabase
      .from("disputes")
      .select("id")
      .eq("order_id", orderId)
      .eq("status", "open")
      .single()

    if (existingDispute) {
      return NextResponse.json(
        { error: "A dispute is already open for this order" },
        { status: 400 }
      )
    }

    // Create the dispute
    const { data: dispute, error: disputeError } = await supabase
      .from("disputes")
      .insert({
        order_id: orderId,
        client_id: user.id,
        pro_id: order.pro_id,
        reason,
        description,
        status: "open",
      })
      .select()
      .single()

    if (disputeError) {
      console.error("Error creating dispute:", disputeError)
      return NextResponse.json(
        { error: "Failed to create dispute" },
        { status: 500 }
      )
    }

    // Update order status to disputed
    await supabase
      .from("orders")
      .update({
        status: "disputed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)

    // Add system message to order chat
    await supabase.from("order_messages").insert({
      order_id: orderId,
      sender_id: user.id,
      message: `Dispute filed: ${reason}. An admin will review this case shortly.`,
      is_system: true,
    })

    // Log notification (in production, notify admin)
    console.log(`[ADMIN NOTIFICATION] New dispute filed:`)
    console.log(`  Order: ${order.order_number}`)
    console.log(`  Reason: ${reason}`)
    console.log(`  Description: ${description}`)

    return NextResponse.json({
      success: true,
      disputeId: dispute.id,
      message: "Dispute filed successfully. An admin will review your case.",
    })
  } catch (error) {
    console.error("Dispute error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
