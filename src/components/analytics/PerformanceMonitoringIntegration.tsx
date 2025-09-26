/**
 * Performance Monitoring Integration
 * Phase 6: Performance Monitoring - Application Integration
 *
 * Integrates all performance monitoring components into the application
 */

'use client'

import React, { useEffect } from 'react'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { PerformanceProvider } from '@/components/analytics/PerformanceProvider'
import { usePerformanceMonitoring } from '@/lib/services/performance-monitoring'
import { errorTracker } from '@/lib/services/error-tracking'

interface PerformanceMonitoringIntegrationProps {
  children: React.ReactNode
  enableInProduction?: boolean
  config?: {
    enableWebVitals?: boolean
    enableErrorTracking?: boolean
    enableMemoryMonitoring?: boolean
    enableBundleMonitoring?: boolean
    errorSampleRate?: number
    performanceSampleRate?: number
  }
}

export function PerformanceMonitoringIntegration({
  children,
  enableInProduction = true,
  config = {},
}: PerformanceMonitoringIntegrationProps) {
  const {
    enableWebVitals = true,
    enableErrorTracking = true,
    enableMemoryMonitoring = true,
    enableBundleMonitoring = true,
    errorSampleRate = 1.0,
    performanceSampleRate = 0.1,
  } = config

  // Only enable in development or if explicitly enabled in production
  const isMonitoringEnabled =
    process.env.NODE_ENV === 'development' || enableInProduction

  useEffect(() => {
    if (!isMonitoringEnabled || typeof window === 'undefined') return

    // Initialize global performance monitoring
    const initializeMonitoring = async () => {
      try {
        // Send initial page load metrics
        setTimeout(() => {
          const navigation = performance.getEntriesByType(
            'navigation'
          )[0] as PerformanceNavigationTiming
          if (navigation) {
            const metrics = {
              loadTime: navigation.loadEventEnd - navigation.loadEventStart,
              domContentLoaded:
                navigation.domContentLoadedEventEnd -
                navigation.domContentLoadedEventStart,
              firstByte: navigation.responseStart - navigation.requestStart,
              dnsLookup:
                navigation.domainLookupEnd - navigation.domainLookupStart,
              tcpConnect: navigation.connectEnd - navigation.connectStart,
            }

            // Sample performance data based on sample rate
            if (Math.random() < performanceSampleRate) {
              fetch('/api/analytics/performance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  metrics,
                  page: window.location.pathname,
                  timestamp: Date.now(),
                  userAgent: navigator.userAgent,
                }),
              }).catch(console.warn)
            }
          }
        }, 1000)

        // Log successful monitoring initialization
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 Performance monitoring initialized', {
            webVitals: enableWebVitals,
            errorTracking: enableErrorTracking,
            memoryMonitoring: enableMemoryMonitoring,
            bundleMonitoring: enableBundleMonitoring,
            errorSampleRate,
            performanceSampleRate,
          })
        }
      } catch (error) {
        console.warn('Failed to initialize performance monitoring:', error)
      }
    }

    initializeMonitoring()

    // Monitor page visibility changes to send queued data
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Page is being hidden, flush any pending data
        const stats = errorTracker.getErrorStats()
        if (stats.queuedErrors > 0 || stats.queuedPerformanceIssues > 0) {
          // This will trigger the automatic flush in error tracker
          navigator.sendBeacon(
            '/api/analytics/error-tracking',
            JSON.stringify({
              flush: true,
              stats,
            })
          )
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [
    isMonitoringEnabled,
    enableWebVitals,
    enableErrorTracking,
    enableMemoryMonitoring,
    enableBundleMonitoring,
    errorSampleRate,
    performanceSampleRate,
  ])

  if (!isMonitoringEnabled) {
    return <>{children}</>
  }

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Sample errors based on error sample rate
        if (Math.random() < errorSampleRate) {
          console.error('Application Error Boundary:', error, errorInfo)
        }
      }}
    >
      <PerformanceProvider
        enableWebVitalsMonitoring={enableWebVitals}
        enableErrorTracking={enableErrorTracking}
        enableMemoryMonitoring={enableMemoryMonitoring}
        enableBundleMonitoring={enableBundleMonitoring}
      >
        <PerformanceMetricsCollector />
        {children}
      </PerformanceProvider>
    </ErrorBoundary>
  )
}

/**
 * Component that runs performance metrics collection
 */
function PerformanceMetricsCollector() {
  const { getCurrentMetrics } = usePerformanceMonitoring()

  useEffect(() => {
    // Collect metrics periodically
    const interval = setInterval(() => {
      if (typeof window === 'undefined') return

      const metrics = getCurrentMetrics()

      // Only send metrics if we have meaningful data
      if (metrics && (metrics.lcp || metrics.fid || metrics.cls)) {
        // This will be handled by the performance monitoring hook
        // which batches and sends data automatically
      }
    }, 30000) // Every 30 seconds

    return () => clearInterval(interval)
  }, [getCurrentMetrics])

  return null
}

/**
 * Hook for components to easily integrate performance monitoring
 */
export function useApplicationPerformance() {
  const reportError = React.useCallback((error: Error, context?: string) => {
    errorTracker.captureError({
      message: error.message,
      stack: error.stack,
      severity: 'medium',
      category: 'user',
      metadata: { context },
    })
  }, [])

  const trackUserAction = React.useCallback(
    (action: string, data?: Record<string, any>) => {
      // Track user interactions that might impact performance
      fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'user_action',
          action,
          data,
          page: window.location.pathname,
          timestamp: Date.now(),
        }),
      }).catch(() => {
        // Silently fail - don't impact user experience
      })
    },
    []
  )

  const measureOperation = React.useCallback(
    async function <T>(
      operation: () => Promise<T>,
      operationName: string
    ): Promise<T> {
      const startTime = performance.now()

      try {
        const result = await operation()
        const duration = performance.now() - startTime

        // Track successful operations
        if (duration > 100) {
          // Only track operations > 100ms
          trackUserAction('slow_operation', {
            operation: operationName,
            duration: Math.round(duration),
          })
        }

        return result
      } catch (error) {
        const duration = performance.now() - startTime

        reportError(
          error as Error,
          `Failed operation: ${operationName} (${Math.round(duration)}ms)`
        )
        throw error
      }
    },
    [reportError, trackUserAction]
  )

  return {
    reportError,
    trackUserAction,
    measureOperation,
  }
}

/**
 * Performance monitoring configuration for different environments
 */
export const PerformanceConfig = {
  development: {
    enableWebVitals: true,
    enableErrorTracking: true,
    enableMemoryMonitoring: true,
    enableBundleMonitoring: true,
    errorSampleRate: 1.0,
    performanceSampleRate: 1.0,
  },

  production: {
    enableWebVitals: true,
    enableErrorTracking: true,
    enableMemoryMonitoring: false, // Might impact performance
    enableBundleMonitoring: false, // Might impact performance
    errorSampleRate: 0.1, // Sample 10% of errors
    performanceSampleRate: 0.01, // Sample 1% of performance events
  },

  staging: {
    enableWebVitals: true,
    enableErrorTracking: true,
    enableMemoryMonitoring: true,
    enableBundleMonitoring: true,
    errorSampleRate: 0.5,
    performanceSampleRate: 0.1,
  },
}

/**
 * Get environment-appropriate config
 */
export function getPerformanceConfig() {
  const env = process.env.NODE_ENV

  if (env === 'development') {
    return PerformanceConfig.development
  } else if (env === 'production') {
    return PerformanceConfig.production
  } else {
    return PerformanceConfig.staging
  }
}
