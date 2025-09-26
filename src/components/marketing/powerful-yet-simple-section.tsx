import {
  BoltIcon,
  PuzzlePieceIcon,
  ClockIcon,
  CursorArrowRaysIcon,
  AdjustmentsHorizontalIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { Container } from '@/components/layout/containers'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const powerFeatures = [
  {
    title: 'Vale-Level Power',
    description:
      'All the sophisticated rule checking and customization capabilities you need',
    icon: BoltIcon,
    details: [
      'Custom style guide enforcement',
      'Advanced prose analysis',
      'Context-aware suggestions',
      'Professional-grade accuracy',
    ],
  },
  {
    title: 'Grammarly-Level Simplicity',
    description:
      'Zero configuration required - works immediately out of the box',
    icon: SparklesIcon,
    details: [
      'One-click browser extension',
      'Intelligent defaults',
      'Visual configuration interface',
      'No YAML files or CLI setup',
    ],
  },
]

const simplificationBenefits = [
  {
    icon: ClockIcon,
    title: 'Minutes to Start',
    before: 'Vale: Hours of YAML configuration',
    after: 'Silent Scribe: Install and immediately start writing',
  },
  {
    icon: CursorArrowRaysIcon,
    title: 'Visual Interface',
    before: 'Vale: Complex command-line setup',
    after: 'Silent Scribe: Point-and-click rule management',
  },
  {
    icon: PuzzlePieceIcon,
    title: 'Smart Defaults',
    before: 'Vale: Overwhelming rule configuration',
    after: 'Silent Scribe: Intelligent presets that just work',
  },
  {
    icon: AdjustmentsHorizontalIcon,
    title: 'Easy Customization',
    before: 'Vale: Manual YAML editing and sync',
    after: 'Silent Scribe: Drag-and-drop rule customization',
  },
]

export function PowerfulYetSimpleSection() {
  return (
    <section id="powerful-simple" className="py-24 sm:py-32 bg-document-gray">
      <Container>
        {/* Main heading */}
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-quill-blue">
            Powerful Yet Simple
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-ink-black sm:text-4xl">
            Why choose between power and simplicity?
          </p>
          <p className="mt-6 text-lg leading-8 text-text-gray">
            Vale gives you power but punishes you with complexity. Grammarly
            gives you simplicity but lacks the features technical teams need.
            Silent Scribe delivers both.
          </p>
        </div>

        {/* Power + Simplicity showcase */}
        <div className="mx-auto mt-16 max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-8">
            {powerFeatures.map((feature, index) => (
              <div key={feature.title} className="relative">
                <div className="bg-parchment-white rounded-2xl p-8 shadow-sm ring-1 ring-border-gray h-full">
                  <div className="flex items-center mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-quill-blue">
                      <feature.icon className="h-5 w-5 text-parchment-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-ink-black">
                        {feature.title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-text-gray mb-6">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.details.map((detail) => (
                      <li
                        key={detail}
                        className="flex items-center text-sm text-text-gray"
                      >
                        <div className="h-1.5 w-1.5 bg-suggestion-green rounded-full mr-3 flex-shrink-0"></div>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
                {index === 0 && (
                  <div className="hidden lg:flex absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
                    <div className="bg-quill-blue text-parchment-white px-3 py-1 rounded-full text-xs font-medium">
                      +
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Before/After comparison */}
        <div className="mx-auto mt-16 max-w-4xl">
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-ink-black">
              The Silent Scribe Difference
            </h3>
            <p className="mt-2 text-text-gray">
              See how we've solved the complexity problem
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {simplificationBenefits.map((benefit) => (
              <div
                key={benefit.title}
                className="bg-parchment-white rounded-lg p-6 border border-border-gray"
              >
                <div className="flex items-center mb-4">
                  <benefit.icon className="h-5 w-5 text-quill-blue mr-3 flex-shrink-0" />
                  <h4 className="font-medium text-ink-black">
                    {benefit.title}
                  </h4>
                </div>

                <div className="space-y-3">
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <div className="flex items-center mb-1">
                      <div className="h-2 w-2 bg-error-crimson rounded-full mr-2"></div>
                      <span className="text-xs font-medium text-error-crimson">
                        Before
                      </span>
                    </div>
                    <p className="text-sm text-red-700">{benefit.before}</p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <div className="flex items-center mb-1">
                      <div className="h-2 w-2 bg-suggestion-green rounded-full mr-2"></div>
                      <span className="text-xs font-medium text-suggestion-green">
                        After
                      </span>
                    </div>
                    <p className="text-sm text-green-700">{benefit.after}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to action */}
        <div className="mx-auto mt-16 max-w-2xl text-center">
          <div className="bg-gradient-to-r from-quill-blue to-ink-black rounded-2xl p-8 text-white">
            <h3 className="text-xl font-bold mb-4">
              Ready to experience the perfect balance?
            </h3>
            <p className="text-quill-blue-light mb-6">
              Join hundreds of developers who've already discovered the power of
              truly simple writing tools.
            </p>
            <Link href="/beta">
              <Button
                variant="secondary"
                size="lg"
                className="bg-parchment-white text-ink-black hover:bg-document-gray"
              >
                Join the Beta Program
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  )
}
