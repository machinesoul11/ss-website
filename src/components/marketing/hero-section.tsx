'use client'

import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { Container } from '@/components/layout/containers'
import {
  EnhancedButton,
  ScrollDepthTracker,
  ConversionFunnelStep,
} from '@/components/analytics'

export function HeroSection() {
  return (
    <ConversionFunnelStep
      stepName="hero_view"
      stepNumber={1}
      funnelName="beta_signup"
    >
      <ScrollDepthTracker trackingId="hero-section">
        <section className="relative overflow-hidden bg-gradient-to-br from-parchment-white to-document-gray py-24 sm:py-32">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-ink-black sm:text-6xl">
                The writing assistant that{' '}
                <span className="text-quill-blue">respects your privacy</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-text-gray">
                Get Vale-level power with Grammarly-level simplicity. All
                processing happens locally—your code, docs, and ideas never
                leave your machine. Finally, a writing tool built by developers,
                for developers.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link href="/beta">
                  <EnhancedButton
                    className="flex items-center px-6 py-3 bg-quill-blue text-parchment-white rounded-lg hover:bg-blue-700 transition-colors"
                    ctaText="Join the Beta"
                    ctaPosition="hero"
                    ctaType="primary"
                    section="hero"
                    destination="/beta"
                    userFlow="beta_signup"
                    trackAsGoal={true}
                    goalName="Hero CTA Click"
                  >
                    Join the Beta
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </EnhancedButton>
                </Link>
                <Link
                  href="#privacy"
                  className="text-ui-label font-medium text-text-gray hover:text-quill-blue transition-colors"
                >
                  Learn about our privacy approach{' '}
                  <span aria-hidden="true">→</span>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="mt-12 flex items-center justify-center space-x-8 text-caption text-muted-gray">
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-suggestion-green rounded-full mr-2"></div>
                  No Cloud Dependencies
                </div>
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-suggestion-green rounded-full mr-2"></div>
                  Enterprise Ready
                </div>
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-suggestion-green rounded-full mr-2"></div>
                  Works Everywhere
                </div>
              </div>
            </div>
          </Container>
        </section>
      </ScrollDepthTracker>
    </ConversionFunnelStep>
  )
}
