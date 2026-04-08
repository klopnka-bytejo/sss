"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle,
  User,
  Globe,
  Gamepad2,
  Calendar,
  Mail,
  Phone,
  ExternalLink,
  RefreshCw,
  Eye,
  MessageSquare
} from "lucide-react"

type Application = {
  id: string
  user_id: string
  status: string
  full_name: string
  display_name: string
  email: string
  phone: string | null
  country: string
  timezone: string
  games: string[]
  experience_years: number | null
  experience_hours: number | null
  achievements: string | null
  proof_links: string[]
  gaming_profiles: string[]
  languages: string[]
  admin_notes: string | null
  created_at: string
  reviewed_at: string | null
  user?: {
    full_name: string
    email: string
    avatar_url: string | null
  }
  reviewer?: {
    full_name: string
  }
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  under_review: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  approved: "bg-green-500/10 text-green-500 border-green-500/30",
  rejected: "bg-red-500/10 text-red-500 border-red-500/30",
  more_info_needed: "bg-orange-500/10 text-orange-500 border-orange-500/30",
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [viewDialog, setViewDialog] = useState(false)
  const [actionDialog, setActionDialog] = useState(false)
  const [action, setAction] = useState<string>("")
  const [adminNotes, setAdminNotes] = useState("")
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/applications')
      const data = await res.json()
      setApplications(data.applications || [])
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async () => {
    if (!selectedApp || !action) return
    setProcessing(true)

    try {
      const res = await fetch('/api/admin/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: selectedApp.id,
          action,
          admin_notes: adminNotes,
        }),
      })

      if (res.ok) {
        setActionDialog(false)
        setSelectedApp(null)
        setAdminNotes("")
        fetchApplications()
      }
    } catch (error) {
      console.error('Error processing application:', error)
    } finally {
      setProcessing(false)
    }
  }

  const pendingCount = applications.filter(a => a.status === 'pending').length
  const reviewCount = applications.filter(a => a.status === 'under_review').length
  const approvedCount = applications.filter(a => a.status === 'approved').length
  const rejectedCount = applications.filter(a => a.status === 'rejected').length

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">PRO Applications</h1>
            <p className="text-muted-foreground">Review and manage PRO applications</p>
          </div>
          <Button variant="outline" onClick={fetchApplications}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingCount}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Eye className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{reviewCount}</p>
                  <p className="text-sm text-muted-foreground">Under Review</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{approvedCount}</p>
                  <p className="text-sm text-muted-foreground">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <XCircle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{rejectedCount}</p>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Applications List */}
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
            <TabsTrigger value="under_review">Under Review ({reviewCount})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approvedCount})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedCount})</TabsTrigger>
          </TabsList>

          {['pending', 'under_review', 'approved', 'rejected'].map(tab => (
            <TabsContent key={tab} value={tab} className="space-y-4">
              {loading ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    Loading applications...
                  </CardContent>
                </Card>
              ) : applications.filter(a => a.status === tab).length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No applications found
                  </CardContent>
                </Card>
              ) : (
                applications
                  .filter(a => a.status === tab)
                  .map(app => (
                    <Card key={app.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={statusColors[app.status]}>
                                {app.status.replace('_', ' ')}
                              </Badge>
                              <span className="font-semibold">{app.display_name}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {app.email}
                              </span>
                              <span className="flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                {app.country}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(app.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {app.games?.slice(0, 4).map((game, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  <Gamepad2 className="h-3 w-3 mr-1" />
                                  {game}
                                </Badge>
                              ))}
                              {app.games?.length > 4 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{app.games.length - 4} more
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedApp(app)
                                setViewDialog(true)
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                            {(app.status === 'pending' || app.status === 'under_review') && (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => {
                                    setSelectedApp(app)
                                    setAction('approve')
                                    setActionDialog(true)
                                  }}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setSelectedApp(app)
                                    setAction('reject')
                                    setActionDialog(true)
                                  }}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* View Details Dialog */}
        <Dialog open={viewDialog} onOpenChange={setViewDialog}>
          <DialogContent className="sm:max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
              <DialogDescription>
                {selectedApp?.display_name} - {selectedApp?.email}
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="max-h-[60vh] pr-4">
              {selectedApp && (
                <div className="space-y-6">
                  {/* Personal Info */}
                  <div>
                    <h4 className="font-semibold mb-2">Personal Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Full Name:</span>
                        <p>{selectedApp.full_name}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Display Name:</span>
                        <p>{selectedApp.display_name}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Email:</span>
                        <p>{selectedApp.email}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Phone:</span>
                        <p>{selectedApp.phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Country:</span>
                        <p>{selectedApp.country}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Timezone:</span>
                        <p>{selectedApp.timezone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Gaming Info */}
                  <div>
                    <h4 className="font-semibold mb-2">Gaming Experience</h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-muted-foreground text-sm">Games:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedApp.games?.map((game, i) => (
                            <Badge key={i} variant="secondary">{game}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Experience:</span>
                          <p>{selectedApp.experience_years} years / {selectedApp.experience_hours} hours</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Languages:</span>
                          <p>{selectedApp.languages?.join(', ') || 'Not specified'}</p>
                        </div>
                      </div>
                      {selectedApp.achievements && (
                        <div>
                          <span className="text-muted-foreground text-sm">Achievements:</span>
                          <p className="text-sm mt-1">{selectedApp.achievements}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Links */}
                  {(selectedApp.proof_links?.length > 0 || selectedApp.gaming_profiles?.length > 0) && (
                    <div>
                      <h4 className="font-semibold mb-2">Proof & Profiles</h4>
                      <div className="space-y-2">
                        {selectedApp.proof_links?.map((link, i) => (
                          <a
                            key={i}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {link}
                          </a>
                        ))}
                        {selectedApp.gaming_profiles?.map((profile, i) => (
                          <a
                            key={i}
                            href={profile}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {profile}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Admin Notes */}
                  {selectedApp.admin_notes && (
                    <div>
                      <h4 className="font-semibold mb-2">Admin Notes</h4>
                      <p className="text-sm bg-muted p-3 rounded-lg">{selectedApp.admin_notes}</p>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            <DialogFooter>
              <Button variant="outline" onClick={() => setViewDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Action Dialog */}
        <Dialog open={actionDialog} onOpenChange={setActionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {action === 'approve' ? 'Approve Application' : 'Reject Application'}
              </DialogTitle>
              <DialogDescription>
                {action === 'approve' 
                  ? 'This will upgrade the user to PRO status and enable them to accept orders.'
                  : 'This will reject the application. The user can apply again later.'}
              </DialogDescription>
            </DialogHeader>

            <div>
              <Label>Admin Notes (Optional)</Label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={action === 'approve' 
                  ? "Welcome message or special instructions..."
                  : "Reason for rejection..."}
                className="mt-2"
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setActionDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAction} 
                disabled={processing}
                variant={action === 'approve' ? 'default' : 'destructive'}
              >
                {processing ? 'Processing...' : action === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
