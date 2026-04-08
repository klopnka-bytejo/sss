import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { order_id, message_content, blocked_reason, matched_pattern } = body

  const { error } = await supabase
    .from("moderation_logs")
    .insert({
      order_id,
      user_id: user.id,
      message_content,
      blocked_reason,
      matched_pattern
    })

  if (error) {
    console.error("Failed to log moderation event:", error)
    // Don't return error to client - this is just logging
  }

  return NextResponse.json({ success: true })
}
