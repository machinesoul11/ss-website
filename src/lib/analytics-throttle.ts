/**
 * Analytics Throttling and Rate Limiting
 * Prevents excessive API calls and implements proper error handling
 */

import {
  shouldTrackAnalytics,
  analyticsDebug,
  analyticsConfig,
} from './analytics-config'
import { safeAnalyticsExecution } from './analytics-circuit-breaker'

interface ThrottleOptions {
  delay: number
  maxCalls: number
  timeWindow: number
}

interface CallInfo {
  count: number
  lastReset: number
}

class AnalyticsThrottle {
  private callHistory = new Map<string, CallInfo>()
  private pendingCalls = new Map<string, NodeJS.Timeout>()

  /**
   * Rate limit analytics calls
   */
  rateLimit(key: string, options: ThrottleOptions): boolean {
    const now = Date.now()
    const info = this.callHistory.get(key)

    if (!info) {
      this.callHistory.set(key, { count: 1, lastReset: now })
      return true
    }

    // Reset counter if time window has passed
    if (now - info.lastReset > options.timeWindow) {
      info.count = 1
      info.lastReset = now
      return true
    }

    // Check if we've exceeded max calls
    if (info.count >= options.maxCalls) {
      return false
    }

    info.count++
    return true
  }

  /**
   * Throttle function calls with debouncing
   */
  throttle<T extends (...args: any[]) => any>(
    key: string,
    fn: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    return (...args: Parameters<T>) => {
      // Clear existing timeout
      if (this.pendingCalls.has(key)) {
        clearTimeout(this.pendingCalls.get(key)!)
      }

      // Set new timeout
      const timeout = setTimeout(() => {
        this.pendingCalls.delete(key)
        try {
          fn(...args)
        } catch (error) {
          console.debug('Throttled analytics call failed:', error)
        }
      }, delay)

      this.pendingCalls.set(key, timeout)
    }
  }

  /**
   * Batch multiple calls together
   */
  batch<T>(
    key: string,
    fn: (items: T[]) => void,
    batchSize: number = 10,
    batchDelay: number = 1000
  ) {
    const batches = new Map<string, T[]>()
    const batchTimeouts = new Map<string, NodeJS.Timeout>()

    return (item: T) => {
      if (!batches.has(key)) {
        batches.set(key, [])
      }

      const batch = batches.get(key)!
      batch.push(item)

      // Clear existing timeout
      if (batchTimeouts.has(key)) {
        clearTimeout(batchTimeouts.get(key)!)
      }

      // Process batch when full or after delay
      if (batch.length >= batchSize) {
        this.processBatch(key, fn, batches, batchTimeouts)
      } else {
        const timeout = setTimeout(() => {
          this.processBatch(key, fn, batches, batchTimeouts)
        }, batchDelay)
        batchTimeouts.set(key, timeout)
      }
    }
  }

  private processBatch<T>(
    key: string,
    fn: (items: T[]) => void,
    batches: Map<string, T[]>,
    batchTimeouts: Map<string, NodeJS.Timeout>
  ) {
    const batch = batches.get(key)
    if (batch && batch.length > 0) {
      try {
        fn([...batch])
        batches.set(key, []) // Clear batch
      } catch (error) {
        console.debug('Batched analytics call failed:', error)
      }
    }
    batchTimeouts.delete(key)
  }
}

// Global throttle instance
const globalThrottle = new AnalyticsThrottle()

export { globalThrottle }

/**
 * Production-safe analytics wrapper with circuit breaker
 */
export function safeAnalyticsCall(
  fn: () => void | Promise<void>,
  fallbackFn?: () => void,
  operationName: string = 'analytics'
) {
  // Skip if analytics is disabled
  if (!shouldTrackAnalytics()) {
    analyticsDebug('Analytics disabled, skipping call')
    return
  }

  // Use circuit breaker for production safety
  return safeAnalyticsExecution(async () => {
    await Promise.resolve(fn())
  }, operationName).catch(() => {
    // Fallback for any unhandled errors
    if (fallbackFn) fallbackFn()
  })
}

