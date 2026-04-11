"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar, Clock, Gamepad2, Monitor, Globe, Save, Loader2, CheckCircle } from "lucide-react"

const daysOfWeek = [
  { id: "monday", label: "Monday" },
  { id: "tuesday", label: "Tuesday" },
  { id: "wednesday", label: "Wednesday" },
  { id: "thursday", label: "Thursday" },
  { id: "friday", label: "Friday" },
  { id: "saturday", label: "Saturday" },
  { id: "sunday", label: "Sunday" },
]

const timeSlots = [
  "00:00", "01:00", "02:00", "03:00", "04:00", "05:00",
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00", "22:00", "23:00",
]

const deliveryMethods = [
  { id: "piloted", label: "Piloted", description: "You play on customer account" },
  { id: "selfplay", label: "Self-Play", description: "Customer plays with your help" },
  { id: "coaching", label: "Coaching", description: "Guide and teach the customer" },
]

const platforms = [
  { id: "pc", label: "PC" },
  { id: "playstation", label: "PlayStation" },
  { id: "xbox", label: "Xbox" },
  { id: "nintendo", label: "Nintendo Switch" },
]

const regions = [
  { id: "na", label: "North America" },
  { id: "eu", label: "Europe" },
  { id: "asia", label: "Asia" },
  { id: "oce", label: "Oceania" },
  { id: "sa", label: "South America" },
]

