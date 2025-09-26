import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/layout/containers'

export function CTASection() {
  return (
    <section className="py-24 sm:py-32 bg-quill-blue">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-parchment-white sm:text-4xl">
            Stop compromising between power and privacy
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-100">
            Join developers who refuse to send their proprietary code and
            documentation to the cloud. Get enterprise-grade writing assistance
            that works completely offline.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/beta">
              <Button
                size="lg"
                variant="secondary"
                className="bg-parchment-white text-quill-blue hover:bg-gray-50 border-0"
              >
                Join Beta Program
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link
              href="/about"
              className="text-ui-label font-medium text-blue-100 hover:text-parchment-white transition-colors"
            >
              Learn more about our mission <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-parchment-white">
                100%
              </div>
              <div className="text-blue-100">Local Processing</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-parchment-white">0</div>
              <div className="text-blue-100">Data Collection</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-parchment-white">∞</div>
              <div className="text-blue-100">Privacy Protection</div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
