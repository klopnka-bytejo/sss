import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppLayout } from "@/components/app-layout"
import { AdminDisputesContent } from "@/components/admin/admin-disputes-content"
import type { Profile, UserRole } from "@/lib/types"

export default async function AdminDisputesPage() {
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

  // Fetch all disputes with related data
  const { data: disputes } = await supabase
    .from("disputes")
    .select(`
      *,
      order:orders(*, service:services(*)),
      opener:profiles!disputes_opened_by_fkey(*)
    `)
    .order("created_at", { ascending: false })

  return (
    <AppLayout 
      breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Disputes" }]} 
      userRole={userProfile.role}
      user={userProfile}
    >
      <AdminDisputesContent disputes={disputes || []} admin={userProfile} />
    </AppLayout>
  )
}
