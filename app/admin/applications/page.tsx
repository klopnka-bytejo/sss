'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { CheckCircle, XCircle, Eye, EyeOff, Gamepad2, MessageSquare, Clock, CalendarDays } from 'lucide-react'

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState<any | null>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/applications')
      const data = await res.json()
      setApplications(data.applications || [])
    } catch (err) {
      console.error('Failed to fetch applications:', err)
    } finally {
      setLoading(false)
    }
  }

  const openReview = (app: any) => {
    setSelectedApp(app)
    setAdminNotes('')
    setPassword('')
    setError('')
    setReviewDialogOpen(true)
  }

  const handleReview = async (action: 'approve' | 'reject') => {
    if (!selectedApp) return
    if (action === 'approve' && password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/applications/${selectedApp.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, admin_notes: adminNotes, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Something went wrong.')
        return
      }
      setReviewDialogOpen(false)
      setSelectedApp(null)
      fetchApplications()
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const pending = applications.filter((a) => a.status === 'pending')
  const approved = applications.filter((a) => a.status === 'approved')
  const rejected = applications.filter((a) => a.status === 'rejected')

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">PRO Applications</h1>
          <p className="text-muted-foreground">Review, approve or decline applications to become a PRO</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading applications...</div>
        ) : (
          <Tabs defaultValue="pending" className="w-full">
            <TabsList>
              <TabsTrigger value="pending">
                Pending
                {pending.length > 0 && (
                  <Badge variant="destructive" className="ml-2 h-5 min-w-5 px-1.5 text-xs">{pending.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4 mt-4">
              {pending.length === 0 ? (
                <Card><CardContent className="py-12 text-center text-muted-foreground">No pending applications</CardContent></Card>
              ) : (
                pending.map((app) => (
                  <ApplicationCard key={app.id} app={app} onReview={() => openReview(app)} />
                ))
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-4 mt-4">
              {approved.length === 0 ? (
                <Card><CardContent className="py-12 text-center text-muted-foreground">No approved applications</CardContent></Card>
              ) : (
                approved.map((app) => (
                  <ApplicationCard key={app.id} app={app} viewOnly />
                ))
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4 mt-4">
              {rejected.length === 0 ? (
                <Card><CardContent className="py-12 text-center text-muted-foreground">No rejected applications</CardContent></Card>
              ) : (
                rejected.map((app) => (
                  <ApplicationCard key={app.id} app={app} viewOnly />
                ))
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Review Dialog */}
        {selectedApp && (
          <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Review Application</DialogTitle>
                <DialogDescription>
                  Reviewing application from <strong>{selectedApp.display_name}</strong>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5">
                {/* Applicant details */}
                <div className="rounded-lg border border-border/50 p-4 space-y-3 bg-muted/30">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">Display Name</p>
                      <p className="font-medium">{selectedApp.display_name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">Email</p>
                      <p className="font-medium">{selectedApp.email}</p>
                    </div>
                    {selectedApp.discord && (
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Discord</p>
                        <p className="font-medium">{selectedApp.discord}</p>
                      </div>
                    )}
                    {selectedApp.experience && (
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Experience</p>
                        <p className="font-medium">{selectedApp.experience}</p>
                      </div>
                    )}
                  </div>

                  {selectedApp.games && selectedApp.games.length > 0 && (
                    <div>
                      <p className="text-muted-foreground text-xs mb-2">Games</p>
                      <div className="flex flex-wrap gap-1">
                        {(typeof selectedApp.games === 'string'
                          ? JSON.parse(selectedApp.games)
                          : selectedApp.games
                        ).map((game: string) => (
                          <Badge key={game} variant="secondary" className="text-xs">{game}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedApp.achievements && (
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">Achievements / Bio</p>
                      <p className="text-sm">{selectedApp.achievements}</p>
                    </div>
                  )}
                </div>

                {/* Password field — required for approval */}
                <div className="space-y-2">
                  <Label htmlFor="pro-password">
                    Set Login Password for PRO
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    This password will be given to the applicant so they can log in as a PRO. Required for approval.
                  </p>
                  <div className="relative">
                    <Input
                      id="pro-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError('') }}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Admin notes */}
                <div className="space-y-2">
                  <Label htmlFor="admin-notes">Admin Notes (optional)</Label>
                  <Textarea
                    id="admin-notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Internal notes about this decision..."
                    rows={3}
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
                )}
              </div>

              <DialogFooter className="gap-2 flex-row justify-end">
                <Button variant="outline" onClick={() => setReviewDialogOpen(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleReview('reject')}
                  disabled={submitting}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Decline
                </Button>
                <Button
                  onClick={() => handleReview('approve')}
                  disabled={submitting || password.length < 6}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve & Set Password
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminLayout>
  )
}

function ApplicationCard({ app, onReview, viewOnly }: { app: any; onReview?: () => void; viewOnly?: boolean }) {
  const games = app.games
    ? (typeof app.games === 'string' ? JSON.parse(app.games) : app.games)
    : []

  const statusColor =
    app.status === 'approved'
      ? 'bg-green-500/15 text-green-500 border-green-500/30'
      : app.status === 'rejected'
      ? 'bg-red-500/15 text-red-500 border-red-500/30'
      : 'bg-yellow-500/15 text-yellow-500 border-yellow-500/30'

  return (
    <Card>
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <div>
                {/* display_name is the correct DB column */}
                <h3 className="font-semibold">{app.display_name}</h3>
                <p className="text-sm text-muted-foreground">{app.email}</p>
              </div>
              <Badge className={`ml-auto text-xs border ${statusColor}`}>{app.status}</Badge>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {app.discord && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{app.discord}</span>
                </div>
              )}
              {app.experience && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{app.experience}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                <span>{new Date(app.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {games.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {games.map((game: string) => (
                  <Badge key={game} variant="secondary" className="text-xs">
                    <Gamepad2 className="h-3 w-3 mr-1" />{game}
                  </Badge>
                ))}
              </div>
            )}

            {app.achievements && (
              <p className="text-sm text-muted-foreground line-clamp-2">{app.achievements}</p>
            )}

            {app.admin_notes && viewOnly && (
              <p className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1">
                <span className="font-medium">Admin note:</span> {app.admin_notes}
              </p>
            )}
          </div>

          {!viewOnly && (
            <Button onClick={onReview} size="sm">
              Review
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
