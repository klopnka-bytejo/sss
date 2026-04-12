import { AppLayout } from "@/components/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function PrivacyPage() {
  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
          <div className="container relative">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Privacy Policy
              </h1>
              <p className="text-muted-foreground">Last updated: April 2026</p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12">
          <div className="container max-w-4xl">
            <Card className="glass">
              <CardContent className="p-8 space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We collect information you provide directly, including email address, username, payment information, and any content you submit through our platform.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2 leading-relaxed">
                    <li>To provide and improve our services</li>
                    <li>To process transactions and send related information</li>
                    <li>To communicate with you about orders and updates</li>
                    <li>To detect and prevent fraud</li>
                    <li>To comply with legal obligations</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We do not sell your personal information. We may share information with service providers who assist in operating our platform, or when required by law.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We implement industry-standard security measures including encryption, secure servers, and regular security audits to protect your data.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    You have the right to access, correct, or delete your personal data. Contact us at privacy@elevategaming.com to exercise these rights.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold mb-4">6. Cookies</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We use cookies to improve your experience, analyze site traffic, and personalize content. You can control cookies through your browser settings.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold mb-4">7. Third-Party Links</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Our service may contain links to third-party websites. We are not responsible for their privacy practices.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold mb-4">8. Children&apos;s Privacy</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Our service is not intended for users under 18. We do not knowingly collect information from children.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold mb-4">9. Changes to This Policy</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We may update this policy periodically. We will notify you of significant changes via email or platform notification.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    For privacy-related questions, contact us at privacy@elevategaming.com
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Section */}
            <Card className="mt-12 glass border-primary/20">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-2">Need Help?</h2>
                <p className="text-muted-foreground mb-6">
                  If you have any questions, feel free to contact us.
                </p>
                <Button asChild>
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </AppLayout>
  )
}
