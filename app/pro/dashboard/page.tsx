import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppLayout } from "@/components/app-layout"
import { ProDashboard } from "@/components/dashboard/pro-dashboard"
import type { Profile, UserRole } from "@/lib/types"

export default async function ProDashboardPage() {
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

  return (
    <AppLayout 
      breadcrumbs={[{ label: "PRO Dashboard" }]} 
      userRole={userProfile.role}
      user={userProfile}
    >
      <ProDashboard user={userProfile} />
    </AppLayout>
  )
}
