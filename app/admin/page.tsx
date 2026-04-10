import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { sql } from "@/lib/neon/server"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default async function AdminPage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('user_id')?.value
  
  if (!userId) {
    redirect("/auth/admin")
  }

  // If user has a session cookie, they're authenticated
  // The middleware already verified this, so we can proceed
  // Fetch stats for the dashboard
  const [
    totalUsersResult,
    totalOrdersResult,
    totalProsResult,
    recentOrdersResult,
    recentUsersResult,
    pendingDisputesResult,
    pendingWithdrawalsResult,
  ] = await Promise.all([
    sql`SELECT COUNT(*) as count FROM profiles`,
    sql`SELECT COUNT(*) as count FROM orders`,
    sql`SELECT COUNT(*) as count FROM profiles WHERE role = 'pro'`,
    sql`SELECT * FROM orders ORDER BY created_at DESC LIMIT 5`,
    sql`SELECT * FROM profiles ORDER BY created_at DESC LIMIT 5`,
    sql`SELECT COUNT(*) as count FROM disputes WHERE status != 'resolved'`,
    sql`SELECT COUNT(*) as count FROM withdrawals WHERE status = 'pending'`,
  ])

  const stats = {
    totalUsers: totalUsersResult[0]?.count || 0,
    totalOrders: totalOrdersResult[0]?.count || 0,
    totalPros: totalProsResult[0]?.count || 0,
    pendingDisputes: pendingDisputesResult[0]?.count || 0,
    pendingWithdrawals: pendingWithdrawalsResult[0]?.count || 0,
    recentOrders: recentOrdersResult || [],
    recentUsers: recentUsersResult || [],
  }

  return (
    <AdminLayout>
      <AdminDashboard 
        stats={stats} 
        recentOrders={stats.recentOrders} 
        recentUsers={stats.recentUsers} 
      />
    </AdminLayout>
  )
}
