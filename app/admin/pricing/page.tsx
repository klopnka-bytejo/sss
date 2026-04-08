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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Calculator, Plus, Pencil, Trash2, Loader2 } from "lucide-react"

interface PricingRule {
  id: string
  service_id: string
  rule_name: string
  rule_type: string
  base_value?: number
  multiplier?: number
  min_value?: number
  max_value?: number
  options?: Record<string, number>
  is_active: boolean
  services?: { title: string; game: string }
}

interface Service {
  id: string
  title: string
  game: string
}

const ruleTypes = [
  { value: "per_level", label: "Per Level", description: "Price multiplied by level difference" },
  { value: "per_rank", label: "Per Rank", description: "Price per rank tier" },
  { value: "multiplier", label: "Multiplier", description: "Base price multiplier" },
  { value: "platform", label: "Platform", description: "Platform-based pricing" },
  { value: "region", label: "Region", description: "Region-based pricing" },
  { value: "speed", label: "Speed", description: "Delivery speed multipliers" },
]

export default function AdminPricingPage() {
  const [rules, setRules] = useState<PricingRule[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null)
  const [formData, setFormData] = useState({
    service_id: "",
    rule_name: "",
    rule_type: "per_level",
    base_value: 0,
    multiplier: 1,
    min_value: 1,
    max_value: 100,
    is_active: true,
    options: {} as Record<string, number>
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [rulesRes, servicesRes] = await Promise.all([
        fetch("/api/admin/pricing"),
        fetch("/api/services")
      ])
      
      if (rulesRes.ok) {
        const data = await rulesRes.json()
        setRules(data.rules || [])
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
      const method = editingRule ? "PATCH" : "POST"
      const body = editingRule 
        ? { ...formData, id: editingRule.id }
        : formData

      const res = await fetch("/api/admin/pricing", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        setDialogOpen(false)
        setEditingRule(null)
        resetForm()
        fetchData()
      }
    } catch (error) {
      console.error("Failed to save rule:", error)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this pricing rule?")) return
    
    try {
      const res = await fetch(`/api/admin/pricing?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error("Failed to delete rule:", error)
    }
  }

  function resetForm() {
    setFormData({
      service_id: "",
      rule_name: "",
      rule_type: "per_level",
      base_value: 0,
      multiplier: 1,
      min_value: 1,
      max_value: 100,
      is_active: true,
      options: {}
    })
  }

  function openEditDialog(rule: PricingRule) {
    setEditingRule(rule)
    setFormData({
      service_id: rule.service_id,
      rule_name: rule.rule_name,
      rule_type: rule.rule_type,
      base_value: rule.base_value || 0,
      multiplier: rule.multiplier || 1,
      min_value: rule.min_value || 1,
      max_value: rule.max_value || 100,
      is_active: rule.is_active,
      options: rule.options || {}
    })
    setDialogOpen(true)
  }

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
            <h1 className="text-2xl font-bold">Pricing Rules Engine</h1>
            <p className="text-muted-foreground">Configure dynamic pricing formulas</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) {
              setEditingRule(null)
              resetForm()
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingRule ? "Edit Rule" : "Create Pricing Rule"}</DialogTitle>
                <DialogDescription>
                  Configure how prices are calculated for services
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Service</Label>
                  <Select 
                    value={formData.service_id} 
                    onValueChange={(v) => setFormData(prev => ({ ...prev, service_id: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.game} - {s.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Rule Name</Label>
                  <Input
                    value={formData.rule_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, rule_name: e.target.value }))}
                    placeholder="e.g., Level Price"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Rule Type</Label>
                  <Select 
                    value={formData.rule_type} 
                    onValueChange={(v) => setFormData(prev => ({ ...prev, rule_type: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ruleTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <p>{type.label}</p>
                            <p className="text-xs text-muted-foreground">{type.description}</p>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {(formData.rule_type === "per_level" || formData.rule_type === "per_rank") && (
                  <>
                    <div className="space-y-2">
                      <Label>Price per Unit ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.base_value}
                        onChange={(e) => setFormData(prev => ({ ...prev, base_value: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Min Value</Label>
                        <Input
                          type="number"
                          value={formData.min_value}
                          onChange={(e) => setFormData(prev => ({ ...prev, min_value: parseInt(e.target.value) || 1 }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Max Value</Label>
                        <Input
                          type="number"
                          value={formData.max_value}
                          onChange={(e) => setFormData(prev => ({ ...prev, max_value: parseInt(e.target.value) || 100 }))}
                        />
                      </div>
                    </div>
                  </>
                )}

                {formData.rule_type === "multiplier" && (
                  <div className="space-y-2">
                    <Label>Multiplier</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.multiplier}
                      onChange={(e) => setFormData(prev => ({ ...prev, multiplier: parseFloat(e.target.value) || 1 }))}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
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
                  {editingRule ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Rules</TabsTrigger>
            {ruleTypes.map((type) => (
              <TabsTrigger key={type.value} value={type.value}>{type.label}</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Rule Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rules.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No pricing rules configured yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      rules.map((rule) => (
                        <TableRow key={rule.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{rule.services?.title}</p>
                              <p className="text-xs text-muted-foreground">{rule.services?.game}</p>
                            </div>
                          </TableCell>
                          <TableCell>{rule.rule_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {ruleTypes.find(t => t.value === rule.rule_type)?.label || rule.rule_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {rule.rule_type === "per_level" || rule.rule_type === "per_rank" 
                              ? `$${rule.base_value}/unit`
                              : `${rule.multiplier}x`
                            }
                          </TableCell>
                          <TableCell>
                            <Badge variant={rule.is_active ? "default" : "secondary"}>
                              {rule.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(rule)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(rule.id)}
                              >
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
          </TabsContent>

          {ruleTypes.map((type) => (
            <TabsContent key={type.value} value={type.value} className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    {type.label} Rules
                  </CardTitle>
                  <CardDescription>{type.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>Rule Name</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Range</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rules.filter(r => r.rule_type === type.value).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No {type.label.toLowerCase()} rules configured
                          </TableCell>
                        </TableRow>
                      ) : (
                        rules.filter(r => r.rule_type === type.value).map((rule) => (
                          <TableRow key={rule.id}>
                            <TableCell>{rule.services?.title}</TableCell>
                            <TableCell>{rule.rule_name}</TableCell>
                            <TableCell>
                              {type.value === "per_level" || type.value === "per_rank"
                                ? `$${rule.base_value}/unit`
                                : `${rule.multiplier}x`
                              }
                            </TableCell>
                            <TableCell>
                              {rule.min_value && rule.max_value 
                                ? `${rule.min_value} - ${rule.max_value}`
                                : "-"
                              }
                            </TableCell>
                            <TableCell>
                              <Badge variant={rule.is_active ? "default" : "secondary"}>
                                {rule.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditDialog(rule)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(rule.id)}
                                >
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
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AppLayout>
  )
}
