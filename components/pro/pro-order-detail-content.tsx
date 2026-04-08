"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Gamepad2,
  Clock,
  DollarSign,
  Send,
  CheckCircle,
  AlertTriangle,
  Link as LinkIcon,
  FileText,
  MessageSquare,
  User,
  Shield,
  Play,
  Pause
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { Order, Service, Profile } from "@/lib/types"
import { useRouter } from "next/navigation"

interface OrderMessage {
  id: string
  order_id: string
  sender_id: string
  content: string
  is_system: boolean
  is_blocked: boolean
  created_at: string
}

interface ProOrderDetailContentProps {
  order: Order & { service?: Service; client?: Profile }
  messages: OrderMessage[]
  currentUserId: string
}

const statusColors: Record<string, string> = {
  assigned: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  in_progress: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  pending_review: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  released: "bg-green-500/10 text-green-500 border-green-500/20",
}

const ALLOWED_PROOF_DOMAINS = [
  "drive.google.com",
  "docs.google.com",
  "onedrive.live.com",
  "1drv.ms",
  "dropbox.com",
  "streamable.com",
  "imgur.com",
  "youtube.com",
  "youtu.be",
  "twitch.tv",
  "medal.tv",
]

export function ProOrderDetailContent({ order, messages: initialMessages, currentUserId }: ProOrderDetailContentProps) {
  const [messages, setMessages] = useState(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)
  const [proofDialogOpen, setProofDialogOpen] = useState(false)
  const [proofLink, setProofLink] = useState(order.proof_link || "")
  const [proofNotes, setProofNotes] = useState(order.proof_notes || "")
  const [submittingProof, setSubmittingProof] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim()) return

    setSendingMessage(true)
    try {
      const res = await fetch("/api/orders/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          content: newMessage.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.blocked) {
          alert(data.error)
        } else {
          alert(data.error || "Failed to send message")
        }
        return
      }

      setMessages([...messages, data.message])
      setNewMessage("")
    } finally {
      setSendingMessage(false)
    }
  }

  async function handleStartProgress() {
    setUpdatingStatus(true)
    try {
      const res = await fetch("/api/orders/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          status: "in_progress",
        }),
      })

      if (res.ok) {
        router.refresh()
      }
    } finally {
      setUpdatingStatus(false)
    }
  }

  async function handleSubmitProof() {
    if (!proofLink.trim() || !proofNotes.trim()) {
      alert("Both proof link and summary are required")
      return
    }

    // Validate proof link domain
    try {
      const url = new URL(proofLink)
      const isAllowed = ALLOWED_PROOF_DOMAINS.some(domain => url.hostname.includes(domain))
      if (!isAllowed) {
        alert("Please use an allowed proof hosting service (Google Drive, Dropbox, Streamable, Imgur, YouTube, etc.)")
        return
      }
    } catch {
      alert("Please enter a valid URL")
      return
    }

    setSubmittingProof(true)
    try {
      const res = await fetch("/api/orders/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          proofLink: proofLink.trim(),
          proofNotes: proofNotes.trim(),
        }),
      })

      if (res.ok) {
        setProofDialogOpen(false)
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || "Failed to submit proof")
      }
    } finally {
      setSubmittingProof(false)
    }
  }

  const calculatePayout = () => Math.round(order.total_cents * 0.85)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Badge className={statusColors[order.status] || ""}>
              {order.status.replace(/_/g, " ")}
            </Badge>
            <span className="text-muted-foreground">Order #{order.order_number}</span>
          </div>
          <h1 className="text-2xl font-bold">{order.service?.title || "Service"}</h1>
          <p className="text-muted-foreground">{order.service?.game}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Your Payout</p>
          <p className="text-2xl font-bold text-green-500">{formatCurrency(calculatePayout())}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Delivery Type</p>
                  <p className="font-medium capitalize">{order.service?.delivery_type || "Piloted"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Est. Completion</p>
                  <p className="font-medium">{order.service?.estimated_hours || 24} hours</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Client</p>
                  <p className="font-medium flex items-center gap-1">
                    <User className="h-4 w-4" />
                    Client #{order.order_number}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {order.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Client Notes</p>
                    <p className="text-sm bg-muted/50 rounded-lg p-3">{order.notes}</p>
                  </div>
                </>
              )}

              {/* Requirements - Only show for piloted/selfplay */}
              {order.requirements && Object.keys(order.requirements).length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                      <Shield className="h-4 w-4" />
                      Order Requirements (Confidential)
                    </p>
                    <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
                      {Object.entries(order.requirements).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}:</span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Chat */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Order Chat
              </CardTitle>
              <CardDescription>
                Communicate with the client about the order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] overflow-y-auto border rounded-lg p-4 space-y-3 bg-muted/20">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No messages yet</p>
                    <p className="text-sm">Start the conversation with the client</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_id === currentUserId ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          msg.is_system
                            ? "bg-yellow-500/10 text-yellow-500 text-center w-full"
                            : msg.sender_id === currentUserId
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {msg.is_blocked && (
                          <p className="text-xs text-red-500 mb-1">[Message blocked by moderation]</p>
                        )}
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs opacity-60 mt-1">
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
            <CardFooter>
              <form onSubmit={handleSendMessage} className="flex gap-2 w-full">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  disabled={sendingMessage || order.status === "released"}
                />
                <Button type="submit" disabled={sendingMessage || !newMessage.trim()}>
                  {sendingMessage ? <Spinner className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.status === "assigned" && (
                <Button className="w-full" onClick={handleStartProgress} disabled={updatingStatus}>
                  {updatingStatus ? <Spinner className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                  Start Progress
                </Button>
              )}

              {order.status === "in_progress" && (
                <Dialog open={proofDialogOpen} onOpenChange={setProofDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Submit Completion Proof
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Submit Proof of Completion</DialogTitle>
                      <DialogDescription>
                        Provide proof that the order has been completed successfully.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="proofLink">
                          Proof Link <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="proofLink"
                          value={proofLink}
                          onChange={(e) => setProofLink(e.target.value)}
                          placeholder="https://drive.google.com/..."
                        />
                        <p className="text-xs text-muted-foreground">
                          Allowed: Google Drive, Dropbox, Streamable, Imgur, YouTube
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="proofNotes">
                          Completion Summary <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                          id="proofNotes"
                          value={proofNotes}
                          onChange={(e) => setProofNotes(e.target.value)}
                          placeholder="Describe what was completed, steps taken, and any relevant details..."
                          rows={4}
                        />
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-sm">
                        <p className="font-medium flex items-center gap-1 mb-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          Important
                        </p>
                        <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                          <li>Your payout will be held for 24 hours for review</li>
                          <li>Make sure the proof clearly shows completion</li>
                          <li>Include any final screenshots or recordings</li>
                        </ul>
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={handleSubmitProof}
                        disabled={submittingProof || !proofLink.trim() || !proofNotes.trim()}
                      >
                        {submittingProof ? (
                          <>
                            <Spinner className="h-4 w-4 mr-2" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Submit Proof
                          </>
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {order.status === "pending_review" && (
                <div className="text-center py-4">
                  <Clock className="h-8 w-8 mx-auto text-orange-500 mb-2" />
                  <p className="font-medium">Pending Review</p>
                  <p className="text-sm text-muted-foreground">
                    Your proof is being reviewed. Payout will be released within 24 hours.
                  </p>
                </div>
              )}

              {order.status === "released" && (
                <div className="text-center py-4">
                  <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
                  <p className="font-medium text-green-500">Payout Released!</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(calculatePayout())} has been added to your wallet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Proof Preview (if submitted) */}
          {order.proof_link && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <LinkIcon className="h-4 w-4" />
                  Submitted Proof
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <a
                  href={order.proof_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm break-all"
                >
                  {order.proof_link}
                </a>
                {order.proof_notes && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Summary:</p>
                    <p className="text-sm">{order.proof_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
