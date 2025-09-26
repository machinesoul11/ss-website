/**
 * Performance Monitoring Provider
 * Phase 6: Performance Monitoring - Comprehensive Monitoring Integration
 *
 * Provides comprehensive performance monitoring across the application
 */

'use client'

import React, { createContext, useContext, useEffect, ReactNode } from 'react'
import { usePerformanceMonitoring } from '@/lib/services/performance-monitoring'
import { errorTracker, PerformanceMonitor } from '@/lib/services/error-tracking'

interface PerformanceContextValue {
  trackEvent: (eventName: string, data?: Record<string, any>) => void
  reportPerformanceIssue: (
    type: string,
    message: string,
    severity?: 'low' | 'medium' | 'high' | 'critical'
  ) => void
  getCurrentMetrics: () => any
  isMonitoring: boolean
}

const PerformanceContext = createContext<PerformanceContextValue>({
  trackEvent: () => {},
  reportPerformanceIssue: () => {},
  getCurrentMetrics: () => null,
  isMonitoring: false,
})

interface PerformanceProviderProps {
  children: ReactNode
  enableWebVitalsMonitoring?: boolean
  enableErrorTracking?: boolean
  enableMemoryMonitoring?: boolean
  enableBundleMonitoring?: boolean
}

export function PerformanceProvider({
  children,
  enableWebVitalsMonitoring = true,
  enableErrorTracking = true,
  enableMemoryMonitoring = true,
  enableBundleMonitoring = true,
}: PerformanceProviderProps) {
  const { getCurrentMetrics } = usePerformanceMonitoring()
  const [isMonitoring, setIsMonitoring] = React.useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Initialize monitoring based on props
    const cleanup: (() => void)[] = []

    try {
      if (enableWebVitalsMonitoring) {
        PerformanceMonitor.monitorWebVitals()
      }

      if (enableMemoryMonitoring) {
        PerformanceMonitor.monitorMemoryUsage()
      }

      if (enableBundleMonitoring) {
        PerformanceMonitor.monitorBundlePerformance()
      }

      // Monitor long tasks (tasks that block the main thread for >50ms)
      if ('PerformanceObserver' in window) {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              errorTracker.capturePerformanceIssue({
                type: 'slow-api',
                severity: entry.duration > 100 ? 'high' : 'medium',
                message: `Long task detected: ${Math.round(entry.duration)}ms`,
                page: window.location.pathname,
                metrics: { duration: entry.duration },
                timestamp: Date.now(),
                userAgent: navigator.userAgent,
              })
            }
          }
        })

        try {
          longTaskObserver.observe({ entryTypes: ['longtask'] })
          cleanup.push(() => longTaskObserver.disconnect())
        } catch (error) {
          console.warn('Long task monitoring not supported:', error)
        }
      }

      // Monitor unhandled promise rejections
      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        errorTracker.captureError({
          message: `Unhandled Promise Rejection: ${event.reason}`,
          severity: 'high',
          category: 'javascript',
          page: window.location.pathname,
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
          metadata: {
            reason: event.reason,
            type: 'unhandledrejection',
          },
        })
      }

      // Monitor page visibility changes for accurate metrics
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden') {
          // Page is being hidden, send any queued metrics
          errorTracker.getErrorStats()
        }
      }

      if (enableErrorTracking) {
        window.addEventListener('unhandledrejection', handleUnhandledRejection)
        document.addEventListener('visibilitychange', handleVisibilityChange)

        cleanup.push(() => {
          window.removeEventListener(
            'unhandledrejection',
            handleUnhandledRejection
          )
          document.removeEventListener(
            'visibilitychange',
            handleVisibilityChange
          )
        })
      }

      // Monitor resource loading failures
      const handleResourceError = (event: Event) => {
        const target = event.target as HTMLElement
        if (
          target &&
          (target.tagName === 'IMG' ||
            target.tagName === 'SCRIPT' ||
            target.tagName === 'LINK')
        ) {
          const resourceUrl =
            target.getAttribute('src') ||
            target.getAttribute('href') ||
            'unknown'

          errorTracker.captureError({
            message: `Resource failed to load: ${resourceUrl}`,
            severity: 'medium',
            category: 'network',
            page: window.location.pathname,
            userAgent: navigator.userAgent,
            timestamp: Date.now(),
            metadata: {
              resourceUrl,
              tagName: target.tagName,
              type: 'resource_error',
            },
          })
        }
      }

      window.addEventListener('error', handleResourceError, true)
      cleanup.push(() =>
        window.removeEventListener('error', handleResourceError, true)
      )

      setIsMonitoring(true)

      // Initial performance report
      setTimeout(() => {
        const metrics = getCurrentMetrics()
        if (metrics && Object.keys(metrics).length > 0) {
          trackEvent('initial_performance_metrics', metrics)
        }
      }, 2000)
    } catch (error) {
      console.error('Failed to initialize performance monitoring:', error)
      errorTracker.captureError({
        message: `Performance monitoring initialization failed: ${error}`,
        severity: 'high',
        category: 'system',
        page: window.location.pathname,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      })
    }

    // Cleanup function
    return () => {
      cleanup.forEach((fn) => fn())
      setIsMonitoring(false)
    }
  }, [
    enableWebVitalsMonitoring,
    enableErrorTracking,
    enableMemoryMonitoring,
    enableBundleMonitoring,
  ])

  const trackEvent = React.useCallback(
    (eventName: string, data?: Record<string, any>) => {
      try {
        // Send custom events to analytics
        fetch('/api/analytics/performance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventName,
            data,
            page: window.location.pathname,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
          }),
        }).catch((error) => {
          console.warn('Failed to send performance event:', error)
        })
      } catch (error) {
        console.warn('Failed to track performance event:', error)
      }
    },
    []
  )

  const reportPerformanceIssue = React.useCallback(
    (
      type: string,
      message: string,
      severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
    ) => {
      errorTracker.capturePerformanceIssue({
        type: type as any,
        severity,
        message,
        page: window.location.pathname,
        metrics: (getCurrentMetrics() as Record<string, number>) || {},
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
      })
    },
    [getCurrentMetrics]
  )

  const value: PerformanceContextValue = {
    trackEvent,
    reportPerformanceIssue,
    getCurrentMetrics,
    isMonitoring,
  }

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  )
}

