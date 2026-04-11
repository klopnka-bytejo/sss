'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingBag,
  Wallet,
  MessageSquare,
  Settings,
  Gamepad2,
  Package,
  Users,
  BarChart3,
  AlertTriangle,
  Shield,
  Briefcase,
  Star,
  HelpCircle,
  Trophy,
  Calculator,
  Percent,
  FileText,
  Calendar,
  DollarSign,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { Badge } from '@/components/ui/badge'
import { useUnreadMessages } from '@/lib/hooks/use-unread-messages'
import type { UserRole } from '@/lib/types'

// Client navigation
const clientNavItems = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Browse Games', href: '/games', icon: Gamepad2 },
  { title: 'Browse Services', href: '/services', icon: ShoppingBag },
  { title: 'My Orders', href: '/orders', icon: Package },
  { title: 'Messages', href: '/dashboard/client/messages', icon: MessageSquare },
  { title: 'Wallet', href: '/wallet', icon: Wallet },
]

// PRO navigation (Services removed - only admin can add services)
const proNavItems = [
  { title: 'Dashboard', href: '/pro/dashboard', icon: LayoutDashboard },
  { title: 'Available Orders', href: '/pro/available', icon: ShoppingBag },
  { title: 'My Orders', href: '/pro/orders', icon: Package },
  { title: 'Availability', href: '/pro/availability', icon: Calendar },
  { title: 'Messages', href: '/pro/messages', icon: MessageSquare },
  { title: 'Earnings', href: '/pro/earnings', icon: DollarSign },
]

// Admin navigation
const adminNavItems = [
  { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { title: 'Games', href: '/admin/games', icon: Gamepad2 },
  { title: 'Services', href: '/admin/services', icon: Briefcase },
  { title: 'Pricing Rules', href: '/admin/pricing', icon: Calculator },
  { title: 'Discounts', href: '/admin/discounts', icon: Percent },
  { title: 'Orders', href: '/admin/orders', icon: Package },
  { title: 'Users', href: '/admin/users', icon: Users },
  { title: 'PRO Management', href: '/admin/pros', icon: Star },
  { title: 'PRO Applications', href: '/admin/applications', icon: Trophy },
  { title: 'Disputes', href: '/admin/disputes', icon: AlertTriangle },
  { title: 'Withdrawals', href: '/admin/withdrawals', icon: Wallet },
  { title: 'Chat Monitoring', href: '/admin/chat-monitoring', icon: Shield },
  { title: 'Audit Logs', href: '/admin/audit', icon: FileText },
]

const bottomNavItems = [
  { title: 'Become a PRO', href: '/become-pro', icon: Trophy },
  { title: 'FAQ', href: '/faq', icon: HelpCircle },
  { title: 'Settings', href: '/settings', icon: Settings },
]

interface AppSidebarProps {
  userRole?: UserRole
}

export function AppSidebar({ userRole = 'client' }: AppSidebarProps) {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()
  const unreadCount = useUnreadMessages()

  const handleNavClick = () => {
    setOpenMobile(false)
  }

  const getNavItems = () => {
    switch (userRole) {
      case 'pro':
        return proNavItems
      case 'admin':
        return adminNavItems
      default:
        return clientNavItems
    }
  }

  const navItems = getNavItems()
  const roleLabel = userRole === 'admin' ? 'Admin' : userRole === 'pro' ? 'PRO' : 'Player'

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-3"
          onClick={handleNavClick}
        >
          <div className="flex size-9 items-center justify-center rounded-lg gradient-primary glow-primary">
            <Gamepad2 className="size-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gradient">Elevate</span>
            <span className="text-xs text-sidebar-foreground/70">Gaming Services</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground">
            {roleLabel} Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/dashboard' && pathname.startsWith(item.href))
                const isMessages = item.title === 'Messages'
                const isOnMessagesPage = pathname.includes('/messages')
                const showBadge = isMessages && unreadCount > 0 && !isOnMessagesPage
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href} onClick={handleNavClick} className="flex items-center gap-2">
                        <item.icon className="size-4" />
                        <span className="flex-1">{item.title}</span>
                        {showBadge && (
                          <Badge 
                            variant="destructive" 
                            className="h-5 min-w-5 px-1.5 flex items-center justify-center text-xs ml-auto"
                          >
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomNavItems.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/' && pathname.startsWith(item.href))
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href} onClick={handleNavClick}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  )
}
