'use client'

import React, { useEffect, useCallback } from 'react'
import { useAnalyticsUtils, useConversionTrackingUtils } from '@/lib/analytics'
import { useCombinedAnalytics } from '@/lib/combined-analytics'

interface AnalyticsProviderProps {
  children: React.ReactNode
  config?: {
    enableAutoTracking?: boolean
    trackScrollDepth?: boolean
    trackTimeOnPage?: boolean
    trackClicks?: boolean
    enablePlausible?: boolean
  }
}

/**
 * Analytics Provider Component
 * Wraps the app to provide analytics tracking throughout the application
 */
export function AnalyticsProvider({
  children,
  config = {},
}: AnalyticsProviderProps) {
  const {
    enableAutoTracking = true,
    trackScrollDepth = true,
    trackTimeOnPage = true,
    trackClicks = true,
  } = config

  const combinedAnalytics = useCombinedAnalytics()

  const fetchAnalyticsData = React.useCallback(async () => {
    if (!enableAutoTracking) return

    const setupTracking = async () => {
      // Track initial page view
      await combinedAnalytics.trackPageView()

      // Set up scroll depth tracking
      if (trackScrollDepth) {
        setupScrollDepthTracking()
      }

      // Set up time on page tracking
      if (trackTimeOnPage) {
        setupTimeOnPageTracking()
      }

      // Set up click tracking
      if (trackClicks) {
        setupClickTracking()
      }
    }

    const setupScrollDepthTracking = () => {
      let maxScrollDepth = 0
      const trackedDepths = new Set<number>()

      const handleScroll = () => {
        const scrollTop = window.scrollY
        const docHeight =
          document.documentElement.scrollHeight - window.innerHeight
        const scrollPercent = Math.round((scrollTop / docHeight) * 100)

        if (scrollPercent > maxScrollDepth) {
          maxScrollDepth = scrollPercent

          // Track at 25%, 50%, 75%, 90%, and 100%
          const milestones = [25, 50, 75, 90, 100]
          for (const milestone of milestones) {
            if (scrollPercent >= milestone && !trackedDepths.has(milestone)) {
              trackedDepths.add(milestone)
              combinedAnalytics.trackScrollDepth(milestone)
              break
            }
          }
        }
      }

      window.addEventListener('scroll', handleScroll, { passive: true })

      return () => window.removeEventListener('scroll', handleScroll)
    }

    const setupTimeOnPageTracking = () => {
      const startTime = Date.now()
      const trackedTimes = new Set<number>()

      const trackTimeInterval = setInterval(() => {
        const timeOnPage = Math.round((Date.now() - startTime) / 1000)

        // Track at 30s, 60s, 120s, 300s milestones
        const milestones = [30, 60, 120, 300]
        for (const milestone of milestones) {
          if (timeOnPage >= milestone && !trackedTimes.has(milestone)) {
            trackedTimes.add(milestone)
            combinedAnalytics.trackTimeOnPage(milestone)
            break
          }
        }
      }, 10000) // Check every 10 seconds

      return () => clearInterval(trackTimeInterval)
    }

    const setupClickTracking = () => {
      const handleClick = (event: MouseEvent) => {
        const target = event.target as HTMLElement
        if (!target) return

        // Track CTA button clicks
        if (
          target.matches(
            'button[data-cta], a[data-cta], [role="button"][data-cta]'
          )
        ) {
          const ctaText = target.textContent?.trim() || 'Unknown CTA'
          const position = target.getAttribute('data-cta-position') || 'unknown'
          combinedAnalytics.trackCTAClick(ctaText, position)
        }

        // Track navigation clicks
        if (target.matches('a[href]')) {
          const href = target.getAttribute('href')
          if (
            href?.startsWith('http') &&
            !href.includes(window.location.hostname)
          ) {
            // Outbound link - Plausible handles this automatically
            return
          }
        }

        // Track form interactions
        if (target.matches('input, select, textarea')) {
          const formName =
            target.closest('form')?.getAttribute('data-form-name') || 'unknown'
          combinedAnalytics.trackEvent({
            name: 'form_interaction',
            properties: {
              form_name: formName,
              field_type: target.tagName.toLowerCase(),
              field_name: target.getAttribute('name') || 'unknown',
            },
          })
        }
      }

      document.addEventListener('click', handleClick, { passive: true })

      return () => document.removeEventListener('click', handleClick)
    }

    await setupTracking()
  }, [
    combinedAnalytics,
    enableAutoTracking,
    trackScrollDepth,
    trackTimeOnPage,
    trackClicks,
  ])

  useEffect(() => {
    fetchAnalyticsData()
  }, [fetchAnalyticsData])

  return <>{children}</>
}

/**
 * Hook for analytics tracking in React components
 */
