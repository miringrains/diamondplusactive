import { ChevronRight } from "lucide-react"
import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--page-bg)]">
      <div className="bg-gradient-to-b from-[var(--hero-bg)] to-[var(--page-bg)] py-12 px-6 lg:px-12">
        <nav className="flex items-center gap-2 text-sm text-[var(--ink)]/70 mb-6">
          <Link href="/dashboard" className="hover:text-[var(--ink)] transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-[var(--ink)]">Terms of Service</span>
        </nav>
        <h1 className="text-4xl font-bold text-[var(--ink)] mb-4">Terms of Service</h1>
        <p className="text-lg text-[var(--ink)]/80">
          Please read these terms carefully before using the Diamond Plus Portal.
        </p>
      </div>

      <div className="px-6 lg:px-12 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Effective Date</h2>
            <p className="text-gray-700">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Acceptance of Terms</h2>
            <p className="text-gray-700">
              By accessing or using the Diamond Plus Portal ("Service"), you agree to be bound by these Terms of Service ("Terms") and all applicable laws and regulations. These Terms supplement any agreement you have entered into with Zero To Diamond LLC for participation in the Diamond Plus coaching program.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Description of Service</h2>
            <p className="text-gray-700">
              The Diamond Plus Portal provides exclusive access to real estate training materials, coaching resources, video content, scripts, workshops, and other educational materials designed to help real estate professionals grow their business.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Eligibility</h2>
            <p className="text-gray-700">
              You must be at least 18 years old to use this Service. By using the Service, you represent and warrant that you meet this age requirement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">User Account</h2>
            <p className="text-gray-700 mb-4">To access the Service, you must:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain the security of your password and account</li>
              <li>Promptly update your account information if it changes</li>
              <li>Accept responsibility for all activities that occur under your account</li>
              <li>Immediately notify us of any unauthorized use of your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Intellectual Property Rights</h2>
            <p className="text-gray-700 mb-4">
              All content on the Diamond Plus Portal, including but not limited to text, graphics, logos, images, audio clips, video clips, data compilations, and software, is the exclusive property of Ricky Carruth and Zero To Diamond LLC and is protected by copyright laws.
            </p>
            <p className="text-gray-700 font-semibold">
              You may NOT:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Share, distribute, or reproduce any content from the platform</li>
              <li>Download content for redistribution</li>
              <li>Use content for any commercial purpose without written permission</li>
              <li>Modify, create derivative works, or reverse engineer any content</li>
              <li>Remove any copyright or proprietary notices</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Prohibited Uses</h2>
            <p className="text-gray-700 mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Share your account credentials with anyone</li>
              <li>Use the Service for any illegal or unauthorized purpose</li>
              <li>Violate any laws in your jurisdiction</li>
              <li>Transmit any viruses, malware, or harmful code</li>
              <li>Attempt to gain unauthorized access to any portion of the Service</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Collect or harvest any personally identifiable information</li>
              <li>Use the Service to compete with Zero To Diamond LLC</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Payment Terms</h2>
            <p className="text-gray-700">
              Payment terms, including fees, billing cycles, and refund policies, are governed by your coaching program agreement with Zero To Diamond LLC. All payments are processed securely through our payment processor, Stripe.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Termination</h2>
            <p className="text-gray-700">
              We reserve the right to terminate or suspend your account and access to the Service at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason. Termination terms are further detailed in your coaching program agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Disclaimers</h2>
            <p className="text-gray-700">
              The information provided through the Service is for educational purposes only. Results vary and are not guaranteed. The Service is provided "as is" without warranties of any kind, either express or implied. We do not guarantee that the Service will be uninterrupted, secure, or error-free.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
            <p className="text-gray-700">
              To the fullest extent permitted by law, Zero To Diamond LLC shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Governing Law</h2>
            <p className="text-gray-700">
              These Terms shall be governed by and construed in accordance with the laws of the State of Alabama, without regard to its conflict of law provisions. Any disputes shall be resolved as specified in your coaching program agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
            <p className="text-gray-700">
              We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the new Terms on this page. Your continued use of the Service after such modifications constitutes your acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
            <p className="text-gray-700">
              If you have any questions about these Terms, please contact us at:
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