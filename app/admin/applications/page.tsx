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
import { CheckCircle, XCircle, Clock, Mail, Globe, Gamepad2, Calendar } from 'lucide-react'

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState<any | null>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/admin/applications')
      const data = await res.json()
      setApplications(data.applications || [])
    } catch (error) {
      console.error('Failed to fetch applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async (appId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`/api/admin/applications/${appId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, admin_notes: adminNotes }),
      })
      if (res.ok) {
        setReviewDialogOpen(false)
        setAdminNotes('')
        setReviewAction(null)
        setSelectedApp(null)
        fetchApplications()
      }
    } catch (error) {
      console.error('Failed to review application:', error)
    }
  }

  const pending = applications.filter((app: any) => app.status === 'pending')
  const approved = applications.filter((app: any) => app.status === 'approved')
  const rejected = applications.filter((app: any) => app.status === 'rejected')

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">PRO Applications</h1>
          <p className="text-muted-foreground">Review and manage PRO applications</p>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pending.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No pending applications
                </CardContent>
              </Card>
            ) : (
              pending.map((app: any) => (
                <ApplicationCard
                  key={app.id}
                  app={app}
                  onReview={() => {
                    setSelectedApp(app)
                    setReviewDialogOpen(true)
                  }}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {approved.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No approved applications
                </CardContent>
              </Card>
            ) : (
              approved.map((app: any) => (
                <ApplicationCard key={app.id} app={app} viewOnly />
              ))
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejected.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No rejected applications
                </CardContent>
              </Card>
            ) : (
              rejected.map((app: any) => (
                <ApplicationCard key={app.id} app={app} viewOnly />
              ))
            )}
          </TabsContent>
        </Tabs>

        <ReviewDialog
          open={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          app={selectedApp}
          adminNotes={adminNotes}
          onAdminNotesChange={setAdminNotes}
          onApprove={() => selectedApp && handleReview(selectedApp.id, 'approve')}
          onReject={() => selectedApp && handleReview(selectedApp.id, 'reject')}
        />
      </div>
    </AdminLayout>
  )
}

function ApplicationCard({ app, onReview, viewOnly }: any) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="font-semibold">{app.full_name}</h3>
              <p className="text-sm text-muted-foreground">{app.email}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Country</p>
                <p className="font-medium flex items-center gap-1">
                  <Globe className="h-3 w-3" /> {app.country}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Discord</p>
                <p className="font-medium">{app.discord_username}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Experience</p>
                <p className="font-medium">{app.years_of_experience || 'N/A'} years</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <Badge className={app.status === 'approved' ? 'bg-green-500/20 text-green-500' : app.status === 'rejected' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'}>
                  {app.status}
                </Badge>
              </div>
            </div>

            {app.games && app.games.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Games</p>
                <div className="flex flex-wrap gap-1">
                  {app.games.map((game: string) => (
                    <Badge key={game} variant="secondary">{game}</Badge>
                  ))}
                </div>
              </div>
            )}

            {app.bio && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Bio</p>
                <p className="text-sm">{app.bio}</p>
              </div>
            )}
          </div>

          {!viewOnly && (
            <Button onClick={onReview} variant="default">
              Review
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ReviewDialog({ open, onOpenChange, app, adminNotes, onAdminNotesChange, onApprove, onReject }: any) {
  if (!app) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review PRO Application</DialogTitle>
          <DialogDescription>Review {app.full_name}&apos;s application</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Full Name</Label>
              <p className="font-medium">{app.full_name}</p>
            </div>
            <div>
              <Label>Email</Label>
              <p className="font-medium">{app.email}</p>
            </div>
            <div>
              <Label>Discord</Label>
              <p className="font-medium">{app.discord_username}</p>
            </div>
            <div>
              <Label>Country</Label>
              <p className="font-medium">{app.country}</p>
            </div>
          </div>

          <div>
            <Label>Admin Notes</Label>
            <Textarea
              value={adminNotes}
              onChange={(e) => onAdminNotesChange(e.target.value)}
              placeholder="Add notes for your decision..."
              rows={4}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onReject}>
            <XCircle className="mr-2 h-4 w-4" />
            Reject
          </Button>
          <Button onClick={onApprove}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
