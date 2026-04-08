import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppLayout } from "@/components/app-layout"
import { ProOrderDetailContent } from "@/components/pro/pro-order-detail-content"

export default async function ProOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Get order with service details
  const { data: order } = await supabase
    .from("orders")
    .select("*, service:services(*), client:profiles!orders_client_id_fkey(*)")
    .eq("id", id)
    .eq("pro_id", user.id)
    .single()

  if (!order) {
    redirect("/pro/orders")
  }

  // Get messages for this order
  const { data: messages } = await supabase
    .from("order_messages")
    .select("*")
    .eq("order_id", id)
    .order("created_at", { ascending: true })

  return (
    <AppLayout>
      <ProOrderDetailContent 
        order={order} 
        messages={messages || []} 
        currentUserId={user.id}
      />
    </AppLayout>
  )
}
