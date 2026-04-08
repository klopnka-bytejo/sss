import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppLayout } from "@/components/app-layout"
import { AdminWithdrawalsContent } from "@/components/admin/admin-withdrawals-content"
import type { Profile, UserRole } from "@/lib/types"

export default async function AdminWithdrawalsPage() {
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

  // Fetch withdrawals with PRO info
  const { data: withdrawals } = await supabase
    .from("withdrawals")
    .select(`
      *,
      pro:profiles!withdrawals_pro_id_fkey(*)
    `)
    .order("created_at", { ascending: false })

  return (
    <AppLayout 
      breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Withdrawals" }]} 
      userRole={userProfile.role}
      user={userProfile}
    >
      <AdminWithdrawalsContent withdrawals={withdrawals || []} />
    </AppLayout>
  )
}
