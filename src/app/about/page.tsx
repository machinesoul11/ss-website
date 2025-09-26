import { Metadata } from 'next'
import { Container } from '@/components/layout/containers'

import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'About Silent Scribe - Privacy-First Writing Assistant for Developers',
  description: 'Learn about Silent Scribe\'s mission to bring Vale-level power with Grammarly-level simplicity through local processing and privacy-first architecture.',
}

export default function AboutPage() {
  return (
    <Container className="py-12 lg:py-20">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
            About Silent Scribe
          </h1>
          <p className="mt-4 text-xl text-text-secondary">
            Bringing Vale-level power with Grammarly-level simplicity through privacy-first architecture
          </p>
        </div>

        <div className="prose prose-lg prose-slate max-w-none">
          {/* Mission Statement */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              Our Mission
            </h2>
            <p className="text-text-secondary mb-4">
              At Silent Scribe, we believe that powerful writing assistance shouldn&apos;t come at the cost of privacy. 
              We&apos;re building the writing assistant that developers and technical writers have been waiting for—one 
              that combines the advanced capabilities of specialized tools like Vale with the intuitive user 
              experience of mainstream assistants like Grammarly, all while keeping your content completely private 
              through local processing.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-6">
              <p className="text-blue-800 font-medium">
                Our core principle is simple: <strong>Your words should never leave your machine unless you choose to share them.</strong>
              </p>
            </div>
          </section>

          {/* The Problem We're Solving */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              The Problem We&apos;re Solving
            </h2>
            
            <h3 className="text-xl font-medium text-text-primary mb-3">
              The Current Dilemma
            </h3>
            <p className="text-text-secondary mb-4">
              Today, developers and technical writers face an impossible choice:
            </p>
            <ul className="list-disc list-inside text-text-secondary mb-6 space-y-2">
              <li><strong>Easy but Limited:</strong> Tools like Grammarly are user-friendly but lack technical context, can&apos;t enforce custom style guides, and require sending your content to cloud servers</li>
              <li><strong>Powerful but Complex:</strong> Tools like Vale offer incredible customization and local processing but require significant setup time and technical expertise</li>
            </ul>

            <h3 className="text-xl font-medium text-text-primary mb-3">
              The Cost of Poor Documentation
            </h3>
            <p className="text-text-secondary mb-4">
              Research shows that developers spend up to 17 hours per week dealing with technical debt and maintenance issues, 
              often caused by poor documentation. This translates to nearly $85 billion annually in lost productivity across 
              the global software industry.
            </p>
            <ul className="list-disc list-inside text-text-secondary mb-6 space-y-2">
              <li>18% longer feature release cycles for companies with poor documentation</li>
              <li>10x increase in cost to fix defects found late due to misaligned docs</li>
              <li>38% of developers cite poor documentation as a top reason for leaving a company</li>
            </ul>
          </section>

          {/* Our Solution */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              Our Solution: The Best of Both Worlds
            </h2>
            
            <h3 className="text-xl font-medium text-text-primary mb-3">
              Privacy-First Architecture
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="border border-border-gray rounded-lg p-4">
                <h4 className="font-medium text-text-primary mb-2">🔒 Local Processing</h4>
                <p className="text-text-secondary text-sm">
                  All analysis happens on your device. Your code, documents, and content never leave your machine.
                </p>
              </div>
              <div className="border border-border-gray rounded-lg p-4">
                <h4 className="font-medium text-text-primary mb-2">🚫 No Cloud Dependencies</h4>
                <p className="text-text-secondary text-sm">
                  Works completely offline. No API calls, no data transmission, no third-party servers.
                </p>
              </div>
              <div className="border border-border-gray rounded-lg p-4">
                <h4 className="font-medium text-text-primary mb-2">🛡️ Enterprise Security</h4>
                <p className="text-text-secondary text-sm">
                  Safe for proprietary code, API keys, internal docs, and confidential information.
                </p>
              </div>
              <div className="border border-border-gray rounded-lg p-4">
                <h4 className="font-medium text-text-primary mb-2">⚡ Lightning Fast</h4>
                <p className="text-text-secondary text-sm">
                  No network latency. Instant analysis and suggestions as you type.
                </p>
              </div>
            </div>

            <h3 className="text-xl font-medium text-text-primary mb-3">
              Technical Excellence
            </h3>
            <ul className="list-disc list-inside text-text-secondary mb-6 space-y-2">
              <li><strong>Syntax Awareness:</strong> Understands code blocks, API references, and technical terminology</li>
              <li><strong>Custom Style Guides:</strong> Enforces Google, Microsoft, and your own company style rules</li>
              <li><strong>Docs-as-Code Integration:</strong> Works seamlessly with Git workflows and static site generators</li>
              <li><strong>Multi-Format Support:</strong> Markdown, AsciiDoc, reStructuredText, and more</li>
              <li><strong>Team Consistency:</strong> Shared rules across your entire development team</li>
            </ul>

            <h3 className="text-xl font-medium text-text-primary mb-3">
              Grammarly-Level User Experience
            </h3>
            <ul className="list-disc list-inside text-text-secondary mb-6 space-y-2">
              <li><strong>One-Click Setup:</strong> Install and start using immediately, no configuration required</li>
              <li><strong>Smart Defaults:</strong> Pre-configured with sensible rules for technical writing</li>
              <li><strong>IDE Integration:</strong> Native support for VS Code, JetBrains, Vim, and other popular editors</li>
              <li><strong>Real-Time Feedback:</strong> Instant suggestions as you write</li>
              <li><strong>Clear Explanations:</strong> Every suggestion comes with context and reasoning</li>
            </ul>
          </section>

          {/* Our Values */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              Our Core Values
            </h2>
            
            <div className="space-y-6">
              <div className="border-l-4 border-green-400 pl-6">
                <h3 className="text-xl font-medium text-text-primary mb-2">Privacy by Design</h3>
                <p className="text-text-secondary">
                  Privacy isn't a feature—it's the foundation. We architect our software from the ground up 
                  to ensure your content remains private and secure.
                </p>
              </div>
              
              <div className="border-l-4 border-blue-400 pl-6">
                <h3 className="text-xl font-medium text-text-primary mb-2">Developer-Centric</h3>
                <p className="text-text-secondary">
                  Built by developers, for developers. We understand your workflow, your tools, and your 
                  unique challenges with technical documentation.
                </p>
              </div>
              
              <div className="border-l-4 border-purple-400 pl-6">
                <h3 className="text-xl font-medium text-text-primary mb-2">Simplicity in Complexity</h3>
                <p className="text-text-secondary">
                  Powerful doesn't have to mean complicated. We hide complex algorithms behind intuitive 
                  interfaces that just work.
                </p>
              </div>
              
              <div className="border-l-4 border-orange-400 pl-6">
                <h3 className="text-xl font-medium text-text-primary mb-2">Open and Transparent</h3>
                <p className="text-text-secondary">
                  We believe in transparency about how our software works, what data we collect (spoiler: very little), 
                  and how we make decisions.
                </p>
              </div>
            </div>
          </section>

          {/* Company Background */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              Part of the Sequenxa Family
            </h2>
            
            <p className="text-text-secondary mb-4">
              Silent Scribe is owned and managed by <strong>Sequenxa</strong>, a company that stands at the critical 
              intersection between human identity and digital intelligence. Sequenxa specializes in sophisticated 
              verification systems, behavioral analysis, and privacy-first security solutions.
            </p>
            
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-6">
              <p className="text-blue-800 font-medium">
                <strong>Sequenxa's Mission:</strong> Revolutionizing how organizations harness digital intelligence 
                while protecting human identity, creating unprecedented value through systems that continuously 
                evolve, adapt, and advance.
              </p>
            </div>
            
            <p className="text-text-secondary mb-6">
              Under Sequenxa's guidance, Silent Scribe embodies the same commitment to privacy-first architecture 
              and sophisticated technology that operates behind an elegant, user-friendly interface. This partnership 
              ensures that Silent Scribe has the resources and expertise to deliver enterprise-grade privacy 
              protection while maintaining the simplicity developers expect.
            </p>

            <h3 className="text-xl font-medium text-text-primary mb-3">
              Built by People Who Understand the Problem
            </h3>
            
            <p className="text-text-secondary mb-6">
              Silent Scribe is founded by a team of experienced developers and technical writers who have 
              lived through the daily frustration of inadequate writing tools. We've spent countless hours 
              configuring Vale, wrestling with style guide enforcement, and compromising our privacy for 
              the sake of user-friendly tools.
            </p>

            <h3 className="text-xl font-medium text-text-primary mb-3">
              Our Experience
            </h3>
            <ul className="list-disc list-inside text-text-secondary mb-6 space-y-2">
              <li><strong>Enterprise Documentation:</strong> Years of experience building and maintaining documentation systems at scale</li>
              <li><strong>Developer Tooling:</strong> Deep understanding of developer workflows and productivity challenges</li>
              <li><strong>Privacy Engineering:</strong> Expertise in building privacy-first software architectures</li>
              <li><strong>Technical Writing:</strong> Hands-on experience with the challenges of creating clear, accurate technical content</li>
            </ul>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h4 className="font-medium text-text-primary mb-2">Community-Driven Development</h4>
              <p className="text-text-secondary">
                We're building Silent Scribe in close collaboration with the developer and technical writing 
                communities. Every feature is informed by real user needs and validated through extensive 
                beta testing with diverse teams.
              </p>
            </div>
          </section>

          {/* The Technology */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              The Technology Behind Silent Scribe
            </h2>
            
            <h3 className="text-xl font-medium text-text-primary mb-3">
              Local-First Architecture
            </h3>
            <p className="text-text-secondary mb-4">
              Our core innovation is a sophisticated natural language processing engine that runs entirely 
              on your local machine. This requires solving complex challenges around:
            </p>
            <ul className="list-disc list-inside text-text-secondary mb-6 space-y-2">
              <li><strong>Performance Optimization:</strong> Real-time analysis without cloud computing power</li>
              <li><strong>Model Efficiency:</strong> Advanced AI capabilities in a lightweight local package</li>
              <li><strong>Cross-Platform Compatibility:</strong> Consistent performance across different operating systems</li>
              <li><strong>Memory Management:</strong> Efficient processing of large documents without impacting system performance</li>
            </ul>

            <h3 className="text-xl font-medium text-text-primary mb-3">
              Advanced Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-text-primary mb-2">Context-Aware Analysis</h4>
                <p className="text-text-secondary text-sm">
                  Understands the difference between code comments, API documentation, and user guides.
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-text-primary mb-2">Custom Rule Engine</h4>
                <p className="text-text-secondary text-sm">
                  Flexible configuration system for team-specific style guides and terminology.
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-text-primary mb-2">Intelligent Suggestions</h4>
                <p className="text-text-secondary text-sm">
                  Not just error detection—proactive suggestions for clarity, conciseness, and impact.
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-text-primary mb-2">Learning Adaptation</h4>
                <p className="text-text-secondary text-sm">
                  Learns your preferences and project-specific terminology over time.
                </p>
              </div>
            </div>
          </section>

          {/* Our Roadmap */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              What's Next: Our Development Roadmap
            </h2>
            
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mr-3">Current</div>
                  <h3 className="text-lg font-medium text-text-primary">Beta Phase</h3>
                </div>
                <ul className="text-text-secondary text-sm space-y-1">
                  <li>• Core writing assistant with VS Code integration</li>
                  <li>• Grammar, style, and technical writing checks</li>
                  <li>• Basic custom style guide support</li>
                  <li>• Community feedback and rapid iteration</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-3">Q1 2026</div>
                  <h3 className="text-lg font-medium text-text-primary">Multi-Platform Launch</h3>
                </div>
                <ul className="text-text-secondary text-sm space-y-1">
                  <li>• JetBrains IDE integration (IntelliJ, WebStorm, PyCharm)</li>
                  <li>• Advanced custom rule configuration</li>
                  <li>• Team collaboration features</li>
                  <li>• Enhanced Markdown and code awareness</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <div className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full mr-3">Q2 2026</div>
                  <h3 className="text-lg font-medium text-text-primary">Advanced Features</h3>
                </div>
                <ul className="text-text-secondary text-sm space-y-1">
                  <li>• AI-powered content suggestions and improvements</li>
                  <li>• Advanced terminology management</li>
                  <li>• Integration with popular documentation platforms</li>
                  <li>• Accessibility and inclusive language checking</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Join Us */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              Join the Silent Scribe Community
            </h2>
            
            <p className="text-text-secondary mb-6">
              We're building Silent Scribe with the developer and technical writing communities, not just for them. 
              Your feedback, ideas, and real-world use cases directly shape our product development.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-blue-900 mb-3">Why Join Our Beta Program?</h3>
              <ul className="text-blue-800 space-y-2">
                <li>• Early access to cutting-edge writing assistance technology</li>
                <li>• Direct influence on feature development and prioritization</li>
                <li>• Community access with other technical writers and developers</li>
                <li>• Free access during the entire beta period</li>
                <li>• Special pricing and benefits for early supporters</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button href="/beta">
                Join the Beta Program
              </Button>
              <Button variant="secondary" href="/contact">
                Get in Touch
              </Button>
            </div>
          </section>

          {/* Contact CTA */}
          <section className="mb-12 bg-gray-50 border border-gray-200 rounded-lg p-8">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              Questions? We'd Love to Hear From You
            </h2>
            <p className="text-text-secondary mb-6">
              Whether you're curious about our technology, interested in partnerships, or just want to chat 
              about the challenges of technical writing, we're always happy to connect with the community.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-medium text-text-primary mb-1">General Inquiries</h3>
                <p className="text-text-secondary text-sm">hello@silentscribe.dev</p>
              </div>
              <div>
                <h3 className="font-medium text-text-primary mb-1">Beta Program</h3>
                <p className="text-text-secondary text-sm">beta@silentscribe.dev</p>
              </div>
              <div>
                <h3 className="font-medium text-text-primary mb-1">Partnerships</h3>
                <p className="text-text-secondary text-sm">partnerships@silentscribe.dev</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Container>
  )
}
