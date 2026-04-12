"use client"

import { AppLayout } from "@/components/app-layout"
import { ClientHeader } from "@/components/client-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HelpCircle, Shield, CreditCard, Clock, Users, MessageSquare } from "lucide-react"
import Link from "next/link"

const faqCategories = [
  {
    title: "Getting Started",
    icon: HelpCircle,
    faqs: [
      {
        question: "How does Elevate Gaming work?",
        answer: "Elevate Gaming connects you with verified professional gamers (PROs) who can help you achieve your gaming goals. Browse services, choose what you need, pay securely, and get your order completed by a skilled PRO. All transactions are protected and funds are held until the service is completed."
      },
      {
        question: "How do I create an account?",
        answer: "Click the 'Sign Up' button in the top right corner. You can register with your email address. Once registered, you can browse services, make purchases, and track your orders from your dashboard."
      },
      {
        question: "What games do you support?",
        answer: "We currently support Call of Duty, World of Warcraft, Fortnite, Destiny 2, EA FC 26, Battlefield, Elden Ring, and Arc Raiders. We're constantly adding new games based on demand."
      },
      {
        question: "Is my account information safe?",
        answer: "Yes! We never store your game login credentials on our servers. When account access is needed, PROs use secure methods and your information is deleted immediately after service completion. We also recommend enabling 2FA on your gaming accounts."
      }
    ]
  },
  {
    title: "Orders & Services",
    icon: Clock,
    faqs: [
      {
        question: "How long does an order take?",
        answer: "Delivery time varies by service type. Most boosting services are completed within 1-7 days depending on the scope. Coaching sessions are scheduled at your convenience. Each service listing shows an estimated completion time."
      },
      {
        question: "Can I track my order progress?",
        answer: "Yes! Once your order is accepted by a PRO, you can track progress in real-time from your Orders page. You'll also receive notifications when there are updates to your order status."
      },
      {
        question: "What if I need to cancel my order?",
        answer: "You can request a cancellation before a PRO accepts your order for a full refund. Once work has started, cancellations are handled on a case-by-case basis. Contact support if you need assistance."
      },
      {
        question: "Can I communicate with my PRO?",
        answer: "Yes! Each order has a built-in chat system where you can communicate directly with your assigned PRO. This keeps all communication secure and on-platform."
      }
    ]
  },
  {
    title: "Payments & Pricing",
    icon: CreditCard,
    faqs: [
      {
        question: "What payment methods do you accept?",
        answer: "We accept major credit/debit cards (Visa, Mastercard, Amex), PayPal, and cryptocurrency (Bitcoin, Ethereum, USDT). All payments are processed securely."
      },
      {
        question: "When is payment taken?",
        answer: "Payment is taken when you place your order. The funds are held securely until the service is completed. After completion, there's a 24-hour review period before the PRO receives payment."
      },
      {
        question: "Are there any hidden fees?",
        answer: "No hidden fees! The price you see is the price you pay. Optional add-ons like priority queue or livestreaming are clearly marked with their prices before checkout."
      },
      {
        question: "Do you offer refunds?",
        answer: "Yes, we have a buyer protection policy. If your order cannot be completed or there's an issue with the service, you're eligible for a full or partial refund. See our refund policy for details."
      }
    ]
  },
  {
    title: "Safety & Security",
    icon: Shield,
    faqs: [
      {
        question: "Is boosting safe? Will I get banned?",
        answer: "We take safety seriously. Our PROs use VPNs and secure methods to minimize any risks. However, boosting carries inherent risks depending on the game's terms of service. We recommend reviewing each game's policies."
      },
      {
        question: "How do you verify PROs?",
        answer: "All PROs go through a verification process including skill assessment, identity verification, and background checks. We only accept experienced players with proven track records."
      },
      {
        question: "What happens if something goes wrong?",
        answer: "Our support team is available to help resolve any issues. If there's a dispute, we investigate thoroughly and have buyer protection policies in place. You can also dispute an order within 24 hours of completion."
      },
      {
        question: "How is my data protected?",
        answer: "We use industry-standard encryption for all data transmission and storage. We never sell your personal information and only collect what's necessary to provide our services."
      }
    ]
  },
  {
    title: "For PROs",
    icon: Users,
    faqs: [
      {
        question: "How do I become a PRO?",
        answer: "Click 'Become a PRO' in the navigation menu and fill out the application form. You'll need to provide proof of your gaming skills, complete a verification process, and agree to our PRO guidelines."
      },
      {
        question: "How much can I earn as a PRO?",
        answer: "PROs keep 85% of each order total. Earnings depend on the services you offer and how many orders you complete. Top PROs earn $5,000+ monthly."
      },
      {
        question: "How do withdrawals work?",
        answer: "You can withdraw earnings to PayPal, cryptocurrency wallet, or bank transfer. Minimum withdrawal is $10, and processing takes 24-48 hours. Funds become available 24 hours after order completion."
      },
      {
        question: "Can I set my own prices?",
        answer: "PROs can create custom service offerings with their own pricing within our guidelines. You have full control over your services and availability."
      }
    ]
  }
]

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background">
      <ClientHeader 
        title="FAQ"
        breadcrumbs={[{ label: 'FAQ', href: '/faq' }]}
      />

      <div className="pt-14">
        {/* Hero Section */}
        <section className="relative py-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
          <div className="container relative">
            <div className="max-w-3xl mx-auto text-center">
              <Badge variant="outline" className="mb-4">
                <MessageSquare className="h-3 w-3 mr-1" />
                Help Center
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Frequently Asked Questions
              </h1>
              <p className="text-xl text-muted-foreground">
                Find answers to common questions about our gaming services
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-12">
          <div className="container max-w-4xl">
            <div className="space-y-8">
              {faqCategories.map((category) => (
                <Card key={category.title} className="glass">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <category.icon className="h-5 w-5 text-primary" />
                      </div>
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {category.faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`${category.title}-${index}`}>
                          <AccordionTrigger className="text-left">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Contact Section */}
            <Card className="mt-12 glass border-primary/20">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-2">Still have questions?</h2>
                <p className="text-muted-foreground mb-6">
                  Our support team is here to help you 24/7
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild>
                    <Link href="/support">Contact Support</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/discord">Join Discord</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
