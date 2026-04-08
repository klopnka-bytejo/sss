import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppLayout } from "@/components/app-layout"
import { ServiceForm } from "@/components/pro/service-form"
import type { Profile, UserRole } from "@/lib/types"

export default async function NewServicePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const userProfile: Profile = profile || {
    id: user.id,
    email: user.email || "",
    username: user.user_metadata?.username || null,
    avatar_url: null,
    role: (user.user_metadata?.role as UserRole) || "client",
    balance_cents: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  // Only allow PRO users
  if (userProfile.role !== "pro" && userProfile.role !== "admin") {
    redirect("/dashboard")
  }

  // Check if PRO profile exists, if not create one
  const { data: proProfile } = await supabase
    .from("pro_profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!proProfile) {
    // Create PRO profile
    await supabase.from("pro_profiles").insert({
      id: user.id,
      display_name: userProfile.username || "PRO User",
      games: [],
    })
  }

  return (
    <AppLayout 
      breadcrumbs={[
        { label: "PRO Dashboard", href: "/pro/dashboard" },
        { label: "My Services", href: "/pro/services" },
        { label: "New Service" }
      ]} 
      userRole={userProfile.role}
      user={userProfile}
    >
      <ServiceForm user={userProfile} />
    </AppLayout>
  )
}
