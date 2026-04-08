"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft,
  Package, 
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Send,
  Loader2,
  ExternalLink,
  CreditCard,
  Wallet,
  Bitcoin,
  Star,
  ThumbsUp
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import type { Order, Profile, Service, OrderStatus } from "@/lib/types"

const statusConfig: Record<OrderStatus, { label: string; icon: typeof Clock; variant: "default" | "secondary" | "destructive" | "outline"; color: string }> = {
  pending: { label: "Pending Payment", icon: Clock, variant: "secondary", color: "text-muted-foreground" },
  paid: { label: "Awaiting PRO", icon: Clock, variant: "secondary", color: "text-yellow-500" },
  in_progress: { label: "In Progress", icon: Package, variant: "default", color: "text-primary" },
  pending_review: { label: "Pending Review (24h)", icon: Clock, variant: "secondary", color: "text-cyan-500" },
  completed: { label: "Completed", icon: CheckCircle2, variant: "secondary", color: "text-green-500" },
  disputed: { label: "Disputed", icon: AlertTriangle, variant: "destructive", color: "text-destructive" },
  refunded: { label: "Refunded", icon: XCircle, variant: "outline", color: "text-muted-foreground" },
  cancelled: { label: "Cancelled", icon: XCircle, variant: "outline", color: "text-muted-foreground" },
}

const paymentIcons = {
  stripe: CreditCard,
  paypal: Wallet,
  crypto: Bitcoin,
}

interface Message {
  id: string
  order_id: string
  sender_id: string
  message: string
  is_system: boolean
  created_at: string
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string
  
