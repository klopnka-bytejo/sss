"use client"

import { useState } from "react"
import Link from "next/link"
import { Gamepad2, Mail, MessageCircle, Clock, CheckCircle, Send, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const supportCategories = [
  { value: "order", label: "Order Issues" },
  { value: "payment", label: "Payment & Refunds" },
  { value: "account", label: "Account Help" },
  { value: "technical", label: "Technical Support" },
  { value: "pro", label: "PRO Application" },
  { value: "other", label: "Other" },
]

export default function SupportPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "",
    subject: "",
    message: "",
    orderId: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: formData.category,
          subject: formData.subject,
          message: formData.message,
          orderId: formData.orderId || null,
          email: formData.email,
        }),
      })
      
      if (response.ok) {
        setSubmitted(true)
      } else {
        const data = await response.json()
        alert(data.error || "Failed to submit support ticket")
      }
    } catch (error) {
      alert("Failed to submit support ticket")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Gamepad2 className="h-6 w-6 text-primary" />
            <span>Elevate Gaming</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </Link>
            <Link href="/services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Services
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-4">Contact Support</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Need help? Our support team is here to assist you. Fill out the form below or check our FAQ for quick answers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="md:col-span-2">
              {submitted ? (
                <Card className="glass text-center py-12">
                  <CardContent>
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Message Sent!</h2>
                    <p className="text-muted-foreground mb-6">
                      Thank you for contacting us. We&apos;ll get back to you within 24 hours.
                    </p>
                    <div className="flex gap-4 justify-center">
                      <Button variant="outline" onClick={() => setSubmitted(false)}>
                        Send Another
                      </Button>
                      <Button asChild>
                        <Link href="/">Back to Home</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Send us a Message</CardTitle>
                    <CardDescription>
                      Fill out the form and we&apos;ll respond as soon as possible.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Your Name</Label>
                          <Input
                            id="name"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="bg-input"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            className="bg-input"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Select
                            value={formData.category}
                            onValueChange={(value) => setFormData({ ...formData, category: value })}
                          >
                            <SelectTrigger className="bg-input">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {supportCategories.map((cat) => (
                                <SelectItem key={cat.value} value={cat.value}>
                                  {cat.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="orderId">Order ID (optional)</Label>
                          <Input
                            id="orderId"
                            placeholder="ORD-XXXX"
                            value={formData.orderId}
                            onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                            className="bg-input"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          placeholder="Brief description of your issue"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          required
                          className="bg-input"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          placeholder="Please describe your issue in detail..."
                          rows={6}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          required
                          className="bg-input resize-none"
                        />
                      </div>

                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? (
                          <>Sending...</>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Links */}
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/faq">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      FAQ
                      <ArrowRight className="h-4 w-4 ml-auto" />
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/refund-policy">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Refund Policy
                      <ArrowRight className="h-4 w-4 ml-auto" />
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/terms">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Terms of Service
                      <ArrowRight className="h-4 w-4 ml-auto" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Response Time */}
              <Card className="glass border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Average Response</p>
                      <p className="text-2xl font-bold text-primary">~2 hours</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    During business hours. Weekend responses may take up to 24 hours.
                  </p>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="text-lg">Contact Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">support@elevategaming.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MessageCircle className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Discord</p>
                      <p className="font-medium">discord.gg/elevate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Elevate Gaming. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
