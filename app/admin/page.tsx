import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppLayout } from "@/components/app-layout"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import type { Profile, UserRole } from "@/lib/types"

export default async function AdminPage() {
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

  // Only allow admin users
  if (userProfile.role !== "admin") {
    redirect("/dashboard")
  }

  // Fetch stats
  const [
    { count: totalUsers },
    { count: totalOrders },
    { count: totalPros },
    { count: pendingDisputes },
    { count: pendingWithdrawals },
    { data: recentOrders },
    { data: recentUsers },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "pro"),
    supabase.from("disputes").select("*", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("withdrawals").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("orders").select("*, client:profiles!orders_client_id_fkey(*), service:services(*)").order("created_at", { ascending: false }).limit(5),
    supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(5),
  ])

  const stats = {
    totalUsers: totalUsers || 0,
    totalOrders: totalOrders || 0,
    totalPros: totalPros || 0,
    pendingDisputes: pendingDisputes || 0,
    pendingWithdrawals: pendingWithdrawals || 0,
  }

  return (
    <AppLayout 
      breadcrumbs={[{ label: "Admin Dashboard" }]} 
      userRole={userProfile.role}
      user={userProfile}
    >
      <AdminDashboard 
        stats={stats} 
        recentOrders={recentOrders || []} 
        recentUsers={recentUsers || []} 
      />
    </AppLayout>
  )
}
