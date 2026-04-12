'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
import {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { createClient } from '@/lib/supabase/client'
import { Gamepad2, LogOut, User, Wallet, ChevronDown, ShoppingCart } from 'lucide-react'
import type { Profile } from '@/lib/types'

interface ClientHeaderProps {
  title?: string
  breadcrumbs?: Array<{ label: string; href: string }>
}

export function ClientHeader({ title, breadcrumbs }: ClientHeaderProps) {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(data)
      setLoading(false)
    }
    fetchProfile()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U'
    return name.slice(0, 2).toUpperCase()
  }

  const formatBalance = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  }

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background border-border px-4 md:px-6">
      {/* Logo + Breadcrumbs */}
      <Breadcrumb className="flex-1">
        <BreadcrumbList>
          <BreadcrumbLink href="/" className="font-semibold text-primary flex items-center gap-1.5">
            <Gamepad2 className="h-4 w-4" />
            <span className="hidden sm:inline">Elevate</span>
          </BreadcrumbLink>

          {breadcrumbs && breadcrumbs.map((crumb, idx) => (
            <span key={crumb.href} className="contents">
              <BreadcrumbSeparator className="text-muted-foreground" />
              {idx === breadcrumbs.length - 1 ? (
                <BreadcrumbPage className="text-foreground">{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={crumb.href} className="text-muted-foreground">{crumb.label}</BreadcrumbLink>
              )}
            </span>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Right side */}
      <div className="flex items-center gap-2">
        <ThemeToggle />

        {!loading && profile ? (
          <>
            {/* Wallet Balance */}
            <Link href="/wallet">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-sm hover:bg-muted/80 transition-colors cursor-pointer">
                <Wallet className="h-4 w-4 text-primary" />
                <span className="font-medium">{formatBalance(profile.balance_cents)}</span>
              </div>
            </Link>

            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </Link>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2 h-9">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={profile.avatar_url || undefined} alt={profile.username || 'User'} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {getInitials(profile.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start leading-none">
                    <span className="text-sm font-medium">{profile.username || 'User'}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[120px]">{profile.email}</span>
                  </div>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">{profile.username || 'User'}</span>
                    <span className="text-xs font-normal text-muted-foreground">{profile.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/wallet')}>
                  <Wallet className="mr-2 h-4 w-4" />
                  Wallet ({formatBalance(profile.balance_cents)})
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : !loading && !profile ? (
          /* Guest buttons */
          <>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button size="sm" className="gradient-primary border-0" asChild>
              <Link href="/auth/register">Get Started</Link>
            </Button>
          </>
        ) : null}
      </div>
    </header>
  )
}
