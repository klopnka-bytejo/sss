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

  // Handle temporary admin user (hardcoded credentials)
  if (userId === 'admin-temp') {
    // Fetch stats for temporary admin
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

  // Fetch user profile
  const users = await sql`
    SELECT * FROM profiles WHERE id = ${userId}
  `

  if (!users || users.length === 0) {
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
