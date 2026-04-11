"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ShoppingBag, 
  Package, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Wallet,
  Trophy,
  Zap,
  Users
} from "lucide-react"
import type { Profile } from "@/lib/types"

interface ClientDashboardProps {
  user: Profile
}

const quickActions = [
  {
    title: "Rank Boosting",
    description: "Climb the ranks fast",
    icon: Trophy,
    href: "/services?category=boosting",
    color: "text-chart-1",
  },
  {
    title: "Pro Coaching",
    description: "Learn from the best",
    icon: Users,
    href: "/services?category=coaching",
    color: "text-chart-2",
  },
  {
    title: "Account Services",
    description: "Leveling & unlocks",
    icon: Zap,
    href: "/services?category=account",
    color: "text-chart-3",
  },
]

export function ClientDashboard({ user }: ClientDashboardProps) {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100)
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Welcome back, <span className="text-gradient">{user.username || "Player"}</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Ready to level up your gaming experience?
          </p>
        </div>
        <Button asChild>
          <Link href="/browse-services">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Browse Services
          </Link>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className="text-xl font-bold">{formatCurrency(user.balance_cents)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/20">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Orders</p>
                <p className="text-xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/20">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/20">
                <Package className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Card key={action.title} className="glass hover:glow-primary transition-all group">
              <CardHeader className="pb-2">
                <div className={`p-2 rounded-lg bg-muted w-fit ${action.color}`}>
                  <action.icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-lg mb-1">{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
                <Button variant="ghost" className="mt-3 p-0 h-auto text-primary group-hover:gap-2 transition-all" asChild>
                  <Link href={action.href}>
                    Browse <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Orders (placeholder) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/orders">View All</Link>
          </Button>
        </div>
        <Card className="glass">
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No orders yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Browse our services and place your first order
            </p>
            <Button asChild>
              <Link href="/browse-services">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Browse Services
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
