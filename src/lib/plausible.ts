/**
 * Plausible Analytics Integration
 * Privacy-first analytics with Plausible.io
 */

declare global {
  interface Window {
    plausible?: {
      (
        event: string,
        options?: {
          props?: Record<string, string | number | boolean>
          callback?: () => void
          revenue?: { currency: string; amount: number }
        }
      ): void
      q?: Array<any>
    }
  }
}

export interface PlausibleEventData {
  props?: Record<string, string | number | boolean>
  callback?: () => void
  revenue?: { currency: string; amount: number }
}

/**
 * Check if Plausible is available
 */
export function isPlausibleAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.plausible === 'function'
}

/**
 * Track a custom event with Plausible
 */
export function trackPlausibleEvent(
  eventName: string,
  data?: PlausibleEventData
): void {
  if (!isPlausibleAvailable()) {
    console.debug('Plausible not available, skipping event:', eventName)
    return
  }

  try {
    window.plausible!(eventName, data)
  } catch (error) {
    console.error('Error tracking Plausible event:', error)
  }
}

/**
 * Track page view with custom properties
 */
export function trackPlausiblePageView(
  path?: string,
  props?: Record<string, string | number | boolean>
): void {
  if (!isPlausibleAvailable()) {
    console.debug('Plausible not available, skipping page view')
    return
  }

  try {
    // Plausible automatically tracks page views, but we can send custom properties
    if (props) {
      window.plausible!('pageview', { props })
    }
  } catch (error) {
    console.error('Error tracking Plausible page view:', error)
  }
}

/**
 * Track conversion goals
 */
export function trackPlausibleGoal(
  goalName: string,
  data?: PlausibleEventData
): void {
  trackPlausibleEvent(goalName, data)
}

/**
 * Track file downloads (automatically handled by Plausible script)
 */
export function trackPlausibleDownload(
  fileName: string,
  fileUrl: string
): void {
  trackPlausibleEvent('File Download', {
    props: {
      file_name: fileName,
      file_url: fileUrl,
    },
  })
}

/**
 * Track outbound link clicks (automatically handled by Plausible script)
 */
export function trackPlausibleOutboundLink(url: string): void {
  trackPlausibleEvent('Outbound Link: Click', {
    props: {
      url: url,
    },
  })
}

/**
 * Track form submissions
 */
export function trackPlausibleFormSubmission(
  formName: string,
  success: boolean = true
): void {
  trackPlausibleEvent(success ? 'Form Submit' : 'Form Error', {
    props: {
      form_name: formName,
      success: success,
    },
  })
}

/**
 * Track CTA clicks with position data
 */
export function trackPlausibleCTAClick(
  ctaText: string,
  position: string,
  page?: string
): void {
  trackPlausibleEvent('CTA Click', {
    props: {
      cta_text: ctaText,
      cta_position: position,
      page:
        page || (typeof window !== 'undefined' ? window.location.pathname : ''),
    },
  })
}

/**
 * Track beta signup conversion
 */
export function trackPlausibleBetaSignup(source?: string, step?: string): void {
  trackPlausibleGoal('Beta Signup', {
    props: {
      source: source || 'direct',
      step: step || 'completed',
    },
  })
}

/**
 * Track newsletter signup
 */
export function trackPlausibleNewsletterSignup(location: string): void {
  trackPlausibleGoal('Newsletter Signup', {
    props: {
      location: location,
    },
  })
}

/**
 * Track user engagement events
 */
export function trackPlausibleEngagement(
  eventType: string,
  data?: Record<string, string | number | boolean>
): void {
  trackPlausibleEvent('User Engagement', {
    props: {
      engagement_type: eventType,
      ...data,
    },
  })
}

/**
 * Track scroll depth milestones
 */
export function trackPlausibleScrollDepth(
  percentage: number,
  page?: string
): void {
  trackPlausibleEvent('Scroll Depth', {
    props: {
      depth_percentage: percentage,
      page:
        page || (typeof window !== 'undefined' ? window.location.pathname : ''),
    },
  })
}

/**
 * Track time on page milestones
 */
export function trackPlausibleTimeOnPage(seconds: number, page?: string): void {
  trackPlausibleEvent('Time on Page', {
    props: {
      time_seconds: seconds,
      page:
        page || (typeof window !== 'undefined' ? window.location.pathname : ''),
    },
  })
}

/**
 * Track search queries (if applicable)
 */
export function trackPlausibleSearch(query: string, results: number): void {
  trackPlausibleEvent('Search', {
    props: {
      search_query: query,
      results_count: results,
    },
  })
}

/**
 * Track error events
 */
export function trackPlausibleError(
  errorType: string,
  errorMessage: string,
  page?: string
): void {
  trackPlausibleEvent('Error', {
    props: {
      error_type: errorType,
      error_message: errorMessage.substring(0, 100), // Limit length
      page:
        page || (typeof window !== 'undefined' ? window.location.pathname : ''),
    },
  })
}
