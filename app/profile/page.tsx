"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [country, setCountry] = useState("")
  const [timezone, setTimezone] = useState("")

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      console.log('[v0] Profile page: Fetching user profile')
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
      })

      if (!res.ok) {
        console.log('[v0] Profile page: Not authenticated, redirecting')
        router.push('/auth/login')
        return
      }

      const data = await res.json()
      const user = data.user

      if (!user) {
        router.push('/auth/login')
        return
      }

      console.log('[v0] Profile page: User loaded:', user.id)
      setProfile({
        id: user.id,
        display_name: user.display_name || '',
        email: user.email || '',
        avatar_url: user.avatar_url || null,
        role: user.role || 'client',
        bio: user.bio || null,
        country: user.country || null,
        timezone: user.timezone || null,
        created_at: user.created_at || new Date().toISOString(),
      })
      
      setDisplayName(user.display_name || '')
      setBio(user.bio || '')
      setCountry(user.country || '')
      setTimezone(user.timezone || '')

      // Mock stats for now
      setStats({
        totalOrders: 12,
        totalSpent: 29900,
        memberSince: 'January 2024',
      })
    } catch (error) {
      console.error('[v0] Profile page: Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!profile) return
    setSaving(true)

    try {
      console.log('[v0] Profile page: Saving profile')
      const res = await fetch('/api/profile', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: displayName,
          bio,
          country,
          timezone,
        }),
      })

      if (res.ok) {
        console.log('[v0] Profile page: Profile saved successfully')
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch (error) {
      console.error('[v0] Profile page: Error saving profile:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AppLayout breadcrumbs={[{ label: "Profile" }]}>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    )
  }

  if (!profile) {
    return (
      <AppLayout breadcrumbs={[{ label: "Profile" }]}>
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="pt-6">
            <p>Unable to load profile. Please try again or contact support.</p>
          </CardContent>
        </Card>
      </AppLayout>
    )
  }

  return (
    <AppLayout breadcrumbs={[{ label: "Profile" }]} userRole={profile.role as any}>
      <div className="space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback>{profile.display_name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{profile.display_name}</h1>
                <p className="text-muted-foreground">{profile.email}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary" className="capitalize">{profile.role}</Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Verified
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Total Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.totalOrders}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Gamepad2 className="h-4 w-4" />
                  Total Spent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{formatCurrency(stats.totalSpent)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Member Since
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">{stats.memberSince}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Profile Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your display name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Your country"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  placeholder="Your timezone"
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              {saved && (
                <p className="text-sm text-green-600 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Changes saved
                </p>
              )}
              <Button onClick={handleSaveProfile} disabled={saving} className="ml-auto">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
