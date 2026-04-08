"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { 
  DollarSign, 
  CheckCircle2, 
  XCircle,
  Clock,
  CreditCard,
  Bitcoin,
  Wallet
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Withdrawal {
  id: string
  pro_id: string
  amount_cents: number
  method: string
  payout_details: Record<string, string>
  status: string
  admin_notes: string | null
  processed_at: string | null
  created_at: string
  pro?: {
    id: string
    email: string
    username: string | null
    avatar_url: string | null
  }
}

interface AdminWithdrawalsContentProps {
  withdrawals: Withdrawal[]
}

export function AdminWithdrawalsContent({ withdrawals }: AdminWithdrawalsContentProps) {
  const router = useRouter()
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null)
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null)
  const [adminNotes, setAdminNotes] = useState("")
  const [loading, setLoading] = useState(false)

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100)
  }

  const methodIcons: Record<string, typeof DollarSign> = {
    paypal: CreditCard,
    crypto: Bitcoin,
    bank: Wallet,
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-500",
    approved: "bg-green-500/20 text-green-500",
    rejected: "bg-red-500/20 text-red-500",
    completed: "bg-blue-500/20 text-blue-500",
  }

  const pendingWithdrawals = withdrawals.filter(w => w.status === "pending")
  const processedWithdrawals = withdrawals.filter(w => w.status !== "pending")

  const handleAction = async () => {
    if (!selectedWithdrawal || !actionType) return

    setLoading(true)
    try {
      const res = await fetch("/api/admin/withdrawals/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          withdrawalId: selectedWithdrawal.id,
          action: actionType,
          adminNotes,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to process withdrawal")
      }

      toast.success(`Withdrawal ${actionType === "approve" ? "approved" : "rejected"} successfully`)
      setSelectedWithdrawal(null)
      setActionType(null)
      setAdminNotes("")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const WithdrawalCard = ({ withdrawal }: { withdrawal: Withdrawal }) => {
    const MethodIcon = methodIcons[withdrawal.method] || DollarSign

    return (
      <Card className="glass">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={withdrawal.pro?.avatar_url || ""} />
                <AvatarFallback>
                  {withdrawal.pro?.email?.[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{withdrawal.pro?.username || withdrawal.pro?.email}</p>
                <p className="text-sm text-muted-foreground">{withdrawal.pro?.email}</p>
              </div>
            </div>
            <Badge className={statusColors[withdrawal.status] || ""}>
              {withdrawal.status}
            </Badge>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="text-xl font-bold text-success">{formatCurrency(withdrawal.amount_cents)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Method</p>
              <div className="flex items-center gap-2">
                <MethodIcon className="h-4 w-4" />
                <span className="capitalize">{withdrawal.method}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-muted/30">
            <p className="text-sm text-muted-foreground mb-1">Payout Details</p>
            {Object.entries(withdrawal.payout_details || {}).map(([key, value]) => (
              <p key={key} className="text-sm">
                <span className="capitalize">{key.replace(/_/g, " ")}: </span>
                <span className="font-medium">{value}</span>
              </p>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>Requested {new Date(withdrawal.created_at).toLocaleDateString()}</span>
            {withdrawal.status === "pending" && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive"
                  onClick={() => {
                    setSelectedWithdrawal(withdrawal)
                    setActionType("reject")
                  }}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedWithdrawal(withdrawal)
                    setActionType("approve")
                  }}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Approve
                </Button>
              </div>
            )}
          </div>

          {withdrawal.admin_notes && (
            <div className="mt-3 p-2 rounded bg-muted/50 text-sm">
              <span className="text-muted-foreground">Admin notes: </span>
              {withdrawal.admin_notes}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Withdrawal Requests</h1>
        <p className="text-muted-foreground mt-1">Process PRO payout requests</p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending ({pendingWithdrawals.length})
          </TabsTrigger>
          <TabsTrigger value="processed" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Processed ({processedWithdrawals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          {pendingWithdrawals.length === 0 ? (
            <Card className="glass">
              <CardContent className="py-8 text-center">
                <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">No pending withdrawals</h3>
                <p className="text-sm text-muted-foreground">
                  All withdrawal requests have been processed
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingWithdrawals.map((withdrawal) => (
                <WithdrawalCard key={withdrawal.id} withdrawal={withdrawal} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="processed" className="mt-4">
          {processedWithdrawals.length === 0 ? (
            <Card className="glass">
              <CardContent className="py-8 text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">No processed withdrawals</h3>
                <p className="text-sm text-muted-foreground">
                  No withdrawals have been processed yet
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {processedWithdrawals.map((withdrawal) => (
                <WithdrawalCard key={withdrawal.id} withdrawal={withdrawal} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <Dialog open={!!selectedWithdrawal && !!actionType} onOpenChange={() => {
        setSelectedWithdrawal(null)
        setActionType(null)
        setAdminNotes("")
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve" : "Reject"} Withdrawal
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "Are you sure you want to approve this withdrawal? Make sure you have processed the payment."
                : "Are you sure you want to reject this withdrawal? The funds will be returned to the PRO's balance."}
            </DialogDescription>
          </DialogHeader>

          {selectedWithdrawal && (
            <div className="p-4 rounded-lg bg-muted/30">
              <p className="font-medium">{formatCurrency(selectedWithdrawal.amount_cents)}</p>
              <p className="text-sm text-muted-foreground">
                via {selectedWithdrawal.method} to {selectedWithdrawal.pro?.email}
              </p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium">Admin Notes (optional)</label>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add any notes about this decision..."
              className="mt-1"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSelectedWithdrawal(null)
              setActionType(null)
              setAdminNotes("")
            }}>
              Cancel
            </Button>
            <Button
              variant={actionType === "approve" ? "default" : "destructive"}
              onClick={handleAction}
              disabled={loading}
            >
              {loading ? "Processing..." : actionType === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
