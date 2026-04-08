"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { 
  Star, 
  Shield,
  ArrowLeft,
  ShoppingCart,
  MessageSquare,
  Clock,
  CheckCircle,
  Trophy,
  Users,
  Zap,
  Monitor,
  Gamepad2,
  Globe,
  Info,
  Loader2
} from "lucide-react"
import type { Service, ServiceCategory, Review, Profile, ServiceAddon } from "@/lib/types"

interface ServiceDetailContentProps {
  service: Service
  addons: ServiceAddon[]
  reviews: (Review & { client?: Profile })[]
  isLoggedIn: boolean
}

const categoryIcons: Record<ServiceCategory, typeof Trophy> = {
  boosting: Trophy,
  coaching: Users,
  account: Zap,
}

const categoryLabels: Record<ServiceCategory, string> = {
  boosting: "Rank Boosting",
  coaching: "Coaching",
  account: "Account Services",
}

const platformOptions = [
  { value: "pc", label: "PC", icon: Monitor },
  { value: "playstation", label: "PlayStation", icon: Gamepad2 },
  { value: "xbox", label: "Xbox", icon: Gamepad2 },
]

const regionOptions = [
  { value: "na", label: "North America" },
  { value: "eu", label: "Europe" },
  { value: "asia", label: "Asia" },
  { value: "oce", label: "Oceania" },
]

const speedOptions = [
  { value: "normal", label: "Normal", multiplier: 1.0, description: "Standard delivery" },
  { value: "express", label: "Express", multiplier: 1.5, description: "50% faster" },
  { value: "super_express", label: "Super Express", multiplier: 2.0, description: "Priority" },
]

