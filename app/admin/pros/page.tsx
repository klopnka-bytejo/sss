"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Search, 
  MoreHorizontal, 
  Shield, 
  Ban, 
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Star,
  Gamepad2,
  Clock,
  TrendingUp
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface Pro {
  id: string
  display_name: string
  email: string
  status: string
  created_at: string
  wallet_balance: number
  total_earnings: number
  orders_completed: number
  rating: number
  games: string[]
  is_available: boolean
}

export default function AdminProsPage() {
  const [pros, setPros] = useState<Pro[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedPro, setSelectedPro] = useState<Pro | null>(null)
  const [showFineDialog, setShowFineDialog] = useState(false)
  const [showSuspendDialog, setShowSuspendDialog] = useState(false)
  const [fineAmount, setFineAmount] = useState("")
  const [fineReason, setFineReason] = useState("")
  const [suspendReason, setSuspendReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadPros()
  }, [statusFilter])

  const loadPros = async () => {
    setLoading(true)
    let query = supabase
      .from("profiles")
      .select(`
        id,
        display_name,
        email,
        role,
        status,
        created_at
      `)
      .eq("role", "pro")
    
    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter)
    }

    const { data: prosData, error } = await query.order("created_at", { ascending: false })

    if (prosData && !error) {
      // Fetch additional stats for each PRO
      const prosWithStats = await Promise.all(
        prosData.map(async (pro) => {
          // Get wallet balance
          const { data: wallet } = await supabase
            .from("wallets")
            .select("balance")
            .eq("user_id", pro.id)
            .single()

          // Get orders count
          const { count: ordersCount } = await supabase
            .from("orders")
            .select("*", { count: "exact", head: true })
            .eq("pro_id", pro.id)
            .eq("status", "completed")

          // Get total earnings
          const { data: earnings } = await supabase
            .from("wallet_transactions")
            .select("amount")
            .eq("user_id", pro.id)
            .eq("type", "earning")

          const totalEarnings = earnings?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0

          // Get average rating
          const { data: reviews } = await supabase
            .from("reviews")
            .select("rating")
            .eq("pro_id", pro.id)

          const avgRating = reviews?.length 
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
            : 0

          return {
            ...pro,
            wallet_balance: wallet?.balance || 0,
            total_earnings: totalEarnings,
            orders_completed: ordersCount || 0,
            rating: avgRating,
            games: [],
            is_available: true,
          }
        })
      )
      setPros(prosWithStats)
    }
    setLoading(false)
  }

  const filteredPros = pros.filter((pro) =>
    pro.display_name?.toLowerCase().includes(search.toLowerCase()) ||
    pro.email?.toLowerCase().includes(search.toLowerCase())
  )

  const handleIssueFine = async () => {
    if (!selectedPro || !fineAmount || !fineReason) return
    
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/admin/fines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proId: selectedPro.id,
          amount: parseInt(fineAmount) * 100,
          reason: fineReason,
          fineType: "rule_violation",
        }),
      })
      
      if (response.ok) {
        setShowFineDialog(false)
        setFineAmount("")
        setFineReason("")
        loadPros()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSuspend = async () => {
    if (!selectedPro) return
    
    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status: "suspended" })
        .eq("id", selectedPro.id)
      
      if (!error) {
        // Log to audit
        await supabase.from("audit_logs").insert({
          action: "pro_suspended",
          entity_type: "profile",
          entity_id: selectedPro.id,
          details: { reason: suspendReason },
        })
        
        setShowSuspendDialog(false)
        setSuspendReason("")
        loadPros()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReactivate = async (proId: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ status: "active" })
      .eq("id", proId)
    
    if (!error) {
      await supabase.from("audit_logs").insert({
        action: "pro_reactivated",
        entity_type: "profile",
        entity_id: proId,
      })
      loadPros()
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-500">Active</Badge>
      case "suspended":
        return <Badge className="bg-yellow-500/20 text-yellow-500">Suspended</Badge>
      case "banned":
        return <Badge className="bg-red-500/20 text-red-500">Banned</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  // Stats
  const totalPros = pros.length
  const activePros = pros.filter(p => p.status === "active").length
  const suspendedPros = pros.filter(p => p.status === "suspended").length
  const totalPayout = pros.reduce((sum, p) => sum + p.total_earnings, 0)

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">PRO Management</h1>
          <p className="text-muted-foreground">Manage PRO accounts, performance, and payouts</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalPros}</p>
                  <p className="text-sm text-muted-foreground">Total PROs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activePros}</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{suspendedPros}</p>
                  <p className="text-sm text-muted-foreground">Suspended</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(totalPayout)}</p>
                  <p className="text-sm text-muted-foreground">Total Paid Out</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search PROs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-input"
                />
              </div>
              <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="suspended">Suspended</TabsTrigger>
                  <TabsTrigger value="banned">Banned</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* PROs Table */}
        <Card className="glass">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PRO</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Earnings</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredPros.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No PROs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPros.map((pro) => (
                    <TableRow key={pro.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{pro.display_name || "Unknown"}</p>
                          <p className="text-sm text-muted-foreground">{pro.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(pro.status || "active")}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          {pro.orders_completed}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          {pro.rating > 0 ? pro.rating.toFixed(1) : "N/A"}
                        </div>
                      </TableCell>
                      <TableCell className="text-green-500">
                        {formatCurrency(pro.total_earnings)}
                      </TableCell>
                      <TableCell>{formatCurrency(pro.wallet_balance)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedPro(pro)
                                setShowFineDialog(true)
                              }}
                            >
                              <DollarSign className="h-4 w-4 mr-2" />
                              Issue Fine
                            </DropdownMenuItem>
                            {pro.status === "active" ? (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedPro(pro)
                                  setShowSuspendDialog(true)
                                }}
                                className="text-yellow-500"
                              >
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Suspend
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleReactivate(pro.id)}
                                className="text-green-500"
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Reactivate
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-red-500">
                              <Ban className="h-4 w-4 mr-2" />
                              Ban PRO
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Fine Dialog */}
        <Dialog open={showFineDialog} onOpenChange={setShowFineDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Issue Fine to {selectedPro?.display_name}</DialogTitle>
              <DialogDescription>
                This will deduct the amount from the PRO&apos;s wallet balance.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Fine Amount ($)</Label>
                <Input
                  type="number"
                  placeholder="25"
                  value={fineAmount}
                  onChange={(e) => setFineAmount(e.target.value)}
                  className="bg-input"
                />
              </div>
              <div className="space-y-2">
                <Label>Reason</Label>
                <Textarea
                  placeholder="Describe the reason for this fine..."
                  value={fineReason}
                  onChange={(e) => setFineReason(e.target.value)}
                  className="bg-input resize-none"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowFineDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleIssueFine} 
                disabled={isSubmitting || !fineAmount || !fineReason}
              >
                {isSubmitting ? "Processing..." : "Issue Fine"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Suspend Dialog */}
        <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Suspend {selectedPro?.display_name}</DialogTitle>
              <DialogDescription>
                This will prevent the PRO from accepting new orders.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Reason for Suspension</Label>
                <Textarea
                  placeholder="Describe the reason for suspension..."
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  className="bg-input resize-none"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSuspendDialog(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleSuspend} 
                disabled={isSubmitting || !suspendReason}
              >
                {isSubmitting ? "Processing..." : "Suspend PRO"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
