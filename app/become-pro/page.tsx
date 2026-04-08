"use client"

import { useState } from "react"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Trophy, 
  DollarSign, 
  Clock, 
  Shield, 
  Users, 
  Zap,
  CheckCircle,
  Star,
  ArrowRight,
  Gamepad2,
  Wallet,
  BadgeCheck
} from "lucide-react"

const benefits = [
  {
    icon: DollarSign,
    title: "Earn 85% Commission",
    description: "Keep the majority of your earnings. No hidden fees."
  },
  {
    icon: Clock,
    title: "Flexible Schedule",
    description: "Work when you want. Set your own availability."
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Get paid reliably within 24-48 hours of completion."
  },
  {
    icon: Users,
    title: "Growing Community",
    description: "Join thousands of PROs serving gamers worldwide."
  },
  {
    icon: Zap,
    title: "Instant Orders",
    description: "Get matched with clients looking for your skills."
  },
  {
    icon: Trophy,
    title: "Build Your Brand",
    description: "Grow your reputation and get more clients."
  }
]

const requirements = [
  "High skill level in at least one supported game",
  "Reliable internet connection",
  "Ability to complete orders in a timely manner",
  "Professional and respectful communication",
  "Must be 18 years or older",
  "Valid ID for verification"
]

const games = [
  "Call of Duty",
  "World of Warcraft", 
  "Fortnite",
  "Destiny 2",
  "EA FC 26",
  "Battlefield",
  "Elden Ring",
  "Arc Raiders"
]

