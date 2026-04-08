"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Star,
  Gamepad2,
  Package,
  Save,
  Loader2,
  CheckCircle2
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface Profile {
  id: string
  display_name: string
  email: string
  avatar_url: string | null
  role: string
  bio: string | null
  country: string | null
  timezone: string | null
  created_at: string
}

interface Stats {
  totalOrders: number
  totalSpent: number
  memberSince: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [country, setCountry] = useState("")
  const [timezone, setTimezone] = useState("")

  const supabase = createClient()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileData) {
      setProfile(profileData)
      setDisplayName(profileData.display_name || "")
      setBio(profileData.bio || "")
      setCountry(profileData.country || "")
      setTimezone(profileData.timezone || "")
    }

    // Get stats
    const { count: ordersCount } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("client_id", user.id)

    const { data: ordersData } = await supabase
      .from("orders")
      .select("total_cents")
      .eq("client_id", user.id)
      .eq("payment_status", "paid")

    const totalSpent = ordersData?.reduce((sum, o) => sum + (o.total_cents || 0), 0) || 0

    setStats({
      totalOrders: ordersCount || 0,
      totalSpent,
      memberSince: profileData?.created_at || new Date().toISOString(),
    })

    setLoading(false)
  }

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        bio,
        country,
        timezone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id)

    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">Manage your account information</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="glass lg:col-span-1">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="text-2xl bg-primary/20 text-primary">
                    {profile?.display_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">{profile?.display_name || "Player"}</h2>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
                <Badge className="mt-2 bg-primary/20 text-primary">
                  {profile?.role === "pro" ? "PRO" : "Client"}
                </Badge>
                
                {profile?.bio && (
                  <p className="mt-4 text-sm text-muted-foreground">{profile.bio}</p>
                )}

                <div className="w-full mt-6 pt-6 border-t border-border/50 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Member Since
                    </span>
                    <span>
                      {stats?.memberSince 
                        ? new Date(stats.memberSince).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Total Orders
                    </span>
                    <span>{stats?.totalOrders || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Total Spent
                    </span>
                    <span className="text-primary">
                      {formatCurrency(stats?.totalSpent || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Profile */}
          <Card className="glass lg:col-span-2">
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>Update your profile information</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="general">
                <TabsList className="mb-6">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="preferences">Preferences</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Display Name</Label>
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your display name"
                      className="bg-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      value={profile?.email || ""}
                      disabled
                      className="bg-input opacity-50"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed here
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Bio</Label>
                    <Textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      className="bg-input resize-none"
                      rows={3}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="preferences" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Your country"
                      className="bg-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Input
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      placeholder="e.g., America/New_York"
                      className="bg-input"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex items-center gap-3 mt-6 pt-6 border-t border-border/50">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : saved ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Saved!
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
