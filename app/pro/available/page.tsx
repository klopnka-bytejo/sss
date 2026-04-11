"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  Gamepad2, 
  Clock, 
  DollarSign, 
  Zap, 
  RefreshCw,
  CheckCircle,
  Filter,
  AlertTriangle,
  Loader2
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface Order {
  id: string
  order_number: string
  total_cents: number
  amount_cents: number
  status: string
  notes: string | null
  created_at: string
  service_id: string
  service_title: string
  service_description: string
  service_game: string
  service_category: string
  estimated_hours: string
}

interface Game {
  id: string
  name: string
}

export default function ProAvailableOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState<string | null>(null)
  const [selectedGame, setSelectedGame] = useState<string>("all")
  const [confirmOrder, setConfirmOrder] = useState<Order | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchData()
    // Refresh every 30 seconds for FCFS
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  async function fetchData() {
    try {
      const response = await fetch('/api/pro/available-orders', {
        credentials: 'include',
      })
      
      if (!response.ok) {
        console.error('[v0] Failed to fetch available orders')
        setLoading(false)
        return
      }

      const data = await response.json()
      setOrders(data.orders || [])
      setGames(data.games || [])
    } catch (error) {
      console.error('[v0] Error fetching available orders:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAcceptOrder(order: Order) {
    setAccepting(order.id)
    
    try {
      const res = await fetch("/api/orders/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ orderId: order.id }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.error === "Order already taken") {
          alert("This order has already been claimed by another PRO. Refreshing list...")
          fetchData()
        } else {
          alert(data.error || "Failed to accept order")
        }
        return
      }

      // Success - redirect to order details
      router.push(`/orders/${order.id}`)
    } catch (error) {
      console.error("[v0] Error accepting order:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setAccepting(null)
      setConfirmOrder(null)
    }
  }

  const filteredOrders = selectedGame === "all" 
    ? orders 
    : orders.filter(o => o.service_game === selectedGame)

  const calculatePayout = (order: Order) => {
    // 85% payout (15% platform fee)
    const total = order.total_cents || order.amount_cents || 0
    return Math.round(total * 0.85)
  }

  return (
    <AppLayout userRole="pro">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Available Orders</h1>
            <p className="text-muted-foreground">
              First-come, first-served. Accept orders matching your skills.
            </p>
          </div>
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Info Banner */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-primary mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Quick Tips for PROs</p>
                <ul className="mt-1 space-y-1 text-muted-foreground">
                  <li>Orders are first-come, first-served - be quick!</li>
                  <li>Only accept orders you can complete on time</li>
                  <li>Your payout is 85% of the order total</li>
                  <li>Payouts are released 24 hours after client approval</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filter */}
        <div className="flex items-center gap-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedGame} onValueChange={setSelectedGame}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by game" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Games</SelectItem>
              {games.map((game) => (
                <SelectItem key={game.id} value={game.name}>
                  {game.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""} available
          </span>
        </div>

        {/* Orders Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Available Orders</h3>
              <p className="text-muted-foreground">
                Check back soon! New orders appear here as soon as they are paid.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <Badge variant="outline" className="mb-2">
                      <Gamepad2 className="h-3 w-3 mr-1" />
                      {order.service_game || "Game"}
                    </Badge>
                    <Badge variant="secondary">
                      #{order.order_number}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{order.service_title || "Service"}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {order.service_description || "No description"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        Your Payout
                      </span>
                      <span className="font-bold text-green-500">
                        {formatCurrency(calculatePayout(order))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Est. Time
                      </span>
                      <span>{order.estimated_hours || "24h"}</span>
                    </div>
                    {order.service_category && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Category</span>
                        <Badge variant="outline" className="capitalize">
                          {order.service_category}
                        </Badge>
                      </div>
                    )}
                    {order.notes && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-1">Client Notes:</p>
                        <p className="text-sm line-clamp-2">{order.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button 
                    className="w-full" 
                    onClick={() => setConfirmOrder(order)}
                    disabled={accepting === order.id}
                  >
                    {accepting === order.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Accepting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accept Order
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Confirm Dialog */}
        <AlertDialog open={!!confirmOrder} onOpenChange={(open) => !open && setConfirmOrder(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Accept This Order?
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p>
                  You are about to accept order <strong>#{confirmOrder?.order_number}</strong>.
                </p>
                <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Service:</span>
                    <span className="font-medium">{confirmOrder?.service_title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Your Payout:</span>
                    <span className="font-medium text-green-500">
                      {confirmOrder && formatCurrency(calculatePayout(confirmOrder))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Est. Completion:</span>
                    <span>{confirmOrder?.estimated_hours || "24 hours"}</span>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  By accepting, you commit to completing this order on time. 
                  Abandoning orders may result in penalties.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => confirmOrder && handleAcceptOrder(confirmOrder)}
                disabled={accepting !== null}
              >
                {accepting ? "Accepting..." : "Yes, Accept Order"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  )
}
