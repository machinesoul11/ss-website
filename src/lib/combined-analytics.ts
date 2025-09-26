/**
 * Combined Analytics Hook
 * Integrates both custom analytics and Plausible Analytics
 */

'use client'

import { useCallback } from 'react'
import { useAnalyticsUtils } from '@/lib/analytics'
import {
  trackPlausibleEvent,
  trackPlausiblePageView,
  trackPlausibleGoal,
  trackPlausibleFormSubmission,
  trackPlausibleCTAClick,
  trackPlausibleBetaSignup,
  trackPlausibleEngagement,
  trackPlausibleScrollDepth,
  trackPlausibleTimeOnPage,
  isPlausibleAvailable,
} from '@/lib/plausible'

export interface CombinedAnalyticsEvent {
  name: string
  properties?: Record<string, any>
  plausibleProps?: Record<string, string | number | boolean>
  skipPlausible?: boolean
  skipCustom?: boolean
}

/**
 * Combined analytics hook that tracks to both systems
 */
export function useCombinedAnalytics() {
  const analyticsUtils = useAnalyticsUtils()
  // const conversionUtils = useConversionTrackingUtils() // TODO: Use this when implementing conversion tracking

  const trackEvent = useCallback(
    async (event: CombinedAnalyticsEvent) => {
      const {
        name,
        properties = {},
        plausibleProps,
        skipPlausible = false,
        skipCustom = false,
      } = event

      try {
        // Track to custom analytics system
        if (!skipCustom) {
          await analyticsUtils.track(name, properties)
        }

        // Track to Plausible
        if (!skipPlausible && isPlausibleAvailable()) {
          trackPlausibleEvent(name, {
            props: plausibleProps || convertPropsToPlausible(properties),
          })
        }
      } catch (error) {
        console.error('Error in combined analytics tracking:', error)
      }
    },
    [analyticsUtils]
  )

  const trackPageView = useCallback(
    async (path?: string, title?: string, properties?: Record<string, any>) => {
      try {
        // Track to custom analytics
        await analyticsUtils.trackPageView(path, title)

        // Track to Plausible with custom properties
        if (isPlausibleAvailable() && properties) {
          trackPlausiblePageView(path, convertPropsToPlausible(properties))
        }
      } catch (error) {
        console.error('Error in combined page view tracking:', error)
      }
    },
    [analyticsUtils]
  )

  const trackConversion = useCallback(
    async (
      goalName: string,
      value: number = 1,
      metadata: Record<string, any> = {}
    ) => {
      try {
        // Track to custom analytics
        await analyticsUtils.trackConversion(goalName, value, metadata)

        // Track to Plausible as goal
        if (isPlausibleAvailable()) {
          trackPlausibleGoal(goalName, {
            props: convertPropsToPlausible({ value, ...metadata }),
          })
        }
      } catch (error) {
        console.error('Error in combined conversion tracking:', error)
      }
    },
    [analyticsUtils]
  )

  const trackBetaSignup = useCallback(
    async (formData: Record<string, any>, source?: string) => {
      try {
        // Track to custom analytics
        await trackEvent({
          name: 'beta_signup',
          properties: { ...formData, source },
        })

        // Track to Plausible
        trackPlausibleBetaSignup(source, 'completed')

        // Track conversion
        await trackConversion('Beta Signup', 1, { source })
      } catch (error) {
        console.error('Error tracking beta signup:', error)
      }
    },
    [trackEvent, trackConversion]
  )

  const trackFormSubmission = useCallback(
    async (
      formName: string,
      success: boolean = true,
      data?: Record<string, any>
    ) => {
      try {
        // Track to custom analytics
        await trackEvent({
          name: success ? 'form_submission' : 'form_error',
          properties: { form_name: formName, success, ...data },
        })

        // Track to Plausible
        trackPlausibleFormSubmission(formName, success)
      } catch (error) {
        console.error('Error tracking form submission:', error)
      }
    },
    [trackEvent]
  )

  const trackCTAClick = useCallback(
    async (ctaText: string, position: string, page?: string) => {
      try {
        // Track to custom analytics
        await trackEvent({
          name: 'cta_click',
          properties: { cta_text: ctaText, cta_position: position, page },
        })

        // Track to Plausible
        trackPlausibleCTAClick(ctaText, position, page)
      } catch (error) {
        console.error('Error tracking CTA click:', error)
      }
    },
    [trackEvent]
  )

  const trackEngagement = useCallback(
    async (eventType: string, data: Record<string, any> = {}) => {
      try {
        // Track to custom analytics
        await analyticsUtils.trackEngagement(eventType, data)

        // Track to Plausible
        trackPlausibleEngagement(eventType, convertPropsToPlausible(data))
      } catch (error) {
        console.error('Error tracking engagement:', error)
      }
    },
    [analyticsUtils]
  )

  const trackScrollDepth = useCallback(
    async (percentage: number, page?: string) => {
      try {
        // Track to custom analytics
        await trackEvent({
          name: 'scroll_depth',
          properties: { depth_percentage: percentage, page },
        })

        // Track to Plausible (only at key milestones to avoid spam)
        if ([25, 50, 75, 90, 100].includes(percentage)) {
          trackPlausibleScrollDepth(percentage, page)
        }
      } catch (error) {
        console.error('Error tracking scroll depth:', error)
      }
    },
    [trackEvent]
  )

  const trackTimeOnPage = useCallback(
    async (seconds: number, page?: string) => {
      try {
        // Track to custom analytics
        await trackEvent({
          name: 'time_on_page',
          properties: { time_seconds: seconds, page },
        })

        // Track to Plausible (only at key milestones: 30s, 1min, 2min, 5min)
        if ([30, 60, 120, 300].includes(seconds)) {
          trackPlausibleTimeOnPage(seconds, page)
        }
      } catch (error) {
        console.error('Error tracking time on page:', error)
      }
    },
    [trackEvent]
  )

  return {
    trackEvent,
    trackPageView,
    trackConversion,
    trackBetaSignup,
    trackFormSubmission,
    trackCTAClick,
    trackEngagement,
    trackScrollDepth,
    trackTimeOnPage,
    isPlausibleEnabled: isPlausibleAvailable(),
  }
}

/**
 * Convert properties object to Plausible-compatible format
 */
function convertPropsToPlausible(
  properties: Record<string, any>
): Record<string, string | number | boolean> {
  const plausibleProps: Record<string, string | number | boolean> = {}

  for (const [key, value] of Object.entries(properties)) {
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      plausibleProps[key] = value
    } else if (value !== null && value !== undefined) {
      plausibleProps[key] = String(value)
    }
  }

  return plausibleProps
}
