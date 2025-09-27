/**
 * Analytics Configuration
 * Controls analytics behavior and debugging
 */

export const analyticsConfig = {
  // Production-ready analytics control with kill switches
  enabled:
    process.env.NODE_ENV === 'production' &&
    process.env.NEXT_PUBLIC_DISABLE_ALL_ANALYTICS !== 'true',

  // Force enable analytics in development (for testing)
  forceEnable:
    process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === 'true' &&
    process.env.NEXT_PUBLIC_DISABLE_ALL_ANALYTICS !== 'true',

  // Debug mode shows console logs
  debug:
    process.env.NODE_ENV === 'development' ||
    process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === 'true',

  // Production rate limiting - more conservative for live site
  rateLimiting: {
    enabled: true,
    maxCallsPerMinute: process.env.NODE_ENV === 'production' ? 15 : 5, // Stricter in prod
    throttleDelay: process.env.NODE_ENV === 'production' ? 1000 : 2000, // Longer delays in prod
    maxFormEventsPerMinute: 10, // Specific limit for form events
    maxScrollEventsPerMinute: 5, // Specific limit for scroll events
  },

  // Plausible settings with production safeguards
  plausible: {
    domain: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
    enabled:
      process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN !== undefined &&
      typeof window !== 'undefined',
    trackLocalhost: false,
    maxRetries: 3,
    retryDelay: 1000,
    timeout: 5000, // 5 second timeout for requests
  },

  // Feature flags for granular control with safe mode
  features: {
    formTracking:
      process.env.NEXT_PUBLIC_DISABLE_FORM_TRACKING !== 'true' &&
      process.env.NEXT_PUBLIC_ANALYTICS_SAFE_MODE !== 'true',
    scrollTracking:
      process.env.NEXT_PUBLIC_DISABLE_SCROLL_TRACKING !== 'true' &&
      process.env.NEXT_PUBLIC_ANALYTICS_SAFE_MODE !== 'true',
    ctaTracking:
      process.env.NEXT_PUBLIC_DISABLE_CTA_TRACKING !== 'true' &&
      process.env.NEXT_PUBLIC_ANALYTICS_SAFE_MODE !== 'true',
    errorTracking: true, // Always enabled for debugging
    performanceTracking:
      process.env.NODE_ENV === 'production' &&
      process.env.NEXT_PUBLIC_ANALYTICS_SAFE_MODE !== 'true',
  },

  // Error handling
  errorHandling: {
    maxErrors: 10, // Max errors before disabling analytics
    errorWindow: 60000, // 1 minute window
    silentMode: process.env.NODE_ENV === 'production', // Don't log errors in production
  },
}

/**
 * Check if analytics should be active
 */
export function shouldTrackAnalytics(): boolean {
  return analyticsConfig.enabled || analyticsConfig.forceEnable
}

/**
 * Log analytics debug info
 */
export function analyticsDebug(message: string, ...args: any[]) {
  if (analyticsConfig.debug) {
    console.debug(`[Analytics] ${message}`, ...args)
  }
}
