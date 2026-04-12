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
  FileText, 
  CheckCircle, 
  UserCircle, 
  CreditCard, 
  Package, 
  ShieldX, 
  UserX, 
  Scale, 
  RefreshCw, 
  Mail,
  ScrollText
} from "lucide-react"
import Link from "next/link"

const termsContent = [
  {
    icon: CheckCircle,
    title: "Acceptance of Terms",
    content: "By accessing and using Elevate Gaming (\"the Service\"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service. Your continued use of the platform constitutes your acceptance of these terms and any updates we may make."
  },
  {
    icon: Package,
    title: "Description of Service",
    content: "Elevate Gaming is a marketplace platform that connects clients seeking gaming services with professional gamers (\"PROs\") who provide those services. We facilitate transactions but do not directly provide gaming services. Our platform provides secure payment processing, communication tools, and order management features."
  },
  {
    icon: UserCircle,
    title: "User Accounts",
    content: "You must be at least 18 years old to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You agree to notify us immediately of any unauthorized access to your account."
  },
  {
    icon: CreditCard,
    title: "Payments and Fees",
    content: "All payments are processed securely through our payment partners. Funds are held in escrow until service completion. PROs receive 85% of the order total after the 24-hour review period. Clients are charged at the time of order placement, and refunds are processed according to our refund policy."
  },
  {
    icon: Package,
    title: "Service Delivery",
    content: "PROs are independent contractors and are solely responsible for the quality and delivery of their services. Elevate Gaming does not guarantee specific outcomes or results. Service timelines are estimates and may vary based on complexity and PRO availability."
  },
  {
    icon: ShieldX,
    title: "Prohibited Activities",
    content: "Users are prohibited from: sharing contact information to circumvent the platform, engaging in fraudulent or deceptive practices, harassing or abusing other users, violating game publisher terms of service, and money laundering or illegal transactions. Violations may result in immediate account termination."
  },
  {
    icon: UserX,
    title: "Account Termination",
    content: "We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or abuse our platform. Users may also request account deletion at any time through their account settings or by contacting support."
  },
  {
    icon: Scale,
    title: "Limitation of Liability",
    content: "Elevate Gaming is not liable for any damages arising from the use of our service, including but not limited to account bans by game publishers or loss of in-game progress. Our maximum liability is limited to the amount paid for the specific service in question."
  },
  {
    icon: RefreshCw,
    title: "Changes to Terms",
    content: "We may update these terms from time to time. Continued use of the Service after changes constitutes acceptance of the new terms. We will notify users of significant changes via email or platform notification at least 7 days before they take effect."
  },
  {
    icon: Mail,
    title: "Contact",
    content: "For questions about these terms, please contact us at legal@elevategaming.com. Our legal team typically responds within 2-3 business days."
  }
]

export default function TermsPage() {
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
                <ScrollText className="h-3 w-3 mr-1" />
                Legal
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Terms of Service
              </h1>
              <p className="text-xl text-muted-foreground mb-2">
                Please read these terms carefully before using our platform
              </p>
              <p className="text-sm text-muted-foreground">
                Last updated: April 2026
              </p>
            </div>
          </div>
        </section>

        {/* Quick Summary */}
        <section className="py-8">
          <div className="container max-w-4xl">
            <Card className="glass border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Quick Summary</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      These terms govern your use of Elevate Gaming. By using our platform, you agree to follow our guidelines, 
                      use services responsibly, and accept that PROs are independent contractors. We protect your payments with 
                      escrow and provide dispute resolution if issues arise.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Terms Content */}
        <section className="py-8 pb-16">
          <div className="container max-w-4xl">
            <Card className="glass">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Full Terms</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <Accordion type="single" collapsible className="w-full">
                  {termsContent.map((section, index) => (
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
                <h2 className="text-2xl font-bold mb-2">Have Questions?</h2>
                <p className="text-muted-foreground mb-6">
                  Our support team is here to help clarify any terms
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
