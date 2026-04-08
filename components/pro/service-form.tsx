"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { 
  Loader2, 
  DollarSign,
  Trophy,
  Users,
  Zap,
  ArrowLeft
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Profile, ServiceCategory, PriceType } from "@/lib/types"
import { SUPPORTED_GAMES } from "@/lib/types"

interface ServiceFormProps {
  user: Profile
  service?: {
    id: string
    title: string
    description: string | null
    category: ServiceCategory
    game: string
    price_cents: number
    price_type: PriceType
  }
}

export function ServiceForm({ user, service }: ServiceFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState(service?.title || "")
  const [description, setDescription] = useState(service?.description || "")
  const [category, setCategory] = useState<ServiceCategory>(service?.category || "boosting")
  const [game, setGame] = useState(service?.game || "")
  const [price, setPrice] = useState(service ? (service.price_cents / 100).toString() : "")
  const [priceType, setPriceType] = useState<PriceType>(service?.price_type || "fixed")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const priceCents = Math.round(parseFloat(price) * 100)

    if (isNaN(priceCents) || priceCents <= 0) {
      setError("Please enter a valid price")
      setLoading(false)
      return
    }

    const supabase = createClient()

    if (service) {
      // Update existing service
      const { error: updateError } = await supabase
        .from("services")
        .update({
          title,
          description,
          category,
          game,
          price_cents: priceCents,
          price_type: priceType,
          updated_at: new Date().toISOString(),
        })
        .eq("id", service.id)

      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return
      }
    } else {
      // Create new service
      const { error: insertError } = await supabase
        .from("services")
        .insert({
          pro_id: user.id,
          title,
          description,
          category,
          game,
          price_cents: priceCents,
          price_type: priceType,
        })

      if (insertError) {
        setError(insertError.message)
        setLoading(false)
        return
      }
    }

    router.push("/pro/services")
    router.refresh()
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card className="glass">
        <CardHeader>
          <CardTitle>{service ? "Edit Service" : "Create New Service"}</CardTitle>
          <CardDescription>
            {service
              ? "Update your service details"
              : "Fill in the details to create a new service offering"
            }
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Category Selection */}
            <div className="space-y-3">
              <Label>Service Category</Label>
              <RadioGroup 
                value={category} 
                onValueChange={(v) => setCategory(v as ServiceCategory)}
                className="grid grid-cols-3 gap-3"
              >
                <Label
                  htmlFor="boosting"
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    category === "boosting"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value="boosting" id="boosting" className="sr-only" />
                  <Trophy className="h-6 w-6" />
                  <span className="font-medium text-sm">Boosting</span>
                </Label>
                <Label
                  htmlFor="coaching"
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    category === "coaching"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value="coaching" id="coaching" className="sr-only" />
                  <Users className="h-6 w-6" />
                  <span className="font-medium text-sm">Coaching</span>
                </Label>
                <Label
                  htmlFor="account"
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    category === "account"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value="account" id="account" className="sr-only" />
                  <Zap className="h-6 w-6" />
                  <span className="font-medium text-sm">Account</span>
                </Label>
              </RadioGroup>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Service Title</Label>
              <Input
                id="title"
                placeholder="e.g., Diamond Rank Boost"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="bg-input"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your service in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="bg-input resize-none"
              />
            </div>

            {/* Game */}
            <div className="space-y-2">
              <Label htmlFor="game">Game</Label>
              <Select value={game} onValueChange={setGame} required>
                <SelectTrigger className="bg-input">
                  <SelectValue placeholder="Select a game" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_GAMES.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (USD)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="price"
                    type="number"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    min="0.01"
                    step="0.01"
                    className="pl-9 bg-input"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priceType">Price Type</Label>
                <Select value={priceType} onValueChange={(v) => setPriceType(v as PriceType)}>
                  <SelectTrigger className="bg-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Price</SelectItem>
                    <SelectItem value="hourly">Per Hour</SelectItem>
                    <SelectItem value="per_rank">Per Rank</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {service ? "Update Service" : "Create Service"}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}
