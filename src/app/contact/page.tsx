import { Metadata } from 'next'
import { Container } from '@/components/layout/containers'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Contact Silent Scribe - Get in Touch with Our Team',
  description:
    'Contact Silent Scribe for support, partnerships, media inquiries, or general questions about our privacy-first writing assistant.',
}

export default function ContactPage() {
  return (
    <Container className="py-12 lg:py-20">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
            Contact Us
          </h1>
          <p className="mt-4 text-xl text-text-secondary">
            We'd love to hear from you. Get in touch with our team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-semibold text-text-primary mb-6">
              Get in Touch
            </h2>

            <p className="text-text-secondary mb-8">
              Whether you have questions about Silent Scribe, want to join our
              beta program, or are interested in partnerships, we're here to
              help. Our team typically responds within 24 hours.
            </p>

            {/* Contact Methods */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-text-primary">
                    General Inquiries
                  </h3>
                  <p className="text-text-secondary">
                    For general questions and support
                  </p>
                  <a
                    href="mailto:hello@silentscribe.dev"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    hello@silentscribe.dev
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-text-primary">
                    Beta Program
                  </h3>
                  <p className="text-text-secondary">
                    Questions about joining our beta
                  </p>
                  <a
                    href="mailto:beta@silentscribe.dev"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    beta@silentscribe.dev
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-text-primary">
                    Partnerships & Business
                  </h3>
                  <p className="text-text-secondary">
                    Integration partnerships and business inquiries
                  </p>
                  <a
                    href="mailto:partnerships@silentscribe.dev"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    partnerships@silentscribe.dev
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-text-primary">
                    Security & Privacy
                  </h3>
                  <p className="text-text-secondary">
                    Security issues and privacy concerns
                  </p>
                  <a
                    href="mailto:security@silentscribe.dev"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    security@silentscribe.dev
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-text-primary">
                    Media & Press
                  </h3>
                  <p className="text-text-secondary">
                    Press inquiries and media requests
                  </p>
                  <a
                    href="mailto:press@silentscribe.dev"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    press@silentscribe.dev
                  </a>
                </div>
              </div>
            </div>

            {/* Response Time */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Response Time</h4>
              <div className="text-blue-800 text-sm space-y-1">
                <p>
                  • <strong>General inquiries:</strong> Within 24 hours
                </p>
                <p>
                  • <strong>Beta program:</strong> Within 12 hours
                </p>
                <p>
                  • <strong>Security issues:</strong> Within 2 hours
                </p>
                <p>
                  • <strong>Press inquiries:</strong> Same business day
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions & Resources */}
          <div>
            <h2 className="text-2xl font-semibold text-text-primary mb-6">
              Quick Actions
            </h2>

            <div className="space-y-4 mb-8">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  Join Our Beta Program
                </h3>
                <p className="text-text-secondary mb-4">
                  Get early access to Silent Scribe and help shape the future of
                  privacy-first writing assistance.
                </p>
                <Button href="/beta" className="w-full">
                  Sign Up for Beta
                </Button>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  Learn More About Us
                </h3>
                <p className="text-text-secondary mb-4">
                  Discover our mission, values, and the technology behind our
                  privacy-first approach.
                </p>
                <Button variant="secondary" href="/about" className="w-full">
                  About Silent Scribe
                </Button>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  Privacy & Security
                </h3>
                <p className="text-text-secondary mb-4">
                  Review our privacy policy and learn about our commitment to
                  keeping your data secure.
                </p>
                <Button variant="secondary" href="/privacy" className="w-full">
                  Privacy Policy
                </Button>
              </div>
            </div>

            {/* Social Media & Community */}
            <div>
              <h3 className="text-xl font-medium text-text-primary mb-4">
                Connect With Us
              </h3>

              <p className="text-text-secondary mb-4">
                Follow us for updates, technical insights, and community
                discussions about privacy-first development and technical
                writing.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <a
                  href="https://github.com/silentscribe"
                  className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  GitHub
                </a>

                <a
                  href="https://twitter.com/silentscribe"
                  className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                  Twitter
                </a>

                <a
                  href="https://linkedin.com/company/silentscribe"
                  className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                      clipRule="evenodd"
                    />
                  </svg>
                  LinkedIn
                </a>

                <a
                  href="https://dev.to/silentscribe"
                  className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M7.42 10.05c-.18-.16-.46-.23-.84-.23H6l.02 2.44.04 2.45.02-.05h.83c.38 0 .66-.08.84-.23.18-.16.27-.42.27-.8v-2.59c0-.38-.09-.64-.27-.8zM4.37 7H19.63C21.5 7 23 8.5 23 10.37v3.26C23 15.5 21.5 17 19.63 17H4.37C2.5 17 1 15.5 1 13.63v-3.26C1 8.5 2.5 7 4.37 7zM15.3 9.45c-.3-.3-.77-.45-1.4-.45h-2.2v5h.8v-1.9h1.4c.63 0 1.1-.15 1.4-.45.3-.3.45-.77.45-1.4s-.15-1.1-.45-1.4zm-1.4 1.55h-1.35v-1.6h1.35c.16 0 .28.04.36.12.08.08.12.2.12.36 0 .16-.04.28-.12.36-.08.08-.2.12-.36.12zm4.15-1.55c-.3-.3-.77-.45-1.4-.45h-2.2v5h.8v-1.9h1.4c.63 0 1.1-.15 1.4-.45.3-.3.45-.77.45-1.4s-.15-1.1-.45-1.4zM17.15 11h-1.35v-1.6h1.35c.16 0 .28.04.36.12.08.08.12.2.12.36 0 .16-.04.28-.12.36-.08.08-.2.12-.36.12z" />
                  </svg>
                  Dev.to
                </a>
              </div>
            </div>

            {/* Community Guidelines */}
            <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-text-primary mb-2">
                Community Guidelines
              </h4>
              <p className="text-text-secondary text-sm">
                We're committed to maintaining a welcoming, inclusive community
                for developers and technical writers. Please be respectful,
                constructive, and helpful in all interactions.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 border-t border-gray-200 pt-12">
          <h2 className="text-2xl font-semibold text-text-primary mb-8">
            Frequently Asked Questions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-text-primary mb-2">
                How do I join the beta program?
              </h3>
              <p className="text-text-secondary">
                Simply{' '}
                <Link
                  href="/beta"
                  className="text-blue-600 hover:text-blue-800"
                >
                  sign up for our beta program
                </Link>{' '}
                with your email and some information about your current writing
                workflow. We'll send you early access as soon as it's available.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-text-primary mb-2">
                Is Silent Scribe really free during beta?
              </h3>
              <p className="text-text-secondary">
                Yes! Beta access is completely free. We want your feedback to
                make the best possible product. Beta users will also receive
                special pricing when we launch.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-text-primary mb-2">
                How does local processing work?
              </h3>
              <p className="text-text-secondary">
                Silent Scribe runs entirely on your device. Your text is
                analyzed locally using our advanced NLP engine, so your content
                never leaves your machine. No internet connection required for
                core functionality.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-text-primary mb-2">
                What IDEs will you support?
              </h3>
              <p className="text-text-secondary">
                We're starting with VS Code, then expanding to JetBrains IDEs
                (IntelliJ, WebStorm, PyCharm), Vim/Neovim, and others based on
                community demand. Let us know what you use!
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-text-primary mb-2">
                Can I use this for my company's internal docs?
              </h3>
              <p className="text-text-secondary">
                Absolutely! Local processing means your proprietary code, API
                keys, and internal documentation stay completely private.
                Perfect for enterprise and security-conscious teams.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-text-primary mb-2">
                How can I contribute to the project?
              </h3>
              <p className="text-text-secondary">
                Join our beta program, provide feedback, report bugs, and share
                your use cases. We're building this with the community and value
                every insight from technical writers and developers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}
