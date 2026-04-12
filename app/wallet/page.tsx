import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { sql } from "@/lib/neon/server"
import { ClientHeader } from "@/components/client-header"
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

    // Fetch transactions - don't fail if table doesn't exist or query fails
    let transactions = []
    try {
      const result = await sql`
        SELECT id, user_id, type, amount_cents, description, status, balance_after_cents, created_at
        FROM transactions
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT 50
      `
      transactions = result || []
      console.log('[v0] Wallet page: Found', transactions.length, 'transactions')
    } catch (txError) {
      console.warn('[v0] Wallet page: Could not fetch transactions:', txError instanceof Error ? txError.message : txError)
      // Continue with empty transactions array - don't crash the page
      transactions = []
    }

    return (
      <div className="min-h-screen bg-background">
        <ClientHeader
          title="Wallet"
          breadcrumbs={[{ label: 'Wallet', href: '/wallet' }]}
        />
        <div className="container mx-auto px-4 py-8 pt-20">
          <WalletContent user={userProfile} transactions={transactions} />
        </div>
      </div>
    )
  } catch (error) {
    console.error('[v0] Wallet page error loading profile:', error instanceof Error ? error.message : error)
    if (error instanceof Error) {
      console.error('[v0] Wallet page stack:', error.stack)
    }
    // Only redirect if profile load fails - not transaction issues
    return redirect("/auth/login")
  }
}
