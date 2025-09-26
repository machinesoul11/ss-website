/**
 * Error Tracking & Monitoring Service
 * Phase 6: Performance Monitoring - Error Handling System
 *
 * Provides comprehensive error tracking, logging, and alerting
 */

'use client'

interface ErrorDetails {
  message: string
  stack?: string
  componentStack?: string
  errorBoundary?: boolean
  userId?: string
  sessionId?: string
  page: string
  userAgent: string
  timestamp: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'javascript' | 'network' | 'api' | 'render' | 'user' | 'system'
  metadata?: Record<string, any>
}

interface PerformanceIssue {
  type:
    | 'slow-api'
    | 'memory-leak'
    | 'large-bundle'
    | 'poor-vitals'
    | 'failed-request'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  page: string
  metrics: Record<string, number>
  timestamp: number
  userAgent: string
  resolved?: boolean
}

class ErrorTrackingService {
  private errorQueue: ErrorDetails[] = []
  private performanceQueue: PerformanceIssue[] = []
  private isOnline = true
  private batchSize = 10
  private flushInterval = 5000 // 5 seconds

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeErrorHandlers()
      this.startBatchProcessor()
      this.monitorNetworkStatus()
    }
  }

  /**
   * Initialize global error handlers
   */
  private initializeErrorHandlers() {
    // Global JavaScript errors
    window.addEventListener('error', (event) => {
      this.captureError({
        message: event.message || 'Unknown error',
        stack: event.error?.stack,
        page: window.location.pathname,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        severity: 'high',
        category: 'javascript',
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      })
    })

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        page: window.location.pathname,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        severity: 'high',
        category: 'javascript',
        metadata: {
          reason: event.reason,
        },
      })
    })

    // Network errors (fetch failures)
    this.interceptFetch()
  }

  /**
   * Intercept fetch requests to monitor API errors
   */
  private interceptFetch() {
    const originalFetch = window.fetch

    window.fetch = async (...args) => {
      const startTime = performance.now()

      try {
        const response = await originalFetch(...args)
        const endTime = performance.now()
        const duration = endTime - startTime

        // Monitor slow API calls
        if (duration > 3000) {
          this.capturePerformanceIssue({
            type: 'slow-api',
            severity: duration > 10000 ? 'critical' : 'medium',
            message: `Slow API call: ${args[0]} took ${Math.round(duration)}ms`,
            page: window.location.pathname,
            metrics: { duration, status: response.status },
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
          })
        }

        // Monitor API errors
        if (!response.ok) {
          this.captureError({
            message: `API Error: ${response.status} ${response.statusText}`,
            page: window.location.pathname,
            userAgent: navigator.userAgent,
            timestamp: Date.now(),
            severity: response.status >= 500 ? 'critical' : 'medium',
            category: 'api',
            metadata: {
              url: args[0],
              status: response.status,
              statusText: response.statusText,
              duration,
            },
          })
        }

        return response
      } catch (error) {
        const endTime = performance.now()
        const duration = endTime - startTime

        this.captureError({
          message: `Network Error: ${error instanceof Error ? error.message : 'Unknown network error'}`,
          stack: error instanceof Error ? error.stack : undefined,
          page: window.location.pathname,
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
          severity: 'critical',
          category: 'network',
          metadata: {
            url: args[0],
            duration,
          },
        })

        throw error
      }
    }
  }

  /**
   * Monitor network status
   */
  private monitorNetworkStatus() {
    this.isOnline = navigator.onLine

    window.addEventListener('online', () => {
      this.isOnline = true
      this.flushQueues()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
    })
  }

  /**
   * Start batch processor for error reporting
   */
  private startBatchProcessor() {
    setInterval(() => {
      if (
        this.isOnline &&
        (this.errorQueue.length > 0 || this.performanceQueue.length > 0)
      ) {
        this.flushQueues()
      }
    }, this.flushInterval)
  }

  /**
   * Capture an error
   */
  public captureError(error: Partial<ErrorDetails>) {
    const errorDetails: ErrorDetails = {
      message: error.message || 'Unknown error',
      stack: error.stack,
      componentStack: error.componentStack,
      errorBoundary: error.errorBoundary || false,
      page: error.page || window.location.pathname,
      userAgent: error.userAgent || navigator.userAgent,
      timestamp: error.timestamp || Date.now(),
      severity: error.severity || 'medium',
      category: error.category || 'javascript',
      metadata: error.metadata,
    }

    this.errorQueue.push(errorDetails)

    // Immediately flush critical errors
    if (errorDetails.severity === 'critical') {
      this.flushQueues()
    }

    // Log to console in development (only for non-test errors)
    if (
      process.env.NODE_ENV === 'development' &&
      !errorDetails.message.includes('Test') &&
      !errorDetails.message.includes('ErrorTestingWidget')
    ) {
      console.warn(
        `[Error Tracker] ${errorDetails.severity}: ${errorDetails.message}`
      )
    }
  }

  /**
   * Capture a performance issue
   */
  public capturePerformanceIssue(issue: PerformanceIssue) {
    this.performanceQueue.push(issue)

    // Immediately flush critical performance issues
    if (issue.severity === 'critical') {
      this.flushQueues()
    }
  }

  /**
   * React Error Boundary integration
   */
  public captureComponentError(
    error: Error,
    errorInfo: { componentStack: string }
  ) {
    this.captureError({
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
      severity: 'high',
      category: 'render',
    })
  }

  /**
   * Manual error reporting
   */
  public reportError(
    message: string,
    metadata?: Record<string, any>,
    severity: ErrorDetails['severity'] = 'medium'
  ) {
    this.captureError({
      message,
      severity,
      category: 'user',
      metadata,
    })
  }

  /**
   * Flush error and performance queues
   */
  private async flushQueues() {
    const errors = this.errorQueue.splice(0, this.batchSize)
    const performanceIssues = this.performanceQueue.splice(0, this.batchSize)

    if (errors.length === 0 && performanceIssues.length === 0) return

    try {
      await fetch('/api/analytics/error-tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errors,
          performanceIssues,
          timestamp: Date.now(),
        }),
      })
    } catch (error) {
      // Re-add items to queue if sending failed
      this.errorQueue.unshift(...errors)
      this.performanceQueue.unshift(...performanceIssues)

      console.warn('Failed to send error reports:', error)
    }
  }

  /**
   * Get current error statistics
   */
  public getErrorStats() {
    return {
      queuedErrors: this.errorQueue.length,
      queuedPerformanceIssues: this.performanceQueue.length,
      isOnline: this.isOnline,
    }
  }

  /**
   * Clear all queued errors (for testing)
   */
  public clearQueues() {
    this.errorQueue = []
    this.performanceQueue = []
  }
}

