'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, MoreVertical, Loader2, AlertCircle, Trash2, Edit } from 'lucide-react'

interface Service {
  id: string
  title: string
  description: string
  category: string
  game: string
  price_cents: number
  delivery_time: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export function PROServicesContent() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    game: '',
    price_cents: '',
    delivery_time: '7 days',
  })

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      console.log('[v0] Fetching PRO services...')
      const response = await fetch('/api/pro/services')

      if (!response.ok) {
        setError(`Failed to fetch services: ${response.status}`)
        setLoading(false)
        return
      }

      const data = await response.json()
      console.log('[v0] Fetched services:', data.services?.length || 0)
      setServices(data.services || [])
      setError(null)
    } catch (error) {
      console.error('[v0] Error fetching services:', error)
      setError(`Error fetching services: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveService = async () => {
    if (!formData.title || !formData.category || !formData.price_cents) {
      alert('Please fill in all required fields')
      return
    }

    setSaving(true)
    try {
      const url = '/api/pro/services'
      const method = editingService ? 'PATCH' : 'POST'
      const body = editingService
        ? {
            serviceId: editingService.id,
            ...formData,
            price_cents: parseInt(formData.price_cents),
          }
        : {
            ...formData,
            price_cents: parseInt(formData.price_cents),
          }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        const data = await response.json()
        if (editingService) {
          setServices(services.map((s) => (s.id === data.service.id ? data.service : s)))
        } else {
          setServices([data.service, ...services])
        }
        setCreateDialogOpen(false)
        setEditingService(null)
        setFormData({
          title: '',
          description: '',
          category: '',
          game: '',
          price_cents: '',
          delivery_time: '7 days',
        })
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save service')
      }
    } catch (error) {
      console.error('[v0] Error saving service:', error)
      alert('Error saving service')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return

    try {
      const response = await fetch('/api/pro/services', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId }),
      })

      if (response.ok) {
        setServices(services.filter((s) => s.id !== serviceId))
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete service')
      }
    } catch (error) {
      console.error('[v0] Error deleting service:', error)
      alert('Error deleting service')
    }
  }

  const handleEditClick = (service: Service) => {
    setEditingService(service)
    setFormData({
      title: service.title,
      description: service.description,
      category: service.category,
      game: service.game,
      price_cents: String(service.price_cents),
      delivery_time: service.delivery_time,
    })
    setCreateDialogOpen(true)
  }

  const handleCreateClick = () => {
    setEditingService(null)
    setFormData({
      title: '',
      description: '',
      category: '',
      game: '',
      price_cents: '',
      delivery_time: '7 days',
    })
    setCreateDialogOpen(true)
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-lg flex items-start gap-3">
        <AlertCircle className="h-5 w-5 mt-0.5" />
        <div>
          <p className="font-semibold">Error Loading Services</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Services</h1>
          <p className="text-muted-foreground">Create and manage your services</p>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateClick} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingService ? 'Edit Service' : 'Create New Service'}</DialogTitle>
              <DialogDescription>
                {editingService ? 'Update your service details' : 'Add a new service to your profile'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Service Title *</label>
                <Input
                  placeholder="e.g., Valorant Ranked Coaching"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Describe your service..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Category *</label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coaching">Coaching</SelectItem>
                      <SelectItem value="boosting">Boosting</SelectItem>
                      <SelectItem value="accounts">Accounts</SelectItem>
                      <SelectItem value="items">Items</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Game</label>
                  <Input
                    placeholder="e.g., Valorant"
                    value={formData.game}
                    onChange={(e) => setFormData({ ...formData, game: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Price (USD) *</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.price_cents ? (parseInt(formData.price_cents) / 100).toFixed(2) : ''}
                    onChange={(e) => setFormData({ ...formData, price_cents: String(Math.round(parseFloat(e.target.value) * 100)) })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Delivery Time</label>
                  <Select value={formData.delivery_time} onValueChange={(value) => setFormData({ ...formData, delivery_time: value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24 hours">24 hours</SelectItem>
                      <SelectItem value="3 days">3 days</SelectItem>
                      <SelectItem value="7 days">7 days</SelectItem>
                      <SelectItem value="14 days">14 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleSaveService} disabled={saving} className="w-full">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editingService ? 'Update Service' : 'Create Service'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Services Table */}
      <Card>
        <CardContent className="p-0">
          {services.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <p>No services yet. Create your first service!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Delivery</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{service.title}</p>
                          {service.game && <p className="text-sm text-muted-foreground">{service.game}</p>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{service.category}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">{formatCurrency(service.price_cents)}</TableCell>
                      <TableCell className="text-sm">{service.delivery_time}</TableCell>
                      <TableCell>
                        <Badge variant={service.is_active ? 'default' : 'outline'}>
                          {service.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(service.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEditClick(service)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteService(service.id)}
                              className="text-red-500"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