export default function BecomeProPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    email: "",
    displayName: "",
    discord: "",
    selectedGames: [] as string[],
    experience: "",
    achievements: "",
    agreeTerms: false,
    agreeAge: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const toggleGame = (game: string) => {
    setFormData(prev => ({
      ...prev,
      selectedGames: prev.selectedGames.includes(game)
        ? prev.selectedGames.filter(g => g !== game)
        : [...prev.selectedGames, game]
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/pro/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          displayName: formData.displayName,
          discord: formData.discord || null,
          games: formData.selectedGames,
          experience: formData.experience,
          achievements: formData.achievements,
          acceptedTerms: formData.agreeTerms,
          acceptedAge: formData.agreeAge,
        }),
      })
      
      if (response.ok) {
        setSubmitted(true)
      } else {
        const data = await response.json()
        alert(data.error || "Failed to submit application")
      }
    } catch (error) {
      alert("Failed to submit application")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center py-16">
          <Card className="max-w-lg mx-auto glass text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
              <p className="text-muted-foreground mb-6">
                Thanks for applying to become a PRO! We&apos;ll review your application and get back to you within 24-48 hours.
              </p>
              <Button asChild>
                <a href="/">Return Home</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
          <div className="container relative">
            <div className="max-w-3xl mx-auto text-center">
              <Badge variant="outline" className="mb-4">
                <Trophy className="h-3 w-3 mr-1" />
                Join Our Team
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Become a <span className="text-primary">PRO</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Turn your gaming skills into income. Join thousands of PROs earning money doing what they love.
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">85%</div>
                  <div className="text-xs text-muted-foreground">Commission</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">$5K+</div>
                  <div className="text-xs text-muted-foreground">Top Earners</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">24h</div>
                  <div className="text-xs text-muted-foreground">Fast Payouts</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-12 border-y border-border/50">
          <div className="container">
            <h2 className="text-2xl font-bold text-center mb-8">Why Become a PRO?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {benefits.map((benefit) => (
                <Card key={benefit.title} className="glass">
                  <CardContent className="p-6">
                    <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                      <benefit.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Application Form */}
        <section className="py-12">
          <div className="container max-w-2xl">
            <Card className="glass">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge>{step}/3</Badge>
                  <span className="text-sm text-muted-foreground">
                    {step === 1 ? "Basic Info" : step === 2 ? "Gaming Profile" : "Review & Submit"}
                  </span>
                </div>
                <CardTitle>PRO Application</CardTitle>
                <CardDescription>
                  Fill out the form below to apply. Applications are reviewed within 24-48 hours.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {step === 1 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        placeholder="Your PRO name"
                        value={formData.displayName}
                        onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                      />
                      <p className="text-xs text-muted-foreground">This is how clients will see you</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discord">Discord Username</Label>
                      <Input
                        id="discord"
                        placeholder="username#1234"
                        value={formData.discord}
                        onChange={(e) => setFormData(prev => ({ ...prev, discord: e.target.value }))}
                      />
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => setStep(2)}
                      disabled={!formData.email || !formData.displayName}
                    >
                      Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="space-y-2">
                      <Label>Select Your Games</Label>
                      <p className="text-xs text-muted-foreground mb-3">Choose the games you want to offer services for</p>
                      <div className="grid grid-cols-2 gap-2">
                        {games.map((game) => (
                          <Button
                            key={game}
                            type="button"
                            variant={formData.selectedGames.includes(game) ? "default" : "outline"}
                            className="justify-start h-auto py-3"
                            onClick={() => toggleGame(game)}
                          >
                            <Gamepad2 className="h-4 w-4 mr-2" />
                            {game}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experience">Gaming Experience</Label>
                      <Textarea
                        id="experience"
                        placeholder="Tell us about your gaming experience, ranks achieved, years played..."
                        value={formData.experience}
                        onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="achievements">Notable Achievements</Label>
                      <Textarea
                        id="achievements"
                        placeholder="Tournament wins, high ranks, speedruns, etc."
                        value={formData.achievements}
                        onChange={(e) => setFormData(prev => ({ ...prev, achievements: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setStep(1)}>
                        Back
                      </Button>
                      <Button 
                        className="flex-1" 
                        onClick={() => setStep(3)}
                        disabled={formData.selectedGames.length === 0 || !formData.experience}
                      >
                        Continue <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}

                {step === 3 && (
                  <>
                    <div className="space-y-4 p-4 rounded-lg bg-muted/30 border border-border/50">
                      <h3 className="font-semibold">Application Summary</h3>
                      <div className="grid gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span>{formData.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Display Name:</span>
                          <span>{formData.displayName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Discord:</span>
                          <span>{formData.discord || "Not provided"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Games:</span>
                          <span>{formData.selectedGames.length} selected</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold">Requirements</h3>
                      <ul className="space-y-2">
                        {requirements.map((req, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="agreeTerms"
                          checked={formData.agreeTerms}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({ ...prev, agreeTerms: checked as boolean }))
                          }
                        />
                        <label htmlFor="agreeTerms" className="text-sm text-muted-foreground cursor-pointer">
                          I agree to the <a href="/terms" className="text-primary underline">Terms of Service</a> and <a href="/pro-guidelines" className="text-primary underline">PRO Guidelines</a>
                        </label>
                      </div>
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="agreeAge"
                          checked={formData.agreeAge}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({ ...prev, agreeAge: checked as boolean }))
                          }
                        />
                        <label htmlFor="agreeAge" className="text-sm text-muted-foreground cursor-pointer">
                          I confirm that I am 18 years of age or older
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setStep(2)}>
                        Back
                      </Button>
                      <Button 
                        className="flex-1" 
                        onClick={handleSubmit}
                        disabled={!formData.agreeTerms || !formData.agreeAge || isSubmitting}
                      >
                        {isSubmitting ? "Submitting..." : "Submit Application"}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-12 border-t border-border/50">
          <div className="container max-w-4xl">
            <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <BadgeCheck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">1. Apply & Get Verified</h3>
                <p className="text-sm text-muted-foreground">
                  Submit your application and complete our verification process
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">2. Accept Orders</h3>
                <p className="text-sm text-muted-foreground">
                  Browse available orders and accept the ones that match your skills
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">3. Get Paid</h3>
                <p className="text-sm text-muted-foreground">
                  Complete orders and withdraw your earnings within 24-48 hours
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  )
}
