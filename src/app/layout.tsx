import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ToastProvider } from '@/components/ui/toast'
import {
  AnalyticsProvider,
  EnhancedAnalyticsProvider,
} from '@/components/analytics'
import { PrivacyAnalyticsProvider } from '@/components/analytics/PrivacyAnalyticsProvider'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { OfflineRecovery } from '@/components/ui/error-recovery'
import {
  ErrorMonitoringProvider,
  ErrorTestingWidget,
  ErrorMonitoringStatusIndicator,
} from '@/components/providers/ErrorMonitoringProvider'
import {
  ErrorFallback,
  HeaderErrorFallback,
  FooterErrorFallback,
} from '@/components/ui/error-fallback'
import Script from 'next/script'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
})

export const metadata: Metadata = {
  title: 'Silent Scribe - Privacy-First Writing Assistant for Developers',
  description:
    'Get Vale-level power with Grammarly-level simplicity. Advanced writing assistance that works locally—your code and docs never leave your machine. Built by developers, for developers.',
  keywords:
    'writing assistant, privacy, technical writing, documentation, local processing, developers, Vale alternative, Grammarly alternative, offline writing tool, code documentation',
  authors: [{ name: 'Silent Scribe Team' }],
  creator: 'Silent Scribe (Sequenxa)',
  category: 'Developer Tools',
  openGraph: {
    title: 'Silent Scribe - Privacy-First Writing Assistant for Developers',
    description:
      'Get Vale-level power with Grammarly-level simplicity. Advanced writing assistance that works locally—your code and docs never leave your machine.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Silent Scribe',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Silent Scribe - Privacy-First Writing Assistant for Developers',
    description:
      'Get Vale-level power with Grammarly-level simplicity. Advanced writing assistance that works locally—your code and docs never leave your machine.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN

  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        {/* Plausible Analytics Script */}
        {plausibleDomain && (
          <>
            <Script
              defer
              data-domain={plausibleDomain}
              src="https://plausible.io/js/script.file-downloads.hash.outbound-links.pageview-props.tagged-events.js"
              strategy="afterInteractive"
            />
            <Script id="plausible-init" strategy="afterInteractive">
              {`window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }`}
            </Script>
          </>
        )}
      </head>
      <body className="antialiased">
        <ErrorMonitoringProvider
          enablePerformanceMonitoring={true}
          enableWebVitalsTracking={true}
          enableMemoryMonitoring={true}
          enableBundleMonitoring={true}
        >
          <ErrorBoundary fallback={<ErrorFallback />}>
            <OfflineRecovery>
              <PrivacyAnalyticsProvider
                config={{
                  enableTracking: true,
                  respectDoNotTrack: true,
                  enablePerformanceMonitoring: true,
                  enableAutoTracking: true,
                }}
              >
                <AnalyticsProvider
                  config={{
                    enableAutoTracking: true,
                    trackScrollDepth: true,
                    trackTimeOnPage: true,
                    trackClicks: true,
                  }}
                >
                  <EnhancedAnalyticsProvider enableAutoTracking={true}>
                    <ToastProvider>
                      <div className="min-h-screen flex flex-col">
                        <ErrorBoundary fallback={<HeaderErrorFallback />}>
                          <Header />
                        </ErrorBoundary>

                        <main className="flex-1">
                          <ErrorBoundary>{children}</ErrorBoundary>
                        </main>

                        <ErrorBoundary fallback={<FooterErrorFallback />}>
                          <Footer />
                        </ErrorBoundary>
                      </div>
                    </ToastProvider>
                  </EnhancedAnalyticsProvider>
                </AnalyticsProvider>
              </PrivacyAnalyticsProvider>
            </OfflineRecovery>

            {/* Error monitoring status and testing widgets */}
            <ErrorMonitoringStatusIndicator />
            <ErrorTestingWidget />
          </ErrorBoundary>
        </ErrorMonitoringProvider>
      </body>
    </html>
  )
}
