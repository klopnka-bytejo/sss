'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

const statusColors: Record<string, string> = {
  open: 'bg-red-500/20 text-red-500',
  resolved: 'bg-green-500/20 text-green-500',
  refunded: 'bg-blue-500/20 text-blue-500',
  dismissed: 'bg-gray-500/20 text-gray-500',
}

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDispute, setSelectedDispute] = useState<any | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [resolution, setResolution] = useState('')
  const [action, setAction] = useState<'resolve' | 'refund' | 'dismiss' | null>(null)

  useEffect(() => {
    fetchDisputes()
  }, [])

  const fetchDisputes = async () => {
    try {
      const res = await fetch('/api/admin/disputes')
      const data = await res.json()
      setDisputes(data.disputes || [])
    } catch (error) {
      console.error('Failed to fetch disputes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResolve = async () => {
    if (!selectedDispute || !action) return

    try {
      const res = await fetch(`/api/admin/disputes/${selectedDispute.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, resolution }),
      })

      if (res.ok) {
        setDialogOpen(false)
        setResolution('')
        setAction(null)
        setSelectedDispute(null)
        fetchDisputes()
      }
    } catch (error) {
      console.error('Failed to resolve dispute:', error)
    }
  }

  const openDisputes = disputes.filter((d: any) => d.status === 'open')
  const resolvedDisputes = disputes.filter((d: any) => d.status !== 'open')

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Disputes Management</h1>
          <p className="text-muted-foreground">Resolve customer disputes and handle refunds</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-destructive" />
                <div>
                  <p className="text-sm text-muted-foreground">Open Disputes</p>
                  <p className="text-2xl font-bold">{openDisputes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                  <p className="text-2xl font-bold">{disputes.filter((d: any) => d.status === 'resolved').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <XCircle className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Refunded</p>
                  <p className="text-2xl font-bold">{disputes.filter((d: any) => d.status === 'refunded').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Open Disputes</CardTitle>
            <CardDescription>Disputes requiring action</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading disputes...</p>
            ) : openDisputes.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No open disputes</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {openDisputes.map((dispute: any) => (
                      <TableRow key={dispute.id}>
                        <TableCell className="font-mono text-sm">{dispute.order_number}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{dispute.client_name || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">{dispute.client_email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{formatCurrency(dispute.amount_cents)}</TableCell>
                        <TableCell className="text-sm max-w-xs truncate">{dispute.reason}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[dispute.status] || 'bg-gray-500/20 text-gray-500'}>
                            {dispute.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(dispute.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedDispute(dispute)
                              setDialogOpen(true)
                            }}
                          >
                            Review
                          </Button>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Dispute</DialogTitle>
            <DialogDescription>
              Dispute for order {selectedDispute?.order_number}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Issue</Label>
              <p className="text-sm">{selectedDispute?.reason}</p>
            </div>

            <div>
              <Label>Client Message</Label>
              <p className="text-sm max-h-20 overflow-y-auto">{selectedDispute?.description}</p>
            </div>

            <div>
              <Label htmlFor="resolution">Your Resolution</Label>
              <Textarea
                id="resolution"
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Explain your resolution..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setAction('refund')
                handleResolve()
              }}
            >
              Issue Refund
            </Button>
            <Button
              onClick={() => {
                setAction('resolve')
                handleResolve()
              }}
            >
              Resolve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
