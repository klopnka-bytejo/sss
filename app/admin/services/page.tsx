"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Pencil, Trash2, Package, Filter } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency } from "@/lib/utils"
import type { Game, Service } from "@/lib/types"

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGame, setSelectedGame] = useState<string>("all")
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "boosting" as "boosting" | "coaching" | "account",
    game: "",
    game_id: "",
    price_cents: 1999,
    price_type: "fixed" as "fixed" | "hourly" | "per_rank",
    pricing_type: "fixed" as "fixed" | "dynamic",
    delivery_type: "piloted" as "piloted" | "selfplay" | "coaching",
    estimated_hours: 24,
    is_active: true,
  })

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const [servicesRes, gamesRes] = await Promise.all([
      supabase.from("services").select("*").order("created_at", { ascending: false }),
      supabase.from("games").select("*").order("sort_order", { ascending: true }),
    ])
    setServices(servicesRes.data || [])
    setGames(gamesRes.data || [])
    setLoading(false)
  }

  function openCreateDialog() {
    setEditingService(null)
    setFormData({
      title: "",
      description: "",
      category: "boosting",
      game: games[0]?.name || "",
      game_id: games[0]?.id || "",
      price_cents: 1999,
      price_type: "fixed",
      pricing_type: "fixed",
      delivery_type: "piloted",
      estimated_hours: 24,
      is_active: true,
    })
    setIsDialogOpen(true)
  }

  function openEditDialog(service: Service) {
    setEditingService(service)
    setFormData({
      title: service.title,
      description: service.description || "",
      category: service.category,
      game: service.game,
      game_id: service.game_id || "",
      price_cents: service.price_cents,
      price_type: service.price_type,
      pricing_type: service.pricing_type || "fixed",
      delivery_type: service.delivery_type || "piloted",
      estimated_hours: service.estimated_hours || 24,
      is_active: service.is_active,
    })
    setIsDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    const selectedGameObj = games.find(g => g.id === formData.game_id)
    const dataToSave = {
      ...formData,
      game: selectedGameObj?.name || formData.game,
    }
    
    if (editingService) {
      await supabase.from("services").update(dataToSave).eq("id", editingService.id)
    } else {
      await supabase.from("services").insert(dataToSave)
    }
    
    setIsDialogOpen(false)
    fetchData()
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this service?")) return
    await supabase.from("services").delete().eq("id", id)
    fetchData()
  }

  async function toggleActive(service: Service) {
    await supabase.from("services").update({ is_active: !service.is_active }).eq("id", service.id)
    fetchData()
  }

  const filteredServices = selectedGame === "all" 
    ? services 
    : services.filter(s => s.game_id === selectedGame)

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Services Management</h1>
            <p className="text-muted-foreground">Manage your service catalog</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingService ? "Edit Service" : "Add New Service"}</DialogTitle>
                <DialogDescription>
                  {editingService ? "Update service details" : "Add a new service to your catalog"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Service Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="game_id">Game</Label>
                    <Select
                      value={formData.game_id}
                      onValueChange={(value) => setFormData({ ...formData, game_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select game" />
                      </SelectTrigger>
                      <SelectContent>
                        {games.map((game) => (
                          <SelectItem key={game.id} value={game.id}>
                            {game.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: "boosting" | "coaching" | "account") => 
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="boosting">Boosting</SelectItem>
                        <SelectItem value="coaching">Coaching</SelectItem>
                        <SelectItem value="account">Account</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="delivery_type">Delivery Type</Label>
                    <Select
                      value={formData.delivery_type}
                      onValueChange={(value: "piloted" | "selfplay" | "coaching") => 
                        setFormData({ ...formData, delivery_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="piloted">Piloted</SelectItem>
                        <SelectItem value="selfplay">Self-Play</SelectItem>
                        <SelectItem value="coaching">Coaching</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pricing_type">Pricing Type</Label>
                    <Select
                      value={formData.pricing_type}
                      onValueChange={(value: "fixed" | "dynamic") => 
                        setFormData({ ...formData, pricing_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed Price</SelectItem>
                        <SelectItem value="dynamic">Dynamic Price</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price_cents">Base Price (cents)</Label>
                    <Input
                      id="price_cents"
                      type="number"
                      value={formData.price_cents}
                      onChange={(e) => setFormData({ ...formData, price_cents: parseInt(e.target.value) })}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(formData.price_cents)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price_type">Price Type</Label>
                    <Select
                      value={formData.price_type}
                      onValueChange={(value: "fixed" | "hourly" | "per_rank") => 
                        setFormData({ ...formData, price_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed</SelectItem>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="per_rank">Per Rank</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estimated_hours">Est. Hours</Label>
                    <Input
                      id="estimated_hours"
                      type="number"
                      value={formData.estimated_hours}
                      onChange={(e) => setFormData({ ...formData, estimated_hours: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingService ? "Update" : "Create"} Service
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filter Bar */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedGame} onValueChange={setSelectedGame}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by game" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Games</SelectItem>
                  {games.map((game) => (
                    <SelectItem key={game.id} value={game.id}>
                      {game.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                Showing {filteredServices.length} services
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Services ({filteredServices.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Game</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">{service.title}</TableCell>
                      <TableCell>{service.game}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {service.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(service.price_cents)}</TableCell>
                      <TableCell>
                        <Badge variant={service.pricing_type === "dynamic" ? "default" : "secondary"}>
                          {service.pricing_type || "fixed"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={service.is_active ? "default" : "secondary"}
                          className="cursor-pointer"
                          onClick={() => toggleActive(service)}
                        >
                          {service.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(service)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(service.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
