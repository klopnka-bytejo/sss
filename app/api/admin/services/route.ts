import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  const supabase = await createClient()

  const { searchParams } = new URL(req.url)
  const gameId = searchParams.get("gameId")

  let query = supabase
    .from("services")
    .select("*, game:games(name, slug)")
    .order("created_at", { ascending: false })

  if (gameId) {
    query = query.eq("game_id", gameId)
  }

  const { data: services, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(services)
}

export async function POST(req: NextRequest) {
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

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const {
    title,
    description,
    game_id,
    category,
    pricing_type,
    price_cents,
    delivery_type,
    estimated_hours,
    is_active,
    is_featured,
    requirements_schema,
    addons,
    metadata,
  } = body

  // Generate slug from title
  const slug = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")

  const { data: service, error } = await supabase
    .from("services")
    .insert({
      title,
      slug,
      description,
      game_id,
      category: category || "boosting",
      pricing_type: pricing_type || "fixed",
      price_cents: price_cents || 0,
      price_type: pricing_type === "dynamic" ? "dynamic" : "fixed",
      delivery_type: delivery_type || "piloted",
      estimated_hours: estimated_hours || 24,
      is_active: is_active ?? true,
      is_featured: is_featured ?? false,
      requirements_schema: requirements_schema || {},
      addons: addons || [],
      metadata: metadata || {},
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await supabase.from("audit_logs").insert({
    action: "service_created",
    entity_type: "service",
    entity_id: service.id,
    user_id: user.id,
    details: { title, game_id },
  })

  return NextResponse.json(service, { status: 201 })
}

export async function PUT(req: NextRequest) {
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

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const { id, ...updates } = body

  if (!id) {
    return NextResponse.json({ error: "Service ID required" }, { status: 400 })
  }

  // Update slug if title changed
  if (updates.title) {
    updates.slug = updates.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
  }

  const { data: service, error } = await supabase
    .from("services")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await supabase.from("audit_logs").insert({
    action: "service_updated",
    entity_type: "service",
    entity_id: id,
    user_id: user.id,
    details: updates,
  })

  return NextResponse.json(service)
}

export async function DELETE(req: NextRequest) {
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

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "Service ID required" }, { status: 400 })
  }

  // Check for active orders
  const { count } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("service_id", id)
    .not("status", "in", "(completed,cancelled,refunded)")

  if (count && count > 0) {
    return NextResponse.json(
      { error: "Cannot delete service with active orders" },
      { status: 400 }
    )
  }

  const { error } = await supabase.from("services").delete().eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await supabase.from("audit_logs").insert({
    action: "service_deleted",
    entity_type: "service",
    entity_id: id,
    user_id: user.id,
  })

  return NextResponse.json({ success: true })
}
