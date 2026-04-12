'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Gamepad2, LogOut, User, Wallet, ShoppingCart, MessageSquare, ChevronDown } from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  display_name: string | null
  username?: string | null
  avatar_url?: string | null
  balance_cents?: number
  role: string
}

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
  const [profile, setProfile] = useState<UserProfile | null>(null)
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

  const handleSignOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U'
    return name.slice(0, 2).toUpperCase()
  }

  const displayName = profile?.display_name || profile?.username || 'User'

  const formatBalance = (cents: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
  }

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

              {/* Avatar dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-2 h-9 rounded-lg hover:bg-secondary/60 transition-colors"
                  >
                    <Avatar className="h-7 w-7 ring-2 ring-primary/20">
                      <AvatarImage src={profile.avatar_url || undefined} alt={displayName} />
                      <AvatarFallback className="gradient-primary text-primary-foreground text-xs font-semibold">
                        {getInitials(displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block text-sm font-medium max-w-[100px] truncate">
                      {displayName}
                    </span>
                    <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-60" sideOffset={8}>
                  {/* User info header */}
                  <DropdownMenuLabel className="pb-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                        <AvatarImage src={profile.avatar_url || undefined} />
                        <AvatarFallback className="gradient-primary text-primary-foreground text-sm font-semibold">
                          {getInitials(displayName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-sm truncate">{displayName}</span>
                        <span className="text-xs text-muted-foreground truncate">{profile.email}</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={() => router.push('/profile')} className="gap-2 cursor-pointer">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Profile</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => router.push('/wallet')} className="gap-2 cursor-pointer">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    <span>Wallet</span>
                    <span className="ml-auto text-xs font-medium text-primary">
                      {formatBalance(profile.balance_cents)}
                    </span>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => router.push('/dashboard/client/messages')} className="gap-2 cursor-pointer">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span>Messages</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