export function ServiceDetailContent({ service, addons, reviews, isLoggedIn }: ServiceDetailContentProps) {
  const router = useRouter()
  const CategoryIcon = categoryIcons[service.category]
  const [addingToCart, setAddingToCart] = useState(false)

  // Dynamic pricing state
  const [currentLevel, setCurrentLevel] = useState(1)
  const [desiredLevel, setDesiredLevel] = useState(10)
  const [platform, setPlatform] = useState("pc")
  const [region, setRegion] = useState("na")
  const [speed, setSpeed] = useState("normal")
  const [selectedAddons, setSelectedAddons] = useState<string[]>([])
  const [requirements, setRequirements] = useState({
    gamertag: "",
    notes: "",
    preferredSchedule: ""
  })

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100)
  }

  // Calculate dynamic price
  const calculatedPrice = useMemo(() => {
    let basePrice = service.price_cents

    // If dynamic pricing (per_rank or per_level)
    if (service.pricing_type === "dynamic" || service.price_type === "per_rank") {
      const levelDiff = Math.max(0, desiredLevel - currentLevel)
      // Price per level/rank
      basePrice = service.price_cents * Math.max(1, levelDiff)
    }

    // Apply speed multiplier
    const speedOption = speedOptions.find(s => s.value === speed)
    if (speedOption) {
      basePrice = Math.round(basePrice * speedOption.multiplier)
    }

    // Add addon prices
    for (const addonId of selectedAddons) {
      const addon = addons.find(a => a.id === addonId)
      if (addon) {
        if (addon.is_percentage) {
          basePrice = Math.round(basePrice * (1 + addon.price_cents / 10000))
        } else {
          basePrice = basePrice + addon.price_cents
        }
      }
    }

    return basePrice
  }, [service, currentLevel, desiredLevel, speed, selectedAddons, addons])

  // Calculate ETA
  const estimatedTime = useMemo(() => {
    const baseHours = 24 // Default 1 day
    let hours = baseHours
    
    if (service.pricing_type === "dynamic" || service.price_type === "per_rank") {
      const levelDiff = Math.max(1, desiredLevel - currentLevel)
      hours = baseHours * levelDiff * 0.5
    }
    
    const speedOption = speedOptions.find(s => s.value === speed)
    if (speedOption) {
      hours = hours / speedOption.multiplier
    }
    
    if (hours < 24) return `${Math.round(hours)} hours`
    const days = Math.ceil(hours / 24)
    return `${days} day${days > 1 ? "s" : ""}`
  }, [service, currentLevel, desiredLevel, speed])

  const isDynamic = service.pricing_type === "dynamic" || service.price_type === "per_rank"

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      router.push(`/auth/login?redirect=/services/${service.id}`)
      return
    }
    
    setAddingToCart(true)
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: service.id,
          selected_options: {
            currentLevel: isDynamic ? currentLevel : undefined,
            desiredLevel: isDynamic ? desiredLevel : undefined,
            platform,
            region,
            speed,
            addons: selectedAddons
          },
          calculated_price_cents: calculatedPrice,
          requirements
        })
      })
      
      if (res.ok) {
        router.push("/cart")
      }
    } catch (error) {
      console.error("Failed to add to cart:", error)
    } finally {
      setAddingToCart(false)
    }
  }

  const handleBuyNow = () => {
    if (!isLoggedIn) {
      router.push(`/auth/login?redirect=/checkout/${service.id}`)
      return
    }
    router.push(`/checkout/${service.id}?level=${currentLevel}&target=${desiredLevel}&platform=${platform}&region=${region}&speed=${speed}&addons=${selectedAddons.join(",")}`)
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      {/* Back Button */}
      <Link href="/services">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Services
        </Button>
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Header */}
          <Card className="glass">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="secondary">
                  <CategoryIcon className="h-3 w-3 mr-1" />
                  {categoryLabels[service.category]}
                </Badge>
                <Badge variant="outline">{service.game}</Badge>
                {isDynamic && (
                  <Badge className="bg-primary/20 text-primary">Dynamic Pricing</Badge>
                )}
              </div>
              <CardTitle className="text-2xl md:text-3xl">{service.title}</CardTitle>
              <CardDescription className="text-base">
                {service.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Usually starts within 1 hour</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>100% Satisfaction Guarantee</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>Secure & Safe</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuration Tabs */}
          <Tabs defaultValue="options" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="options">Options</TabsTrigger>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="options" className="space-y-4 mt-4">
              {/* Dynamic Pricing Options */}
              {isDynamic && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Select Your Progress</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Current Level/Rank</Label>
                        <Input
                          type="number"
                          min={1}
                          max={99}
                          value={currentLevel}
                          onChange={(e) => setCurrentLevel(parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Desired Level/Rank</Label>
                        <Input
                          type="number"
                          min={currentLevel + 1}
                          max={100}
                          value={desiredLevel}
                          onChange={(e) => setDesiredLevel(Math.max(currentLevel + 1, parseInt(e.target.value) || currentLevel + 1))}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Progress Range</Label>
                      <Slider
                        value={[currentLevel, desiredLevel]}
                        min={1}
                        max={100}
                        step={1}
                        onValueChange={(values) => {
                          setCurrentLevel(values[0])
                          setDesiredLevel(Math.max(values[0] + 1, values[1]))
                        }}
                        className="py-4"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Level {currentLevel}</span>
                        <span className="text-primary font-medium">+{desiredLevel - currentLevel} levels</span>
                        <span>Level {desiredLevel}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Platform & Region */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Platform & Region</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Platform</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {platformOptions.map((opt) => (
                        <Button
                          key={opt.value}
                          variant={platform === opt.value ? "default" : "outline"}
                          size="sm"
                          className="justify-start"
                          onClick={() => setPlatform(opt.value)}
                        >
                          <opt.icon className="h-4 w-4 mr-2" />
                          {opt.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Region</Label>
                    <Select value={region} onValueChange={setRegion}>
                      <SelectTrigger>
                        <Globe className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {regionOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Speed Options */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Delivery Speed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {speedOptions.map((opt) => (
                      <div
                        key={opt.value}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                          speed === opt.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => setSpeed(opt.value)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            speed === opt.value ? "border-primary" : "border-muted-foreground"
                          }`}>
                            {speed === opt.value && (
                              <div className="w-2 h-2 rounded-full bg-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{opt.label}</p>
                            <p className="text-xs text-muted-foreground">{opt.description}</p>
                          </div>
                        </div>
                        {opt.multiplier > 1 && (
                          <Badge variant="secondary" className="text-xs">+{(opt.multiplier - 1) * 100}%</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Add-ons */}
              {addons.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Add-ons</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {addons.map((addon) => (
                        <div
                          key={addon.id}
                          className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedAddons.includes(addon.id)
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => {
                            setSelectedAddons(prev =>
                              prev.includes(addon.id)
                                ? prev.filter(id => id !== addon.id)
                                : [...prev, addon.id]
                            )
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox checked={selectedAddons.includes(addon.id)} />
                            <div>
                              <p className="font-medium text-sm">{addon.name}</p>
                              {addon.description && (
                                <p className="text-xs text-muted-foreground">{addon.description}</p>
                              )}
                            </div>
                          </div>
                          <span className="font-medium text-sm text-primary">
                            +{addon.is_percentage 
                              ? `${addon.price_cents / 100}%` 
                              : formatCurrency(addon.price_cents)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="requirements" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Order Requirements</CardTitle>
                  <CardDescription>Fill these out now or later at checkout</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Gamertag / In-Game Name</Label>
                    <Input
                      placeholder="Enter your gamertag"
                      value={requirements.gamertag}
                      onChange={(e) => setRequirements(prev => ({ ...prev, gamertag: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Preferred Schedule (Optional)</Label>
                    <Input
                      placeholder="e.g., Weekends, Evenings EST"
                      value={requirements.preferredSchedule}
                      onChange={(e) => setRequirements(prev => ({ ...prev, preferredSchedule: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Additional Notes</Label>
                    <Textarea
                      placeholder="Any specific instructions..."
                      value={requirements.notes}
                      onChange={(e) => setRequirements(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div className="flex gap-2">
                      <Info className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground">
                        For piloted orders, login credentials will be requested securely after purchase.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b border-border/50 last:border-0 pb-4 last:pb-0">
                          <div className="flex items-center gap-3 mb-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {review.client?.username?.slice(0, 2).toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{review.client?.username || 'Anonymous'}</p>
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < review.rating
                                        ? 'fill-yellow-500 text-yellow-500'
                                        : 'text-muted-foreground'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-sm text-muted-foreground">{review.comment}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-6">
                      No reviews yet. Be the first to try this service!
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar - Purchase Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <Card className="glass border-primary/20 shadow-lg shadow-primary/5">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent pb-3">
                <CardTitle className="flex items-center justify-between text-lg">
                  <span>Order Summary</span>
                  <Zap className="h-5 w-5 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Price Breakdown */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base Price</span>
                    <span>{formatCurrency(service.price_cents)}</span>
                  </div>
                  
                  {isDynamic && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {desiredLevel - currentLevel} levels
                      </span>
                      <span>x{desiredLevel - currentLevel}</span>
                    </div>
                  )}
                  
                  {speed !== "normal" && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {speedOptions.find(s => s.value === speed)?.label}
                      </span>
                      <span className="text-primary">
                        +{((speedOptions.find(s => s.value === speed)?.multiplier || 1) - 1) * 100}%
                      </span>
                    </div>
                  )}
                  
                  {selectedAddons.map((addonId) => {
                    const addon = addons.find(a => a.id === addonId)
                    if (!addon) return null
                    return (
                      <div key={addonId} className="flex justify-between">
                        <span className="text-muted-foreground">{addon.name}</span>
                        <span>+{formatCurrency(addon.price_cents)}</span>
                      </div>
                    )
                  })}
                </div>

                <Separator />

                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(calculatedPrice)}
                  </span>
                </div>

                {/* ETA */}
                <div className="flex items-center justify-center gap-2 p-2 bg-muted/50 rounded-lg">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    ETA: <span className="font-medium">{estimatedTime}</span>
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleBuyNow}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Buy Now
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                  >
                    {addingToCart ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <ShoppingCart className="h-4 w-4 mr-2" />
                    )}
                    Add to Cart
                  </Button>
                </div>

                {/* Guarantees */}
                <div className="pt-2 space-y-1">
                  {[
                    "Secure Payment",
                    "Money-Back Guarantee",
                    "24/7 Support"
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
