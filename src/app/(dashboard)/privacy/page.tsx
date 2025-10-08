import { ChevronRight } from "lucide-react"
import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--page-bg)]">
      <div className="bg-gradient-to-b from-[var(--hero-bg)] to-[var(--page-bg)] py-12 px-6 lg:px-12">
        <nav className="flex items-center gap-2 text-sm text-[var(--ink)]/70 mb-6">
          <Link href="/dashboard" className="hover:text-[var(--ink)] transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-[var(--ink)]">Privacy Policy</span>
        </nav>
        <h1 className="text-4xl font-bold text-[var(--ink)] mb-4">Privacy Policy</h1>
        <p className="text-lg text-[var(--ink)]/80">
          Your privacy is important to us. This policy explains how we collect, use, and protect your information.
        </p>
      </div>

      <div className="px-6 lg:px-12 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Effective Date</h2>
            <p className="text-gray-700">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
            <p className="text-gray-700 mb-4">
              Zero To Diamond LLC ("we," "our," or "us") collects information you provide directly to us when using the Diamond Plus Portal:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Account Information:</strong> Name, email address, and password when you create an account</li>
              <li><strong>Profile Information:</strong> Avatar image and any additional profile details you choose to provide</li>
              <li><strong>Payment Information:</strong> Billing details processed securely through Stripe (we do not store credit card numbers)</li>
              <li><strong>Usage Data:</strong> Information about how you interact with our platform, including pages visited, videos watched, and features used</li>
              <li><strong>Communications:</strong> Information you provide when contacting support or using platform features</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Provide, maintain, and improve the Diamond Plus Portal services</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices, updates, security alerts, and support messages</li>
              <li>Respond to your comments, questions, and customer service requests</li>
              <li>Monitor and analyze trends, usage, and activities to improve our services</li>
              <li>Personalize and improve your experience on the platform</li>
              <li>Communicate with you about products, services, offers, and events</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Information Sharing</h2>
            <p className="text-gray-700 mb-4">We do not sell, trade, or rent your personal information. We may share your information in the following situations:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Service Providers:</strong> With third-party vendors who perform services on our behalf (e.g., Stripe for payment processing, Mux for video hosting)</li>
              <li><strong>Legal Requirements:</strong> If required by law or in response to valid requests by public authorities</li>
              <li><strong>Business Transfers:</strong> In connection with any merger, sale of company assets, or acquisition</li>
              <li><strong>Consent:</strong> With your consent or at your direction</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
            <p className="text-gray-700">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
            <p className="text-gray-700 mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Access and receive a copy of your personal information</li>
              <li>Update or correct your personal information</li>
              <li>Delete your account and associated personal information</li>
              <li>Opt-out of certain communications</li>
            </ul>
            <p className="text-gray-700 mt-4">
              To exercise these rights, please contact us at support@zerotodiamond.com.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Cookies</h2>
            <p className="text-gray-700">
              We use cookies and similar tracking technologies to track activity on our platform and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
            <p className="text-gray-700">
              Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
            <p className="text-gray-700">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Effective Date" above.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="text-gray-700">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <p className="text-gray-700">
                <strong>Zero To Diamond LLC</strong><br />
                Email: support@zerotodiamond.com
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
