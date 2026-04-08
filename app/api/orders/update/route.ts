import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { orderId, status } = await request.json()

    if (!orderId || !status) {
      return NextResponse.json({ error: "Order ID and status are required" }, { status: 400 })
    }

    // Validate status
    const validStatuses = ["in_progress", "completed", "cancelled"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
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

    // Check permissions
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    const isOwner = order.pro_id === user.id || order.client_id === user.id
    const isAdmin = profile?.role === "admin"

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Not authorized to update this order" }, { status: 403 })
    }

    // Build update data
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (status === "completed") {
      updateData.completed_at = new Date().toISOString()
    }

    // Update order
    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating order:", updateError)
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
    }

    // Add system message
    const statusMessages: Record<string, string> = {
      in_progress: "Order has been started.",
      completed: "Order has been marked as completed.",
      cancelled: "Order has been cancelled.",
    }

    await supabase
      .from("order_messages")
      .insert({
        order_id: orderId,
        sender_id: user.id,
        message: statusMessages[status],
        is_system: true,
      })

    return NextResponse.json({ 
      success: true, 
      order: updatedOrder,
      message: "Order updated successfully" 
    })
  } catch (error) {
    console.error("Error in update order API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
