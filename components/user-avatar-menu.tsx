'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, User, Wallet, MessageSquare, ChevronDown } from 'lucide-react'

export interface AvatarUser {
  id: string
  email: string
  display_name: string | null
  avatar_url?: string | null
  balance_cents?: number
  role?: string
}

interface UserAvatarMenuProps {
  user: AvatarUser
  onSignOut?: () => void
}

export function UserAvatarMenu({ user, onSignOut }: UserAvatarMenuProps) {
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  const displayName = user.display_name || 'User'

  const getInitials = (name: string) => name.slice(0, 2).toUpperCase()

  const formatBalance = (cents: number | undefined) => {
    if (cents === undefined || cents === null) return '$0.00'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
  }

  const handleSignOut = async () => {
    if (signingOut) return
    setSigningOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      if (onSignOut) {
        onSignOut()
      } else {
        // Clear state by navigating client-side — no full reload
        router.push('/')
      }
    } catch {
      setSigningOut(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-2 h-9 rounded-lg hover:bg-secondary/60 transition-colors"
        >
          <Avatar className="h-7 w-7 ring-2 ring-primary/20">
            <AvatarImage src={user.avatar_url || undefined} alt={displayName} />
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
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback className="gradient-primary text-primary-foreground text-sm font-semibold">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-sm truncate">{displayName}</span>
              <span className="text-xs text-muted-foreground truncate">{user.email}</span>
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
            {formatBalance(user.balance_cents)}
          </span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => router.push('/dashboard/client/messages')} className="gap-2 cursor-pointer">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <span>Messages</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={signingOut}
          className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          <span>{signingOut ? 'Signing out...' : 'Sign Out'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
