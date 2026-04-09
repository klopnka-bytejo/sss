'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Wallet, CheckCircle, Clock } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-500',
  approved: 'bg-green-500/20 text-green-500',
  rejected: 'bg-red-500/20 text-red-500',
  completed: 'bg-blue-500/20 text-blue-500',
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWithdrawals()
  }, [])

  const fetchWithdrawals = async () => {
    try {
      const res = await fetch('/api/admin/withdrawals')
      const data = await res.json()
      setWithdrawals(data.withdrawals || [])
    } catch (error) {
      console.error('Failed to fetch withdrawals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (withdrawalId: string) => {
    try {
      const res = await fetch(`/api/admin/withdrawals/${withdrawalId}/approve`, {
        method: 'POST',
      })
      if (res.ok) fetchWithdrawals()
    } catch (error) {
      console.error('Failed to approve withdrawal:', error)
    }
  }

  const handleReject = async (withdrawalId: string) => {
    try {
      const res = await fetch(`/api/admin/withdrawals/${withdrawalId}/reject`, {
        method: 'POST',
      })
      if (res.ok) fetchWithdrawals()
    } catch (error) {
      console.error('Failed to reject withdrawal:', error)
    }
  }

  const pendingCount = withdrawals.filter((w: any) => w.status === 'pending').length
  const totalAmount = withdrawals.reduce((sum: number, w: any) => sum + (w.amount_cents || 0), 0)

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
          <h1 className="text-3xl font-bold">Withdrawals Management</h1>
          <p className="text-muted-foreground">Process PRO payout requests</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{pendingCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{withdrawals.filter((w: any) => w.status === 'completed').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Wallet className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-lg font-bold">{formatCurrency(totalAmount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Withdrawal Requests</CardTitle>
            <CardDescription>{withdrawals.length} total requests</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : withdrawals.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No withdrawals</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PRO Name</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Bank Account</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawals.map((withdrawal: any) => (
                      <TableRow key={withdrawal.id}>
                        <TableCell className="font-medium">{withdrawal.pro_name || 'Unknown'}</TableCell>
                        <TableCell>{formatCurrency(withdrawal.amount_cents)}</TableCell>
                        <TableCell className="text-sm font-mono">****{withdrawal.account_last_four}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[withdrawal.status] || 'bg-gray-500/20'}>
                            {withdrawal.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(withdrawal.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {withdrawal.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleReject(withdrawal.id)}>
                                Reject
                              </Button>
                              <Button size="sm" onClick={() => handleApprove(withdrawal.id)}>
                                Approve
                              </Button>
                            </div>
                          )}
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
    </AdminLayout>
  )
}
