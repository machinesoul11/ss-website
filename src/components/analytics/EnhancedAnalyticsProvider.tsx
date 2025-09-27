/**
 * Enhanced Analytics Provider
 * Provides automatic tracking for all enhanced events
 */

'use client'

import React, { createContext, useContext, useEffect, useRef } from 'react'
import {
  useEnhancedTracking,
  extractUTMParameters,
  determineTrafficSource,
  type FormInteractionData,
  type CTAClickData,
  type ScrollDepthData,
  type EngagementTimeData,
} from '@/lib/enhanced-tracking'

interface EnhancedAnalyticsContextType {
  trackFormInteraction: (data: FormInteractionData) => Promise<void>
  trackCTAClick: (data: CTAClickData) => Promise<void>
  trackScrollDepth: (data: ScrollDepthData) => Promise<void>
  trackEngagementTime: (data: EngagementTimeData) => Promise<void>
  startFormTracking: (formId: string, totalSteps?: number) => FormTracker
  startFunnelTracking: (funnelName: string, totalSteps: number) => FunnelTracker
}

const EnhancedAnalyticsContext =
  createContext<EnhancedAnalyticsContextType | null>(null)

export interface FormTracker {
  trackFieldInteraction: (
    fieldName: string,
    action: FormInteractionData['action'],
    value?: string
  ) => void
  trackStepCompletion: (stepNumber: number) => void
  trackAbandonment: (stepNumber: number) => void
  trackCompletion: () => void
  cleanup: () => void
}

export interface FunnelTracker {
  trackStep: (step: string, stepNumber: number) => void
  trackCompletion: () => void
  trackAbandonment: (stepNumber: number) => void
  cleanup: () => void
}

interface EnhancedAnalyticsProviderProps {
  children: React.ReactNode
  enableAutoTracking?: boolean
}

