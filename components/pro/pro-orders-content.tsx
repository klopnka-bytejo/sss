"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Search, 
  Package, 
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Check,
  Calendar,
  CreditCard,
  Wallet,
  Bitcoin,
  ThumbsUp,
  Eye,
  Loader2,
  User,
  Link2,
  FileText
} from "lucide-react"
import type { Order, Profile, Service } from "@/lib/types"

interface ProOrdersContentProps {
  orders: (Order & { service?: Service; client?: Profile })[]
  user: Profile
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof Clock }> = {
  pending: { label: "Pending", variant: "outline", icon: Clock },
  paid: { label: "Awaiting Acceptance", variant: "secondary", icon: Clock },
  in_progress: { label: "In Progress", variant: "default", icon: Package },
  pending_review: { label: "Pending Review (24h Hold)", variant: "secondary", icon: Clock },
  completed: { label: "Completed", variant: "secondary", icon: CheckCircle2 },
  disputed: { label: "Disputed", variant: "destructive", icon: AlertTriangle },
  refunded: { label: "Refunded", variant: "outline", icon: XCircle },
  cancelled: { label: "Cancelled", variant: "outline", icon: XCircle },
}

const paymentMethodIcons: Record<string, typeof CreditCard> = {
  stripe: CreditCard,
  paypal: Wallet,
  crypto: Bitcoin,
}

export function ProOrdersContent({ orders, user }: ProOrdersContentProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedOrder, setSelectedOrder] = useState<(Order & { service?: Service; client?: Profile }) | null>(null)
  const [isAccepting, setIsAccepting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [proofLink, setProofLink] = useState("")
  const [proofNotes, setProofNotes] = useState("")
  const [showCompleteForm, setShowCompleteForm] = useState(false)

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.service?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.client?.username?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const pendingOrders = orders.filter(o => o.status === "paid")
  const activeOrders = orders.filter(o => o.status === "in_progress")
  const completedOrders = orders.filter(o => o.status === "completed")

  const handleAcceptOrder = async () => {
    if (!selectedOrder) return

    setIsAccepting(true)
    try {
      const response = await fetch("/api/orders/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: selectedOrder.id }),
      })

      if (response.ok) {
        setSelectedOrder(null)
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to accept order")
      }
    } catch (error) {
      console.error("Error accepting order:", error)
      alert("Failed to accept order")
    } finally {
      setIsAccepting(false)
    }
  }

  const handleCompleteOrder = async () => {
    if (!selectedOrder || !proofLink) return

    setIsUpdating(true)
    try {
      const response = await fetch("/api/orders/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          orderId: selectedOrder.id, 
          proofLink,
          proofNotes 
        }),
      })

      if (response.ok) {
        setSelectedOrder(null)
        setShowCompleteForm(false)
        setProofLink("")
        setProofNotes("")
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to complete order")
      }
    } catch (error) {
      console.error("Error completing order:", error)
      alert("Failed to complete order")
    } finally {
      setIsUpdating(false)
    }
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-yellow-500/20">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Awaiting Acceptance</p>
                <p className="text-2xl font-bold">{pendingOrders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-500/20">
                <Package className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{activeOrders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/20">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedOrders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {["all", "paid", "in_progress", "pending_review", "completed"].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                >
                  {status === "all" ? "All" : status === "paid" ? "Pending" : statusConfig[status]?.label || status}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No orders found</h3>
              <p className="text-muted-foreground">
                {orders.length === 0 
                  ? "You haven't received any orders yet." 
                  : "No orders match your search criteria."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => {
            const StatusIcon = statusConfig[order.status]?.icon || Clock
            const PaymentIcon = paymentMethodIcons[order.payment_method || "stripe"] || CreditCard

            return (
              <Card key={order.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm text-primary">{order.order_number}</span>
                        <Badge variant={statusConfig[order.status]?.variant || "outline"}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig[order.status]?.label || order.status}
                        </Badge>
                      </div>

                      <h3 className="font-semibold">{order.service?.title || "Unknown Service"}</h3>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{order.client?.username || order.client?.email || "Client"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(order.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <PaymentIcon className="h-4 w-4" />
                          <span className="capitalize">{order.payment_method || "Card"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(order.total_cents)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          You earn: {formatCurrency(order.total_cents * 0.85)}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {order.status === "paid" && (
                          <Button
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              {selectedOrder?.order_number}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Service</p>
                  <p className="font-medium">{selectedOrder.service?.title}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Client</p>
                  <p className="font-medium">{selectedOrder.client?.username || selectedOrder.client?.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Amount</p>
                  <p className="font-medium text-primary">{formatCurrency(selectedOrder.total_cents)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Your Earnings</p>
                  <p className="font-medium text-green-500">{formatCurrency(selectedOrder.total_cents * 0.85)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment Method</p>
                  <p className="font-medium capitalize">{selectedOrder.payment_method}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant={statusConfig[selectedOrder.status]?.variant || "outline"}>
                    {statusConfig[selectedOrder.status]?.label || selectedOrder.status}
                  </Badge>
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm bg-muted/50 p-3 rounded-lg">{selectedOrder.notes}</p>
                </div>
              )}

              {selectedOrder.requirements && Object.keys(selectedOrder.requirements).length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Requirements</p>
                  <div className="bg-muted/50 p-3 rounded-lg text-sm">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(selectedOrder.requirements, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Complete Order Form */}
          {selectedOrder?.status === "in_progress" && showCompleteForm && (
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Submit Proof of Completion
              </h4>
              <div className="space-y-2">
                <Label htmlFor="proofLink">Proof Link (required)</Label>
                <Input
                  id="proofLink"
                  placeholder="https://imgur.com/... or screenshot link"
                  value={proofLink}
                  onChange={(e) => setProofLink(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Link to screenshot or video proof of completion
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="proofNotes">Notes (optional)</Label>
                <Textarea
                  id="proofNotes"
                  placeholder="Any additional notes for the client..."
                  value={proofNotes}
                  onChange={(e) => setProofNotes(e.target.value)}
                  rows={2}
                />
              </div>
              <p className="text-xs text-muted-foreground bg-yellow-500/10 border border-yellow-500/20 p-2 rounded">
                After completion, funds will be held for 24 hours before being released to your wallet.
              </p>
            </div>
          )}

          <DialogFooter>
            {selectedOrder?.status === "paid" && (
              <Button onClick={handleAcceptOrder} disabled={isAccepting}>
                {isAccepting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  <>
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Accept Order
                  </>
                )}
              </Button>
            )}
            {selectedOrder?.status === "in_progress" && !showCompleteForm && (
              <Button onClick={() => setShowCompleteForm(true)}>
                <Check className="h-4 w-4 mr-2" />
                Complete Order
              </Button>
            )}
            {selectedOrder?.status === "in_progress" && showCompleteForm && (
              <Button onClick={handleCompleteOrder} disabled={isUpdating || !proofLink}>
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Submit & Complete
                  </>
                )}
              </Button>
            )}
            <Button variant="outline" onClick={() => {
              setSelectedOrder(null)
              setShowCompleteForm(false)
              setProofLink("")
              setProofNotes("")
            }}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
