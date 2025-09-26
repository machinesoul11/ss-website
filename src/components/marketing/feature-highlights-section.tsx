import {
  ShieldCheckIcon,
  BoltIcon,
  CodeBracketIcon,
  CogIcon,
  DocumentTextIcon,
  ClockIcon,
  GlobeAltIcon,
  PuzzlePieceIcon,
  UserGroupIcon,
  AcademicCapIcon,
  CheckBadgeIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { Container, Grid } from '@/components/layout/containers'

const featureHighlights = [
  {
    name: 'Privacy First',
    description:
      'Complete local processing. Zero data transmission to external servers.',
    icon: ShieldCheckIcon,
    category: 'Privacy',
  },
  {
    name: 'Lightning Fast',
    description:
      'Real-time suggestions as you type. No lag, no delays, no waiting.',
    icon: BoltIcon,
    category: 'Performance',
  },
  {
    name: 'Code Context Aware',
    description:
      'Understands code blocks, API references, and technical terminology.',
    icon: CodeBracketIcon,
    category: 'Intelligence',
  },
  {
    name: 'Zero Configuration',
    description:
      'Works immediately after install. Intelligent defaults for technical writing.',
    icon: CogIcon,
    category: 'Simplicity',
  },
  {
    name: 'Style Guide Enforcement',
    description:
      'Built-in rules from Google, Microsoft, and other tech industry leaders.',
    icon: DocumentTextIcon,
    category: 'Quality',
  },
  {
    name: 'Instant Setup',
    description:
      'Browser extension installs in seconds. Start writing immediately.',
    icon: ClockIcon,
    category: 'Efficiency',
  },
  {
    name: 'Works Everywhere',
    description:
      'GitHub, GitLab, Notion, Google Docs, and any web-based editor.',
    icon: GlobeAltIcon,
    category: 'Compatibility',
  },
  {
    name: 'Extensible Rules',
    description:
      'Add custom rules and style preferences without complex configuration.',
    icon: PuzzlePieceIcon,
    category: 'Customization',
  },
  {
    name: 'Team Collaboration',
    description:
      'Share style configurations across your team for consistent documentation.',
    icon: UserGroupIcon,
    category: 'Collaboration',
  },
  {
    name: 'Multiple Formats',
    description:
      'Supports Markdown, reStructuredText, AsciiDoc, and plain text.',
    icon: AcademicCapIcon,
    category: 'Versatility',
  },
  {
    name: 'Enterprise Ready',
    description:
      'GDPR compliant, SOC 2 ready, perfect for regulated industries.',
    icon: CheckBadgeIcon,
    category: 'Compliance',
  },
  {
    name: 'AI-Powered',
    description:
      'Advanced language models running locally for intelligent suggestions.',
    icon: SparklesIcon,
    category: 'Intelligence',
  },
]

const categoryColors = {
  Privacy: 'bg-blue-100 text-blue-800 border-blue-200',
  Performance: 'bg-green-100 text-green-800 border-green-200',
  Intelligence: 'bg-purple-100 text-purple-800 border-purple-200',
  Simplicity: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Quality: 'bg-red-100 text-red-800 border-red-200',
  Efficiency: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  Compatibility: 'bg-pink-100 text-pink-800 border-pink-200',
  Customization: 'bg-orange-100 text-orange-800 border-orange-200',
  Collaboration: 'bg-teal-100 text-teal-800 border-teal-200',
  Versatility: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  Compliance: 'bg-gray-100 text-gray-800 border-gray-200',
}

export function FeatureHighlightsSection() {
  return (
    <section
      id="features"
      className="py-24 sm:py-32 bg-gradient-to-b from-parchment-white via-document-gray to-parchment-white"
    >
      <Container>
        {/* Section header */}
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-quill-blue">
            Feature Highlights
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-ink-black sm:text-4xl">
            Everything you need for better documentation
          </p>
          <p className="mt-6 text-lg leading-8 text-text-gray">
            Comprehensive writing assistance built specifically for developers
            and technical teams. No compromises on features, privacy, or user
            experience.
          </p>
        </div>

        {/* Features grid */}
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureHighlights.map((feature) => (
              <div
                key={feature.name}
                className="group relative bg-parchment-white rounded-lg p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer border border-border-gray hover:border-quill-blue/30 hover:bg-document-gray/50"
              >
                {/* Category badge */}
                <div className="mb-4">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${categoryColors[feature.category as keyof typeof categoryColors] || categoryColors.Quality}`}
                  >
                    {feature.category}
                  </span>
                </div>

                {/* Icon and title */}
                <div className="flex items-start mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-quill-blue group-hover:bg-ink-black transition-colors flex-shrink-0 mt-0.5">
                    <feature.icon
                      className="h-4 w-4 text-parchment-white"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="ml-3 text-sm font-semibold text-ink-black group-hover:text-quill-blue transition-colors">
                    {feature.name}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-sm leading-6 text-text-gray">
                  {feature.description}
                </p>

                {/* Hover effect indicator */}
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="h-2 w-2 bg-quill-blue rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature summary stats */}
        <div className="mx-auto mt-16 max-w-4xl">
          <div className="bg-gradient-to-r from-document-gray to-parchment-white rounded-2xl p-8 border border-border-gray">
            <div className="text-center mb-8">
              <h3 className="text-lg font-semibold text-ink-black">
                By the Numbers
              </h3>
              <p className="text-sm text-text-gray mt-1">
                What makes Silent Scribe the complete solution
              </p>
            </div>

            <Grid cols={4} gap="lg" className="max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-quill-blue">100%</div>
                <div className="text-xs text-text-gray mt-1">
                  Local Processing
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-quill-blue">15+</div>
                <div className="text-xs text-text-gray mt-1">Style Guides</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-quill-blue">
                  &lt;30s
                </div>
                <div className="text-xs text-text-gray mt-1">Setup Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-quill-blue">0</div>
                <div className="text-xs text-text-gray mt-1">
                  Data Transmitted
                </div>
              </div>
            </Grid>
          </div>
        </div>
      </Container>
    </section>
  )
}