export function EnhancedAnalyticsProvider({
  children,
  enableAutoTracking = true,
}: EnhancedAnalyticsProviderProps) {
  // Production-ready analytics control with proper feature flags
  const shouldTrack =
    enableAutoTracking &&
    (process.env.NODE_ENV === 'production' ||
      process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === 'true')
  const tracking = useEnhancedTracking()
  const sessionDataRef = useRef({
    sessionStart: Date.now(),
    pageStart: Date.now(),
    interactions: 0,
    scrollDepth: 0,
    ctaClicks: 0,
    formInteractions: 0,
    maxScrollDepth: 0,
    lastActiveTime: Date.now(),
    isActive: true,
  })
  const scrollTrackingRef = useRef(new Set<number>())
  const timeTrackingRef = useRef(new Set<number>())

  // Initialize session tracking
  useEffect(() => {
    if (!shouldTrack) return

    // Track initial attribution
    const initializeAttribution = () => {
      const utm = extractUTMParameters()
      const trafficSource = determineTrafficSource()

      tracking.trackReferrerAttribution({
        ...trafficSource,
        ...utm,
        referrerUrl: typeof document !== 'undefined' ? document.referrer : '',
      })
    }

    // Initialize scroll tracking
    const initializeScrollTracking = () => {
      let scrollTimeout: NodeJS.Timeout

      const handleScroll = () => {
        clearTimeout(scrollTimeout)
        scrollTimeout = setTimeout(() => {
          const scrollPercentage = Math.round(
            (window.scrollY /
              (document.documentElement.scrollHeight - window.innerHeight)) *
              100
          )

          sessionDataRef.current.scrollDepth = scrollPercentage
          sessionDataRef.current.maxScrollDepth = Math.max(
            sessionDataRef.current.maxScrollDepth,
            scrollPercentage
          )

          // Track scroll milestones
          const milestones = [25, 50, 75, 90, 100]
          milestones.forEach((milestone) => {
            if (
              scrollPercentage >= milestone &&
              !scrollTrackingRef.current.has(milestone)
            ) {
              scrollTrackingRef.current.add(milestone)

              tracking.trackScrollDepth({
                percentage: milestone,
                page: window.location.pathname,
                timeToReach: Date.now() - sessionDataRef.current.pageStart,
                maxDepthReached: sessionDataRef.current.maxScrollDepth,
                bounced:
                  sessionDataRef.current.interactions === 0 && milestone < 25,
              })
            }
          })
        }, 100)
      }

      window.addEventListener('scroll', handleScroll, { passive: true })
      return () => window.removeEventListener('scroll', handleScroll)
    }

    // Initialize time tracking
    const initializeTimeTracking = () => {
      const interval = setInterval(() => {
        if (sessionDataRef.current.isActive) {
          const activeTime = Date.now() - sessionDataRef.current.pageStart
          const milestones = [15000, 30000, 60000, 120000, 300000] // 15s, 30s, 1m, 2m, 5m

          milestones.forEach((milestone) => {
            if (
              activeTime >= milestone &&
              !timeTrackingRef.current.has(milestone)
            ) {
              timeTrackingRef.current.add(milestone)

              tracking.trackEngagementTime({
                page: window.location.pathname,
                timeSpent: activeTime,
                interactions: sessionDataRef.current.interactions,
                scrollDepth: sessionDataRef.current.maxScrollDepth,
                ctaClicks: sessionDataRef.current.ctaClicks,
                formInteractions: sessionDataRef.current.formInteractions,
                activeTime: activeTime,
              })
            }
          })
        }
      }, 5000) // Check every 5 seconds

      return () => clearInterval(interval)
    }

    // Initialize visibility tracking
    const initializeVisibilityTracking = () => {
      const handleVisibilityChange = () => {
        if (document.hidden) {
          sessionDataRef.current.isActive = false
        } else {
          sessionDataRef.current.isActive = true
          sessionDataRef.current.lastActiveTime = Date.now()
        }
      }

      document.addEventListener('visibilitychange', handleVisibilityChange)
      return () =>
        document.removeEventListener('visibilitychange', handleVisibilityChange)
    }

    // Initialize interaction tracking
    const initializeInteractionTracking = () => {
      const handleInteraction = (event: Event) => {
        sessionDataRef.current.interactions++
        sessionDataRef.current.lastActiveTime = Date.now()

        // Track CTA clicks automatically
        const target = event.target as HTMLElement
        if (target && isCTAElement(target)) {
          sessionDataRef.current.ctaClicks++

          const ctaData: CTAClickData = {
            ctaText: target.textContent?.trim() || 'CTA Click',
            ctaPosition: getCTAPosition(target),
            ctaType: getCTAType(target),
            page: window.location.pathname,
            section: getPageSection(target),
            destination: target.getAttribute('href') || undefined,
          }

          tracking.trackCTAClick(ctaData)
        }

        // Track form interactions automatically
        if (
          target &&
          (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.tagName === 'SELECT')
        ) {
          sessionDataRef.current.formInteractions++

          const form = target.closest('form')
          if (form) {
            const formData: FormInteractionData = {
              formId:
                form.getAttribute('data-form-name') ||
                form.id ||
                'unknown_form',
              fieldName:
                target.getAttribute('name') || target.id || 'unknown_field',
              action: event.type as FormInteractionData['action'],
            }

            tracking.trackFormInteraction(formData)
          }
        }
      }

      const events = ['click', 'focus', 'change']
      events.forEach((eventType) => {
        document.addEventListener(eventType, handleInteraction, true)
      })

      return () => {
        events.forEach((eventType) => {
          document.removeEventListener(eventType, handleInteraction, true)
        })
      }
    }

    // Initialize all tracking
    initializeAttribution()
    const cleanupScroll = initializeScrollTracking()
    const cleanupTime = initializeTimeTracking()
    const cleanupVisibility = initializeVisibilityTracking()
    const cleanupInteraction = initializeInteractionTracking()

    // Cleanup function
    return () => {
      cleanupScroll()
      cleanupTime()
      cleanupVisibility()
      cleanupInteraction()
    }
  }, [enableAutoTracking, tracking])

  // Form tracker factory
  const startFormTracking = (
    formId: string,
    totalSteps: number = 1
  ): FormTracker => {
    const startTime = Date.now()
    let currentStep = 1

    return {
      trackFieldInteraction: (
        fieldName: string,
        action: FormInteractionData['action'],
        value?: string
      ) => {
        tracking.trackFormInteraction({
          formId,
          fieldName,
          action,
          value,
          timeSpent: Date.now() - startTime,
          stepNumber: currentStep,
          totalSteps,
        })
      },

      trackStepCompletion: (stepNumber: number) => {
        currentStep = stepNumber + 1
        tracking.trackFormInteraction({
          formId,
          fieldName: `step_${stepNumber}`,
          action: 'submit',
          timeSpent: Date.now() - startTime,
          stepNumber,
          totalSteps,
        })
      },

      trackAbandonment: (stepNumber: number) => {
        tracking.trackFormInteraction({
          formId,
          fieldName: `step_${stepNumber}`,
          action: 'abandon',
          timeSpent: Date.now() - startTime,
          stepNumber,
          totalSteps,
        })
      },

      trackCompletion: () => {
        tracking.trackFormInteraction({
          formId,
          fieldName: 'completion',
          action: 'submit',
          timeSpent: Date.now() - startTime,
          stepNumber: totalSteps,
          totalSteps,
        })
      },

      cleanup: () => {
        // Cleanup any form-specific tracking
      },
    }
  }

  // Funnel tracker factory
  const startFunnelTracking = (
    funnelName: string,
    totalSteps: number
  ): FunnelTracker => {
    const startTime = Date.now()
    // let currentStep = 1

    return {
      trackStep: (step: string, stepNumber: number) => {
        tracking.trackConversionFunnel({
          funnelName,
          step,
          stepNumber,
          totalSteps,
          timeInFunnel: Date.now() - startTime,
          previousStep: stepNumber > 1 ? `step_${stepNumber - 1}` : undefined,
          nextStep:
            stepNumber < totalSteps ? `step_${stepNumber + 1}` : undefined,
        })
      },

      trackCompletion: () => {
        tracking.trackConversionFunnel({
          funnelName,
          step: 'completed',
          stepNumber: totalSteps,
          totalSteps,
          timeInFunnel: Date.now() - startTime,
          completed: true,
        })
      },

      trackAbandonment: (stepNumber: number) => {
        tracking.trackConversionFunnel({
          funnelName,
          step: 'abandoned',
          stepNumber,
          totalSteps,
          timeInFunnel: Date.now() - startTime,
          abandoned: true,
        })
      },

      cleanup: () => {
        // Cleanup any funnel-specific tracking
      },
    }
  }

  const contextValue: EnhancedAnalyticsContextType = {
    trackFormInteraction: shouldTrack
      ? tracking.trackFormInteraction
      : async () => {},
    trackCTAClick: shouldTrack ? tracking.trackCTAClick : async () => {},
    trackScrollDepth: shouldTrack ? tracking.trackScrollDepth : async () => {},
    trackEngagementTime: shouldTrack
      ? tracking.trackEngagementTime
      : async () => {},
    startFormTracking: shouldTrack
      ? startFormTracking
      : () => ({
          trackFieldInteraction: () => {},
          trackStepCompletion: () => {},
          trackAbandonment: () => {},
          trackCompletion: () => {},
          cleanup: () => {},
        }),
    startFunnelTracking: shouldTrack
      ? startFunnelTracking
      : () => ({
          trackStep: () => {},
          trackCompletion: () => {},
          trackAbandonment: () => {},
          cleanup: () => {},
        }),
  }

  return (
    <EnhancedAnalyticsContext.Provider value={contextValue}>
      {children}
    </EnhancedAnalyticsContext.Provider>
  )
}

