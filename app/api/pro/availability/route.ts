import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// GET /api/pro/availability - Get PRO's availability settings
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, availability_settings")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "pro") {
      return NextResponse.json({ error: "PRO access required" }, { status: 403 })
    }

    return NextResponse.json({ settings: profile.availability_settings || {} })
  } catch (error) {
    console.error("PRO availability error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/pro/availability - Update PRO's availability settings
export async function PUT(request: NextRequest) {
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

    const settings = await request.json()

    const { error } = await supabase
      .from("profiles")
      .update({ 
        availability_settings: settings,
        updated_at: new Date().toISOString()
      })
      .eq("id", user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("PRO availability update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
