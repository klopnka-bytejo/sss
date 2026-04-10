import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { sql } from "@/lib/neon/server"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default async function AdminPage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('user_id')?.value
  
  console.log('[v0] Admin page - userId from cookie:', userId)
  
  if (!userId) {
    console.log('[v0] Admin page - No userId, redirecting')
    redirect("/auth/admin")
  }

  // Fetch user profile
  console.log('[v0] Admin page - Querying user with id:', userId)
  const users = await sql`
    SELECT * FROM profiles WHERE id = ${userId}
  `
  
  console.log('[v0] Admin page - Query result:', users?.length || 0, 'users found')

  if (!users || users.length === 0) {
    console.log('[v0] Admin page - No user found, redirecting')
    redirect("/auth/admin")
  }

  const userProfile = users[0]

  // Only allow admin users
  if (userProfile.role !== "admin") {
    redirect("/dashboard")
  }

  // Fetch stats
  const [
    totalUsersResult,
    totalOrdersResult,
    totalProsResult,
    recentOrdersResult,
    recentUsersResult,
  ] = await Promise.all([
    sql`SELECT COUNT(*) as count FROM profiles`,
    sql`SELECT COUNT(*) as count FROM orders`,
    sql`SELECT COUNT(*) as count FROM profiles WHERE role = 'pro'`,
    sql`SELECT * FROM orders ORDER BY created_at DESC LIMIT 5`,
    sql`SELECT * FROM profiles ORDER BY created_at DESC LIMIT 5`,
  ])

  const stats = {
    totalUsers: totalUsersResult[0]?.count || 0,
    totalOrders: totalOrdersResult[0]?.count || 0,
    totalPros: totalProsResult[0]?.count || 0,
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