/**
 * Hook to use enhanced analytics context
 */
export function useEnhancedAnalyticsContext() {
  const context = useContext(EnhancedAnalyticsContext)
  if (!context) {
    throw new Error(
      'useEnhancedAnalyticsContext must be used within an EnhancedAnalyticsProvider'
    )
  }
  return context
}

/**
 * Helper functions for automatic tracking
 */
function isCTAElement(element: HTMLElement): boolean {
  const ctaKeywords = [
    'cta',
    'button',
    'signup',
    'register',
    'download',
    'get-started',
    'try-now',
    'join',
    'beta',
  ]
  const elementString = (
    element.className +
    ' ' +
    element.id +
    ' ' +
    (element.textContent || '')
  ).toLowerCase()

  return (
    ctaKeywords.some((keyword) => elementString.includes(keyword)) ||
    element.tagName.toLowerCase() === 'button' ||
    (element.tagName.toLowerCase() === 'a' &&
      element.getAttribute('href') !== null) ||
    element.hasAttribute('data-cta')
  )
}

function getCTAPosition(element: HTMLElement): CTAClickData['ctaPosition'] {
  const rect = element.getBoundingClientRect()
  const viewportHeight = window.innerHeight
  const scrollY = window.scrollY
  const elementTop = rect.top + scrollY

  // Check if in navigation area
  if (elementTop < 100) return 'nav'

  // Check if in hero section (first 30% of viewport)
  if (elementTop < viewportHeight * 0.3) return 'hero'

  // Check if in footer area (bottom 20% of document)
  const documentHeight = document.documentElement.scrollHeight
  if (elementTop > documentHeight * 0.8) return 'footer'

  // Check if in sidebar (narrow screens this might not apply)
  if (rect.left < 200 || rect.right > window.innerWidth - 200) return 'sidebar'

  return 'content'
}

function getCTAType(element: HTMLElement): CTAClickData['ctaType'] {
  const classes = element.className.toLowerCase()

  if (classes.includes('primary') || classes.includes('btn-primary'))
    return 'primary'
  if (classes.includes('secondary') || classes.includes('btn-secondary'))
    return 'secondary'
  if (classes.includes('ghost') || classes.includes('btn-ghost')) return 'ghost'
  if (element.tagName.toLowerCase() === 'a' && !classes.includes('btn'))
    return 'text'

  return 'primary' // Default
}

function getPageSection(element: HTMLElement): string {
  // Try to find the closest section or main content area
  const section = element.closest('section')
  if (section) {
    const sectionId = section.id || section.className
    if (sectionId) return sectionId.substring(0, 20) // Limit length
  }

  // Fallback to position-based detection
  const rect = element.getBoundingClientRect()
  const scrollY = window.scrollY
  const elementTop = rect.top + scrollY
  const documentHeight = document.documentElement.scrollHeight

  const relativePosition = elementTop / documentHeight

  if (relativePosition < 0.2) return 'hero'
  if (relativePosition < 0.4) return 'features'
  if (relativePosition < 0.6) return 'content'
  if (relativePosition < 0.8) return 'social_proof'
  return 'footer'
}
