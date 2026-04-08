import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// GET /api/admin/users - Get all users with filters
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    let query = supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })

    if (role && role !== "all") {
      query = query.eq("role", role)
    }

    if (status === "suspended") {
      query = query.eq("is_suspended", true)
    } else if (status === "active") {
      query = query.eq("is_suspended", false)
    }

    if (search) {
      query = query.or(`email.ilike.%${search}%,username.ilike.%${search}%`)
    }

    const { data: users, error } = await query.limit(100)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Admin users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH /api/admin/users - Update user (suspend/unsuspend, change role)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { userId, action, newRole, reason } = body

    if (!userId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let updateData: Record<string, unknown> = {}
    let auditAction = ""

    switch (action) {
      case "suspend":
        updateData = { is_suspended: true, suspended_at: new Date().toISOString(), suspension_reason: reason }
        auditAction = "user_suspended"
        break
      case "unsuspend":
        updateData = { is_suspended: false, suspended_at: null, suspension_reason: null }
        auditAction = "user_unsuspended"
        break
      case "change_role":
        if (!newRole || !["client", "pro", "admin"].includes(newRole)) {
          return NextResponse.json({ error: "Invalid role" }, { status: 400 })
        }
        updateData = { role: newRole }
        auditAction = "user_role_changed"
        break
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", userId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Log audit
    await supabase.from("audit_logs").insert({
      action: auditAction,
      entity_type: "user",
      entity_id: userId,
      user_id: user.id,
      details: { action, reason, newRole },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin users update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