// Singleton instance
export const errorTracker = new ErrorTrackingService()

/**
 * React Hook for error tracking
 */
export function useErrorTracking() {
  const reportError = (
    message: string,
    metadata?: Record<string, any>,
    severity?: ErrorDetails['severity']
  ) => {
    errorTracker.reportError(message, metadata, severity)
  }

  const reportPerformanceIssue = (
    issue: Omit<PerformanceIssue, 'page' | 'timestamp' | 'userAgent'>
  ) => {
    errorTracker.capturePerformanceIssue({
      ...issue,
      page: window.location.pathname,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
    })
  }

  return {
    reportError,
    reportPerformanceIssue,
    getStats: () => errorTracker.getErrorStats(),
  }
}

/**
 * Performance monitoring utilities
 */
export const PerformanceMonitor = {
  /**
   * Monitor Core Web Vitals and report issues
   */
  monitorWebVitals() {
    if (typeof window === 'undefined') return

    // Monitor LCP
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1] as any

      if (lastEntry && lastEntry.startTime > 4000) {
        // LCP > 4s is poor
        errorTracker.capturePerformanceIssue({
          type: 'poor-vitals',
          severity: lastEntry.startTime > 6000 ? 'critical' : 'high',
          message: `Poor LCP: ${Math.round(lastEntry.startTime)}ms`,
          page: window.location.pathname,
          metrics: { lcp: lastEntry.startTime },
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
        })
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true })

    // Monitor CLS
    let clsValue = 0
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as any[]) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value

          if (clsValue > 0.25) {
            // CLS > 0.25 is poor
            errorTracker.capturePerformanceIssue({
              type: 'poor-vitals',
              severity: clsValue > 0.5 ? 'critical' : 'high',
              message: `Poor CLS: ${clsValue.toFixed(3)}`,
              page: window.location.pathname,
              metrics: { cls: clsValue },
              timestamp: Date.now(),
              userAgent: navigator.userAgent,
            })
          }
        }
      }
    }).observe({ type: 'layout-shift', buffered: true })
  },

  /**
   * Monitor memory usage
   */
  monitorMemoryUsage() {
    if (typeof window === 'undefined' || !(performance as any).memory) return

    setInterval(() => {
      const memory = (performance as any).memory
      const usedMB = memory.usedJSHeapSize / 1024 / 1024
      const totalMB = memory.totalJSHeapSize / 1024 / 1024
      const usage = (usedMB / totalMB) * 100

      // Alert if memory usage is very high
      if (usage > 90) {
        errorTracker.capturePerformanceIssue({
          type: 'memory-leak',
          severity: usage > 95 ? 'critical' : 'high',
          message: `High memory usage: ${usage.toFixed(1)}%`,
          page: window.location.pathname,
          metrics: {
            usedMB: Math.round(usedMB),
            totalMB: Math.round(totalMB),
            usage: Math.round(usage),
          },
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
        })
      }
    }, 30000) // Check every 30 seconds
  },

  /**
   * Monitor bundle size and loading performance
   */
  monitorBundlePerformance() {
    if (typeof window === 'undefined') return

    // Monitor resource loading
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as PerformanceResourceTiming[]) {
        if (entry.initiatorType === 'script' && entry.transferSize > 1000000) {
          // > 1MB
          errorTracker.capturePerformanceIssue({
            type: 'large-bundle',
            severity: 'medium',
            message: `Large bundle loaded: ${entry.name} (${Math.round(entry.transferSize / 1024)}KB)`,
            page: window.location.pathname,
            metrics: {
              size: entry.transferSize,
              duration: entry.duration,
            },
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
          })
        }
      }
    }).observe({ entryTypes: ['resource'] })
  },
}