export function useAnalytics() {
  const analyticsUtils = useAnalyticsUtils()

  const trackEvent = useCallback(
    async (eventType: string, properties: Record<string, any> = {}) => {
      await analyticsUtils.track(eventType, properties)
    },
    [analyticsUtils]
  )

  const trackPageView = useCallback(
    async (path?: string, title?: string) => {
      await analyticsUtils.trackPageView(path, title)
    },
    [analyticsUtils]
  )

  const trackConversion = useCallback(
    async (
      conversionType: string,
      value: number = 1,
      metadata: Record<string, any> = {}
    ) => {
      await analyticsUtils.trackConversion(conversionType, value, metadata)
    },
    [analyticsUtils]
  )

  const trackEngagement = useCallback(
    async (eventType: string, data: Record<string, any> = {}) => {
      await analyticsUtils.trackEngagement(eventType, data)
    },
    [analyticsUtils]
  )

  const trackCTAClick = useCallback(
    async (ctaText: string, position: string, destination?: string) => {
      await analyticsUtils.trackCTAClick(ctaText, position, destination)
    },
    [analyticsUtils]
  )

  const trackFormInteraction = useCallback(
    async (formId: string, field: string, action: string) => {
      await analyticsUtils.trackFormInteraction(formId, field, action)
    },
    [analyticsUtils]
  )

  return {
    track: trackEvent,
    trackPageView,
    trackConversion,
    trackEngagement,
    trackCTAClick,
    trackFormInteraction,
    getIds: analyticsUtils.getIds,
  }
}

/**
 * Hook for automatic page view tracking
 */
export function usePageTracking(path?: string, title?: string) {
  const { trackPageView } = useAnalytics()

  useEffect(() => {
    trackPageView(path, title)
  }, [path, title, trackPageView])
}

/**
 * Hook for conversion tracking
 */
export function useConversionTracking() {
  const conversionUtils = useConversionTrackingUtils()

  return {
    trackBetaSignup: conversionUtils.trackBetaSignup,
    trackNewsletterSignup: conversionUtils.trackNewsletterSignup,
    trackDownload: conversionUtils.trackDownload,
  }
}

/**
 * CTA Click Tracker Component
 */
interface CTATrackerProps {
  children: React.ReactElement<any>
  ctaText: string
  position: string
  destination?: string
}

export function CTATracker({
  children,
  ctaText,
  position,
  destination,
}: CTATrackerProps) {
  const { trackCTAClick } = useAnalytics()

  const handleClick = useCallback(
    async (event: React.MouseEvent) => {
      await trackCTAClick(ctaText, position, destination)

      // Call original onClick if it exists
      const originalOnClick = (children.props as any)?.onClick
      if (originalOnClick) {
        originalOnClick(event)
      }
    },
    [trackCTAClick, ctaText, position, destination, children]
  )

  return React.cloneElement(children, {
    ...children.props,
    onClick: handleClick,
  } as any)
}

/**
 * Form Tracker Component
 */
interface FormTrackerProps {
  children: React.ReactNode
  formId: string
  onSubmit?: (data: any) => void
  className?: string
}

export function FormTracker({
  children,
  formId,
  onSubmit,
  className,
}: FormTrackerProps) {
  const { trackFormInteraction, trackConversion } = useAnalytics()

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      await trackFormInteraction(formId, 'form', 'submit')

      // Check if this is a signup form for conversion tracking
      if (formId.includes('signup') || formId.includes('beta')) {
        await trackConversion('form_submission', 1, { formId })
      }

      if (onSubmit) {
        const formData = new FormData(event.currentTarget)
        const data = Object.fromEntries(formData.entries())
        onSubmit(data)
      }
    },
    [trackFormInteraction, trackConversion, formId, onSubmit]
  )

  return (
    <form onSubmit={handleSubmit} className={className} data-form-id={formId}>
      {children}
    </form>
  )
}

/**
 * Field Tracker Component for individual form fields
 */
interface FieldTrackerProps {
  children: React.ReactElement<any>
  fieldName: string
  formId: string
}

export function FieldTracker({
  children,
  fieldName,
  formId,
}: FieldTrackerProps) {
  const { trackFormInteraction } = useAnalytics()

  const handleFocus = useCallback(async () => {
    await trackFormInteraction(formId, fieldName, 'focus')
  }, [trackFormInteraction, formId, fieldName])

  const handleBlur = useCallback(async () => {
    await trackFormInteraction(formId, fieldName, 'blur')
  }, [trackFormInteraction, formId, fieldName])

  return React.cloneElement(children, {
    ...children.props,
    onFocus: (event: React.FocusEvent) => {
      handleFocus()
      const originalOnFocus = (children.props as any)?.onFocus
      if (originalOnFocus) {
        originalOnFocus(event)
      }
    },
    onBlur: (event: React.FocusEvent) => {
      handleBlur()
      const originalOnBlur = (children.props as any)?.onBlur
      if (originalOnBlur) {
        originalOnBlur(event)
      }
    },
  } as any)
}

/**
 * Page View Tracker Component
 */
interface PageViewTrackerProps {
  path?: string
  title?: string
}

export function PageViewTracker({ path, title }: PageViewTrackerProps) {
  usePageTracking(path, title)
  return null
}