  const [order, setOrder] = useState<(Order & { service?: Service; pro?: Profile }) | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // Review state
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState("")
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)
  
  // Dispute state
  const [showDisputeDialog, setShowDisputeDialog] = useState(false)
  const [disputeReason, setDisputeReason] = useState("")
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      // Get profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
      
      setProfile(profileData)

      // Get order
      const { data: orderData } = await supabase
        .from("orders")
        .select(`
          *,
          service:services(*),
          pro:profiles!orders_pro_id_profiles_fkey(*)
        `)
        .eq("id", orderId)
        .single()

      if (!orderData || (orderData.client_id !== user.id && orderData.pro_id !== user.id)) {
        router.push("/orders")
        return
      }

      setOrder(orderData)

      // Get messages
      const { data: messagesData } = await supabase
        .from("order_messages")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: true })

      setMessages(messagesData || [])
      
      // Check if user has already reviewed
      const { data: reviewData } = await supabase
        .from("reviews")
        .select("id")
        .eq("order_id", orderId)
        .eq("reviewer_id", user.id)
        .single()
      
      if (reviewData) {
        setHasReviewed(true)
      }
      
      setLoading(false)
    }

    loadData()

    // Subscribe to new messages
    const channel = supabase
      .channel(`order-messages-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "order_messages",
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [orderId, router, supabase])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !profile) return

    setIsSending(true)
    try {
      const { error } = await supabase.from("order_messages").insert({
        order_id: orderId,
        sender_id: profile.id,
        message: newMessage.trim(),
        is_system: false,
      })

      if (!error) {
        setNewMessage("")
      }
    } finally {
      setIsSending(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!profile || !order) return
    
    setIsSubmittingReview(true)
    try {
      const response = await fetch("/api/orders/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          rating: reviewRating,
          comment: reviewComment.trim() || null,
        }),
      })
      
      if (response.ok) {
        setHasReviewed(true)
        setShowReviewDialog(false)
      }
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const handleSubmitDispute = async () => {
    if (!profile || !order || !disputeReason.trim()) return
    
    setIsSubmittingDispute(true)
    try {
      const response = await fetch("/api/orders/dispute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          reason: disputeReason.trim(),
        }),
      })
      
      if (response.ok) {
        setShowDisputeDialog(false)
        // Refresh order data
        window.location.reload()
      }
    } finally {
      setIsSubmittingDispute(false)
    }
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!order || !profile) {
    return null
  }

  const status = statusConfig[order.status]
  const StatusIcon = status.icon
  const PaymentIcon = paymentIcons[order.payment_method as keyof typeof paymentIcons] || CreditCard
  const isClient = order.client_id === profile.id

  return (
    <AppLayout 
      breadcrumbs={[
        { label: "Orders", href: "/orders" },
        { label: order.order_number }
      ]} 
      userRole={profile.role}
      user={profile}
    >
      <div className="p-4 md:p-6 space-y-6">
        {/* Back Button */}
        <Button variant="ghost" asChild>
          <Link href={isClient ? "/orders" : "/pro/orders"}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Order Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <Card className="glass">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardDescription className="font-mono">{order.order_number}</CardDescription>
                    <CardTitle className="text-xl mt-1">{order.service?.title || "Service"}</CardTitle>
                  </div>
                  <Badge variant={status.variant} className="text-sm px-3 py-1">
                    <StatusIcon className="h-4 w-4 mr-1" />
                    {status.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status Timeline */}
                <div className="flex items-center gap-2 text-sm">
                  <div className={`flex items-center gap-1 ${order.status !== "pending" ? "text-green-500" : "text-muted-foreground"}`}>
                    <CheckCircle2 className="h-4 w-4" /> Paid
                  </div>
                  <div className="h-px flex-1 bg-border" />
                  <div className={`flex items-center gap-1 ${["in_progress", "pending_review", "completed"].includes(order.status) ? "text-green-500" : "text-muted-foreground"}`}>
                    <CheckCircle2 className="h-4 w-4" /> Accepted
                  </div>
                  <div className="h-px flex-1 bg-border" />
                  <div className={`flex items-center gap-1 ${["pending_review", "completed"].includes(order.status) ? "text-green-500" : "text-muted-foreground"}`}>
                    <CheckCircle2 className="h-4 w-4" /> Completed
                  </div>
                  <div className="h-px flex-1 bg-border" />
                  <div className={`flex items-center gap-1 ${order.status === "completed" ? "text-green-500" : "text-muted-foreground"}`}>
                    <CheckCircle2 className="h-4 w-4" /> Released
                  </div>
                </div>

                <Separator />

                {/* Order Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Order Date</p>
                    <p className="font-medium">{formatDate(order.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Payment Method</p>
                    <p className="font-medium flex items-center gap-1">
                      <PaymentIcon className="h-4 w-4" />
                      {order.payment_method?.toUpperCase() || "Card"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total</p>
                    <p className="font-medium text-xl">{formatCurrency(order.total_cents)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Game</p>
                    <p className="font-medium">{order.service?.game || "-"}</p>
                  </div>
                </div>

                {/* Proof Link (if completed) */}
                {order.proof_link && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Proof of Completion</p>
                      <Button variant="outline" size="sm" asChild>
                        <a href={order.proof_link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Proof
                        </a>
                      </Button>
                      {order.proof_notes && (
                        <p className="text-sm mt-2 text-muted-foreground">{order.proof_notes}</p>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Messages */}
            <Card className="glass">
              <CardHeader>
                <CardTitle>Messages</CardTitle>
                <CardDescription>Chat with your {isClient ? "service provider" : "client"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 h-[300px] overflow-y-auto mb-4 p-4 bg-muted/30 rounded-lg">
                  {messages.length === 0 ? (
                    <p className="text-center text-muted-foreground text-sm py-8">
                      No messages yet. Start the conversation!
                    </p>
                  ) : (
                    messages.map((msg) => {
                      const isOwn = msg.sender_id === profile.id
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                        >
                          {msg.is_system ? (
                            <div className="bg-muted/50 text-muted-foreground text-xs px-3 py-2 rounded-lg text-center w-full">
                              {msg.message}
                            </div>
                          ) : (
                            <div
                              className={`max-w-[70%] px-4 py-2 rounded-lg ${
                                isOwn
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <p className="text-sm">{msg.message}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {new Date(msg.created_at).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    className="bg-input"
                  />
                  <Button onClick={handleSendMessage} disabled={isSending || !newMessage.trim()}>
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* PRO Info (for client) */}
            {isClient && order.pro && (
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="text-lg">Your PRO</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {order.pro.username?.slice(0, 2).toUpperCase() || "PR"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{order.pro.username || "PRO Player"}</p>
                      <p className="text-sm text-muted-foreground">{order.pro.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Service Info */}
            {order.service && (
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="text-lg">Service Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Service</p>
                    <p className="font-medium">{order.service.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <Badge variant="outline" className="capitalize">
                      {order.service.category}
                    </Badge>
                  </div>
                  {order.service.description && (
                    <div>
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p className="text-sm">{order.service.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Actions Card */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Review Button - only show for client after completion */}
                {isClient && order.status === "completed" && !hasReviewed && (
                  <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Star className="h-4 w-4 mr-2" />
                        Leave a Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Rate Your Experience</DialogTitle>
                        <DialogDescription>
                          How was your experience with this service?
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Rating</Label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReviewRating(star)}
                                className="p-1 hover:scale-110 transition-transform"
                              >
                                <Star
                                  className={`h-8 w-8 ${
                                    star <= reviewRating
                                      ? "fill-yellow-500 text-yellow-500"
                                      : "text-muted-foreground"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Comment (optional)</Label>
                          <Textarea
                            placeholder="Share your experience..."
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            rows={4}
                            className="bg-input resize-none"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSubmitReview} disabled={isSubmittingReview}>
                          {isSubmittingReview ? "Submitting..." : "Submit Review"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
                
                {hasReviewed && (
                  <div className="flex items-center gap-2 text-sm text-green-500 p-2 bg-green-500/10 rounded-lg">
                    <ThumbsUp className="h-4 w-4" />
                    Review submitted
                  </div>
                )}
                
                {/* Dispute Button - only for active orders */}
                {isClient && !["completed", "refunded", "cancelled", "disputed"].includes(order.status) && (
                  <Dialog open={showDisputeDialog} onOpenChange={setShowDisputeDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full text-yellow-500 border-yellow-500/50 hover:bg-yellow-500/10">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Open Dispute
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Open a Dispute</DialogTitle>
                        <DialogDescription>
                          Please describe the issue you&apos;re experiencing with this order.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Reason for Dispute</Label>
                          <Textarea
                            placeholder="Describe your issue in detail..."
                            value={disputeReason}
                            onChange={(e) => setDisputeReason(e.target.value)}
                            rows={4}
                            className="bg-input resize-none"
                            required
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Our support team will review your dispute within 24 hours. Please provide as much detail as possible.
                        </p>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDisputeDialog(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleSubmitDispute} 
                          disabled={isSubmittingDispute || !disputeReason.trim()}
                          variant="destructive"
                        >
                          {isSubmittingDispute ? "Submitting..." : "Submit Dispute"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
                
                {order.status === "disputed" && (
                  <div className="flex items-center gap-2 text-sm text-yellow-500 p-2 bg-yellow-500/10 rounded-lg">
                    <AlertTriangle className="h-4 w-4" />
                    Dispute under review
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Help Card */}
            <Card className="glass border-muted">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">
                  Need help? Check our FAQ or contact support.
                </p>
                <Button variant="link" size="sm" className="mt-2 p-0" asChild>
                  <Link href="/support">Contact Support</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
