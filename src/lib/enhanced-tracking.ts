/**
 * Enhanced Custom Event Tracking
 * Implements specific tracking requirements for Phase 6
 */

'use client'

import { useCombinedAnalytics } from '@/lib/combined-analytics'
// import { useAnalyticsUtils } from '@/lib/analytics'
import { trackPlausibleEvent, trackPlausibleGoal } from '@/lib/plausible'

export interface FormInteractionData {
  formId: string
  fieldName: string
  action: 'focus' | 'blur' | 'change' | 'submit' | 'abandon' | 'error'
  value?: string
  timeSpent?: number
  stepNumber?: number
  totalSteps?: number
  errors?: string[]
}

export interface CTAClickData {
  ctaText: string
  ctaPosition: 'hero' | 'content' | 'footer' | 'nav' | 'sidebar'
  ctaType: 'primary' | 'secondary' | 'ghost' | 'text'
  page: string
  section?: string
  destination?: string
  userFlow?: string
}

export interface ScrollDepthData {
  percentage: number
  page: string
  timeToReach: number
  maxDepthReached: number
  bounced: boolean
}

export interface EngagementTimeData {
  page: string
  timeSpent: number
  interactions: number
  scrollDepth: number
  ctaClicks: number
  formInteractions: number
  activeTime: number // Time when page was actually visible/active
}

export interface ReferrerAttributionData {
  source: string
  medium: string
  campaign?: string
  term?: string
  content?: string
  referrerUrl?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
}

export interface ConversionFunnelData {
  funnelName: string
  step: string
  stepNumber: number
  totalSteps: number
  timeInFunnel: number
  previousStep?: string
  nextStep?: string
  abandoned?: boolean
  completed?: boolean
}

/**
 * Enhanced tracking utilities hook
 */
