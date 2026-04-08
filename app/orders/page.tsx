import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppLayout } from "@/components/app-layout"
import { OrdersContent } from "@/components/orders/orders-content"
import type { Profile, UserRole } from "@/lib/types"

export default async function OrdersPage() {
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

  // Fetch client orders
  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      service:services(*),
      pro:profiles!orders_pro_id_profiles_fkey(*)
    `)
    .eq("client_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <AppLayout 
      breadcrumbs={[{ label: "My Orders" }]} 
      userRole={userProfile.role}
      user={userProfile}
    >
      <OrdersContent orders={orders || []} user={userProfile} />
    </AppLayout>
  )
}
