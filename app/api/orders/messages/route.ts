import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Patterns to detect external contact attempts
const BLOCKED_PATTERNS = [
  // Discord patterns
  /discord\.gg\/[a-zA-Z0-9]+/i,
  /discord\s*(server|link|invite)/i,
  /add\s*me\s*(on\s*)?discord/i,
  /my\s*discord\s*(is|:)/i,
  /discord\s*#?\d{4}/i,
  
  // Social media patterns
  /instagram\.com/i,
  /@[a-zA-Z0-9_]+\s*(on\s*)?(ig|insta|instagram)/i,
  /my\s*(ig|insta|instagram)/i,
  /twitter\.com/i,
  /x\.com\/[a-zA-Z0-9_]+/i,
  /my\s*twitter/i,
  /follow\s*me\s*(on|@)/i,
  
  // Messaging apps
  /whatsapp/i,
  /telegram\.me/i,
  /t\.me\/[a-zA-Z0-9_]+/i,
  /snapchat/i,
  /my\s*snap(chat)?\s*(is|:)/i,
  
  // Phone/Email
  /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/,  // Phone numbers
  /call\s*me\s*(at|on)/i,
  /text\s*me\s*(at|on)/i,
  /my\s*(number|phone)/i,
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i,  // Email addresses
  /email\s*me/i,
  /contact\s*me\s*(outside|directly)/i,
  
  // Payment bypass
  /pay\s*(me\s*)?(directly|outside)/i,
  /venmo/i,
  /paypal\.me/i,
  /cashapp/i,
  /\$cashtag/i,
  /zelle/i,
  /crypto\s*wallet/i,
  /send\s*(payment|money)\s*(to|directly)/i,
]

function containsBlockedContent(message: string): { blocked: boolean; reason: string | null } {
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(message)) {
      return { 
        blocked: true, 
        reason: "Message contains external contact information which is not allowed for safety reasons."
      }
    }
  }
  return { blocked: false, reason: null }
}

// GET - Fetch messages for an order
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get("orderId")
    
    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is part of this order
    const { data: order } = await supabase
      .from("orders")
      .select("client_id, pro_id")
      .eq("id", orderId)
      .single()

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check if user is admin, client, or PRO of this order
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    const isAdmin = profile?.role === "admin"
    const isParticipant = order.client_id === user.id || order.pro_id === user.id

    if (!isAdmin && !isParticipant) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Fetch messages
    const { data: messages, error } = await supabase
      .from("order_messages")
      .select(`
        *,
        sender:profiles!order_messages_sender_id_fkey(id, email, username, avatar_url, role)
      `)
      .eq("order_id", orderId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching messages:", error)
      return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
    }

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("Messages fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Send a new message
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { orderId, message } = await request.json()

    if (!orderId || !message) {
      return NextResponse.json(
        { error: "Order ID and message are required" },
        { status: 400 }
      )
    }

    // Check if message contains blocked content
    const { blocked, reason } = containsBlockedContent(message)
    if (blocked) {
      return NextResponse.json(
        { 
          error: "Message blocked", 
          reason,
          blocked: true 
        },
        { status: 400 }
      )
    }

    // Check if user is part of this order
    const { data: order } = await supabase
      .from("orders")
      .select("client_id, pro_id, status")
      .eq("id", orderId)
      .single()

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check if user is admin, client, or PRO of this order
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    const isAdmin = profile?.role === "admin"
    const isParticipant = order.client_id === user.id || order.pro_id === user.id

    if (!isAdmin && !isParticipant) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Check if order is in a state that allows messaging
    const allowedStatuses = ["paid", "in_progress", "pending_review", "disputed"]
    if (!allowedStatuses.includes(order.status) && !isAdmin) {
      return NextResponse.json(
        { error: "Cannot send messages for this order status" },
        { status: 400 }
      )
    }

    // Insert message
    const { data: newMessage, error } = await supabase
      .from("order_messages")
      .insert({
        order_id: orderId,
        sender_id: user.id,
        message: message.trim(),
        is_system: false,
      })
      .select(`
        *,
        sender:profiles!order_messages_sender_id_fkey(id, email, username, avatar_url, role)
      `)
      .single()

    if (error) {
      console.error("Error sending message:", error)
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: newMessage 
    })
  } catch (error) {
    console.error("Message send error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
