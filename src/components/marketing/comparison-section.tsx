import { Container } from '@/components/layout/containers'
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface ComparisonFeature {
  feature: string
  silentScribe: boolean | string
  grammarly: boolean | string
  vale: boolean | string
}

const comparisonFeatures: ComparisonFeature[] = [
  {
    feature: 'Privacy Protection',
    silentScribe: 'Complete local processing',
    grammarly: false,
    vale: 'Local only',
  },
  {
    feature: 'Technical Writing Focus',
    silentScribe: 'Built for developers',
    grammarly: 'General purpose',
    vale: 'Technical focus',
  },
  {
    feature: 'Ease of Setup',
    silentScribe: 'Browser extension',
    grammarly: 'Simple install',
    vale: 'Complex configuration',
  },
  {
    feature: 'Real-time Suggestions',
    silentScribe: true,
    grammarly: true,
    vale: false,
  },
  {
    feature: 'Custom Style Guides',
    silentScribe: 'Visual interface',
    grammarly: 'Limited',
    vale: 'YAML configuration',
  },
  {
    feature: 'No Internet Required',
    silentScribe: true,
    grammarly: false,
    vale: true,
  },
  {
    feature: 'Code Context Awareness',
    silentScribe: true,
    grammarly: false,
    vale: 'Limited',
  },
  {
    feature: 'Enterprise Compliance',
    silentScribe: 'Built-in',
    grammarly: 'Paid tiers',
    vale: 'Self-hosted',
  },
]

function FeatureCell({ value }: { value: boolean | string }) {
  if (typeof value === 'boolean') {
    return value ? (
      <CheckIcon className="h-5 w-5 text-suggestion-green mx-auto" />
    ) : (
      <XMarkIcon className="h-5 w-5 text-error-crimson mx-auto" />
    )
  }
  return (
    <span className="text-sm text-text-gray text-center block">{value}</span>
  )
}

export function ComparisonSection() {
  return (
    <section id="comparison" className="py-24 sm:py-32 bg-parchment-white">
      <Container>
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-quill-blue">
            How We Compare
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-ink-black sm:text-4xl">
            The best of both worlds
          </p>
          <p className="mt-6 text-lg leading-8 text-text-gray">
            Silent Scribe combines the ease of use you expect from Grammarly
            with the privacy and technical focus of Vale, without the complexity
            or privacy concerns.
          </p>
        </div>

        <div className="mt-16 overflow-hidden bg-parchment-white shadow-sm ring-1 ring-border-gray rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-gray">
              <thead className="bg-document-gray">
                <tr>
                  <th className="px-6 py-3 text-left text-ui-label font-medium text-ink-black tracking-wider">
                    Feature
                  </th>
                  <th className="px-6 py-3 text-center text-ui-label font-medium text-quill-blue tracking-wider">
                    Silent Scribe
                  </th>
                  <th className="px-6 py-3 text-center text-ui-label font-medium text-text-gray tracking-wider">
                    Grammarly
                  </th>
                  <th className="px-6 py-3 text-center text-ui-label font-medium text-text-gray tracking-wider">
                    Vale
                  </th>
                </tr>
              </thead>
              <tbody className="bg-parchment-white divide-y divide-border-gray">
                {comparisonFeatures.map((row, index) => (
                  <tr
                    key={row.feature}
                    className={
                      index % 2 === 0
                        ? 'bg-parchment-white'
                        : 'bg-document-gray'
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-body font-medium text-ink-black">
                      {row.feature}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <FeatureCell value={row.silentScribe} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <FeatureCell value={row.grammarly} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <FeatureCell value={row.vale} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-body text-muted-gray">
            Ready to experience the perfect balance of power, privacy, and
            simplicity?
          </p>
        </div>
      </Container>
    </section>
  )
}