export default function ProAvailabilityPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [isAvailable, setIsAvailable] = useState(true)
  const [timezone, setTimezone] = useState("UTC")
  const [availability, setAvailability] = useState<Record<string, { enabled: boolean; start: string; end: string }>>({})
  const [selectedMethods, setSelectedMethods] = useState<string[]>([])
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [selectedGames, setSelectedGames] = useState<string[]>([])
  const [games, setGames] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const response = await fetch('/api/pro/availability', {
        credentials: 'include',
      })
      
      if (!response.ok) {
        console.error('[v0] Failed to fetch availability')
        setLoading(false)
        return
      }

      const data = await response.json()
      setGames(data.games || [])

      // Load settings from metadata
      const meta = data.metadata || {}
      setIsAvailable(meta.is_available ?? true)
      setTimezone(meta.timezone ?? "UTC")
      setAvailability(meta.availability ?? {})
      setSelectedMethods(meta.delivery_methods ?? [])
      setSelectedPlatforms(meta.platforms ?? [])
      setSelectedRegions(meta.regions ?? [])
      setSelectedGames(meta.supported_games ?? [])
    } catch (error) {
      console.error('[v0] Error loading availability:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    
    try {
      const response = await fetch('/api/pro/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          is_available: isAvailable,
          timezone,
          availability,
          delivery_methods: selectedMethods,
          platforms: selectedPlatforms,
          regions: selectedRegions,
          supported_games: selectedGames,
        }),
      })

      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (error) {
      console.error('[v0] Error saving availability:', error)
    } finally {
      setSaving(false)
    }
  }

  const toggleDay = (dayId: string) => {
    setAvailability(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        enabled: !prev[dayId]?.enabled,
        start: prev[dayId]?.start || "09:00",
        end: prev[dayId]?.end || "17:00",
      }
    }))
  }

  const updateDayTime = (dayId: string, field: "start" | "end", value: string) => {
    setAvailability(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        [field]: value,
      }
    }))
  }

  const toggleArrayItem = (arr: string[], setArr: (v: string[]) => void, item: string) => {
    if (arr.includes(item)) {
      setArr(arr.filter(i => i !== item))
    } else {
      setArr([...arr, item])
    }
  }

  if (loading) {
    return (
      <AppLayout userRole="pro">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout userRole="pro">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Availability & Schedule</h1>
            <p className="text-muted-foreground">Configure when you can accept orders</p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : saved ? (
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saved ? 'Saved!' : 'Save Changes'}
          </Button>
        </div>

        {/* Availability Toggle */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Availability Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="available" className="text-base">Accept New Orders</Label>
                <p className="text-sm text-muted-foreground">
                  When disabled, you won&apos;t see new available orders
                </p>
              </div>
              <Switch
                id="available"
                checked={isAvailable}
                onCheckedChange={setIsAvailable}
              />
            </div>
            <Badge className={`mt-4 ${isAvailable ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}>
              {isAvailable ? "Currently Available" : "Not Available"}
            </Badge>
          </CardContent>
        </Card>

        {/* Weekly Schedule */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Schedule
            </CardTitle>
            <CardDescription>Set your working hours for each day</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <Label>Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger className="w-64 bg-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                  <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                  <SelectItem value="Europe/London">London (GMT)</SelectItem>
                  <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              {daysOfWeek.map((day) => (
                <div key={day.id} className="flex items-center gap-4 p-3 rounded-lg bg-card/50">
                  <Checkbox
                    id={day.id}
                    checked={availability[day.id]?.enabled ?? false}
                    onCheckedChange={() => toggleDay(day.id)}
                  />
                  <Label htmlFor={day.id} className="w-24 font-medium">{day.label}</Label>
                  
                  {availability[day.id]?.enabled && (
                    <>
                      <Select
                        value={availability[day.id]?.start || "09:00"}
                        onValueChange={(v) => updateDayTime(day.id, "start", v)}
                      >
                        <SelectTrigger className="w-28 bg-input">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-muted-foreground">to</span>
                      <Select
                        value={availability[day.id]?.end || "17:00"}
                        onValueChange={(v) => updateDayTime(day.id, "end", v)}
                      >
                        <SelectTrigger className="w-28 bg-input">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </>
                  )}
                  
                  {!availability[day.id]?.enabled && (
                    <span className="text-sm text-muted-foreground">Not available</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Delivery Methods */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Delivery Methods</CardTitle>
            <CardDescription>Select the types of services you can provide</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {deliveryMethods.map((method) => (
                <div
                  key={method.id}
                  onClick={() => toggleArrayItem(selectedMethods, setSelectedMethods, method.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedMethods.includes(method.id)
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Checkbox checked={selectedMethods.includes(method.id)} />
                    <span className="font-medium">{method.label}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Supported Games */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="h-5 w-5" />
              Supported Games
            </CardTitle>
            <CardDescription>Select games you can boost/coach</CardDescription>
          </CardHeader>
          <CardContent>
            {games.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No games available yet</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {games.map((game) => (
                  <div
                    key={game.id}
                    onClick={() => toggleArrayItem(selectedGames, setSelectedGames, game.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all text-center ${
                      selectedGames.includes(game.id)
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Checkbox checked={selectedGames.includes(game.id)} className="mb-2" />
                    <p className="text-sm font-medium">{game.name}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Platforms */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Platforms
            </CardTitle>
            <CardDescription>Select platforms you can play on</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {platforms.map((platform) => (
                <div
                  key={platform.id}
                  onClick={() => toggleArrayItem(selectedPlatforms, setSelectedPlatforms, platform.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all text-center ${
                    selectedPlatforms.includes(platform.id)
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Checkbox checked={selectedPlatforms.includes(platform.id)} className="mb-2" />
                  <p className="text-sm font-medium">{platform.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Regions */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Regions / Servers
            </CardTitle>
            <CardDescription>Select regions you can play in</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {regions.map((region) => (
                <div
                  key={region.id}
                  onClick={() => toggleArrayItem(selectedRegions, setSelectedRegions, region.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all text-center ${
                    selectedRegions.includes(region.id)
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Checkbox checked={selectedRegions.includes(region.id)} className="mb-2" />
                  <p className="text-sm font-medium">{region.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} size="lg">
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : saved ? (
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saved ? 'Saved!' : 'Save All Changes'}
          </Button>
        </div>
      </div>
    </AppLayout>
  )
}
