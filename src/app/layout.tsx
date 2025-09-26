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
          <ErrorBoundary
            fallback={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-6 max-w-md">
                  <div className="text-red-500 mb-4">
                    <svg
                      className="w-16 h-16 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <h1 className="text-xl font-semibold text-gray-900 mb-2">
                    Application Error
                  </h1>
                  <p className="text-gray-600 mb-4">
                    Something went wrong. Please refresh the page or try again
                    later.
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Reload Page
                  </button>
                </div>
              </div>
            }
          >
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
                        <ErrorBoundary
                          fallback={
                            <div className="bg-red-50 border-b border-red-200 p-4">
                              <div className="text-center text-red-700">
                                <p>
                                  Header component failed to load. Some
                                  navigation features may be unavailable.
                                </p>
                              </div>
                            </div>
                          }
                        >
                          <Header />
                        </ErrorBoundary>

                        <main className="flex-1">
                          <ErrorBoundary>{children}</ErrorBoundary>
                        </main>

                        <ErrorBoundary
                          fallback={
                            <footer className="bg-gray-900 text-white py-8">
                              <div className="container mx-auto px-4 text-center">
                                <p>Footer content unavailable</p>
                              </div>
                            </footer>
                          }
                        >
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
