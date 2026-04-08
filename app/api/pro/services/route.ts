import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// GET /api/pro/services - Get PRO's services
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "pro") {
      return NextResponse.json({ error: "PRO access required" }, { status: 403 })
    }

    const { data: services, error } = await supabase
      .from("services")
      .select("*, game_info:games(*)")
      .eq("pro_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ services })
  } catch (error) {
    console.error("PRO services error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/pro/services - Create a new service
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "pro") {
      return NextResponse.json({ error: "PRO access required" }, { status: 403 })
    }

    const body = await request.json()
    const {
      title,
      description,
      category,
      game,
      game_id,
      price_cents,
      price_type,
      pricing_type,
      delivery_type,
      estimated_hours,
    } = body

    const { data: service, error } = await supabase
      .from("services")
      .insert({
        pro_id: user.id,
        title,
        description,
        category,
        game,
        game_id,
        price_cents,
        price_type: price_type || "fixed",
        pricing_type: pricing_type || "fixed",
        delivery_type: delivery_type || "piloted",
        estimated_hours,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ service })
  } catch (error) {
    console.error("PRO service create error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH /api/pro/services - Update a service
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { serviceId, ...updates } = body

    // Verify ownership
    const { data: service } = await supabase
      .from("services")
      .select("pro_id")
      .eq("id", serviceId)
      .single()

    if (!service || service.pro_id !== user.id) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    const { error } = await supabase
      .from("services")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", serviceId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("PRO service update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/pro/services - Delete a service
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get("id")

    if (!serviceId) {
      return NextResponse.json({ error: "Service ID required" }, { status: 400 })
    }

    // Verify ownership
    const { data: service } = await supabase
      .from("services")
      .select("pro_id")
      .eq("id", serviceId)
      .single()

    if (!service || service.pro_id !== user.id) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    // Check for active orders
    const { count } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("service_id", serviceId)
      .in("status", ["paid", "in_progress", "pending_review"])

    if (count && count > 0) {
      return NextResponse.json({ error: "Cannot delete service with active orders" }, { status: 400 })
    }

    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", serviceId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("PRO service delete error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
