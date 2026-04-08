import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppLayout } from "@/components/app-layout"
import { ClientDashboard } from "@/components/dashboard/client-dashboard"
import { ProDashboard } from "@/components/dashboard/pro-dashboard"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"
import type { Profile, UserRole } from "@/lib/types"

export default async function DashboardPage() {
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

  const renderDashboard = () => {
    switch (userProfile.role) {
      case "admin":
        return <AdminDashboard user={userProfile} />
      case "pro":
        return <ProDashboard user={userProfile} />
      default:
        return <ClientDashboard user={userProfile} />
    }
  }

  return (
    <AppLayout 
      breadcrumbs={[{ label: "Dashboard" }]} 
      userRole={userProfile.role}
      user={userProfile}
    >
      {renderDashboard()}
    </AppLayout>
  )
}
