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

    const { withdrawalId, action, adminNotes } = await request.json()

    if (!withdrawalId || !action) {
      return NextResponse.json(
        { error: "Withdrawal ID and action are required" },
        { status: 400 }
      )
    }

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      )
    }

    // Get the withdrawal
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from("withdrawals")
      .select("*")
      .eq("id", withdrawalId)
      .single()

    if (withdrawalError || !withdrawal) {
      return NextResponse.json({ error: "Withdrawal not found" }, { status: 404 })
    }

    if (withdrawal.status !== "pending") {
      return NextResponse.json(
        { error: "Withdrawal has already been processed" },
        { status: 400 }
      )
    }

    if (action === "approve") {
      // Mark withdrawal as approved/completed
      await supabase
        .from("withdrawals")
        .update({
          status: "completed",
          admin_notes: adminNotes || null,
          processed_at: new Date().toISOString(),
        })
        .eq("id", withdrawalId)

      // Log admin action
      await supabase.from("admin_audit_log").insert({
        admin_id: user.id,
        action: "withdrawal_approved",
        target_type: "withdrawal",
        target_id: withdrawalId,
        details: { amount_cents: withdrawal.amount_cents, method: withdrawal.method, admin_notes: adminNotes },
      })

      return NextResponse.json({
        success: true,
        message: "Withdrawal approved and marked as completed",
      })
    } else {
      // Reject withdrawal - return funds to PRO's balance
      const { data: proProfile } = await supabase
        .from("profiles")
        .select("balance_cents")
        .eq("id", withdrawal.pro_id)
        .single()

      if (proProfile) {
        const newBalance = proProfile.balance_cents + withdrawal.amount_cents

        await supabase
          .from("profiles")
          .update({ balance_cents: newBalance })
          .eq("id", withdrawal.pro_id)

        // Record the refund transaction
        await supabase.from("transactions").insert({
          user_id: withdrawal.pro_id,
          type: "withdrawal_refund",
          amount_cents: withdrawal.amount_cents,
          balance_after_cents: newBalance,
          reference_id: withdrawalId,
          description: `Withdrawal rejected: ${adminNotes || "No reason provided"}`,
        })
      }

      // Mark withdrawal as rejected
      await supabase
        .from("withdrawals")
        .update({
          status: "rejected",
          admin_notes: adminNotes || null,
          processed_at: new Date().toISOString(),
        })
        .eq("id", withdrawalId)

      // Log admin action
      await supabase.from("admin_audit_log").insert({
        admin_id: user.id,
        action: "withdrawal_rejected",
        target_type: "withdrawal",
        target_id: withdrawalId,
        details: { amount_cents: withdrawal.amount_cents, admin_notes: adminNotes },
      })

      return NextResponse.json({
        success: true,
        message: "Withdrawal rejected and funds returned to PRO balance",
      })
    }
  } catch (error) {
    console.error("Withdrawal process error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
