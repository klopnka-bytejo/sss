'use client'

import { useRouter } from 'next/navigation'
import { Menu, LogOut, User, Wallet, ChevronDown, Gamepad2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useSidebar } from '@/components/ui/sidebar'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'

interface AppHeaderProps {
  breadcrumbs?: { label: string; href?: string }[]
  user?: Profile | null
}

export function AppHeader({ breadcrumbs = [], user }: AppHeaderProps) {
  const { toggleSidebar, isMobile } = useSidebar()
  const router = useRouter()

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
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleSidebar}
          aria-label="Toggle menu"
        >
          <Menu className="size-5" />
        </Button>
      )}
      
      <Breadcrumb className="flex-1">
        <BreadcrumbList>
          <BreadcrumbLink href="/dashboard" className="font-semibold text-primary flex items-center gap-1.5">
            <Gamepad2 className="h-4 w-4" />
            Elevate
          </BreadcrumbLink>
          
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.label} className="contents">
              <BreadcrumbSeparator className="text-muted-foreground" />
              {index === breadcrumbs.length - 1 || !crumb.href ? (
                <BreadcrumbPage className="text-foreground">{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={crumb.href} className="text-muted-foreground">{crumb.label}</BreadcrumbLink>
              )}
            </span>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      {user && (
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Wallet Balance */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-sm">
            <Wallet className="h-4 w-4 text-primary" />
            <span className="font-medium">{formatBalance(user.balance_cents)}</span>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar_url || undefined} alt={user.username || 'User'} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {getInitials(user.username)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:block text-sm font-medium">{user.username || 'User'}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{user.username || 'User'}</span>
                  <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/settings')}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/wallet')}>
                <Wallet className="mr-2 h-4 w-4" />
                Wallet ({formatBalance(user.balance_cents)})
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </header>
  )
}
