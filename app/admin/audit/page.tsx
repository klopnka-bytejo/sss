"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  FileText, 
  Search, 
  Loader2,
  User,
  Package,
  DollarSign,
  Settings,
  Shield,
  AlertTriangle
} from "lucide-react"

interface AuditLog {
  id: string
  action: string
  entity_type: string
  entity_id: string
  user_id: string
  details: Record<string, unknown>
  ip_address?: string
  created_at: string
  profiles?: { username: string; email: string }
}

const actionIcons: Record<string, typeof User> = {
  user: User,
  order: Package,
  payment: DollarSign,
  settings: Settings,
  admin: Shield,
  security: AlertTriangle,
}

const actionColors: Record<string, string> = {
  create: "bg-green-500/10 text-green-500",
  update: "bg-blue-500/10 text-blue-500",
  delete: "bg-red-500/10 text-red-500",
  approve: "bg-green-500/10 text-green-500",
  reject: "bg-red-500/10 text-red-500",
  assign: "bg-purple-500/10 text-purple-500",
  refund: "bg-yellow-500/10 text-yellow-500",
  login: "bg-gray-500/10 text-gray-500",
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [entityFilter, setEntityFilter] = useState("all")

  useEffect(() => {
    fetchLogs()
  }, [])

  async function fetchLogs() {
    try {
      const res = await fetch("/api/admin/audit")
      if (res.ok) {
        const data = await res.json()
        setLogs(data.logs || [])
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = search === "" || 
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(search.toLowerCase()) ||
      log.profiles?.username?.toLowerCase().includes(search.toLowerCase())
    
    const matchesEntity = entityFilter === "all" || log.entity_type === entityFilter

    return matchesSearch && matchesEntity
  })

  const entityTypes = [...new Set(logs.map(l => l.entity_type))]

  function getActionColor(action: string) {
    const key = action.toLowerCase().split("_")[0]
    return actionColors[key] || "bg-gray-500/10 text-gray-500"
  }

  function getEntityIcon(entity: string) {
    const Icon = actionIcons[entity] || FileText
    return Icon
  }

  function formatDetails(details: Record<string, unknown>) {
    if (!details || Object.keys(details).length === 0) return "-"
    
    const entries = Object.entries(details).slice(0, 3)
    return entries.map(([key, value]) => `${key}: ${String(value).substring(0, 30)}`).join(", ")
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
        <div>
          <h1 className="text-2xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground">Track all administrative actions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Total Logs</span>
              </div>
              <p className="text-2xl font-bold">{logs.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-muted-foreground">Orders</span>
              </div>
              <p className="text-2xl font-bold">{logs.filter(l => l.entity_type === "order").length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-green-500" />
                <span className="text-sm text-muted-foreground">Users</span>
              </div>
              <p className="text-2xl font-bold">{logs.filter(l => l.entity_type === "user").length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-muted-foreground">Payments</span>
              </div>
              <p className="text-2xl font-bold">{logs.filter(l => l.entity_type === "payment").length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {entityTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Activity Log
            </CardTitle>
            <CardDescription>
              Showing {filteredLogs.length} of {logs.length} logs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => {
                    const EntityIcon = getEntityIcon(log.entity_type)
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm">
                          <div>
                            {new Date(log.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(log.created_at).toLocaleTimeString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{log.profiles?.username || "System"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getActionColor(log.action)}>
                            {log.action.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <EntityIcon className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm">{log.entity_type}</p>
                              <p className="text-xs text-muted-foreground font-mono">
                                {log.entity_id.substring(0, 8)}...
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                          {formatDetails(log.details)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground font-mono">
                          {log.ip_address || "-"}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
