'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Gamepad2, Loader2, AlertCircle, CheckCircle2, Trophy, Zap, Shield } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

const GAMES = [
  { id: 'league-of-legends', name: 'League of Legends' },
  { id: 'valorant', name: 'Valorant' },
  { id: 'wow', name: 'World of Warcraft' },
  { id: 'elden-ring', name: 'Elden Ring' },
  { id: 'cs2', name: 'CS2' },
  { id: 'dota2', name: 'Dota 2' },
]

const COUNTRIES = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 'Spain', 
  'Japan', 'South Korea', 'Brazil', 'Mexico', 'India', 'Other'
]

type FormData = {
  fullName: string
  email: string
  password: string
  discordUsername: string
  gamerTag: string
  games: string[]
  country: string
  customCountry: string
  yearsOfExperience: string
  bio: string
}

export default function BecomeProPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    discordUsername: '',
    gamerTag: '',
    games: [],
    country: '',
    customCountry: '',
    yearsOfExperience: '',
    bio: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const toggleGame = (gameId: string) => {
    console.log('[v0] Toggling game:', gameId)
    setFormData(prev => {
      const newGames = prev.games.includes(gameId)
        ? prev.games.filter(g => g !== gameId)
        : [...prev.games, gameId]
      console.log('[v0] Updated games:', newGames)
      return {
        ...prev,
        games: newGames
      }
    })
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    if (!formData.fullName.trim()) return 'Full name is required'
    if (!formData.email.includes('@')) return 'Valid email is required'
    if (!formData.password || formData.password.length < 8) return 'Password must be at least 8 characters'
    if (!formData.discordUsername.trim()) return 'Discord username is required'
    if (!formData.gamerTag.trim()) return 'Gamer tag is required'
    if (formData.games.length === 0) return 'Select at least one game'
    if (!formData.country) return 'Country/Region is required'
    if (formData.country === 'Other' && !formData.customCountry.trim()) return 'Please specify your country'
    if (!formData.yearsOfExperience) return 'Experience level is required'
    if (formData.bio.trim().length < 20) return 'Bio must be at least 20 characters'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form first
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/become-pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      // Get response as text first
      const text = await res.text()
      
      // Try to parse as JSON
      let data
      try {
        data = JSON.parse(text)
      } catch {
        console.error('[v0] Non-JSON response:', text.substring(0, 200))
        setError('Server error. Please try again later.')
        setLoading(false)
        return
      }

      if (!res.ok) {
        setError(data.message || data.error || 'Application submission failed')
        setLoading(false)
        return
      }

      // Success
      setSuccess(true)
      setLoading(false)
      setTimeout(() => {
        router.push('/')
      }, 3000)
    } catch (err) {
      console.error('[v0] Submit error:', err)
      const errorMsg = err instanceof Error ? err.message : 'An error occurred. Please try again.'
      setError(errorMsg)
      setLoading(false)
    }
  }

      const data = await res.json()
      console.log('[v0] Parsed JSON response:', data)

      if (!res.ok) {
        console.log('[v0] API returned error:', data.error)
        setError(data.error || 'Application submission failed')
        setLoading(false)
        return
      }

      console.log('[v0] Success! Application submitted')
      setSuccess(true)
      setLoading(false)
      setTimeout(() => {
        router.push('/')
      }, 3000)
    } catch (err) {
      console.error('[v0] Caught exception:', err)
      const errorMsg = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMsg)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-10 pb-10 space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full" />
                <CheckCircle2 className="h-16 w-16 text-green-500 relative" />
              </div>
            </div>
            <h2 className="text-2xl font-bold">Application Submitted Successfully!</h2>
            <p className="text-muted-foreground">
              We&apos;ll contact you soon on Discord to complete the application process. Please keep an eye on your Discord messages from our team.
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting to home page in a few seconds...
            </p>
            <Link href="/">
              <Button className="w-full">Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <ThemeToggle />
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <div className="flex items-center justify-center gap-2 text-primary hover:opacity-80 transition">
              <Gamepad2 className="h-6 w-6" />
              <span className="font-bold text-lg">Elevate Gaming</span>
            </div>
          </Link>
          <h1 className="text-4xl font-bold mt-4">Become a PRO</h1>
          <p className="text-xl text-muted-foreground">Join our community of expert gaming service providers</p>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 space-y-2">
              <Trophy className="h-8 w-8 text-primary" />
              <h3 className="font-semibold">Earn Money</h3>
              <p className="text-sm text-muted-foreground">Get paid for your gaming expertise</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 space-y-2">
              <Zap className="h-8 w-8 text-primary" />
              <h3 className="font-semibold">Build Reputation</h3>
              <p className="text-sm text-muted-foreground">Grow your portfolio and get verified</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 space-y-2">
              <Shield className="h-8 w-8 text-primary" />
              <h3 className="font-semibold">Safe Platform</h3>
              <p className="text-sm text-muted-foreground">Secure payments and dispute resolution</p>
            </CardContent>
          </Card>
        </div>

        {/* Application Form */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>PRO Application Form</CardTitle>
            <CardDescription>Fill out all fields to apply for PRO status</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Personal Info */}
              <div className="space-y-4">
                <h3 className="font-semibold">Personal Information</h3>
                
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="Your full name"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This will be your login password once your application is approved
                  </p>
                </div>

                <div>
                  <Label htmlFor="discord">Discord Username *</Label>
                  <Input
                    id="discord"
                    placeholder="YourDiscordTag#1234"
                    value={formData.discordUsername}
                    onChange={(e) => handleInputChange('discordUsername', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">We&apos;ll contact you here during onboarding</p>
                </div>

                <div>
                  <Label htmlFor="gamerTag">Game Username / Gamer Tag *</Label>
                  <Input
                    id="gamerTag"
                    placeholder="Your in-game username"
                    value={formData.gamerTag}
                    onChange={(e) => handleInputChange('gamerTag', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="country">Country / Region *</Label>
                  <Select 
                    value={formData.country} 
                    onValueChange={(value) => {
                      handleInputChange('country', value)
                      if (value !== 'Other') {
                        handleInputChange('customCountry', '')
                      }
                    }}
                  >
                    <SelectTrigger id="country">
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map(country => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.country === 'Other' && (
                    <Input
                      placeholder="Please specify your country"
                      value={formData.customCountry}
                      onChange={(e) => handleInputChange('customCountry', e.target.value)}
                      className="mt-2"
                    />
                  )}
                </div>
              </div>

              {/* Gaming Info */}
              <div className="space-y-4">
                <h3 className="font-semibold">Gaming Information</h3>
                
                <div>
                  <Label>Games You Want to Provide Services For *</Label>
                  <p className="text-xs text-muted-foreground mb-3">Select at least one game</p>
                  <div className="grid grid-cols-2 gap-3">
                    {GAMES.map(game => {
                      const isSelected = formData.games.includes(game.id)
                      return (
                        <button
                          key={game.id}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            toggleGame(game.id)
                          }}
                          className={`p-3 rounded-lg border-2 transition text-left ${
                            isSelected
                              ? 'border-primary bg-primary/10'
                              : 'border-border bg-card/50 hover:border-muted-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              isSelected 
                                ? 'bg-primary border-primary' 
                                : 'border-muted-foreground'
                            }`}>
                              {isSelected && (
                                <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" />
                              )}
                            </div>
                            <span className="text-sm font-medium">{game.name}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <Label htmlFor="experience">Experience Level *</Label>
                  <Select value={formData.yearsOfExperience} onValueChange={(value) => handleInputChange('yearsOfExperience', value)}>
                    <SelectTrigger id="experience">
                      <SelectValue placeholder="Select your experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner (0-1 years)</SelectItem>
                      <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                      <SelectItem value="advanced">Advanced (3-5 years)</SelectItem>
                      <SelectItem value="expert">Expert (5+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Professional Info */}
              <div className="space-y-4">
                <h3 className="font-semibold">Professional Information</h3>
                
                <div>
                  <Label htmlFor="bio">Short Bio / Why do you want to join? *</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself, your skills, and why you want to become a PRO... (minimum 20 characters)"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className="min-h-32"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.bio.length} characters (minimum 20)
                  </p>
                </div>
              </div>

              {/* Terms */}
              <div className="p-4 rounded-lg bg-muted/50 space-y-2 text-sm">
                <p className="font-medium">Before you submit:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>We&apos;ll review your application within 24-48 hours</li>
                  <li>We&apos;ll contact you via Discord to verify your skills and discuss details</li>
                  <li>Upon approval, your PRO profile will be live on our platform</li>
                  <li>You&apos;ll be able to create services and start earning immediately</li>
                </ul>
              </div>
            </CardContent>

            <CardFooter className="flex gap-3">
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full">Cancel</Button>
              </Link>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Questions */}
        <Card>
          <CardHeader>
            <CardTitle>Have Questions?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Check out our <Link href="/faq" className="text-primary hover:underline">FAQ</Link> or{' '}
              <Link href="/support" className="text-primary hover:underline">contact support</Link> for more information.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