export function useEnhancedTracking() {
  const analytics = useCombinedAnalytics()

  /**
   * Track detailed form interactions and completion rates
   */
  const trackFormInteraction = async (data: FormInteractionData) => {
    try {
      // Track to custom analytics with detailed data
      await analytics.trackEvent({
        name: 'form_interaction_detailed',
        properties: {
          form_id: data.formId,
          field_name: data.fieldName,
          action: data.action,
          value_length: data.value?.length || 0,
          time_spent: data.timeSpent || 0,
          step_number: data.stepNumber || 1,
          total_steps: data.totalSteps || 1,
          completion_rate:
            data.stepNumber && data.totalSteps
              ? (data.stepNumber / data.totalSteps) * 100
              : 0,
          has_errors: (data.errors?.length || 0) > 0,
          error_count: data.errors?.length || 0,
          page: typeof window !== 'undefined' ? window.location.pathname : '',
          timestamp: Date.now(),
        },
      })

      // Track to Plausible with key metrics (with error handling)
      try {
        trackPlausibleEvent('Form Interaction', {
          props: {
            form_id: data.formId,
            action: data.action,
            step: data.stepNumber || 1,
            completion_rate:
              data.stepNumber && data.totalSteps
                ? Math.round((data.stepNumber / data.totalSteps) * 100)
                : 0,
          },
        })
      } catch (plausibleError) {
        console.debug(
          'Plausible tracking failed for form interaction:',
          plausibleError
        )
      }

      // Track abandonment specifically
      if (data.action === 'abandon') {
        await analytics.trackEvent({
          name: 'form_abandonment',
          properties: {
            form_id: data.formId,
            abandoned_at_step: data.stepNumber,
            abandonment_rate:
              data.stepNumber && data.totalSteps
                ? ((data.totalSteps - data.stepNumber) / data.totalSteps) * 100
                : 100,
          },
        })

        try {
          trackPlausibleGoal('Form Abandonment', {
            props: {
              form_id: data.formId,
              step: data.stepNumber || 1,
            },
          })
        } catch (plausibleError) {
          console.debug(
            'Plausible tracking failed for form abandonment:',
            plausibleError
          )
        }
      }

      // Track completion
      if (data.action === 'submit' && data.stepNumber === data.totalSteps) {
        await analytics.trackConversion('form_completion', 1, {
          form_id: data.formId,
          completion_time: data.timeSpent || 0,
          total_steps: data.totalSteps,
        })
      }
    } catch (error) {
      console.error('Error tracking form interaction:', error)
    }
  }

  /**
   * Track detailed CTA clicks and user flow
   */
  const trackCTAClick = async (data: CTAClickData) => {
    try {
      await analytics.trackEvent({
        name: 'cta_click_detailed',
        properties: {
          cta_text: data.ctaText,
          cta_position: data.ctaPosition,
          cta_type: data.ctaType,
          page: data.page,
          section: data.section || 'unknown',
          destination: data.destination || '',
          user_flow: data.userFlow || 'direct',
          viewport_width: typeof window !== 'undefined' ? window.innerWidth : 0,
          viewport_height:
            typeof window !== 'undefined' ? window.innerHeight : 0,
          scroll_position: typeof window !== 'undefined' ? window.scrollY : 0,
        },
      })

      // Track click rate by position
      trackPlausibleEvent('CTA Click Rate', {
        props: {
          position: data.ctaPosition,
          type: data.ctaType,
          text: data.ctaText.substring(0, 50), // Limit length
        },
      })

      // Track user flow analysis
      if (data.userFlow) {
        await analytics.trackEvent({
          name: 'user_flow_step',
          properties: {
            flow_name: data.userFlow,
            step_type: 'cta_click',
            step_value: data.ctaText,
            page: data.page,
          },
        })
      }
    } catch (error) {
      console.error('Error tracking CTA click:', error)
    }
  }

  /**
   * Track detailed scroll depth and engagement
   */
  const trackScrollDepth = async (data: ScrollDepthData) => {
    try {
      await analytics.trackEvent({
        name: 'scroll_depth_detailed',
        properties: {
          depth_percentage: data.percentage,
          page: data.page,
          time_to_reach: data.timeToReach,
          max_depth_reached: data.maxDepthReached,
          bounced: data.bounced,
          engagement_score: calculateEngagementScore(data),
        },
      })

      // Only track milestones to Plausible to avoid spam
      if ([25, 50, 75, 90, 100].includes(data.percentage)) {
        trackPlausibleEvent('Scroll Engagement', {
          props: {
            depth: data.percentage,
            time_to_reach: Math.round(data.timeToReach / 1000), // Convert to seconds
            page_section: getPageSection(data.percentage),
          },
        })
      }
    } catch (error) {
      console.error('Error tracking scroll depth:', error)
    }
  }

  /**
   * Track detailed engagement time
   */
  const trackEngagementTime = async (data: EngagementTimeData) => {
    try {
      await analytics.trackEvent({
        name: 'engagement_time_detailed',
        properties: {
          page: data.page,
          total_time: data.timeSpent,
          active_time: data.activeTime,
          interactions: data.interactions,
          scroll_depth: data.scrollDepth,
          cta_clicks: data.ctaClicks,
          form_interactions: data.formInteractions,
          engagement_rate: calculateEngagementRate(data),
          bounce_probability: calculateBounceScore(data),
        },
      })

      // Track engagement milestones to Plausible
      const milestones = [15, 30, 60, 120, 300] // 15s, 30s, 1m, 2m, 5m
      const milestone = milestones.find(
        (m) => Math.abs(data.activeTime - m * 1000) < 2000 // Within 2 seconds
      )

      if (milestone) {
        trackPlausibleEvent('Engagement Milestone', {
          props: {
            duration: milestone,
            interactions: data.interactions,
            scroll_depth: data.scrollDepth,
          },
        })
      }
    } catch (error) {
      console.error('Error tracking engagement time:', error)
    }
  }

  /**
   * Track referrer sources and campaign attribution
   */
  const trackReferrerAttribution = async (data: ReferrerAttributionData) => {
    try {
      await analytics.trackEvent({
        name: 'referrer_attribution',
        properties: {
          source: data.source,
          medium: data.medium,
          campaign: data.campaign || 'direct',
          term: data.term || '',
          content: data.content || '',
          referrer_url: data.referrerUrl || '',
          utm_source: data.utm_source || '',
          utm_medium: data.utm_medium || '',
          utm_campaign: data.utm_campaign || '',
          utm_term: data.utm_term || '',
          utm_content: data.utm_content || '',
          session_start: Date.now(),
        },
      })

      // Track campaign performance to Plausible
      if (data.utm_campaign || data.campaign) {
        trackPlausibleEvent('Campaign Attribution', {
          props: {
            campaign: data.campaign || data.utm_campaign || 'unknown',
            source: data.source || data.utm_source || 'unknown',
            medium: data.medium || data.utm_medium || 'unknown',
          },
        })
      }
    } catch (error) {
      console.error('Error tracking referrer attribution:', error)
    }
  }

  /**
   * Track conversion funnel steps
   */
  const trackConversionFunnel = async (data: ConversionFunnelData) => {
    try {
      await analytics.trackEvent({
        name: 'conversion_funnel_step',
        properties: {
          funnel_name: data.funnelName,
          step: data.step,
          step_number: data.stepNumber,
          total_steps: data.totalSteps,
          time_in_funnel: data.timeInFunnel,
          previous_step: data.previousStep || '',
          next_step: data.nextStep || '',
          abandoned: data.abandoned || false,
          completed: data.completed || false,
          conversion_rate: data.stepNumber / data.totalSteps,
          drop_off_rate: data.abandoned
            ? ((data.totalSteps - data.stepNumber) / data.totalSteps) * 100
            : 0,
        },
      })

      // Track funnel performance to Plausible
      trackPlausibleEvent('Funnel Progress', {
        props: {
          funnel: data.funnelName,
          step: data.stepNumber,
          total_steps: data.totalSteps,
          status: data.completed
            ? 'completed'
            : data.abandoned
              ? 'abandoned'
              : 'in_progress',
        },
      })

      // Track conversion if completed
      if (data.completed) {
        await analytics.trackConversion(`${data.funnelName}_completion`, 1, {
          funnel_time: data.timeInFunnel,
          steps_completed: data.totalSteps,
        })

        trackPlausibleGoal('Funnel Conversion', {
          props: {
            funnel: data.funnelName,
            duration: Math.round(data.timeInFunnel / 1000),
          },
        })
      }
    } catch (error) {
      console.error('Error tracking conversion funnel:', error)
    }
  }

  return {
    trackFormInteraction,
    trackCTAClick,
    trackScrollDepth,
    trackEngagementTime,
    trackReferrerAttribution,
    trackConversionFunnel,
  }
}

