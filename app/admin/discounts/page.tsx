"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Percent, Plus, Pencil, Trash2, Loader2, Tag, Calendar } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface Discount {
  id: string
  title: string
  description?: string
  discount_type: "percentage" | "fixed"
  discount_value: number
  target_type: "game" | "service"
  target_id?: string
  start_date?: string
  end_date?: string
  is_active: boolean
  priority: number
  min_order_amount: number
  max_discount_amount?: number
  usage_limit?: number
  usage_count: number
}

interface Game {
  id: string
  name: string
}

interface Service {
  id: string
  title: string
  game: string
}

export default function AdminDiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Discount | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    discount_type: "percentage" as "percentage" | "fixed",
    discount_value: 10,
    target_type: "game" as "game" | "service",
    target_id: "",
    start_date: "",
    end_date: "",
    is_active: true,
    priority: 0,
    min_order_amount: 0,
    max_discount_amount: 0,
    usage_limit: 0
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [discountsRes, gamesRes, servicesRes] = await Promise.all([
        fetch("/api/admin/discounts"),
        fetch("/api/games"),
        fetch("/api/services")
      ])
      
      if (discountsRes.ok) {
        const data = await discountsRes.json()
        setDiscounts(data.discounts || [])
      }
      if (gamesRes.ok) {
        const data = await gamesRes.json()
        setGames(data.games || [])
      }
      if (servicesRes.ok) {
        const data = await servicesRes.json()
        setServices(data.services || [])
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit() {
    try {
      const method = editing ? "PATCH" : "POST"
      const body = editing ? { ...formData, id: editing.id } : formData

      const res = await fetch("/api/admin/discounts", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        setDialogOpen(false)
        setEditing(null)
        resetForm()
        fetchData()
      }
    } catch (error) {
      console.error("Failed to save discount:", error)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this discount?")) return
    
    try {
      const res = await fetch(`/api/admin/discounts?id=${id}`, { method: "DELETE" })
      if (res.ok) fetchData()
    } catch (error) {
      console.error("Failed to delete:", error)
    }
  }

  async function toggleActive(discount: Discount) {
    try {
      await fetch("/api/admin/discounts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: discount.id, is_active: !discount.is_active })
      })
      fetchData()
    } catch (error) {
      console.error("Failed to toggle:", error)
    }
  }

  function resetForm() {
    setFormData({
      title: "",
      description: "",
      discount_type: "percentage",
      discount_value: 10,
      target_type: "game",
      target_id: "",
      start_date: "",
      end_date: "",
      is_active: true,
      priority: 0,
      min_order_amount: 0,
      max_discount_amount: 0,
      usage_limit: 0
    })
  }

  function openEdit(discount: Discount) {
    setEditing(discount)
    setFormData({
      title: discount.title,
      description: discount.description || "",
      discount_type: discount.discount_type,
      discount_value: discount.discount_value,
      target_type: discount.target_type,
      target_id: discount.target_id || "",
      start_date: discount.start_date?.split("T")[0] || "",
      end_date: discount.end_date?.split("T")[0] || "",
      is_active: discount.is_active,
      priority: discount.priority,
      min_order_amount: discount.min_order_amount,
      max_discount_amount: discount.max_discount_amount || 0,
      usage_limit: discount.usage_limit || 0
    })
    setDialogOpen(true)
  }

  function isExpired(discount: Discount) {
    if (!discount.end_date) return false
    return new Date(discount.end_date) < new Date()
  }

  function isUpcoming(discount: Discount) {
    if (!discount.start_date) return false
    return new Date(discount.start_date) > new Date()
  }

  const activeDiscounts = discounts.filter(d => d.is_active && !isExpired(d) && !isUpcoming(d))
  const inactiveDiscounts = discounts.filter(d => !d.is_active || isExpired(d) || isUpcoming(d))

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Discounts & Offers</h1>
            <p className="text-muted-foreground">Manage game and service discounts</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) {
              setEditing(null)
              resetForm()
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Discount
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editing ? "Edit Discount" : "Create Discount"}</DialogTitle>
                <DialogDescription>
                  Set up game-level or service-level discounts
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Summer Sale"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description (Optional)</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Short description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Discount Type</Label>
                    <Select 
                      value={formData.discount_type} 
                      onValueChange={(v: "percentage" | "fixed") => setFormData(prev => ({ ...prev, discount_type: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {formData.discount_type === "percentage" ? "Percentage (%)" : "Amount ($)"}
                    </Label>
                    <Input
                      type="number"
                      value={formData.discount_value}
                      onChange={(e) => setFormData(prev => ({ ...prev, discount_value: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Target Type</Label>
                    <Select 
                      value={formData.target_type} 
                      onValueChange={(v: "game" | "service") => setFormData(prev => ({ ...prev, target_type: v, target_id: "" }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="game">Game (all services)</SelectItem>
                        <SelectItem value="service">Specific Service</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Target {formData.target_type === "game" ? "Game" : "Service"}</Label>
                    <Select 
                      value={formData.target_id} 
                      onValueChange={(v) => setFormData(prev => ({ ...prev, target_id: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All {formData.target_type === "game" ? "Games" : "Services"}</SelectItem>
                        {formData.target_type === "game" 
                          ? games.map((g) => (
                              <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                            ))
                          : services.map((s) => (
                              <SelectItem key={s.id} value={s.id}>{s.game} - {s.title}</SelectItem>
                            ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Min Order Amount ($)</Label>
                    <Input
                      type="number"
                      value={formData.min_order_amount / 100}
                      onChange={(e) => setFormData(prev => ({ ...prev, min_order_amount: (parseFloat(e.target.value) || 0) * 100 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Discount ($)</Label>
                    <Input
                      type="number"
                      value={(formData.max_discount_amount || 0) / 100}
                      onChange={(e) => setFormData(prev => ({ ...prev, max_discount_amount: (parseFloat(e.target.value) || 0) * 100 }))}
                      placeholder="No limit"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Usage Limit</Label>
                    <Input
                      type="number"
                      value={formData.usage_limit}
                      onChange={(e) => setFormData(prev => ({ ...prev, usage_limit: parseInt(e.target.value) || 0 }))}
                      placeholder="0 = unlimited"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Input
                      type="number"
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Label>Active</Label>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmit}>
                  {editing ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-green-500" />
                <span className="text-sm text-muted-foreground">Active</span>
              </div>
              <p className="text-2xl font-bold">{activeDiscounts.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Total</span>
              </div>
              <p className="text-2xl font-bold">{discounts.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-muted-foreground">Upcoming</span>
              </div>
              <p className="text-2xl font-bold">{discounts.filter(isUpcoming).length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-red-500" />
                <span className="text-sm text-muted-foreground">Expired</span>
              </div>
              <p className="text-2xl font-bold">{discounts.filter(isExpired).length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Discounts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-green-500" />
              Active Discounts
            </CardTitle>
            <CardDescription>Currently running promotions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeDiscounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No active discounts
                    </TableCell>
                  </TableRow>
                ) : (
                  activeDiscounts.map((discount) => (
                    <TableRow key={discount.id}>
                      <TableCell className="font-medium">{discount.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {discount.discount_type === "percentage" ? "%" : "$"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {discount.discount_type === "percentage" 
                          ? `${discount.discount_value}%`
                          : formatCurrency(discount.discount_value * 100)
                        }
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {discount.target_type === "game" ? "Game" : "Service"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {discount.start_date && discount.end_date
                          ? `${new Date(discount.start_date).toLocaleDateString()} - ${new Date(discount.end_date).toLocaleDateString()}`
                          : "Always"
                        }
                      </TableCell>
                      <TableCell>
                        {discount.usage_limit 
                          ? `${discount.usage_count}/${discount.usage_limit}`
                          : discount.usage_count
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Switch
                            checked={discount.is_active}
                            onCheckedChange={() => toggleActive(discount)}
                          />
                          <Button variant="ghost" size="icon" onClick={() => openEdit(discount)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(discount.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Inactive/Expired */}
        {inactiveDiscounts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-muted-foreground">Inactive & Expired</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inactiveDiscounts.map((discount) => (
                    <TableRow key={discount.id} className="opacity-60">
                      <TableCell>{discount.title}</TableCell>
                      <TableCell>
                        {discount.discount_type === "percentage" 
                          ? `${discount.discount_value}%`
                          : formatCurrency(discount.discount_value * 100)
                        }
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {isExpired(discount) ? "Expired" : isUpcoming(discount) ? "Upcoming" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(discount)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(discount.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
