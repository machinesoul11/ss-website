import {
  StarIcon,
  UsersIcon,
  BuildingOfficeIcon,
  CodeBracketIcon,
  ChatBubbleLeftEllipsisIcon,
  TrophyIcon,
} from '@heroicons/react/24/solid'
import { Container, Grid } from '@/components/layout/containers'

// Placeholder testimonials structure - will be populated with real data
const testimonialPlaceholders = [
  {
    id: 1,
    content:
      'Testimonial content will be populated with real user feedback from beta program',
    author: 'Developer Name',
    role: 'Senior Developer',
    company: 'Tech Company',
    avatar: '/placeholder-avatar-1.jpg',
    verified: true,
  },
  {
    id: 2,
    content:
      'Technical writer testimonial about improved workflow and privacy benefits',
    author: 'Technical Writer Name',
    role: 'Lead Technical Writer',
    company: 'Enterprise Company',
    avatar: '/placeholder-avatar-2.jpg',
    verified: true,
  },
  {
    id: 3,
    content:
      'DevOps engineer testimonial about docs-as-code integration and team adoption',
    author: 'DevOps Engineer Name',
    role: 'DevOps Engineer',
    company: 'SaaS Startup',
    avatar: '/placeholder-avatar-3.jpg',
    verified: true,
  },
]

// Placeholder community metrics - will be updated with real data
const communityMetrics = [
  {
    label: 'Beta Signups',
    value: '###',
    icon: UsersIcon,
    description: 'Developers joined beta program',
  },
  {
    label: 'GitHub Stars',
    value: '###',
    icon: StarIcon,
    description: 'Community support on GitHub',
  },
  {
    label: 'Companies',
    value: '##',
    icon: BuildingOfficeIcon,
    description: 'Organizations using Silent Scribe',
  },
  {
    label: 'Extensions Installed',
    value: '###',
    icon: CodeBracketIcon,
    description: 'Active browser extensions',
  },
]

// Placeholder for community highlights
const communityHighlights = [
  {
    platform: 'Reddit',
    community: 'r/programming',
    highlight: 'Discussion thread with positive developer feedback',
    engagement: 'XX upvotes, XX comments',
    link: '#',
  },
  {
    platform: 'Hacker News',
    community: 'Show HN',
    highlight: 'Launch post with community discussion',
    engagement: 'XX points, XX comments',
    link: '#',
  },
  {
    platform: 'DEV Community',
    community: 'Technical Writing',
    highlight: 'Featured article about privacy-first writing tools',
    engagement: 'XX reactions, XX comments',
    link: '#',
  },
]

// Placeholder for case studies
const caseStudyPreviews = [
  {
    title: 'How Team X Improved Documentation Quality by 40%',
    company: 'Enterprise Tech Company',
    industry: 'SaaS',
    summary:
      'Case study preview about improved documentation workflow and quality metrics.',
    metrics: [
      '40% fewer documentation errors',
      '60% faster review cycles',
      '100% privacy compliance',
    ],
    status: 'Coming Soon',
  },
  {
    title: 'From Vale Complexity to Silent Scribe Simplicity',
    company: 'Open Source Project',
    industry: 'Developer Tools',
    summary:
      'Migration story from complex Vale setup to streamlined Silent Scribe workflow.',
    metrics: [
      '90% setup time reduction',
      'Team adoption increased 3x',
      'Zero configuration maintenance',
    ],
    status: 'Coming Soon',
  },
]

