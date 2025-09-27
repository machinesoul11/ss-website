/**
 * Production Analytics Circuit Breaker
 * Prevents analytics failures from affecting site performance
 */

import { analyticsConfig, analyticsDebug } from './analytics-config'

interface CircuitBreakerState {
  errorCount: number
  lastErrorTime: number
  isOpen: boolean
  lastResetAttempt: number
}

class AnalyticsCircuitBreaker {
  private state: CircuitBreakerState = {
    errorCount: 0,
    lastErrorTime: 0,
    isOpen: false,
    lastResetAttempt: 0,
  }

  private readonly maxErrors = analyticsConfig.errorHandling.maxErrors
  private readonly errorWindow = analyticsConfig.errorHandling.errorWindow
  private readonly resetTimeout = 5 * 60 * 1000 // 5 minutes

  /**
   * Check if analytics calls should be allowed
   */
  canExecute(): boolean {
    const now = Date.now()

    // If circuit is open, check if we should try to reset it
    if (this.state.isOpen) {
      if (now - this.state.lastResetAttempt > this.resetTimeout) {
        analyticsDebug('Circuit breaker: Attempting to reset')
        this.state.lastResetAttempt = now
        return true // Allow one test call
      }
      return false
    }

    // Reset error count if error window has passed
    if (now - this.state.lastErrorTime > this.errorWindow) {
      this.state.errorCount = 0
    }

    return true
  }

  /**
   * Record successful analytics call
   */
  recordSuccess(): void {
    if (this.state.isOpen) {
      analyticsDebug('Circuit breaker: Reset successful')
      this.state.isOpen = false
      this.state.errorCount = 0
    }
  }

  /**
   * Record failed analytics call
   */
  recordFailure(error: Error): void {
    const now = Date.now()
    this.state.errorCount++
    this.state.lastErrorTime = now

    if (this.state.errorCount >= this.maxErrors) {
      this.state.isOpen = true
      analyticsDebug('Circuit breaker: OPENED due to excessive errors')

      // In production, log this as a warning since it affects functionality
      if (process.env.NODE_ENV === 'production') {
        console.warn(
          '[Analytics] Circuit breaker opened - analytics temporarily disabled'
        )
      }
    }

    if (!analyticsConfig.errorHandling.silentMode) {
      analyticsDebug('Analytics error recorded:', error.message)
    }
  }

  /**
   * Get current state for monitoring
   */
  getState(): Readonly<CircuitBreakerState> {
    return { ...this.state }
  }
}

// Global circuit breaker instance
const circuitBreaker = new AnalyticsCircuitBreaker()

/**
 * Production-safe analytics wrapper
 */
export async function safeAnalyticsExecution<T>(
  operation: () => Promise<T> | T,
  operationName: string = 'analytics'
): Promise<T | null> {
  if (!circuitBreaker.canExecute()) {
    analyticsDebug(`${operationName}: Circuit breaker is open, skipping`)
    return null
  }

  try {
    const result = await Promise.resolve(operation())
    circuitBreaker.recordSuccess()
    return result
  } catch (error) {
    circuitBreaker.recordFailure(
      error instanceof Error ? error : new Error(String(error))
    )

    // Don't throw errors in production - just log and continue
    if (process.env.NODE_ENV === 'production') {
      return null
    } else {
      analyticsDebug(`${operationName} failed:`, error)
      return null
    }
  }
}

/**
 * Get analytics health status for monitoring
 */
export function getAnalyticsHealth() {
  const state = circuitBreaker.getState()
  return {
    healthy: !state.isOpen,
    errorCount: state.errorCount,
    lastErrorTime: state.lastErrorTime,
    circuitOpen: state.isOpen,
  }
}

export { circuitBreaker }
