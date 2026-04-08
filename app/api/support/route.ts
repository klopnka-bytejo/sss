"use server"

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// POST - Create a support ticket
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json()
    const { category, subject, message, orderId, email } = body

    if (!category || !subject || !message) {
      return NextResponse.json(
        { error: "Category, subject, and message are required" },
        { status: 400 }
      )
    }

    // Create support ticket
    const { data: ticket, error } = await supabase
      .from("support_tickets")
      .insert({
        user_id: user?.id || null,
        category,
        subject,
        message,
        order_id: orderId || null,
        contact_email: email || user?.email || null,
        status: "open",
      })
      .select()
      .single()

    if (error) {
      // If table doesn't exist, log to audit_logs instead
      if (error.code === "42P01") {
        await supabase.from("audit_logs").insert({
          action: "support_ticket_created",
          entity_type: "support",
          entity_id: "email",
          user_id: user?.id,
          details: {
            category,
            subject,
            message: message.substring(0, 500),
            order_id: orderId,
            contact_email: email || user?.email,
          },
        })
        
        return NextResponse.json({
          success: true,
          message: "Support ticket submitted. We will respond within 24 hours.",
        })
      }
      throw error
    }

    return NextResponse.json({
      success: true,
      ticketId: ticket?.id,
      message: "Support ticket submitted. We will respond within 24 hours.",
    })
  } catch (error) {
    console.error("Support ticket error:", error)
    return NextResponse.json(
      { error: "Failed to submit support ticket" },
      { status: 500 }
    )
  }
}
