import {
  ShieldCheckIcon,
  CpuChipIcon,
  CodeBracketIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline'
import { Container, Grid } from '@/components/layout/containers'

const features = [
  {
    name: 'Privacy by Design',
    description:
      'Everything runs locally in your browser. No data ever leaves your machine, no accounts required, no telemetry.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Local AI Processing',
    description:
      'Advanced language models run entirely on your device, providing intelligent suggestions without cloud dependencies.',
    icon: CpuChipIcon,
  },
  {
    name: 'Developer-Focused',
    description:
      'Built specifically for technical documentation, code comments, and developer communication with context awareness.',
    icon: CodeBracketIcon,
  },
  {
    name: 'Zero Trust Architecture',
    description:
      'Designed with security-first principles. Your proprietary content and trade secrets stay completely private.',
    icon: LockClosedIcon,
  },
]

export function PrivacyFirstSection() {
  return (
    <section id="privacy" className="py-24 sm:py-32 bg-document-gray">
      <Container>
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-quill-blue">
            Privacy First
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-ink-black sm:text-4xl">
            Your writing stays yours
          </p>
          <p className="mt-6 text-lg leading-8 text-text-gray">
            Unlike cloud-based alternatives, Silent Scribe processes everything
            locally. No data transmission means no privacy concerns, compliance
            issues, or security risks.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <Grid
            cols={2}
            gap="xl"
            className="max-w-xl gap-x-8 gap-y-10 lg:max-w-none"
          >
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-ink-black">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-quill-blue">
                    <feature.icon
                      className="h-6 w-6 text-parchment-white"
                      aria-hidden="true"
                    />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base leading-7 text-text-gray">
                  {feature.description}
                </dd>
              </div>
            ))}
          </Grid>
        </div>

        {/* Technical Architecture Callout */}
        <div className="mx-auto mt-16 max-w-4xl">
          <div className="rounded-2xl bg-parchment-white p-8 shadow-sm ring-1 ring-border-gray">
            <h3 className="text-lg font-semibold text-ink-black mb-4">
              Technical Privacy Guarantees
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-text-gray mb-2">
                  Network Isolation
                </h4>
                <p className="text-sm text-muted-gray">
                  Zero network requests after initial load. All processing
                  happens in isolated web workers.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-text-gray mb-2">
                  Memory Protection
                </h4>
                <p className="text-sm text-muted-gray">
                  Content never persists beyond your session. No local storage,
                  no caching, no traces.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-text-gray mb-2">
                  Audit Transparency
                </h4>
                <p className="text-sm text-muted-gray">
                  Open source architecture allows full security audits and
                  verification of privacy claims.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-text-gray mb-2">
                  Compliance Ready
                </h4>
                <p className="text-sm text-muted-gray">
                  Meets GDPR, HIPAA, and enterprise security requirements by
                  design.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
