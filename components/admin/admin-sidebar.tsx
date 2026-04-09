'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAdminUnreadMessages } from '@/lib/hooks/use-admin-unread-messages'
import {
  LayoutDashboard,
  Users,
  Package,
  AlertTriangle,
  Wallet,
  Gamepad2,
  Settings,
  Trophy,
  MessageSquare,
  FileText,
  BarChart3,
  LogOut,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'PROs', href: '/admin/pros', icon: Trophy },
  { label: 'Orders', href: '/admin/orders', icon: Package },
  { label: 'Applications', href: '/admin/applications', icon: FileText },
  { label: 'Disputes', href: '/admin/disputes', icon: AlertTriangle },
  { label: 'Withdrawals', href: '/admin/withdrawals', icon: Wallet },
  { label: 'Services', href: '/admin/services', icon: Gamepad2 },
  { label: 'Messages', href: '/admin/chat-monitoring', icon: MessageSquare },
  { label: 'Analytics', href: '/admin/audit', icon: BarChart3 },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const unreadCount = useAdminUnreadMessages()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/auth/admin'
  }

  return (
    <div className="w-64 border-r border-border/50 bg-card/50 flex flex-col h-screen">
      <div className="p-6 border-b border-border/50">
        <h2 className="text-lg font-bold">Admin Panel</h2>
        <p className="text-xs text-muted-foreground">Manage your platform</p>
      </div>

      <ScrollArea className="flex-1">
        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            const isMessages = item.label === 'Messages'
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className={cn(
                    'w-full justify-start text-left relative',
                    isActive && 'bg-primary text-primary-foreground'
                  )}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                  {isMessages && unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      <div className="border-t border-border/50 p-4">
        <Button
          variant="outline"
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}
