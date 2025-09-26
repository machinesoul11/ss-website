import { 
  CommandLineIcon, 
  CodeBracketIcon, 
  CogIcon, 
  DocumentTextIcon,
  RocketLaunchIcon,
  UsersIcon
} from '@heroicons/react/24/outline'
import { Container, Grid } from '@/components/layout/containers'

const developerFeatures = [
  {
    name: 'Docs-as-Code Workflow',
    description: 'Seamlessly integrates with your Git workflow. Works in GitHub, GitLab, and any Markdown editor.',
    icon: CodeBracketIcon,
    stat: '90% of teams use Git for docs',
    iconBg: 'bg-quill-blue'
  },
  {
    name: 'Technical Writing Rules',
    description: 'Built-in style guides from Google, Microsoft, and other tech leaders. Understands code context.',
    icon: DocumentTextIcon,
    stat: 'Supports 15+ style guides',
    iconBg: 'bg-suggestion-green'
  },
  {
    name: 'Zero Configuration',
    description: 'Works immediately without complex YAML files or command-line setup. Intelligent defaults for tech teams.',
    icon: CogIcon,
    stat: '< 30 seconds to start',
    iconBg: 'bg-focus-purple'
  },
  {
    name: 'API Documentation',
    description: 'Specialized rules for API docs, code comments, README files, and technical specifications.',
    icon: CommandLineIcon,
    stat: 'Covers 50+ doc types',
    iconBg: 'bg-warning-amber'
  },
  {
    name: 'Developer Experience',
    description: 'Built by developers who understand the frustration of poor documentation tools and complex setup.',
    icon: RocketLaunchIcon,
    stat: '10+ years combined experience',
    iconBg: 'bg-ink-black'
  },
  {
    name: 'Open Source Spirit',
    description: 'Transparent development process, community-driven rules, and commitment to developer privacy.',
    icon: UsersIcon,
    stat: 'MIT licensed core',
    iconBg: 'bg-quill-blue'
  }
]

const credibilityIndicators = [
  {
    metric: 'Developer Focus',
    description: 'Built specifically for technical teams and their unique documentation needs'
  },
  {
    metric: 'Privacy by Design',
    description: 'Architecture designed for enterprise security and regulatory compliance'
  },
  {
    metric: 'Technical Depth',
    description: 'Created by developers who understand the pain points of existing tools'
  },
  {
    metric: 'Industry Standards',
    description: 'Implements proven style guides from leading technology companies'
  }
]

export function DeveloperFocusedSection() {
  return (
    <section id="developers" className="py-24 sm:py-32 bg-gradient-to-b from-parchment-white to-document-gray">
      <Container>
        {/* Main heading */}
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-quill-blue">Built for Developers</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-ink-black sm:text-4xl">
            Finally, a writing tool that gets it
          </p>
          <p className="mt-6 text-lg leading-8 text-text-gray">
            Designed by developers who were frustrated with existing solutions. We understand your workflow, 
            your privacy concerns, and your need for technical accuracy.
          </p>
        </div>

        {/* Developer features grid */}
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {developerFeatures.map((feature) => (
              <div key={feature.name} className="bg-parchment-white rounded-lg p-6 hover:shadow-lg transition-shadow border border-border-gray hover:border-quill-blue/20 hover:bg-document-gray/30">
                <div className="flex items-start mb-4">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-md ${feature.iconBg} flex-shrink-0 mt-1`}>
                    <feature.icon className="h-4 w-4 text-parchment-white" aria-hidden="true" />
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-semibold text-ink-black">{feature.name}</h3>
                    <p className="text-xs text-quill-blue font-medium mt-1">{feature.stat}</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-text-gray mt-3">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Credibility indicators */}
        <div className="mx-auto mt-16 max-w-4xl">
          <div className="rounded-2xl bg-gradient-to-r from-quill-blue/5 to-ink-black/5 p-8 ring-1 ring-border-gray">
            <h3 className="text-lg font-semibold text-ink-black mb-6 text-center">
              Why Developers Trust Silent Scribe
            </h3>
            <Grid cols={2} gap="md" className="max-w-3xl mx-auto">
              {credibilityIndicators.map((indicator) => (
                <div key={indicator.metric} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-2 w-2 bg-suggestion-green rounded-full mt-2"></div>
                  </div>
                  <div>
                    <h4 className="font-medium text-ink-black text-sm">{indicator.metric}</h4>
                    <p className="text-xs text-text-gray mt-1">{indicator.description}</p>
                  </div>
                </div>
              ))}
            </Grid>
          </div>
        </div>

        {/* Team background teaser */}
        <div className="mx-auto mt-16 max-w-2xl text-center">
          <div className="bg-parchment-white border border-border-gray rounded-lg p-6">
            <h4 className="text-base font-semibold text-ink-black mb-2">
              Meet the Team
            </h4>
            <p className="text-sm text-text-gray mb-4">
              Built by developers with experience at enterprise companies who understand 
              the real challenges of technical documentation and privacy requirements.
            </p>
            <p className="text-xs text-muted-gray">
              Team backgrounds and expertise details coming soon
            </p>
          </div>
        </div>
      </Container>
    </section>
  )
}
