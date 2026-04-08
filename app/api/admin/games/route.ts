import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()

  const { data: games, error } = await supabase
    .from("games")
    .select("*")
    .order("sort_order", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(games)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  // Check admin role
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
  const { name, slug, description, logo_url, banner_url, is_active, sort_order } = body

  const { data: game, error } = await supabase
    .from("games")
    .insert({
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
      description,
      logo_url,
      banner_url,
      is_active: is_active ?? true,
      sort_order: sort_order ?? 0,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Log action
  await supabase.from("audit_logs").insert({
    action: "game_created",
    entity_type: "game",
    entity_id: game.id,
    user_id: user.id,
    details: { name },
  })

  return NextResponse.json(game, { status: 201 })
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
    return NextResponse.json({ error: "Game ID required" }, { status: 400 })
  }

  const { data: game, error } = await supabase
    .from("games")
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
    action: "game_updated",
    entity_type: "game",
    entity_id: id,
    user_id: user.id,
    details: updates,
  })

  return NextResponse.json(game)
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
    return NextResponse.json({ error: "Game ID required" }, { status: 400 })
  }

  // Check if game has services
  const { count } = await supabase
    .from("services")
    .select("*", { count: "exact", head: true })
    .eq("game_id", id)

  if (count && count > 0) {
    return NextResponse.json(
      { error: "Cannot delete game with existing services" },
      { status: 400 }
    )
  }

  const { error } = await supabase.from("games").delete().eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await supabase.from("audit_logs").insert({
    action: "game_deleted",
    entity_type: "game",
    entity_id: id,
    user_id: user.id,
  })

  return NextResponse.json({ success: true })
}
