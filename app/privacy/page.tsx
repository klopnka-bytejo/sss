import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPage() {
  return (
    <AppLayout>
      <div className="container max-w-4xl py-12">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-3xl">Privacy Policy</CardTitle>
            <p className="text-muted-foreground">Last updated: April 2026</p>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <h2 className="text-xl font-semibold mt-6 mb-3">1. Information We Collect</h2>
            <p className="text-muted-foreground mb-4">
              We collect information you provide directly, including email address, username, payment information, and any content you submit through our platform.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
              <li>To provide and improve our services</li>
              <li>To process transactions and send related information</li>
              <li>To communicate with you about orders and updates</li>
              <li>To detect and prevent fraud</li>
              <li>To comply with legal obligations</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">3. Information Sharing</h2>
            <p className="text-muted-foreground mb-4">
              We do not sell your personal information. We may share information with service providers who assist in operating our platform, or when required by law.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">4. Data Security</h2>
            <p className="text-muted-foreground mb-4">
              We implement industry-standard security measures including encryption, secure servers, and regular security audits to protect your data.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">5. Your Rights</h2>
            <p className="text-muted-foreground mb-4">
              You have the right to access, correct, or delete your personal data. Contact us at privacy@elevategaming.com to exercise these rights.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">6. Cookies</h2>
            <p className="text-muted-foreground mb-4">
              We use cookies to improve your experience, analyze site traffic, and personalize content. You can control cookies through your browser settings.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">7. Third-Party Links</h2>
            <p className="text-muted-foreground mb-4">
              Our service may contain links to third-party websites. We are not responsible for their privacy practices.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">8. Children&apos;s Privacy</h2>
            <p className="text-muted-foreground mb-4">
              Our service is not intended for users under 18. We do not knowingly collect information from children.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">9. Changes to This Policy</h2>
            <p className="text-muted-foreground mb-4">
              We may update this policy periodically. We will notify you of significant changes via email or platform notification.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">10. Contact Us</h2>
            <p className="text-muted-foreground mb-4">
              For privacy-related questions, contact us at privacy@elevategaming.com
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
