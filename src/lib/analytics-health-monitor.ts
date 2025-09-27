/**
 * Production Analytics Health Monitor
 * Provides real-time monitoring and alerts for analytics issues
 */

import { getAnalyticsHealth } from './analytics-circuit-breaker'
import { analyticsConfig, analyticsDebug } from './analytics-config'

interface HealthReport {
  timestamp: number
  healthy: boolean
  errors: string[]
  warnings: string[]
  metrics: {
    totalEvents: number
    failedEvents: number
    successRate: number
    lastEventTime: number
  }
}

class AnalyticsHealthMonitor {
  private metrics = {
    totalEvents: 0,
    failedEvents: 0,
    lastEventTime: 0,
  }

  private errors: string[] = []
  private warnings: string[] = []
  private lastHealthCheck = 0

  /**
   * Record successful analytics event
   */
  recordSuccess(eventType: string): void {
    this.metrics.totalEvents++
    this.metrics.lastEventTime = Date.now()
    analyticsDebug(`Analytics success: ${eventType}`)
  }

  /**
   * Record failed analytics event
   */
  recordFailure(eventType: string, error: string): void {
    this.metrics.totalEvents++
    this.metrics.failedEvents++
    this.metrics.lastEventTime = Date.now()

    const errorMsg = `${eventType}: ${error}`
    this.errors.push(errorMsg)

    // Keep error log manageable
    if (this.errors.length > 10) {
      this.errors = this.errors.slice(-5)
    }

    analyticsDebug(`Analytics failure: ${errorMsg}`)
  }

  /**
   * Add warning message
   */
  addWarning(message: string): void {
    this.warnings.push(message)

    // Keep warning log manageable
    if (this.warnings.length > 5) {
      this.warnings = this.warnings.slice(-3)
    }

    analyticsDebug(`Analytics warning: ${message}`)
  }

  /**
   * Get current health report
   */
  getHealthReport(): HealthReport {
    const circuitHealth = getAnalyticsHealth()
    const successRate =
      this.metrics.totalEvents > 0
        ? ((this.metrics.totalEvents - this.metrics.failedEvents) /
            this.metrics.totalEvents) *
          100
        : 100

    return {
      timestamp: Date.now(),
      healthy: circuitHealth.healthy && successRate >= 80,
      errors: [...this.errors],
      warnings: [...this.warnings],
      metrics: {
        ...this.metrics,
        successRate: Math.round(successRate),
      },
    }
  }

  /**
   * Check if analytics is functioning properly
   */
  performHealthCheck(): boolean {
    const now = Date.now()

    // Don't check too frequently
    if (now - this.lastHealthCheck < 30000) {
      // 30 seconds
      return true
    }

    this.lastHealthCheck = now
    const report = this.getHealthReport()

    // Log health status in production
    if (process.env.NODE_ENV === 'production') {
      if (!report.healthy) {
        console.warn('[Analytics] Health check failed:', {
          successRate: report.metrics.successRate,
          errorCount: report.errors.length,
          circuitOpen: !getAnalyticsHealth().healthy,
        })
      }
    }

    // Clear old errors and warnings periodically
    if (now - this.metrics.lastEventTime > 300000) {
      // 5 minutes
      this.errors = []
      this.warnings = []
    }

    return report.healthy
  }

  /**
   * Reset metrics (for testing or after incidents)
   */
  reset(): void {
    this.metrics = {
      totalEvents: 0,
      failedEvents: 0,
      lastEventTime: 0,
    }
    this.errors = []
    this.warnings = []
    analyticsDebug('Analytics health monitor reset')
  }
}

// Global health monitor instance
const healthMonitor = new AnalyticsHealthMonitor()

/**
 * Enhanced safe analytics wrapper with health monitoring
 */
export function monitoredAnalyticsCall(
  operation: () => Promise<void> | void,
  operationName: string = 'analytics'
): Promise<void> {
  return new Promise((resolve) => {
    try {
      // Check health before executing
      if (!healthMonitor.performHealthCheck()) {
        healthMonitor.addWarning(
          `Skipping ${operationName} due to health check failure`
        )
        resolve()
        return
      }

      const result = Promise.resolve(operation())

      result
        .then(() => {
          healthMonitor.recordSuccess(operationName)
          resolve()
        })
        .catch((error) => {
          healthMonitor.recordFailure(
            operationName,
            error.message || String(error)
          )
          resolve() // Don't reject - just log and continue
        })
    } catch (error) {
      healthMonitor.recordFailure(
        operationName,
        error instanceof Error ? error.message : String(error)
      )
      resolve() // Don't reject - just log and continue
    }
  })
}

/**
 * Get analytics health for external monitoring
 */
export function getAnalyticsHealthReport(): HealthReport {
  return healthMonitor.getHealthReport()
}

/**
 * Create a production-ready analytics wrapper
 */
export function createProductionAnalytics() {
  return {
    track: (eventName: string, data?: any) => {
      return monitoredAnalyticsCall(async () => {
        if (typeof window !== 'undefined' && window.plausible) {
          window.plausible(eventName, data)
        }
      }, `plausible_${eventName}`)
    },

    trackCustom: (
      operation: () => void | Promise<void>,
      operationName: string
    ) => {
      return monitoredAnalyticsCall(operation, operationName)
    },

    getHealth: () => healthMonitor.getHealthReport(),

    isHealthy: () => healthMonitor.performHealthCheck(),
  }
}

export { healthMonitor }
