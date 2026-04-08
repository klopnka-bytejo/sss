"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Search, 
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Scale,
  Package
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Profile, Dispute, DisputeStatus, Order } from "@/lib/types"

interface AdminDisputesContentProps {
  disputes: (Dispute & { 
    order?: Order & { service?: { title: string } }
    opener?: Profile 
  })[]
  admin: Profile
}

const statusConfig: Record<DisputeStatus, { label: string; icon: typeof Clock; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  open: { label: "Open", icon: AlertTriangle, variant: "destructive" },
  under_review: { label: "Under Review", icon: Eye, variant: "default" },
  resolved: { label: "Resolved", icon: CheckCircle, variant: "secondary" },
  closed: { label: "Closed", icon: XCircle, variant: "outline" },
}

export function AdminDisputesContent({ disputes: initialDisputes, admin }: AdminDisputesContentProps) {
  const [disputes, setDisputes] = useState(initialDisputes)
  const [searchQuery, setSearchQuery] = useState("")
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false)
  const [selectedDispute, setSelectedDispute] = useState<typeof initialDisputes[0] | null>(null)
  const [resolution, setResolution] = useState("")

  const filteredDisputes = disputes.filter((dispute) => {
    const matchesSearch = 
      dispute.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.order?.order_number?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleResolve = async () => {
    if (!selectedDispute || !resolution) return

    const supabase = createClient()
    const { error } = await supabase
      .from("disputes")
      .update({ 
        status: "resolved",
        resolution,
        resolved_by: admin.id,
        resolved_at: new Date().toISOString()
      })
      .eq("id", selectedDispute.id)

    if (!error) {
      setDisputes(disputes.map(d => 
        d.id === selectedDispute.id 
          ? { ...d, status: "resolved" as DisputeStatus, resolution, resolved_by: admin.id, resolved_at: new Date().toISOString() } 
          : d
      ))
      setResolveDialogOpen(false)
      setSelectedDispute(null)
      setResolution("")
    }
  }

  const handleUpdateStatus = async (disputeId: string, newStatus: DisputeStatus) => {
    const supabase = createClient()
    const { error } = await supabase
      .from("disputes")
      .update({ status: newStatus })
      .eq("id", disputeId)

    if (!error) {
      setDisputes(disputes.map(d => d.id === disputeId ? { ...d, status: newStatus } : d))
    }
  }

  const openDisputes = disputes.filter(d => d.status === "open" || d.status === "under_review")

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dispute Resolution</h1>
          <p className="text-muted-foreground mt-1">
            Review and resolve order disputes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={openDisputes.length > 0 ? "destructive" : "secondary"}>
            <AlertTriangle className="h-3 w-3 mr-1" />
            {openDisputes.length} Open
          </Badge>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search disputes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-input"
        />
      </div>

      {/* Disputes List */}
      {filteredDisputes.length > 0 ? (
        <div className="space-y-4">
          {filteredDisputes.map((dispute) => {
            const status = statusConfig[dispute.status]
            const StatusIcon = status.icon
            
            return (
              <Card key={dispute.id} className="glass">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-destructive/20">
                        <Scale className="h-5 w-5 text-destructive" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          Order: {dispute.order?.order_number || "Unknown"}
                        </CardTitle>
                        <CardDescription>
                          {dispute.order?.service?.title || "Service"} - Opened {formatDate(dispute.created_at)}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={status.variant}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {status.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Opener */}
                  {dispute.opener && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={dispute.opener.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {(dispute.opener.username || "U").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">Opened by: {dispute.opener.username || dispute.opener.email}</p>
                        <p className="text-xs text-muted-foreground">{dispute.opener.role.toUpperCase()}</p>
                      </div>
                    </div>
                  )}

                  {/* Reason */}
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm font-medium mb-1">Reason:</p>
                    <p className="text-sm text-muted-foreground">{dispute.reason}</p>
                  </div>

                  {/* Resolution (if resolved) */}
                  {dispute.resolution && (
                    <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                      <p className="text-sm font-medium mb-1 text-success">Resolution:</p>
                      <p className="text-sm">{dispute.resolution}</p>
                    </div>
                  )}

                  {/* Actions */}
                  {(dispute.status === "open" || dispute.status === "under_review") && (
                    <div className="flex gap-2 pt-2">
                      {dispute.status === "open" && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleUpdateStatus(dispute.id, "under_review")}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          Take Review
                        </Button>
                      )}
                      <Button 
                        size="sm"
                        onClick={() => {
                          setSelectedDispute(dispute)
                          setResolveDialogOpen(true)
                        }}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Resolve
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUpdateStatus(dispute.id, "closed")}
                      >
                        <XCircle className="mr-1 h-4 w-4" />
                        Close
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="glass">
          <CardContent className="p-12 text-center">
            <Scale className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No disputes found</h3>
            <p className="text-sm text-muted-foreground">
              {disputes.length === 0 
                ? "There are no disputes to review."
                : "No disputes match your search."
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Resolve Dialog */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Dispute</DialogTitle>
            <DialogDescription>
              Provide a resolution for this dispute. This will be visible to both parties.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 rounded-lg bg-muted/50 text-sm">
              <p className="font-medium">Reason: {selectedDispute?.reason}</p>
            </div>
            <Textarea
              placeholder="Enter your resolution..."
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              rows={4}
              className="bg-input"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleResolve} disabled={!resolution.trim()}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Resolve Dispute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