/**
 * Production-ready Plausible tracking with circuit breaker
 */
export function createThrottledPlausibleTracker() {
  const config = analyticsConfig.rateLimiting

  // Production rate limiting - more conservative
  const rateLimit = (eventName: string) => {
    return globalThrottle.rateLimit(`plausible_${eventName}`, {
      delay: config.throttleDelay,
      maxCalls: config.maxCallsPerMinute,
      timeWindow: 60000, // 1 minute
    })
  }

  // Throttle calls with production-safe delays
  const throttledTrack = globalThrottle.throttle(
    'plausible_event',
    (eventName: string, data: any) => {
      if (
        typeof window !== 'undefined' &&
        window.plausible &&
        typeof window.plausible === 'function'
      ) {
        // Additional safety check for production
        try {
          window.plausible(eventName, data)
        } catch (error) {
          // Don't let Plausible errors break the site
          analyticsDebug('Plausible tracking error:', error)
        }
      }
    },
    config.throttleDelay
  )

  return {
    trackEvent: (eventName: string, data?: any) => {
      // Additional production checks
      if (!analyticsConfig.plausible.enabled) {
        analyticsDebug('Plausible tracking disabled')
        return
      }

      if (!rateLimit(eventName)) {
        analyticsDebug(`Rate limit exceeded for event: ${eventName}`)
        return
      }

      safeAnalyticsCall(
        () => {
          throttledTrack(eventName, data)
        },
        undefined,
        `plausible_${eventName}`
      )
    },
  }
}

/**
 * Production-ready form interaction throttling
 */
export function createFormInteractionThrottler() {
  const throttler = globalThrottle
  const config = analyticsConfig.rateLimiting

  return {
    throttleFormEvent: (
      formId: string,
      fieldName: string,
      action: string,
      fn: () => void
    ) => {
      // Skip if form tracking is disabled
      if (!analyticsConfig.features.formTracking) {
        analyticsDebug('Form tracking disabled')
        return
      }

      const key = `form_${formId}_${fieldName}_${action}`

      // Production-safe throttling delays
      const delays = {
        focus: config.throttleDelay * 2, // 2x base delay
        blur: config.throttleDelay, // base delay
        change: config.throttleDelay * 3, // 3x base delay
        submit: 100, // immediate
        error: 100, // immediate
        abandon: 100, // immediate
      }

      const delay =
        delays[action as keyof typeof delays] || config.throttleDelay

      if (
        !throttler.rateLimit(key, {
          delay,
          maxCalls:
            config.maxFormEventsPerMinute || (action === 'change' ? 3 : 8),
          timeWindow: 60000, // 1 minute window
        })
      ) {
        analyticsDebug(`Form interaction rate limited: ${key}`)
        return
      }

      // Use safe analytics call with circuit breaker
      safeAnalyticsCall(
        () => throttler.throttle(key, fn, delay)(),
        undefined,
        `form_${action}`
      )
    },
  }
} /**
 * Production-ready scroll tracking throttling
 */
export function createScrollTrackingThrottler() {
  const trackedMilestones = new Set<string>()
  const config = analyticsConfig.rateLimiting

  return {
    trackScrollMilestone: (
      page: string,
      percentage: number,
      fn: () => void
    ) => {
      // Skip if scroll tracking is disabled
      if (!analyticsConfig.features.scrollTracking) {
        analyticsDebug('Scroll tracking disabled')
        return
      }

      const key = `scroll_${page}_${percentage}`

      // Only track each milestone once per page load
      if (trackedMilestones.has(key)) {
        return
      }

      trackedMilestones.add(key)

      // Production rate limiting for scroll events
      if (
        !globalThrottle.rateLimit('scroll_tracking', {
          delay: config.throttleDelay,
          maxCalls: config.maxScrollEventsPerMinute || 8, // Conservative limit
          timeWindow: 60000,
        })
      ) {
        analyticsDebug('Scroll tracking rate limited')
        return
      }

      safeAnalyticsCall(fn, undefined, 'scroll_tracking')
    },
  }
}
