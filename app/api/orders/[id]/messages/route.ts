import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Verify user has access to this order
  const { data: order } = await supabase
    .from("orders")
    .select("client_id, pro_id")
    .eq("id", id)
    .single()

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const isAdmin = profile?.role === "admin"
  const isParticipant = order.client_id === user.id || order.pro_id === user.id

  if (!isAdmin && !isParticipant) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { data: messages, error } = await supabase
    .from("order_messages")
    .select("*, sender:profiles(username, role)")
    .eq("order_id", id)
    .order("created_at", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ messages })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { content } = body

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json({ error: "Message content required" }, { status: 400 })
  }

  if (content.length > 2000) {
    return NextResponse.json({ error: "Message too long" }, { status: 400 })
  }

  // Verify user has access to this order
  const { data: order } = await supabase
    .from("orders")
    .select("client_id, pro_id, status")
    .eq("id", id)
    .single()

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  const isParticipant = order.client_id === user.id || order.pro_id === user.id

  if (!isParticipant) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Check if chat is enabled for this order status
  const chatEnabledStatuses = ["assigned", "in_progress", "awaiting_customer_info"]
  if (!chatEnabledStatuses.includes(order.status)) {
    return NextResponse.json({ error: "Chat is not available for this order" }, { status: 400 })
  }

  // Insert message
  const { data: message, error } = await supabase
    .from("order_messages")
    .insert({
      order_id: id,
      sender_id: user.id,
      content: content.trim()
    })
    .select("*, sender:profiles(username, role)")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message })
}
