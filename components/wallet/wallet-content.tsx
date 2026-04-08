"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Wallet, 
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Bitcoin,
  DollarSign,
  Clock,
  Loader2,
  Banknote
} from "lucide-react"
import { useRouter } from "next/navigation"
import type { Profile, Transaction, TransactionType } from "@/lib/types"

interface WalletContentProps {
  user: Profile
  transactions: Transaction[]
}

const transactionTypeConfig: Record<TransactionType, { label: string; icon: typeof ArrowUpRight; color: string }> = {
  deposit: { label: "Deposit", icon: ArrowDownLeft, color: "text-success" },
  withdrawal: { label: "Withdrawal", icon: ArrowUpRight, color: "text-destructive" },
  order_payment: { label: "Order Payment", icon: ArrowUpRight, color: "text-destructive" },
  order_earning: { label: "Earning", icon: ArrowDownLeft, color: "text-success" },
  refund: { label: "Refund", icon: ArrowDownLeft, color: "text-success" },
  fee: { label: "Platform Fee", icon: ArrowUpRight, color: "text-muted-foreground" },
}

export function WalletContent({ user, transactions }: WalletContentProps) {
  const [depositAmount, setDepositAmount] = useState("")
  const [depositDialogOpen, setDepositDialogOpen] = useState(false)
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [withdrawMethod, setWithdrawMethod] = useState<"paypal" | "crypto" | "bank">("paypal")
  const [withdrawDetails, setWithdrawDetails] = useState("")
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [isDepositing, setIsDepositing] = useState(false)
  const router = useRouter()

  const isPro = user.role === "pro"

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

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount)
    if (!amount || amount < 5) {
      alert("Minimum deposit is $5.00")
      return
    }
    
    const amountCents = Math.floor(amount * 100)
    setIsDepositing(true)
    
    try {
      const response = await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountCents }),
      })
      
      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || "Failed to create deposit session")
      }
    } catch (error) {
      alert("Failed to initiate deposit")
    } finally {
      setIsDepositing(false)
    }
  }

  const handleWithdraw = async () => {
    if (!withdrawAmount || !withdrawDetails) return

    const amountCents = Math.floor(parseFloat(withdrawAmount) * 100)
    if (amountCents <= 0 || amountCents > user.balance_cents) {
      alert("Invalid withdrawal amount")
      return
    }

    setIsWithdrawing(true)
    try {
      const response = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountCents,
          method: withdrawMethod,
          payoutDetails: { address: withdrawDetails },
        }),
      })

      const data = await response.json()
      if (data.success) {
        alert("Withdrawal request submitted! Processing within 24-48 hours.")
        setWithdrawDialogOpen(false)
        setWithdrawAmount("")
        setWithdrawDetails("")
        window.location.reload()
      } else {
        alert(data.error || "Withdrawal failed")
      }
    } catch (error) {
      alert("Withdrawal failed")
    } finally {
      setIsWithdrawing(false)
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Wallet</h1>
        <p className="text-muted-foreground mt-1">
          Manage your balance and transactions
        </p>
      </div>

      {/* Balance Card */}
      <Card className="glass glow-primary">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
              <p className="text-4xl md:text-5xl font-bold text-gradient">
                {formatCurrency(user.balance_cents)}
              </p>
            </div>
            <div className="flex gap-3">
              {isPro && (
                <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" variant="outline">
                      <ArrowUpRight className="mr-2 h-4 w-4" />
                      Withdraw
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Withdraw Funds</DialogTitle>
                      <DialogDescription>
                        Request a withdrawal to your preferred payment method
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Amount (USD)</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            className="pl-9"
                            max={user.balance_cents / 100}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Available: {formatCurrency(user.balance_cents)}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label>Withdrawal Method</Label>
                        <div className="grid grid-cols-3 gap-2">
                          <Button 
                            variant={withdrawMethod === "paypal" ? "default" : "outline"} 
                            className="flex-col h-auto py-3"
                            onClick={() => setWithdrawMethod("paypal")}
                          >
                            <Wallet className="h-5 w-5 mb-1" />
                            <span className="text-xs">PayPal</span>
                          </Button>
                          <Button 
                            variant={withdrawMethod === "crypto" ? "default" : "outline"} 
                            className="flex-col h-auto py-3"
                            onClick={() => setWithdrawMethod("crypto")}
                          >
                            <Bitcoin className="h-5 w-5 mb-1" />
                            <span className="text-xs">Crypto</span>
                          </Button>
                          <Button 
                            variant={withdrawMethod === "bank" ? "default" : "outline"} 
                            className="flex-col h-auto py-3"
                            onClick={() => setWithdrawMethod("bank")}
                          >
                            <Banknote className="h-5 w-5 mb-1" />
                            <span className="text-xs">Bank</span>
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>
                          {withdrawMethod === "paypal" ? "PayPal Email" : 
                           withdrawMethod === "crypto" ? "Wallet Address" : "Bank Details"}
                        </Label>
                        <Input
                          placeholder={
                            withdrawMethod === "paypal" ? "your@paypal.com" : 
                            withdrawMethod === "crypto" ? "0x..." : "Account details"
                          }
                          value={withdrawDetails}
                          onChange={(e) => setWithdrawDetails(e.target.value)}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                        Withdrawals are processed within 24-48 hours. Minimum withdrawal: $10
                      </p>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setWithdrawDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleWithdraw} 
                        disabled={isWithdrawing || !withdrawAmount || !withdrawDetails || parseFloat(withdrawAmount) < 10}
                      >
                        {isWithdrawing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Request Withdrawal"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
              <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Funds
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Funds to Wallet</DialogTitle>
                    <DialogDescription>
                      Choose your preferred payment method to add funds
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (USD)</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="amount"
                          type="number"
                          placeholder="0.00"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          className="pl-9 bg-input"
                          min="1"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[10, 25, 50, 100, 250, 500].map((amount) => (
                        <Button
                          key={amount}
                          variant="outline"
                          size="sm"
                          onClick={() => setDepositAmount(amount.toString())}
                        >
                          ${amount}
                        </Button>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <Label>Payment Method</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Button variant="outline" className="flex-col h-auto py-4">
                          <CreditCard className="h-5 w-5 mb-1" />
                          <span className="text-xs">Card</span>
                        </Button>
                        <Button variant="outline" className="flex-col h-auto py-4" disabled>
                          <DollarSign className="h-5 w-5 mb-1" />
                          <span className="text-xs">PayPal</span>
                        </Button>
                        <Button variant="outline" className="flex-col h-auto py-4" disabled>
                          <Bitcoin className="h-5 w-5 mb-1" />
                          <span className="text-xs">Crypto</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDepositDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleDeposit} disabled={isDepositing || !depositAmount || parseFloat(depositAmount) < 5}>
                      {isDepositing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Continue to Payment"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/20">
                <ArrowDownLeft className="h-4 w-4 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Deposited</p>
                <p className="font-semibold">{formatCurrency(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/20">
                <ArrowUpRight className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Spent</p>
                <p className="font-semibold">{formatCurrency(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/20">
                <Clock className="h-4 w-4 text-info" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="font-semibold">{formatCurrency(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Wallet className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">This Month</p>
                <p className="font-semibold">{formatCurrency(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-lg">Transaction History</CardTitle>
          <CardDescription>Your recent wallet activity</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((transaction) => {
                const config = transactionTypeConfig[transaction.type]
                const TransactionIcon = config.icon
                const isPositive = ["deposit", "order_earning", "refund"].includes(transaction.type)
                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-background ${config.color}`}>
                        <TransactionIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{config.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {transaction.description || formatDate(transaction.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${isPositive ? "text-success" : ""}`}>
                        {isPositive ? "+" : "-"}{formatCurrency(Math.abs(transaction.amount_cents))}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Balance: {formatCurrency(transaction.balance_after_cents)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Wallet className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No transactions yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Add funds to get started
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
