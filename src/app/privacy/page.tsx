import { Metadata } from 'next'
import { Container } from '@/components/layout/containers'

export const metadata: Metadata = {
  title: 'Privacy Policy - Silent Scribe',
  description: 'Our comprehensive privacy policy detailing how Silent Scribe protects your data through local processing and transparent practices.',
}

export default function PrivacyPage() {
  return (
    <Container className="py-12 lg:py-20">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-xl text-text-secondary">
            Last updated: September 25, 2025
          </p>
        </div>

        <div className="prose prose-lg prose-slate max-w-none">
          {/* Introduction */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              Our Privacy-First Commitment
            </h2>
            <p className="text-text-secondary mb-4">
              At Silent Scribe, privacy isn't an afterthought—it's the foundation of everything we build. 
              We believe that your code, documentation, and writing should never leave your machine unless you explicitly choose to share it.
            </p>
            <p className="text-text-secondary mb-4">
              This Privacy Policy explains how Silent Scribe ("we," "us," or "our"), owned and managed by Sequenxa, 
              collects, uses, and protects your information when you use our website and writing assistant software. 
              Silent Scribe operates as an independent product under Sequenxa's privacy-first technology umbrella.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-6">
              <p className="text-blue-800 font-medium">
                <strong>Key Principle:</strong> Silent Scribe's core writing assistant software processes all your text locally on your device. 
                Your documents, code, and writing content never leave your machine.
              </p>
            </div>
          </section>

          {/* What We Collect */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              Information We Collect
            </h2>
            
            <h3 className="text-xl font-medium text-text-primary mb-3">
              Website Analytics (Anonymous)
            </h3>
            <p className="text-text-secondary mb-4">
              We use privacy-focused analytics to understand how our website is used:
            </p>
            <ul className="list-disc list-inside text-text-secondary mb-6 space-y-2">
              <li>Page views and navigation patterns (without tracking individuals)</li>
              <li>General geographic region (country/state level only)</li>
              <li>Device type and browser information (aggregated)</li>
              <li>Referrer sources (which websites link to us)</li>
              <li>No cookies, no cross-site tracking, no personal identifiers</li>
            </ul>

            <h3 className="text-xl font-medium text-text-primary mb-3">
              Beta Program Information
            </h3>
            <p className="text-text-secondary mb-4">
              When you sign up for our beta program, we collect:
            </p>
            <ul className="list-disc list-inside text-text-secondary mb-6 space-y-2">
              <li>Email address (required for program communication)</li>
              <li>GitHub username (optional, helps us understand your development context)</li>
              <li>Current writing tools and workflows (to improve our product)</li>
              <li>Team size and use case description (for better beta experience)</li>
              <li>Documentation platforms you currently use</li>
              <li>Pain points with existing tools</li>
            </ul>

            <h3 className="text-xl font-medium text-text-primary mb-3">
              Email Communication Data
            </h3>
            <p className="text-text-secondary mb-4">
              To improve our communication and respect your preferences:
            </p>
            <ul className="list-disc list-inside text-text-secondary mb-6 space-y-2">
              <li>Email delivery status (delivered, bounced, failed)</li>
              <li>Email engagement (opened, clicked) - anonymous aggregated data only</li>
              <li>Unsubscribe requests and communication preferences</li>
            </ul>
          </section>

          {/* Local Processing Architecture */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              Our Local Processing Architecture
            </h2>
            
            <div className="bg-green-50 border-l-4 border-green-400 p-4 my-6">
              <h4 className="text-green-800 font-medium mb-2">Zero Data Transmission Guarantee</h4>
              <p className="text-green-800">
                Silent Scribe's writing assistant runs entirely on your local machine. Your text, code, 
                documentation, and any content you're writing or editing is processed locally and never transmitted to our servers or any third party.
              </p>
            </div>

            <h3 className="text-xl font-medium text-text-primary mb-3">
              How Local Processing Works
            </h3>
            <ul className="list-disc list-inside text-text-secondary mb-6 space-y-2">
              <li><strong>Local Analysis Engine:</strong> All grammar, style, and writing checks happen on your device</li>
              <li><strong>Offline Operation:</strong> The assistant works without an internet connection</li>
              <li><strong>No Cloud Dependencies:</strong> No text processing happens on remote servers</li>
              <li><strong>Private by Design:</strong> Your writing remains private to you and your chosen collaborators</li>
            </ul>

            <h3 className="text-xl font-medium text-text-primary mb-3">
              What Data Stays Local
            </h3>
            <ul className="list-disc list-inside text-text-secondary mb-6 space-y-2">
              <li>All document content and text you're editing</li>
              <li>Your custom style guide configurations</li>
              <li>Personal dictionary and terminology preferences</li>
              <li>Writing patterns and historical corrections</li>
              <li>Code snippets, API keys, and technical documentation</li>
              <li>Any proprietary or confidential information in your documents</li>
            </ul>
          </section>

          {/* How We Use Information */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibent text-text-primary mb-4">
              How We Use Your Information
            </h2>
            
            <h3 className="text-xl font-medium text-text-primary mb-3">
              Beta Program Communication
            </h3>
            <ul className="list-disc list-inside text-text-secondary mb-6 space-y-2">
              <li>Send you beta releases and early access invitations</li>
              <li>Provide development updates and feature announcements</li>
              <li>Request feedback on your experience with Silent Scribe</li>
              <li>Share technical insights about privacy-first development</li>
              <li>Notify you of important changes or security updates</li>
            </ul>

            <h3 className="text-xl font-medium text-text-primary mb-3">
              Product Improvement
            </h3>
            <ul className="list-disc list-inside text-text-secondary mb-6 space-y-2">
              <li>Understand which features would be most valuable</li>
              <li>Identify common pain points in current writing workflows</li>
              <li>Develop integrations with popular development tools</li>
              <li>Create better documentation and educational resources</li>
            </ul>

            <h3 className="text-xl font-medium text-text-primary mb-3">
              Website Analytics
            </h3>
            <ul className="list-disc list-inside text-text-secondary mb-6 space-y-2">
              <li>Improve website performance and user experience</li>
              <li>Understand which content is most helpful to developers</li>
              <li>Optimize our messaging for technical audiences</li>
              <li>Measure the effectiveness of privacy-focused positioning</li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              Data Sharing and Third Parties
            </h2>
            
            <h3 className="text-xl font-medium text-text-primary mb-3">
              Service Providers We Use
            </h3>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-text-primary">Supabase (Database)</h4>
                <p className="text-text-secondary text-sm mt-1">
                  Stores beta signup information and email preferences. EU-based servers with GDPR compliance.
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-text-primary">SendGrid (Email)</h4>
                <p className="text-text-secondary text-sm mt-1">
                  Sends beta program emails and updates. Industry-standard security and privacy practices.
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-text-primary">Plausible Analytics</h4>
                <p className="text-text-secondary text-sm mt-1">
                  Privacy-focused website analytics. No cookies, no personal data tracking, GDPR compliant.
                </p>
              </div>
            </div>

            <h3 className="text-xl font-medium text-text-primary mb-3 mt-6">
              What We Never Share
            </h3>
            <ul className="list-disc list-inside text-text-secondary mb-6 space-y-2">
              <li>Your documents or writing content (it never leaves your device)</li>
              <li>Personal information with advertisers or marketers</li>
              <li>Email addresses with third-party services for marketing</li>
              <li>Individual analytics data or browsing behavior</li>
              <li>Any data for purposes unrelated to Silent Scribe</li>
            </ul>
          </section>

          {/* Your Rights */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              Your Privacy Rights
            </h2>
            
            <p className="text-text-secondary mb-4">
              You have complete control over your data and privacy preferences:
            </p>

            <h3 className="text-xl font-medium text-text-primary mb-3">
              Access and Control
            </h3>
            <ul className="list-disc list-inside text-text-secondary mb-6 space-y-2">
              <li><strong>Data Access:</strong> Request a copy of all data we have about you</li>
              <li><strong>Data Correction:</strong> Update or correct any inaccurate information</li>
              <li><strong>Data Deletion:</strong> Request complete removal of your data from our systems</li>
              <li><strong>Email Preferences:</strong> Unsubscribe or modify your communication preferences at any time</li>
              <li><strong>Account Deletion:</strong> Delete your beta account and all associated data</li>
            </ul>

            <h3 className="text-xl font-medium text-text-primary mb-3">
              Easy Opt-Out Process
            </h3>
            <ul className="list-disc list-inside text-text-secondary mb-6 space-y-2">
              <li>One-click unsubscribe links in all emails</li>
              <li>Email preferences management portal</li>
              <li>Direct contact for data deletion requests</li>
              <li>No retention of data after opt-out (except as legally required)</li>
            </ul>
          </section>

          {/* Data Security */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              Data Security Measures
            </h2>
            
            <h3 className="text-xl font-medium text-text-primary mb-3">
              Technical Safeguards
            </h3>
            <ul className="list-disc list-inside text-text-secondary mb-6 space-y-2">
              <li>Encryption in transit (HTTPS/TLS) for all website communications</li>
              <li>Encryption at rest for all stored data</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Minimal data collection principle - only what's necessary</li>
              <li>Secure API endpoints with rate limiting and authentication</li>
            </ul>

            <h3 className="text-xl font-medium text-text-primary mb-3">
              Organizational Safeguards
            </h3>
            <ul className="list-disc list-inside text-text-secondary mb-6 space-y-2">
              <li>Access controls limiting who can view your data</li>
              <li>Regular team training on privacy best practices</li>
              <li>Incident response procedures for any security concerns</li>
              <li>Privacy-by-design approach in all product development</li>
            </ul>
          </section>

          {/* Policy Updates */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              Policy Updates and Changes
            </h2>
            
            <p className="text-text-secondary mb-4">
              We may update this Privacy Policy to reflect changes in our practices or legal requirements. When we do:
            </p>
            <ul className="list-disc list-inside text-text-secondary mb-6 space-y-2">
              <li>We'll notify beta users via email of significant changes</li>
              <li>We'll update the "Last updated" date at the top of this policy</li>
              <li>We'll maintain transparency about what changed and why</li>
              <li>Continued use constitutes acceptance of updates</li>
            </ul>
          </section>

          {/* Contact Information */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              Privacy Questions and Contact
            </h2>
            
            <p className="text-text-secondary mb-4">
              We're committed to transparency and responsiveness regarding your privacy concerns. 
              If you have questions about this Privacy Policy or how we handle your data, please contact us:
            </p>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="space-y-3">
                <div>
                  <strong className="text-text-primary">Email:</strong>
                  <span className="text-text-secondary ml-2">privacy@silentscribe.dev</span>
                </div>
                <div>
                  <strong className="text-text-primary">General Contact:</strong>
                  <span className="text-text-secondary ml-2">hello@silentscribe.dev</span>
                </div>
                <div>
                  <strong className="text-text-primary">Response Time:</strong>
                  <span className="text-text-secondary ml-2">We aim to respond to privacy inquiries within 48 hours</span>
                </div>
              </div>
            </div>

            <p className="text-text-secondary mt-6">
              For urgent security concerns or data breach reports, please use our priority contact: 
              <span className="font-mono text-text-primary">security@silentscribe.dev</span>
            </p>
          </section>

          {/* Legal Framework */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              Legal Compliance
            </h2>
            
            <p className="text-text-secondary mb-4">
              This Privacy Policy is designed to comply with major privacy regulations, including:
            </p>
            <ul className="list-disc list-inside text-text-secondary mb-6 space-y-2">
              <li>General Data Protection Regulation (GDPR) - European Union</li>
              <li>California Consumer Privacy Act (CCPA) - California, USA</li>
              <li>Personal Information Protection and Electronic Documents Act (PIPEDA) - Canada</li>
              <li>Other applicable local privacy laws where you are located</li>
            </ul>
            
            <p className="text-text-secondary">
              Our commitment to privacy goes beyond legal compliance—it's a core value that guides every product and business decision we make.
            </p>
          </section>
        </div>
      </div>
    </Container>
  )
}
