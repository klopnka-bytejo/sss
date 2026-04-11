"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { formatCurrency } from "@/lib/utils"
import { 
  Wallet, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Banknote,
  Bitcoin,
  CreditCard,
  Loader2,
  AlertTriangle
} from "lucide-react"

interface Withdrawal {
  id: string
  amount_cents: number
  method?: string
  status: string
  created_at: string
  processed_at: string | null
}

interface Transaction {
  id: string
  type: string
  amount_cents: number
  description: string
  created_at: string
  order_id: string | null
}

export default function ProEarningsPage() {
  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState(0)
  const [pendingBalance, setPendingBalance] = useState(0)
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [totalWithdrawn, setTotalWithdrawn] = useState(0)
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  
  // Withdrawal form
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [withdrawMethod, setWithdrawMethod] = useState("paypal")
  const [withdrawDetails, setWithdrawDetails] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const response = await fetch('/api/pro/earnings', {
        credentials: 'include',
      })
      
      if (!response.ok) {
        console.error('[v0] Failed to fetch earnings')
        setLoading(false)
        return
      }

      const data = await response.json()
      setBalance(data.balance || 0)
      setPendingBalance(data.pendingBalance || 0)
      setTotalEarnings(data.totalEarnings || 0)
      setTotalWithdrawn(data.totalWithdrawn || 0)
      setWithdrawals(data.withdrawals || [])
      setTransactions(data.transactions || [])
    } catch (error) {
      console.error('[v0] Error loading earnings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async () => {
    const amountCents = Math.round(parseFloat(withdrawAmount) * 100)
    
    // Validate minimum amounts
    const minimums: Record<string, number> = {
      paypal: 2500,
      crypto: 2500,
      bank: 10000,
    }
    
    if (amountCents < minimums[withdrawMethod]) {
      alert(`Minimum withdrawal for ${withdrawMethod} is ${formatCurrency(minimums[withdrawMethod])}`)
      return
    }
    
    if (amountCents > balance) {
      alert("Insufficient balance")
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({
          amount_cents: amountCents,
          method: withdrawMethod,
          details: withdrawDetails,
        }),
      })

      if (response.ok) {
        setShowWithdrawDialog(false)
        setWithdrawAmount("")
        setWithdrawDetails("")
        loadData()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to submit withdrawal request')
      }
    } catch (error) {
      alert('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-500/20 text-yellow-500",
      processing: "bg-blue-500/20 text-blue-500",
      completed: "bg-green-500/20 text-green-500",
      rejected: "bg-red-500/20 text-red-500",
    }
    return <Badge className={styles[status] || ""}>{status}</Badge>
  }

  if (loading) {
    return (
      <AppLayout userRole="pro">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout userRole="pro">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Earnings & Wallet</h1>
            <p className="text-muted-foreground">Manage your earnings and withdrawals</p>
          </div>
          <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
            <DialogTrigger asChild>
              <Button disabled={balance < 2500}>
                <Banknote className="h-4 w-4 mr-2" />
                Withdraw
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Withdrawal</DialogTitle>
                <DialogDescription>
                  Available balance: {formatCurrency(balance)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Withdrawal Method</Label>
                  <Select value={withdrawMethod} onValueChange={setWithdrawMethod}>
                    <SelectTrigger className="bg-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paypal">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          PayPal (Min $25)
                        </div>
                      </SelectItem>
                      <SelectItem value="crypto">
                        <div className="flex items-center gap-2">
                          <Bitcoin className="h-4 w-4" />
                          Crypto (Min $25)
                        </div>
                      </SelectItem>
                      <SelectItem value="bank">
                        <div className="flex items-center gap-2">
                          <Banknote className="h-4 w-4" />
                          Bank Transfer (Min $100)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Amount (USD)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="bg-input"
                    min={withdrawMethod === "bank" ? 100 : 25}
                    max={balance / 100}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>
                    {withdrawMethod === "paypal" && "PayPal Email"}
                    {withdrawMethod === "crypto" && "Wallet Address (USDT/BTC/ETH)"}
                    {withdrawMethod === "bank" && "Bank Account Details"}
                  </Label>
                  <Input
                    placeholder={
                      withdrawMethod === "paypal" ? "your@email.com" :
                      withdrawMethod === "crypto" ? "0x..." :
                      "Account number, routing, etc."
                    }
                    value={withdrawDetails}
                    onChange={(e) => setWithdrawDetails(e.target.value)}
                    className="bg-input"
                  />
                </div>
                
                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <div className="flex gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-500">
                      Withdrawals are typically processed within 1-3 business days.
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowWithdrawDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleWithdraw} 
                  disabled={isSubmitting || !withdrawAmount || !withdrawDetails}
                >
                  {isSubmitting ? "Processing..." : "Submit Request"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Available Balance</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(balance)}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Release</p>
                  <p className="text-2xl font-bold text-yellow-500">{formatCurrency(pendingBalance)}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold text-green-500">{formatCurrency(totalEarnings)}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Withdrawn</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalWithdrawn)}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="transactions">
          <TabsList className="bg-card/50">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="mt-4">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>All wallet transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No transactions yet</p>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg bg-card/50">
                        <div className="flex items-center gap-4">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            tx.amount_cents > 0 ? "bg-green-500/20" : "bg-red-500/20"
                          }`}>
                            {tx.amount_cents > 0 ? (
                              <ArrowDownRight className="h-5 w-5 text-green-500" />
                            ) : (
                              <ArrowUpRight className="h-5 w-5 text-red-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{tx.description || tx.type}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(tx.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <p className={`font-bold ${tx.amount_cents > 0 ? "text-green-500" : "text-red-500"}`}>
                          {tx.amount_cents > 0 ? "+" : ""}{formatCurrency(tx.amount_cents)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdrawals" className="mt-4">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Withdrawal History</CardTitle>
                <CardDescription>All withdrawal requests</CardDescription>
              </CardHeader>
              <CardContent>
                {withdrawals.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No withdrawals yet</p>
                ) : (
                  <div className="space-y-3">
                    {withdrawals.map((w) => (
                      <div key={w.id} className="flex items-center justify-between p-4 rounded-lg bg-card/50">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            {w.method === "paypal" && <CreditCard className="h-5 w-5" />}
                            {w.method === "crypto" && <Bitcoin className="h-5 w-5" />}
                            {w.method === "bank" && <Banknote className="h-5 w-5" />}
                            {!w.method && <Banknote className="h-5 w-5" />}
                          </div>
                          <div>
                            <p className="font-medium capitalize">{w.method || 'Withdrawal'}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(w.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(w.amount_cents)}</p>
                          {getStatusBadge(w.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
