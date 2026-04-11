import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { sql } from "@/lib/neon/server"
import { AppLayout } from "@/components/app-layout"
import { WalletContent } from "@/components/wallet/wallet-content"
import type { Profile, UserRole } from "@/lib/types"

export default async function WalletPage() {
  // Check session using cookies (not Supabase)
  const cookieStore = await cookies()
  const userId = cookieStore.get('user_id')?.value

  console.log('[v0] Wallet page: userId from cookie:', userId ? 'present' : 'MISSING')

  if (!userId) {
    console.log('[v0] Wallet page: No user session, redirecting to login')
    return redirect("/auth/login")
  }

  try {
    // Fetch user profile from Neon database
    const users = await sql`
      SELECT id, email, display_name as username, avatar_url, role, balance_cents, created_at, updated_at
      FROM profiles
      WHERE id = ${userId}
    `

    if (!users || users.length === 0) {
      console.log('[v0] Wallet page: User profile not found, redirecting to login')
      return redirect("/auth/login")
    }

    const profile = users[0]
    console.log('[v0] Wallet page: User profile loaded:', profile.email)

    const userProfile: Profile = {
      id: profile.id,
      email: profile.email,
      username: profile.username,
      avatar_url: profile.avatar_url,
      role: (profile.role as UserRole) || "client",
      balance_cents: profile.balance_cents || 0,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    }

    // Fetch transactions
    const transactions = await sql`
      SELECT id, user_id, type, amount_cents, description, status, created_at
      FROM transactions
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 50
    `

    console.log('[v0] Wallet page: Found', transactions?.length || 0, 'transactions')

    return (
      <AppLayout 
        breadcrumbs={[{ label: "Wallet" }]} 
        userRole={userProfile.role}
        user={userProfile}
      >
        <WalletContent user={userProfile} transactions={transactions || []} />
      </AppLayout>
    )
  } catch (error) {
    console.error('[v0] Wallet page error:', error instanceof Error ? error.message : error)
    if (error instanceof Error) {
      console.error('[v0] Wallet page stack:', error.stack)
    }
    return redirect("/auth/login")
  }
}
