"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Package, 
  Clock, 
  DollarSign, 
  Star,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  Calendar
} from "lucide-react"
import type { Profile } from "@/lib/types"

interface ProDashboardProps {
  user: Profile
}

export function ProDashboard({ user }: ProDashboardProps) {
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
            PRO Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your services and track your earnings
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/pro/available">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Available Orders
            </Link>
          </Button>
          <Button asChild>
            <Link href="/pro/availability">
              <Calendar className="mr-2 h-4 w-4" />
              Set Availability
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/20">
                <DollarSign className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Earnings</p>
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
              <div className="p-2 rounded-lg bg-primary/20">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rating</p>
                <p className="text-xl font-bold">--</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/20">
                <TrendingUp className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-xl font-bold">{formatCurrency(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Completion */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-lg">Complete Your Profile</CardTitle>
          <CardDescription>Finish setting up your PRO profile to start receiving orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Profile completion</span>
              <span className="font-medium">25%</span>
            </div>
            <Progress value={25} className="h-2" />
            <div className="grid md:grid-cols-2 gap-3 mt-4">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>Account created</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span>Set your availability</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span>Accept your first order</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span>Complete an order</span>
              </div>
            </div>
            <Button className="w-full md:w-auto mt-2" asChild>
              <Link href="/pro/availability">
                Set Availability
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Active Orders</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/pro/orders">View All</Link>
          </Button>
        </div>
        <Card className="glass">
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No active orders</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Check available orders to start accepting work from clients
            </p>
            <Button asChild>
              <Link href="/pro/available">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Browse Available Orders
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg">Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Orders completed</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Average rating</span>
                <span className="font-medium">--</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Response time</span>
                <span className="font-medium">--</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completion rate</span>
                <span className="font-medium">--</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">New orders</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Revenue</span>
                <span className="font-medium">{formatCurrency(0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Messages</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Profile views</span>
                <span className="font-medium">0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
