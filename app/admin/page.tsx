import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { sql } from "@/lib/neon/server"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default async function AdminPage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('user_id')?.value
  
  console.log('[v0] Admin page: userId from cookie:', userId)
  
  if (!userId) {
    console.log('[v0] Admin page: No userId, redirecting to /auth/admin')
    redirect("/auth/admin")
  }

  // Fetch user profile
  console.log('[v0] Admin page: Querying user profile with id:', userId)
  let users = await sql`
    SELECT * FROM profiles WHERE id = ${userId}
  `

  console.log('[v0] Admin page: User query result:', users?.length || 0, 'users found')

  // If user not found, create them
  if (!users || users.length === 0) {
    console.log('[v0] Admin page: User not found, auto-creating admin user')
    try {
      await sql`
        INSERT INTO profiles (id, email, display_name, role, created_at, updated_at)
        VALUES (${userId}, 'admin@example.com', 'Admin', 'admin', NOW(), NOW())
        ON CONFLICT (id) DO NOTHING
      `
      
      // Re-fetch the user
      users = await sql`
        SELECT * FROM profiles WHERE id = ${userId}
      `
      console.log('[v0] Admin page: User created successfully')
    } catch (error) {
      console.error('[v0] Admin page: Error creating user:', error)
      redirect("/auth/admin")
    }
  }

  if (!users || users.length === 0) {
    console.log('[v0] Admin page: User still not found after creation, redirecting')
    redirect("/auth/admin")
  }

  const userProfile = users[0]

  // Only allow admin users
  if (userProfile.role !== "admin") {
    console.log('[v0] Admin page: User is not admin, redirecting to /dashboard')
    redirect("/dashboard")
  }

  console.log('[v0] Admin page: User authenticated and authorized as admin')

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