/**
 * Hook to use performance monitoring context
 */
export function usePerformanceContext() {
  const context = useContext(PerformanceContext)
  if (!context) {
    throw new Error(
      'usePerformanceContext must be used within a PerformanceProvider'
    )
  }
  return context
}

/**
 * HOC to add performance monitoring to components
 */
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  const PerformanceWrappedComponent = React.forwardRef<any, P>((props, ref) => {
    const { trackEvent, reportPerformanceIssue } = usePerformanceContext()
    const renderStartTime = React.useRef<number>()
    const mountTime = React.useRef<number>()

    // Track component mount time
    React.useEffect(() => {
      const mountEnd = performance.now()
      mountTime.current = mountEnd

      if (renderStartTime.current) {
        const mountDuration = mountEnd - renderStartTime.current

        // Report slow component mounts
        if (mountDuration > 100) {
          trackEvent('slow_component_mount', {
            component: componentName || Component.displayName || Component.name,
            duration: Math.round(mountDuration),
          })
        }
      }
    }, [])

    // Track render start
    React.useLayoutEffect(() => {
      renderStartTime.current = performance.now()
    })

    // Enhanced props with performance helpers
    const enhancedProps = {
      ...props,
      onPerformanceIssue: reportPerformanceIssue,
      trackPerformanceEvent: trackEvent,
    } as P & {
      onPerformanceIssue?: (
        type: string,
        message: string,
        severity?: string
      ) => void
      trackPerformanceEvent?: (
        eventName: string,
        data?: Record<string, any>
      ) => void
    }

    return <Component {...enhancedProps} ref={ref} />
  })

  PerformanceWrappedComponent.displayName = `withPerformanceMonitoring(${componentName || Component.displayName || Component.name})`

  return PerformanceWrappedComponent
}

/**
 * Hook for tracking specific performance metrics in components
 */
export function useComponentPerformance(componentName: string) {
  const { trackEvent, reportPerformanceIssue } = usePerformanceContext()
  const startTime = React.useRef<number>()

  const startMeasurement = React.useCallback(
    (measurementName: string) => {
      startTime.current = performance.now()
      performance.mark(`${componentName}-${measurementName}-start`)
    },
    [componentName]
  )

  const endMeasurement = React.useCallback(
    (measurementName: string) => {
      if (!startTime.current) return 0

      const endTime = performance.now()
      const duration = endTime - startTime.current

      performance.mark(`${componentName}-${measurementName}-end`)
      performance.measure(
        `${componentName}-${measurementName}`,
        `${componentName}-${measurementName}-start`,
        `${componentName}-${measurementName}-end`
      )

      trackEvent('component_measurement', {
        component: componentName,
        measurement: measurementName,
        duration: Math.round(duration),
      })

      return duration
    },
    [componentName, trackEvent]
  )

  const reportIssue = React.useCallback(
    (message: string, severity?: 'low' | 'medium' | 'high' | 'critical') => {
      reportPerformanceIssue(
        'component',
        `${componentName}: ${message}`,
        severity
      )
    },
    [componentName, reportPerformanceIssue]
  )

  return {
    startMeasurement,
    endMeasurement,
    reportIssue,
    trackEvent: (eventName: string, data?: Record<string, any>) =>
      trackEvent(eventName, { ...data, component: componentName }),
  }
}

/**
 * Performance monitoring for async operations
 */
export function useAsyncPerformance() {
  const { trackEvent, reportPerformanceIssue } = usePerformanceContext()

  const measureAsync = React.useCallback(
    async function <T>(
      operation: () => Promise<T>,
      operationName: string,
      options?: {
        warningThreshold?: number
        errorThreshold?: number
      }
    ): Promise<T> {
      const startTime = performance.now()

      try {
        const result = await operation()
        const duration = performance.now() - startTime

        trackEvent('async_operation', {
          operation: operationName,
          duration: Math.round(duration),
          success: true,
        })

        // Check thresholds
        if (options?.errorThreshold && duration > options.errorThreshold) {
          reportPerformanceIssue(
            'slow-api',
            `${operationName} took ${Math.round(duration)}ms`,
            'high'
          )
        } else if (
          options?.warningThreshold &&
          duration > options.warningThreshold
        ) {
          reportPerformanceIssue(
            'slow-api',
            `${operationName} took ${Math.round(duration)}ms`,
            'medium'
          )
        }

        return result
      } catch (error) {
        const duration = performance.now() - startTime

        trackEvent('async_operation', {
          operation: operationName,
          duration: Math.round(duration),
          success: false,
          error: error instanceof Error ? error.message : String(error),
        })

        reportPerformanceIssue(
          'failed-request',
          `${operationName} failed: ${error}`,
          'high'
        )
        throw error
      }
    },
    [trackEvent, reportPerformanceIssue]
  )

  return { measureAsync }
}
