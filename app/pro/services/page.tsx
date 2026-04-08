import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppLayout } from "@/components/app-layout"
import { ProServicesContent } from "@/components/pro/pro-services-content"
import type { Profile, UserRole } from "@/lib/types"

export default async function ProServicesPage() {
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

  // Fetch PRO's services
  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("pro_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <AppLayout 
      breadcrumbs={[{ label: "PRO Dashboard", href: "/pro/dashboard" }, { label: "My Services" }]} 
      userRole={userProfile.role}
      user={userProfile}
    >
      <ProServicesContent services={services || []} user={userProfile} />
    </AppLayout>
  )
}
