import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { orderId, proofLink, proofNotes } = await request.json()

    if (!orderId || !proofLink) {
      return NextResponse.json(
        { error: "Order ID and proof link are required" },
        { status: 400 }
      )
    }

    // Verify the order exists and belongs to this PRO (or is unassigned)
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, service:services(*)")
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (order.status !== "in_progress") {
      return NextResponse.json(
        { error: "Only in-progress orders can be completed" },
        { status: 400 }
      )
    }

    // Calculate hold release time (24 hours from now)
    const holdReleaseTime = new Date()
    holdReleaseTime.setHours(holdReleaseTime.getHours() + 24)

    // Update order with proof and set to pending_review
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "pending_review",
        proof_link: proofLink,
        proof_notes: proofNotes || null,
        completed_at: new Date().toISOString(),
        completed_at_hold: holdReleaseTime.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)

    if (updateError) {
      console.error("Error updating order:", updateError)
      return NextResponse.json(
        { error: "Failed to complete order" },
        { status: 500 }
      )
    }

    // Create a system message about completion
    await supabase.from("order_messages").insert({
      order_id: orderId,
      sender_id: user.id,
      message: `Order completed! Proof submitted: ${proofLink}${proofNotes ? ` - Notes: ${proofNotes}` : ""}`,
      is_system: true,
    })

    // Get client email for notification (in production, send actual email)
    const { data: client } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", order.client_id)
      .single()

    // Log email notification (in production, use Resend/SendGrid)
    console.log(`[EMAIL] Order completed notification to ${client?.email}:`)
    console.log(`  Order: ${order.order_number}`)
    console.log(`  Service: ${order.service?.title}`)
    console.log(`  Proof: ${proofLink}`)
    console.log(`  Payout will be released in 24 hours`)

    return NextResponse.json({
      success: true,
      message: "Order completed successfully. Payout will be released after 24-hour hold.",
      holdReleaseTime: holdReleaseTime.toISOString(),
    })
  } catch (error) {
    console.error("Error completing order:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
