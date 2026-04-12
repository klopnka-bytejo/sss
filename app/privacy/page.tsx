"use client"

import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Shield, 
  Database, 
  Settings, 
  Share2, 
  Lock, 
  UserCheck, 
  Cookie, 
  ExternalLink, 
  Users, 
  RefreshCw, 
  Mail,
  Eye
} from "lucide-react"
import Link from "next/link"

const privacyContent = [
  {
    icon: Database,
    title: "Information We Collect",
    content: "We collect information you provide directly, including email address, username, payment information, and any content you submit through our platform. We also collect usage data such as IP addresses, browser type, device information, and pages visited to improve our services."
  },
  {
    icon: Settings,
    title: "How We Use Your Information",
    content: "We use your information to: provide and improve our services, process transactions and send related information, communicate with you about orders and updates, detect and prevent fraud, personalize your experience, and comply with legal obligations."
  },
  {
    icon: Share2,
    title: "Information Sharing",
    content: "We do not sell your personal information. We may share information with service providers who assist in operating our platform (payment processors, cloud hosting), with PROs necessary to fulfill your orders, or when required by law. All third parties are bound by confidentiality agreements."
  },
  {
    icon: Lock,
    title: "Data Security",
    content: "We implement industry-standard security measures including 256-bit SSL encryption, secure servers, regular security audits, and two-factor authentication options to protect your data. We regularly review and update our security practices to address new threats."
  },
  {
    icon: UserCheck,
    title: "Your Rights",
    content: "You have the right to access, correct, or delete your personal data. You can export your data, opt out of marketing communications, and request information about how your data is used. Contact us at privacy@elevategaming.com to exercise these rights."
  },
  {
    icon: Cookie,
    title: "Cookies",
    content: "We use cookies to improve your experience, analyze site traffic, and personalize content. Essential cookies are required for the platform to function. You can control optional cookies through your browser settings or our cookie preferences panel."
  },
  {
    icon: ExternalLink,
    title: "Third-Party Links",
    content: "Our service may contain links to third-party websites including game publishers, streaming platforms, and payment providers. We are not responsible for their privacy practices. We encourage you to review their privacy policies before providing any personal information."
  },
  {
    icon: Users,
    title: "Children's Privacy",
    content: "Our service is not intended for users under 18. We do not knowingly collect information from children. If we discover we have collected data from a minor, we will delete it immediately and terminate the associated account."
  },
  {
    icon: RefreshCw,
    title: "Changes to This Policy",
    content: "We may update this policy periodically to reflect changes in our practices or legal requirements. We will notify you of significant changes via email or platform notification at least 14 days before they take effect."
  },
  {
    icon: Mail,
    title: "Contact Us",
    content: "For privacy-related questions, concerns, or to exercise your data rights, contact our Privacy Team at privacy@elevategaming.com. We aim to respond to all privacy inquiries within 48 hours."
  }
]

const dataCategories = [
  { label: "Account Info", description: "Email, username, profile" },
  { label: "Payment Data", description: "Processed by Stripe" },
  { label: "Usage Data", description: "Pages visited, features used" },
  { label: "Communications", description: "Support tickets, messages" }
]

export default function PrivacyPage() {
  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
          <div className="container relative">
            <div className="max-w-3xl mx-auto text-center">
              <Badge variant="outline" className="mb-4">
                <Eye className="h-3 w-3 mr-1" />
                Privacy
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Privacy Policy
              </h1>
              <p className="text-xl text-muted-foreground mb-2">
                Your privacy matters to us. Here&apos;s how we protect it.
              </p>
              <p className="text-sm text-muted-foreground">
                Last updated: April 2026
              </p>
            </div>
          </div>
        </section>

        {/* Data Overview */}
        <section className="py-8">
          <div className="container max-w-4xl">
            <Card className="glass border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Our Commitment</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      We collect only what we need, protect it with industry-standard security, and never sell your data. 
                      You have full control over your information.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {dataCategories.map((category, index) => (
                    <div key={index} className="p-3 rounded-xl bg-secondary/30 text-center">
                      <p className="font-medium text-sm">{category.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{category.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Privacy Content */}
        <section className="py-8 pb-16">
          <div className="container max-w-4xl">
            <Card className="glass">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Full Policy</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <Accordion type="single" collapsible className="w-full">
                  {privacyContent.map((section, index) => (
                    <AccordionItem key={index} value={`section-${index}`}>
                      <AccordionTrigger className="text-left hover:no-underline">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-secondary/50">
                            <section.icon className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium">{index + 1}. {section.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pl-12 pr-4 leading-relaxed">
                        {section.content}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            {/* Contact Section */}
            <Card className="mt-10 glass border-primary/20 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
              <CardContent className="relative p-8 text-center">
                <h2 className="text-2xl font-bold mb-2">Privacy Questions?</h2>
                <p className="text-muted-foreground mb-6">
                  Our team is ready to help with any privacy concerns
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild>
                    <Link href="/support">Contact Support</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/faq">View FAQ</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </AppLayout>
  )
}
