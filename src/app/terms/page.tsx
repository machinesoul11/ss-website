import { Metadata } from 'next'
import { Container } from '@/components/layout/containers'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service - Silent Scribe',
  description:
    'Terms of service for Silent Scribe beta program and writing assistant software.',
}

export default function TermsPage() {
  return (
    <Container className="py-12 lg:py-20">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-4 text-xl text-text-secondary">
            Last updated: September 25, 2025
          </p>
        </div>

        <div className="prose prose-lg prose-slate max-w-none">
          {/* Introduction */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              Welcome to Silent Scribe
            </h2>
            <p className="text-text-secondary mb-4">
              These Terms of Service ("Terms") govern your use of Silent
              Scribe's website, beta program, and writing assistant software
              (collectively, the "Service") provided by Silent Scribe ("we,"
              "us," or "our"), owned and managed by Sequenxa.
            </p>
            <p className="text-text-secondary mb-4">
              By accessing or using our Service, you agree to be bound by these
              Terms. If you disagree with any part of these terms, then you may
              not access the Service.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-6">
              <p className="text-blue-800">
                <strong>Developer-Friendly Approach:</strong> We've written
                these terms in plain English. Our goal is transparency and
                fairness, not legal complexity.
              </p>
            </div>
          </section>

          {/* Beta Program Terms */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              Beta Program Terms
            </h2>

            <h3 className="text-xl font-medium text-text-primary mb-3">
              Beta Access and Expectations
            </h3>
            <p className="text-text-secondary mb-4">
              By participating in our beta program, you understand and agree
              that:
            </p>
            <ul className="list-disc list-inside text-text-secondary mb-6 space-y-2">
              <li>
                <strong>Pre-Release Software:</strong> Beta software is provided
                for testing and feedback purposes
              </li>
              <li>
                <strong>No Service Guarantees:</strong> Beta software may
                contain bugs, errors, or incomplete features
              </li>
              <li>
                <strong>Feedback Encouraged:</strong> We welcome your input to
                improve the product
              </li>
              <li>
                <strong>No Commercial Use:</strong> Beta software is for
                evaluation only, not production use
              </li>
              <li>
                <strong>Access May Change:</strong> We may modify, suspend, or
                terminate beta access at any time
              </li>
            </ul>

            <h3 className="text-xl font-medium text-text-primary mb-3">
              Beta User Responsibilities
            </h3>
            <ul className="list-disc list-inside text-text-secondary mb-6 space-y-2">
              <li>Provide constructive feedback about your experience</li>
              <li>Report bugs and issues you encounter</li>
              <li>
                Do not redistribute or share beta software without permission
              </li>
              <li>Respect the collaborative nature of the beta community</li>
              <li>
                Keep confidential any unreleased features or roadmap information
              </li>
            </ul>

            <h3 className="text-xl font-medium text-text-primary mb-3">
              What We Provide
            </h3>
            <ul className="list-disc list-inside text-text-secondary mb-6 space-y-2">
              <li>Early access to Silent Scribe writing assistant features</li>
              <li>Regular development updates and feature announcements</li>
              <li>Direct communication channel for feedback and support</li>
              <li>Opportunity to influence product development direction</li>
              <li>
                Community access with other technical writers and developers
              </li>
            </ul>
          </section>

          {/* Acceptable Use */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              Acceptable Use Policy
            </h2>

            <h3 className="text-xl font-medium text-text-primary mb-3">
              Permitted Use
            </h3>
            <p className="text-text-secondary mb-4">
              You may use Silent Scribe to:
            </p>
            <ul className="list-disc list-inside text-text-secondary mb-6 space-y-2">
              <li>Improve your technical writing and documentation</li>
              <li>Check grammar, style, and consistency in your content</li>
              <li>Develop and maintain project documentation</li>
              <li>Create educational or informational content</li>
              <li>Collaborate with teams on writing quality</li>
            </ul>

            <h3 className="text-xl font-medium text-text-primary mb-3">
              Prohibited Activities
            </h3>
            <p className="text-text-secondary mb-4">
              You agree not to use Silent Scribe to:
            </p>
            <ul className="list-disc list-inside text-text-secondary mb-6 space-y-2">
              <li>Create content that violates laws or regulations</li>
              <li>Generate spam, harassment, or abusive content</li>
              <li>
                Attempt to reverse engineer or extract proprietary algorithms
              </li>
              <li>Overload or disrupt our systems or infrastructure</li>
              <li>Circumvent security measures or access controls</li>
              <li>Use the service for any illegal or harmful purposes</li>
            </ul>
          </section>

          {/* Privacy and Data */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              Privacy and Your Content
            </h2>

            <div className="bg-green-50 border-l-4 border-green-400 p-4 my-6">
              <h4 className="text-green-800 font-medium mb-2">
                Your Content Stays Private
              </h4>
              <p className="text-green-800">
                Silent Scribe processes your writing locally on your device. We
                never access, store, or analyze the content you write or edit
                with our software.
              </p>
            </div>

            <h3 className="text-xl font-medium text-text-primary mb-3">
              Ownership of Your Content
            </h3>
            <ul className="list-disc list-inside text-text-secondary mb-6 space-y-2">
              <li>
                You retain all rights to content you create or edit using Silent
                Scribe
              </li>
              <li>
                We claim no ownership over your documents, code, or writing
              </li>
              <li>Your intellectual property remains entirely yours</li>
              <li>
                We cannot access or view your content due to local processing
                architecture
              </li>
            </ul>

            <h3 className="text-xl font-medium text-text-primary mb-3">
              Feedback and Suggestions
            </h3>
            <p className="text-text-secondary mb-4">
              When you provide feedback, suggestions, or ideas about Silent
              Scribe:
            </p>
            <ul className="list-disc list-inside text-text-secondary mb-6 space-y-2">
              <li>We may use your feedback to improve our product</li>
              <li>
                You grant us permission to implement suggested improvements
              </li>
              <li>No compensation is owed for feedback or suggestions</li>
              <li>
                We will not share your personal feedback publicly without
                permission
              </li>
            </ul>
          </section>

          {/* Software License */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              Software License and Restrictions
            </h2>

            <h3 className="text-xl font-medium text-text-primary mb-3">
              License Grant
            </h3>
            <p className="text-text-secondary mb-4">
              Subject to these Terms, we grant you a limited, non-exclusive,
              non-transferable license to use Silent Scribe for your personal or
              business writing needs.
            </p>

            <h3 className="text-xl font-medium text-text-primary mb-3">
              License Restrictions
            </h3>
            <p className="text-text-secondary mb-4">You may not:</p>
            <ul className="list-disc list-inside text-text-secondary mb-6 space-y-2">
              <li>Copy, modify, or create derivative works of our software</li>
              <li>Reverse engineer, decompile, or disassemble the software</li>
              <li>Remove or alter any copyright or proprietary notices</li>
              <li>Rent, lease, lend, or sublicense the software to others</li>
              <li>Use the software to compete with Silent Scribe</li>
            </ul>

            <h3 className="text-xl font-medium text-text-primary mb-3">
              Open Source Components
            </h3>
            <p className="text-text-secondary mb-4">
              Silent Scribe incorporates open source software components. The
              use of these components is governed by their respective licenses,
              which are included with the software distribution.
            </p>
          </section>

          {/* Service Availability */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              Service Availability and Support
            </h2>

            <h3 className="text-xl font-medium text-text-primary mb-3">
              Service Uptime
            </h3>
            <p className="text-text-secondary mb-4">
              We strive to maintain high availability for our website and beta
              program services, but we cannot guarantee uninterrupted access.
              Scheduled maintenance will be communicated in advance when
              possible.
            </p>

            <h3 className="text-xl font-medium text-text-primary mb-3">
              Beta Program Support
            </h3>
            <ul className="list-disc list-inside text-text-secondary mb-6 space-y-2">
              <li>Email support for beta users during business hours</li>
              <li>Community forum access for peer support and discussion</li>
              <li>Documentation and user guides for getting started</li>
              <li>Regular development updates and progress reports</li>
            </ul>

            <h3 className="text-xl font-medium text-text-primary mb-3">
              Service Modifications
            </h3>
            <p className="text-text-secondary mb-4">
              We reserve the right to modify, suspend, or discontinue any aspect
              of our service with reasonable notice. For beta users, we will
              provide advance notification of significant changes.
            </p>
          </section>

          {/* Disclaimers and Limitations */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              Disclaimers and Limitations
            </h2>

            <h3 className="text-xl font-medium text-text-primary mb-3">
              Service Disclaimer
            </h3>
            <p className="text-text-secondary mb-4">
              Silent Scribe is provided "as is" without warranties of any kind.
              While we work hard to provide accurate writing assistance, our
              software:
            </p>
            <ul className="list-disc list-inside text-text-secondary mb-6 space-y-2">
              <li>May not catch all grammar, style, or formatting issues</li>
              <li>
                May provide suggestions that don't fit your specific context
              </li>
              <li>Should not replace human judgment and editorial review</li>
              <li>Is a tool to assist, not replace, your writing skills</li>
            </ul>

            <h3 className="text-xl font-medium text-text-primary mb-3">
              Limitation of Liability
            </h3>
            <p className="text-text-secondary mb-4">
              To the maximum extent permitted by law, Silent Scribe shall not be
              liable for any indirect, incidental, special, consequential, or
              punitive damages arising from your use of our service.
            </p>

            <h3 className="text-xl font-medium text-text-primary mb-3">
              Professional Writing Disclaimer
            </h3>
            <p className="text-text-secondary mb-4">
              Silent Scribe provides writing assistance tools but does not
              provide professional writing, editing, or legal advice. Always
              review and verify important content before publication or
              submission.
            </p>
          </section>

          {/* Termination */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              Account Termination
            </h2>

            <h3 className="text-xl font-medium text-text-primary mb-3">
              Your Right to Terminate
            </h3>
            <p className="text-text-secondary mb-4">
              You may stop using our service at any time by:
            </p>
            <ul className="list-disc list-inside text-text-secondary mb-6 space-y-2">
              <li>Unsubscribing from our email communications</li>
              <li>Uninstalling the Silent Scribe software</li>
              <li>Requesting deletion of your beta program account</li>
              <li>Contacting us to remove all your data</li>
            </ul>

            <h3 className="text-xl font-medium text-text-primary mb-3">
              Our Right to Terminate
            </h3>
            <p className="text-text-secondary mb-4">
              We may suspend or terminate your access if you:
            </p>
            <ul className="list-disc list-inside text-text-secondary mb-6 space-y-2">
              <li>Violate these Terms of Service</li>
              <li>Engage in prohibited or harmful activities</li>
              <li>Abuse our systems or other users</li>
              <li>Provide false information during signup</li>
            </ul>

            <h3 className="text-xl font-medium text-text-primary mb-3">
              Effect of Termination
            </h3>
            <ul className="list-disc list-inside text-text-secondary mb-6 space-y-2">
              <li>Your license to use Silent Scribe software ends</li>
              <li>
                We will delete your account data according to our privacy policy
              </li>
              <li>You should uninstall any beta software from your devices</li>
              <li>These Terms continue to apply to past use of our service</li>
            </ul>
          </section>

          {/* Changes and Updates */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              Changes to These Terms
            </h2>

            <p className="text-text-secondary mb-4">
              We may update these Terms from time to time to reflect changes in
              our service or legal requirements. When we do:
            </p>
            <ul className="list-disc list-inside text-text-secondary mb-6 space-y-2">
              <li>We'll update the "Last updated" date at the top</li>
              <li>We'll notify beta users of significant changes via email</li>
              <li>We'll post the updated terms on our website</li>
              <li>Continued use constitutes acceptance of the updated terms</li>
            </ul>

            <p className="text-text-secondary">
              If you don't agree to updated terms, you should stop using our
              service and contact us about account deletion.
            </p>
          </section>

          {/* Legal Information */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibent text-text-primary mb-4">
              Legal Information
            </h2>

            <h3 className="text-xl font-medium text-text-primary mb-3">
              Governing Law
            </h3>
            <p className="text-text-secondary mb-4">
              These Terms are governed by the laws of the jurisdiction where
              Silent Scribe is incorporated, without regard to conflict of law
              principles.
            </p>

            <h3 className="text-xl font-medium text-text-primary mb-3">
              Dispute Resolution
            </h3>
            <p className="text-text-secondary mb-4">
              We prefer to resolve disputes through direct communication. If you
              have concerns about our service or these terms, please contact us
              first at
              <Link
                href="mailto:legal@silentscribe.dev"
                className="text-blue-600 hover:text-blue-800"
              >
                legal@silentscribe.dev
              </Link>
              .
            </p>

            <h3 className="text-xl font-medium text-text-primary mb-3">
              Severability
            </h3>
            <p className="text-text-secondary mb-4">
              If any provision of these Terms is found to be unenforceable, the
              remaining provisions will continue in full force and effect.
            </p>
          </section>

          {/* Contact Information */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              Questions About These Terms
            </h2>

            <p className="text-text-secondary mb-4">
              If you have questions about these Terms of Service, please contact
              us:
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="space-y-3">
                <div>
                  <strong className="text-text-primary">
                    Legal Questions:
                  </strong>
                  <span className="text-text-secondary ml-2">
                    legal@silentscribe.dev
                  </span>
                </div>
                <div>
                  <strong className="text-text-primary">Beta Program:</strong>
                  <span className="text-text-secondary ml-2">
                    beta@silentscribe.dev
                  </span>
                </div>
                <div>
                  <strong className="text-text-primary">
                    General Support:
                  </strong>
                  <span className="text-text-secondary ml-2">
                    hello@silentscribe.dev
                  </span>
                </div>
              </div>
            </div>

            <p className="text-text-secondary mt-6">
              We're committed to clear communication and will respond to
              term-related questions within 48 hours.
            </p>
          </section>
        </div>
      </div>
    </Container>
  )
}
