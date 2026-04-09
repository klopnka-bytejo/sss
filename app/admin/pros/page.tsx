'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Trophy, Ban, CheckCircle } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function AdminProsPage() {
  const [pros, setPros] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchPros()
  }, [])

  const fetchPros = async () => {
    try {
      const res = await fetch('/api/admin/pros')
      const data = await res.json()
      setPros(data.pros || [])
    } catch (error) {
      console.error('Failed to fetch PROs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPros = pros.filter((pro: any) =>
    pro.username?.toLowerCase().includes(search.toLowerCase()) ||
    pro.email?.toLowerCase().includes(search.toLowerCase())
  )

  const activePros = pros.filter((p: any) => p.status === 'active').length
  const totalEarnings = pros.reduce((sum: number, p: any) => sum + (p.balance_cents || 0), 0)

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
          <h1 className="text-3xl font-bold">PRO Management</h1>
          <p className="text-muted-foreground">Manage professional sellers on the platform</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total PROs</p>
                  <p className="text-2xl font-bold">{pros.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold">{activePros}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Badge className="h-8 w-8 flex items-center justify-center text-xs">$</Badge>
                <div>
                  <p className="text-sm text-muted-foreground">Total Balance</p>
                  <p className="text-lg font-bold">{formatCurrency(totalEarnings)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search PROs</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search by username or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All PROs</CardTitle>
            <CardDescription>{filteredPros.length} results</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : filteredPros.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No PROs found</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPros.map((pro: any) => (
                      <TableRow key={pro.id}>
                        <TableCell className="font-medium">{pro.username || 'Unknown'}</TableCell>
                        <TableCell className="text-sm">{pro.email}</TableCell>
                        <TableCell>
                          <Badge variant={pro.status === 'active' ? 'default' : 'secondary'}>
                            {pro.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(pro.balance_cents)}</TableCell>
                        <TableCell className="text-sm">
                          {new Date(pro.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            View
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
    </AdminLayout>
  )
}