export function SocialProofSection() {
  return (
    <section id="social-proof" className="py-24 sm:py-32 bg-document-gray">
      <Container>
        {/* Section header */}
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-quill-blue">
            Social Proof
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-ink-black sm:text-4xl">
            Trusted by developers worldwide
          </p>
          <p className="mt-6 text-lg leading-8 text-text-gray">
            Join a growing community of developers and technical writers who
            prioritize both excellent documentation and complete privacy.
          </p>
        </div>

        {/* Community metrics */}
        <div className="mx-auto mt-16 max-w-4xl">
          <Grid cols={4} gap="md">
            {communityMetrics.map((metric) => (
              <div
                key={metric.label}
                className="bg-parchment-white rounded-lg p-6 text-center border border-border-gray"
              >
                <div className="flex justify-center mb-3">
                  <metric.icon className="h-6 w-6 text-quill-blue" />
                </div>
                <div className="text-2xl font-bold text-ink-black">
                  {metric.value}
                </div>
                <div className="text-sm font-medium text-ink-black mt-1">
                  {metric.label}
                </div>
                <div className="text-xs text-text-gray mt-1">
                  {metric.description}
                </div>
              </div>
            ))}
          </Grid>
        </div>

        {/* Testimonials placeholder */}
        <div className="mx-auto mt-16 max-w-4xl">
          <h3 className="text-xl font-semibold text-ink-black text-center mb-8">
            What Developers Are Saying
          </h3>
          <Grid cols={3} gap="md">
            {testimonialPlaceholders.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-parchment-white rounded-lg p-6 border border-border-gray"
              >
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 bg-document-gray rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-text-gray">
                      {testimonial.author
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </span>
                  </div>
                  <div className="ml-3">
                    <div className="flex items-center">
                      <h4 className="text-sm font-medium text-ink-black">
                        {testimonial.author}
                      </h4>
                      {testimonial.verified && (
                        <StarIcon className="h-4 w-4 text-quill-blue ml-1" />
                      )}
                    </div>
                    <p className="text-xs text-text-gray">{testimonial.role}</p>
                    <p className="text-xs text-muted-gray">
                      {testimonial.company}
                    </p>
                  </div>
                </div>
                <div className="bg-document-gray/50 rounded p-3">
                  <p className="text-sm text-text-gray italic">
                    {testimonial.content}
                  </p>
                </div>
              </div>
            ))}
          </Grid>
          <div className="text-center mt-6">
            <p className="text-sm text-muted-gray">
              Testimonials will be populated with real feedback from beta users
            </p>
          </div>
        </div>

        {/* Community highlights */}
        <div className="mx-auto mt-16 max-w-4xl">
          <h3 className="text-xl font-semibold text-ink-black text-center mb-8">
            Community Highlights
          </h3>
          <div className="bg-parchment-white rounded-lg border border-border-gray p-6">
            <div className="space-y-4">
              {communityHighlights.map((highlight, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-document-gray/30 rounded"
                >
                  <div className="flex items-center space-x-4">
                    <ChatBubbleLeftEllipsisIcon className="h-4 w-4 text-quill-blue flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-ink-black">
                        {highlight.platform} - {highlight.community}
                      </h4>
                      <p className="text-xs text-text-gray">
                        {highlight.highlight}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-gray">
                      {highlight.engagement}
                    </p>
                    <p className="text-xs text-quill-blue">View Discussion →</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-4">
              <p className="text-sm text-muted-gray">
                Community engagement metrics will be updated as discussions
                develop
              </p>
            </div>
          </div>
        </div>

        {/* Case study previews */}
        <div className="mx-auto mt-16 max-w-4xl">
          <h3 className="text-xl font-semibold text-ink-black text-center mb-8">
            Success Stories
          </h3>
          <Grid cols={2} gap="lg">
            {caseStudyPreviews.map((caseStudy, index) => (
              <div
                key={index}
                className="bg-parchment-white rounded-lg border border-border-gray p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <TrophyIcon className="h-5 w-5 text-quill-blue" />
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    {caseStudy.status}
                  </span>
                </div>
                <h4 className="text-base font-semibold text-ink-black mb-2">
                  {caseStudy.title}
                </h4>
                <p className="text-sm text-text-gray mb-3">
                  {caseStudy.company} • {caseStudy.industry}
                </p>
                <p className="text-sm text-text-gray mb-4">
                  {caseStudy.summary}
                </p>
                <div className="space-y-1">
                  {caseStudy.metrics.map((metric, metricIndex) => (
                    <div
                      key={metricIndex}
                      className="flex items-center text-xs text-suggestion-green"
                    >
                      <div className="h-1 w-1 bg-suggestion-green rounded-full mr-2"></div>
                      {metric}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </Grid>
          <div className="text-center mt-6">
            <p className="text-sm text-muted-gray">
              Detailed case studies will be published as beta program
              participants share their results
            </p>
          </div>
        </div>

        {/* Beta program CTA */}
        <div className="mx-auto mt-16 max-w-2xl text-center">
          <div className="bg-quill-blue rounded-2xl p-8 text-white">
            <h3 className="text-xl font-bold mb-4">Be Part of the Story</h3>
            <p className="text-quill-blue-light mb-6">
              Join our beta program and help shape the future of privacy-first
              writing tools. Your feedback and success story could be featured
              here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/beta"
                className="bg-parchment-white text-ink-black px-6 py-3 rounded-lg font-medium hover:bg-document-gray transition-colors"
              >
                Join Beta Program
              </a>
              <a
                href="#features"
                className="border border-parchment-white text-parchment-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
