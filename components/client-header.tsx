'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserAvatarMenu, type AvatarUser } from '@/components/user-avatar-menu'
import { Gamepad2, ShoppingCart } from 'lucide-react'

interface ClientHeaderProps {
  title?: string
  breadcrumbs?: Array<{ label: string; href: string }>
}

const NAV_LINKS = [
  { href: '/games', label: 'Games' },
  { href: '/browse-services', label: 'Services' },
  { href: '/faq', label: 'FAQ' },
  { href: '/support', label: 'Contact Us' },
]

export function ClientHeader({ title, breadcrumbs }: ClientHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [profile, setProfile] = useState<AvatarUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        if (data.user) {
          setProfile(data.user)
        }
      } catch (error) {
        console.error('[v0] ClientHeader: Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="p-1.5 rounded-lg gradient-primary">
            <Gamepad2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold">Elevate</span>
        </Link>

        {/* Nav links — always visible */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 text-sm transition-colors rounded-lg ${
                isActive(link.href)
                  ? 'text-foreground font-medium bg-secondary/50'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle />

          {!loading && profile ? (
            /* ── Logged in ── */
            <>
              {/* Cart icon */}
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              </Link>

              <div className="w-px h-5 bg-border/50" />

              <UserAvatarMenu
                user={profile}
                onSignOut={() => setProfile(null)}
              />
            </>
          ) : !loading ? (
            /* ── Guest ── */
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button size="sm" className="gradient-primary border-0" asChild>
                <Link href="/auth/register">Get Started</Link>
              </Button>
            </>
          ) : (
            /* skeleton placeholder while loading */
            <div className="h-9 w-9 rounded-lg bg-secondary/40 animate-pulse" />
          )}
        </div>
      </div>
    </header>
  )
}
