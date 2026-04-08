import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppLayout } from "@/components/app-layout"
import { ProOrdersContent } from "@/components/pro/pro-orders-content"
import type { Profile, UserRole } from "@/lib/types"

export default async function ProOrdersPage() {
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

  // Fetch PRO's orders (including paid orders that can be accepted)
  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      service:services(*),
      client:profiles!orders_client_id_fkey(*)
    `)
    .or(`pro_id.eq.${user.id},pro_id.is.null,status.eq.paid`)
    .order("created_at", { ascending: false })

  return (
    <AppLayout 
      breadcrumbs={[{ label: "PRO Dashboard", href: "/pro/dashboard" }, { label: "Orders" }]} 
      userRole={userProfile.role}
      user={userProfile}
    >
      <ProOrdersContent orders={orders || []} user={userProfile} />
    </AppLayout>
  )
}
