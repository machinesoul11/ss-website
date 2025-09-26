import { Metadata } from 'next'
import { Container } from '@/components/layout/containers'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Security - Silent Scribe',
  description: 'Learn about Silent Scribe\'s security architecture, local processing guarantees, and commitment to protecting your data and content.',
}

export default function SecurityPage() {
  return (
    <Container className="py-12 lg:py-20">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
            Security
          </h1>
          <p className="mt-4 text-xl text-text-secondary">
            Privacy-first architecture designed for security-conscious developers
          </p>
        </div>

        <div className="prose prose-lg prose-slate max-w-none">
          {/* Local Processing Security */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              Local Processing Architecture
            </h2>
            
            <div className="bg-green-50 border-l-4 border-green-400 p-4 my-6">
              <h3 className="text-green-800 font-medium mb-2">Zero Data Transmission</h3>
              <p className="text-green-800">
                Silent Scribe's core principle is that your content never leaves your machine. All text analysis, 
                grammar checking, and writing assistance happens locally on your device.
              </p>
            </div>

            <h3 className="text-xl font-medium text-text-primary mb-3">
              What This Means for Security
            </h3>
            <ul className="list-disc list-inside text-text-secondary mb-6 space-y-2">
              <li><strong>No Network Transmission:</strong> Your documents, code, API keys, and sensitive content never travel over the internet</li>
              <li><strong>No Cloud Storage:</strong> We don't store, cache, or temporarily hold your content on any servers</li>
              <li><strong>No Third-Party Access:</strong> No external services can access your text or writing</li>
              <li><strong>Enterprise Safe:</strong> Suitable for organizations with strict data security requirements</li>
              <li><strong>Offline Operation:</strong> Works without internet connectivity, eliminating network-based attack vectors</li>
            </ul>

            <h3 className="text-xl font-medium text-text-primary mb-3">
              Technical Implementation
            </h3>
            <ul className="list-disc list-inside text-text-secondary mb-6 space-y-2">
              <li><strong>Local NLP Engine:</strong> Advanced natural language processing runs entirely on your CPU</li>
              <li><strong>Embedded Models:</strong> All AI models and rule sets are bundled with the software installation</li>
              <li><strong>Memory-Only Processing:</strong> Text analysis happens in RAM and is never written to disk</li>
              <li><strong>Process Isolation:</strong> Silent Scribe runs in its own secure process space</li>
            </ul>
          </section>

          {/* Software Security */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              Software Security Measures
            </h2>
            
            <h3 className="text-xl font-medium text-text-primary mb-3">
              Code Signing and Distribution
            </h3>
            <ul className="list-disc list-inside text-text-secondary mb-6 space-y-2">
              <li><strong>Digital Signatures:</strong> All releases are cryptographically signed for authenticity verification</li>
              <li><strong>Secure Distribution:</strong> Software distributed through official channels with checksum verification</li>
              <li><strong>Update Integrity:</strong> Automatic updates use secure channels with signature verification</li>
              <li><strong>Tamper Detection:</strong> Built-in mechanisms to detect unauthorized modifications</li>
            </ul>

            <h3 className="text-xl font-medium text-text-primary mb-3">
              Runtime Security
            </h3>
            <ul className="list-disc list-inside text-text-secondary mb-6 space-y-2">
              <li><strong>Sandboxed Execution:</strong> Runs with minimal system permissions and restricted file access</li>
              <li><strong>Memory Protection:</strong> Uses modern memory safety techniques to prevent buffer overflows</li>
              <li><strong>Input Sanitization:</strong> All user input is validated and sanitized before processing</li>
              <li><strong>Secure Defaults:</strong> Conservative security settings enabled by default</li>
            </ul>

            <h3 className="text-xl font-medium text-text-primary mb-3">
              Development Security Practices
            </h3>
            <ul className="list-disc list-inside text-text-secondary mb-6 space-y-2">
              <li><strong>Security Code Reviews:</strong> All code changes undergo security-focused review</li>
              <li><strong>Automated Security Testing:</strong> Continuous security testing in CI/CD pipeline</li>
              <li><strong>Dependency Scanning:</strong> Regular audits of third-party libraries for vulnerabilities</li>
              <li><strong>Penetration Testing:</strong> Regular security assessments by independent security experts</li>
            </ul>
          </section>

          {/* Data Security */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              Data Protection and Privacy
            </h2>
            
            <h3 className="text-xl font-medium text-text-primary mb-3">
              What We Don't Collect
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h4 className="font-medium text-blue-900 mb-3">Your Writing Content</h4>
              <ul className="text-blue-800 space-y-1 text-sm">
                <li>• Document text, code snippets, or any content you're editing</li>
                <li>• API keys, passwords, or sensitive strings in your documents</li>
                <li>• File names, directory structures, or project information</li>
                <li>• Grammar corrections, suggestions, or writing patterns</li>
                <li>• Custom terminology or style guide configurations</li>
              </ul>
            </div>

            <h3 className="text-xl font-medium text-text-primary mb-3">
              Minimal Website Data Collection
            </h3>
            <p className="text-text-secondary mb-4">
              Our website collects only essential information:
            </p>
            <ul className="list-disc list-inside text-text-secondary mb-6 space-y-2">
              <li><strong>Beta Signup Data:</strong> Email address and optional development context (stored encrypted)</li>
              <li><strong>Anonymous Analytics:</strong> Aggregated usage patterns via privacy-focused Plausible Analytics</li>
              <li><strong>No Tracking:</strong> No cookies, pixels, or cross-site tracking mechanisms</li>
              <li><strong>No Behavioral Profiling:</strong> We don't build profiles or track individual users</li>
            </ul>

            <h3 className="text-xl font-medium text-text-primary mb-3">
              Data Storage Security
            </h3>
            <ul className="list-disc list-inside text-text-secondary mb-6 space-y-2">
              <li><strong>Encryption at Rest:</strong> All stored data encrypted with industry-standard AES-256</li>
              <li><strong>Encryption in Transit:</strong> HTTPS/TLS 1.3 for all web communications</li>
              <li><strong>Access Controls:</strong> Strict role-based access to any stored information</li>
              <li><strong>Data Minimization:</strong> We collect and retain only what's absolutely necessary</li>
              <li><strong>Regular Deletion:</strong> Automatic cleanup of temporary data and logs</li>
            </ul>
          </section>

          {/* Compliance and Standards */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              Compliance and Industry Standards
            </h2>
            
            <h3 className="text-xl font-medium text-text-primary mb-3">
              Privacy Regulations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-text-primary mb-2">GDPR Compliant</h4>
                <p className="text-text-secondary text-sm">
                  European Union General Data Protection Regulation compliance through privacy-by-design architecture.
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-text-primary mb-2">CCPA Compliant</h4>
                <p className="text-text-secondary text-sm">
                  California Consumer Privacy Act compliance with transparent data practices and user rights.
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-text-primary mb-2">PIPEDA Aligned</h4>
                <p className="text-text-secondary text-sm">
                  Canadian Personal Information Protection and Electronic Documents Act alignment.
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-text-primary mb-2">SOC 2 Ready</h4>
                <p className="text-text-secondary text-sm">
                  Architecture designed to meet SOC 2 Type II security and availability criteria.
                </p>
              </div>
            </div>

            <h3 className="text-xl font-medium text-text-primary mb-3">
              Security Frameworks
            </h3>
            <ul className="list-disc list-inside text-text-secondary mb-6 space-y-2">
              <li><strong>NIST Cybersecurity Framework:</strong> Following NIST guidelines for security practices</li>
              <li><strong>OWASP Standards:</strong> Application security based on OWASP Top 10 and guidelines</li>
              <li><strong>ISO 27001 Principles:</strong> Information security management aligned with international standards</li>
              <li><strong>Zero Trust Architecture:</strong> Never trust, always verify approach to security</li>
            </ul>
          </section>

          {/* Vulnerability Management */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              Vulnerability Management and Response
            </h2>
            
            <h3 className="text-xl font-medium text-text-primary mb-3">
              Security Monitoring
            </h3>
            <ul className="list-disc list-inside text-text-secondary mb-6 space-y-2">
              <li><strong>Automated Scanning:</strong> Continuous vulnerability scanning of our infrastructure and code</li>
              <li><strong>Dependency Monitoring:</strong> Real-time alerts for security vulnerabilities in third-party libraries</li>
              <li><strong>Security Advisories:</strong> Monitoring of security bulletins and threat intelligence</li>
              <li><strong>Proactive Updates:</strong> Rapid patching and updates for identified security issues</li>
            </ul>

            <h3 className="text-xl font-medium text-text-primary mb-3">
              Incident Response
            </h3>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <h4 className="font-medium text-red-900 mb-2">Security Issue Reporting</h4>
              <p className="text-red-800 text-sm mb-3">
                If you discover a security vulnerability, please report it responsibly:
              </p>
              <ul className="text-red-800 text-sm space-y-1">
                <li>• Email: <strong>security@silentscribe.dev</strong></li>
                <li>• Response time: Within 2 hours for critical issues</li>
                <li>• Coordinated disclosure process</li>
                <li>• Recognition for responsible disclosure</li>
              </ul>
            </div>

            <h3 className="text-xl font-medium text-text-primary mb-3">
              Response Timeline
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <div>
                  <span className="font-medium text-text-primary">Critical Issues:</span>
                  <span className="text-text-secondary ml-2">2-hour acknowledgment, 24-hour patch</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                <div>
                  <span className="font-medium text-text-primary">High Severity:</span>
                  <span className="text-text-secondary ml-2">24-hour acknowledgment, 72-hour patch</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <div>
                  <span className="font-medium text-text-primary">Medium/Low:</span>
                  <span className="text-text-secondary ml-2">48-hour acknowledgment, next release cycle</span>
                </div>
              </div>
            </div>
          </section>

          {/* Enterprise Security */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              Enterprise Security Features
            </h2>
            
            <h3 className="text-xl font-medium text-text-primary mb-3">
              Deployment Options
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-text-primary mb-2">Air-Gapped Environments</h4>
                <p className="text-text-secondary text-sm">
                  Fully offline deployment for high-security environments with no network connectivity.
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-text-primary mb-2">Corporate Networks</h4>
                <p className="text-text-secondary text-sm">
                  Deployment within corporate firewalls with centralized management and policy enforcement.
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-text-primary mb-2">BYOD Compatibility</h4>
                <p className="text-text-secondary text-sm">
                  Secure operation on personal devices while maintaining corporate data protection.
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-text-primary mb-2">VDI Integration</h4>
                <p className="text-text-secondary text-sm">
                  Compatible with Virtual Desktop Infrastructure and remote development environments.
                </p>
              </div>
            </div>

            <h3 className="text-xl font-medium text-text-primary mb-3">
              Management and Auditing
            </h3>
            <ul className="list-disc list-inside text-text-secondary mb-6 space-y-2">
              <li><strong>Centralized Configuration:</strong> Enterprise policy management and deployment</li>
              <li><strong>Audit Logging:</strong> Comprehensive logs for security monitoring and compliance</li>
              <li><strong>Usage Analytics:</strong> Privacy-respecting insights into tool adoption and usage patterns</li>
              <li><strong>Integration APIs:</strong> Secure integration with enterprise security and monitoring systems</li>
            </ul>
          </section>

          {/* Security Contact */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              Security Contact and Resources
            </h2>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-text-primary mb-4">Security Team Contact</h3>
              <div className="space-y-3">
                <div>
                  <strong className="text-text-primary">Security Issues:</strong>
                  <span className="text-text-secondary ml-2">security@silentscribe.dev</span>
                </div>
                <div>
                  <strong className="text-text-primary">Security Questions:</strong>
                  <span className="text-text-secondary ml-2">Same contact for general security inquiries</span>
                </div>
                <div>
                  <strong className="text-text-primary">Enterprise Security:</strong>
                  <span className="text-text-secondary ml-2">enterprise@silentscribe.dev</span>
                </div>
                <div>
                  <strong className="text-text-primary">PGP Key:</strong>
                  <span className="text-text-secondary ml-2">Available on request for sensitive communications</span>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-medium text-text-primary mb-3 mt-6">
              Security Documentation
            </h3>
            <ul className="list-disc list-inside text-text-secondary mb-6 space-y-2">
              <li><Link href="/privacy" className="text-blue-600 hover:text-blue-800">Privacy Policy</Link> - Comprehensive data handling practices</li>
              <li><Link href="/terms" className="text-blue-600 hover:text-blue-800">Terms of Service</Link> - Legal framework and user responsibilities</li>
              <li><strong>Security Whitepaper:</strong> Detailed technical security architecture (available to enterprise customers)</li>
              <li><strong>Compliance Reports:</strong> Available upon request for qualified organizations</li>
            </ul>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-6">
              <p className="text-blue-800">
                <strong>Security is a Journey:</strong> We continuously improve our security posture and welcome 
                feedback from the security community. Our commitment to security is ongoing and evolving with 
                emerging threats and best practices.
              </p>
            </div>
          </section>
        </div>
      </div>
    </Container>
  )
}
