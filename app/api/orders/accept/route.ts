import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is a PRO
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (!profile || (profile.role !== "pro" && profile.role !== "admin")) {
      return NextResponse.json({ error: "Only PROs can accept orders" }, { status: 403 })
    }

    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
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

    // Check if order can be accepted (must be paid and not already in progress)
    if (order.status !== "paid") {
      return NextResponse.json({ error: "Order must be paid to accept" }, { status: 400 })
    }

    // Update order status and assign PRO
    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update({
        status: "in_progress",
        pro_id: user.id,
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select()
      .single()

    if (updateError) {
      console.error("Error accepting order:", updateError)
      return NextResponse.json({ error: "Failed to accept order" }, { status: 500 })
    }

    // Add system message to order
    await supabase
      .from("order_messages")
      .insert({
        order_id: orderId,
        sender_id: user.id,
        message: `Order accepted by ${profile.username || 'PRO'}. Work will begin shortly.`,
        is_system: true,
      })

    return NextResponse.json({ 
      success: true, 
      order: updatedOrder,
      message: "Order accepted successfully" 
    })
  } catch (error) {
    console.error("Error in accept order API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