/**
 * Helper functions for calculations
 */
function calculateEngagementScore(data: ScrollDepthData): number {
  // Simple engagement score based on scroll depth and time
  const timeScore = Math.min(data.timeToReach / 10000, 1) // Max 10 seconds to reach
  const depthScore = data.percentage / 100
  return Math.round((timeScore * 0.3 + depthScore * 0.7) * 100)
}

function calculateEngagementRate(data: EngagementTimeData): number {
  // Engagement rate based on interactions per minute
  const minutes = data.timeSpent / 60000
  return minutes > 0 ? Math.round(data.interactions / minutes) : 0
}

function calculateBounceScore(data: EngagementTimeData): number {
  // Bounce probability (0-100, lower is better engagement)
  if (data.activeTime < 5000) return 90 // Less than 5 seconds is likely bounce
  if (data.interactions === 0 && data.scrollDepth < 25) return 80
  if (data.scrollDepth < 50 && data.activeTime < 15000) return 60
  return Math.max(0, 50 - data.interactions * 5 - data.scrollDepth / 2)
}

function getPageSection(scrollPercentage: number): string {
  if (scrollPercentage < 25) return 'hero'
  if (scrollPercentage < 50) return 'content_top'
  if (scrollPercentage < 75) return 'content_middle'
  if (scrollPercentage < 90) return 'content_bottom'
  return 'footer'
}

/**
 * Utility to extract UTM parameters from URL
 */
export function extractUTMParameters(
  url: string = typeof window !== 'undefined' ? window.location.href : ''
): Partial<ReferrerAttributionData> {
  try {
    const urlObj = new URL(url)
    return {
      utm_source: urlObj.searchParams.get('utm_source') || undefined,
      utm_medium: urlObj.searchParams.get('utm_medium') || undefined,
      utm_campaign: urlObj.searchParams.get('utm_campaign') || undefined,
      utm_term: urlObj.searchParams.get('utm_term') || undefined,
      utm_content: urlObj.searchParams.get('utm_content') || undefined,
    }
  } catch (error) {
    console.error('Error extracting UTM parameters:', error)
    return {}
  }
}

/**
 * Utility to determine traffic source
 */
export function determineTrafficSource(
  referrer: string = typeof document !== 'undefined' ? document.referrer : ''
): { source: string; medium: string } {
  if (!referrer) return { source: 'direct', medium: 'none' }

  try {
    const referrerDomain = new URL(referrer).hostname.toLowerCase()

    // Social media sources
    if (
      referrerDomain.includes('twitter.com') ||
      referrerDomain.includes('t.co')
    ) {
      return { source: 'twitter', medium: 'social' }
    }
    if (referrerDomain.includes('linkedin.com')) {
      return { source: 'linkedin', medium: 'social' }
    }
    if (referrerDomain.includes('github.com')) {
      return { source: 'github', medium: 'social' }
    }
    if (referrerDomain.includes('reddit.com')) {
      return { source: 'reddit', medium: 'social' }
    }

    // Search engines
    if (referrerDomain.includes('google')) {
      return { source: 'google', medium: 'organic' }
    }
    if (referrerDomain.includes('bing')) {
      return { source: 'bing', medium: 'organic' }
    }
    if (referrerDomain.includes('duckduckgo')) {
      return { source: 'duckduckgo', medium: 'organic' }
    }

    // Developer communities
    if (referrerDomain.includes('dev.to')) {
      return { source: 'dev_to', medium: 'referral' }
    }
    if (referrerDomain.includes('stackoverflow.com')) {
      return { source: 'stackoverflow', medium: 'referral' }
    }
    if (
      referrerDomain.includes('hackernews') ||
      referrerDomain.includes('news.ycombinator.com')
    ) {
      return { source: 'hackernews', medium: 'referral' }
    }

    // Default for other referrers
    return { source: referrerDomain, medium: 'referral' }
  } catch (error) {
    console.error('Error determining traffic source:', error)
    return { source: 'unknown', medium: 'referral' }
  }
}
