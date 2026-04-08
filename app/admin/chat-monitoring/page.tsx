"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { 
  MessageSquare, 
  AlertTriangle, 
  Search, 
  Eye, 
  Shield,
  Loader2,
  Ban,
  User
} from "lucide-react"

interface ModerationLog {
  id: string
  order_id: string
  user_id: string
  blocked_content: string
  matched_words: string[]
  severity: string
  created_at: string
  profiles?: {
    display_name: string
    role: string
  }
}

interface FlaggedChat {
  order_id: string
  blocked_count: number
  last_blocked_at: string
  order?: {
    status: string
    service_title: string
  }
}

export default function AdminChatMonitoringPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<{ role: string } | null>(null)
  const [moderationLogs, setModerationLogs] = useState<ModerationLog[]>([])
  const [flaggedChats, setFlaggedChats] = useState<FlaggedChat[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [stats, setStats] = useState({
    totalBlocked: 0,
    todayBlocked: 0,
    flaggedChats: 0,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push("/auth/login")
      return
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileData?.role !== "admin") {
      router.push("/dashboard")
      return
    }

    setProfile(profileData)

    // Load moderation logs
    const { data: logs } = await supabase
      .from("moderation_logs")
      .select(`
        *,
        profiles:user_id (display_name, role)
      `)
      .order("created_at", { ascending: false })
      .limit(100)

    setModerationLogs(logs || [])

    // Calculate flagged chats (orders with multiple blocked messages)
    const orderCounts: Record<string, { count: number; lastAt: string }> = {}
    logs?.forEach(log => {
      if (!orderCounts[log.order_id]) {
        orderCounts[log.order_id] = { count: 0, lastAt: log.created_at }
      }
      orderCounts[log.order_id].count++
      if (new Date(log.created_at) > new Date(orderCounts[log.order_id].lastAt)) {
        orderCounts[log.order_id].lastAt = log.created_at
      }
    })

    const flagged = Object.entries(orderCounts)
      .filter(([, data]) => data.count >= 2)
      .map(([order_id, data]) => ({
        order_id,
        blocked_count: data.count,
        last_blocked_at: data.lastAt,
      }))
      .sort((a, b) => b.blocked_count - a.blocked_count)

    setFlaggedChats(flagged)

    // Calculate stats
    const today = new Date().toISOString().split("T")[0]
    const todayLogs = logs?.filter(l => l.created_at.startsWith(today)) || []
    
    setStats({
      totalBlocked: logs?.length || 0,
      todayBlocked: todayLogs.length,
      flaggedChats: flagged.length,
    })

    setLoading(false)
  }

  const filteredLogs = moderationLogs.filter(log => 
    log.blocked_content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.matched_words?.some(w => w.toLowerCase().includes(searchQuery.toLowerCase())) ||
    log.order_id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    )
  }

  if (!profile || profile.role !== "admin") {
    return null
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Chat Monitoring
          </h1>
          <p className="text-muted-foreground">Monitor and review blocked messages and flagged chats</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Blocked</p>
                  <p className="text-2xl font-bold">{stats.totalBlocked}</p>
                </div>
                <Ban className="h-8 w-8 text-red-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Blocked Today</p>
                  <p className="text-2xl font-bold">{stats.todayBlocked}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Flagged Chats</p>
                  <p className="text-2xl font-bold text-red-500">{stats.flaggedChats}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-red-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="logs">
          <TabsList className="bg-card/50">
            <TabsTrigger value="logs">Moderation Logs</TabsTrigger>
            <TabsTrigger value="flagged">
              Flagged Chats
              {flaggedChats.length > 0 && (
                <Badge variant="destructive" className="ml-2">{flaggedChats.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="logs" className="mt-4">
            <Card className="glass">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Blocked Messages</CardTitle>
                    <CardDescription>Messages that were blocked by auto-moderation</CardDescription>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search logs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 bg-input"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredLogs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No blocked messages found</p>
                ) : (
                  <div className="space-y-3">
                    {filteredLogs.map((log) => (
                      <div key={log.id} className="p-4 rounded-lg bg-card/50 border border-red-500/20">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">
                                {log.profiles?.display_name || "Unknown User"}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {log.profiles?.role || "unknown"}
                              </Badge>
                            </div>
                            
                            <div className="p-3 rounded bg-red-500/10 border border-red-500/20">
                              <p className="text-sm font-mono break-all">{log.message_content}</p>
                            </div>
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Order: {log.order_id.slice(0, 8)}...</span>
                              <span>Reason: {log.blocked_reason}</span>
                              {log.matched_pattern && (
                                <Badge variant="destructive" className="text-xs">
                                  Pattern: {log.matched_pattern}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right shrink-0">
                            <p className="text-xs text-muted-foreground">
                              {new Date(log.created_at).toLocaleString()}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2"
                              onClick={() => router.push(`/admin/orders?id=${log.order_id}`)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Order
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="flagged" className="mt-4">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Flagged Chats</CardTitle>
                <CardDescription>Orders with multiple blocked message attempts</CardDescription>
              </CardHeader>
              <CardContent>
                {flaggedChats.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No flagged chats</p>
                ) : (
                  <div className="space-y-3">
                    {flaggedChats.map((chat) => (
                      <div key={chat.order_id} className="p-4 rounded-lg bg-card/50 flex items-center justify-between">
                        <div>
                          <p className="font-medium">Order #{chat.order_id.slice(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">
                            Last incident: {new Date(chat.last_blocked_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="destructive">
                            {chat.blocked_count} violations
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/admin/orders?id=${chat.order_id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
