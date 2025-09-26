/**
 * Privacy Analytics Provider
 * Phase 6: Custom Analytics System Integration
 * 
 * Wraps the application with privacy-compliant analytics tracking
 */

'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useEnhancedTracking } from '@/lib/enhanced-tracking'
import { usePerformanceMonitoring } from '@/lib/services/performance-monitoring'

interface AnalyticsConfig {
  enableTracking: boolean
  respectDoNotTrack: boolean
  enablePerformanceMonitoring: boolean
  enableAutoTracking: boolean
}

interface AnalyticsContextValue {
  config: AnalyticsConfig
  visitorId: string | null
  sessionId: string | null
  trackEvent: (eventType: string, properties?: Record<string, any>) => void
  trackConversion: (conversionType: string, value?: number) => void
  updateConfig: (config: Partial<AnalyticsConfig>) => void
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null)

interface PrivacyAnalyticsProviderProps {
  children: React.ReactNode
  config?: Partial<AnalyticsConfig>
}

const defaultConfig: AnalyticsConfig = {
  enableTracking: true,
  respectDoNotTrack: true,
  enablePerformanceMonitoring: true,
  enableAutoTracking: true
}

export function PrivacyAnalyticsProvider({ 
  children, 
  config: userConfig = {} 
}: PrivacyAnalyticsProviderProps) {
  const [config, setConfig] = useState<AnalyticsConfig>({
    ...defaultConfig,
    ...userConfig
  })
  
  const [visitorId, setVisitorId] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  const enhancedTracking = useEnhancedTracking()
  const { getCurrentMetrics } = usePerformanceMonitoring()

  useEffect(() => {
    setIsHydrated(true)
    
    if (typeof window === 'undefined') return

    // Check Do Not Track preference
    if (config.respectDoNotTrack && navigator.doNotTrack === '1') {
      setConfig(prev => ({ ...prev, enableTracking: false }))
      return
    }

    // Initialize analytics
    initializeAnalytics()
  }, [])

  const initializeAnalytics = async () => {
    try {
      if (!config.enableTracking) return

      // Generate visitor fingerprint
      const visitorData = {
        userAgent: navigator.userAgent,
        timezone: new Date().getTimezoneOffset(),
        screenResolution: `${screen.width}x${screen.height}`,
        language: navigator.language,
        referrer: document.referrer,
        utmParams: extractUTMParams()
      }

      // Get or create anonymous visitor
      const response = await fetch('/api/analytics/anonymous-visitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorData,
          pagePath: window.location.pathname,
          eventType: 'visitor_identification'
        })
      })

      if (response.ok) {
        const result = await response.json()
        setVisitorId(result.data.visitorId)
        setSessionId(result.data.sessionId)
        
        // Track initial page view
        if (config.enableAutoTracking) {
          trackPageView()
        }
      }

      setInitialized(true)

    } catch (error) {
      console.error('Analytics initialization error:', error)
    }
  }

  const extractUTMParams = (): Record<string, string> => {
    const params = new URLSearchParams(window.location.search)
    const utmParams: Record<string, string> = {}
    
    for (const [key, value] of params.entries()) {
      if (key.startsWith('utm_')) {
        utmParams[key] = value
      }
    }
    
    return utmParams
  }

  const trackPageView = async () => {
    if (!config.enableTracking || !visitorId) return

    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'page_view',
          visitorId,
          sessionId,
          properties: {
            page: window.location.pathname,
            title: document.title,
            referrer: document.referrer,
            timestamp: Date.now()
          }
        })
      })
    } catch (error) {
      console.error('Page view tracking error:', error)
    }
  }

  const trackEvent = async (eventType: string, properties: Record<string, any> = {}) => {
    if (!config.enableTracking || !visitorId) return

    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          visitorId,
          sessionId,
          properties: {
            ...properties,
            page: window.location.pathname,
            timestamp: Date.now()
          }
        })
      })
    } catch (error) {
      console.error('Event tracking error:', error)
    }
  }

  const trackConversion = async (conversionType: string, value: number = 1) => {
    if (!config.enableTracking || !visitorId) return

    try {
      await fetch('/api/analytics/conversions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversionType,
          visitorId,
          sessionId,
          conversionValue: value,
          metadata: {
            page: window.location.pathname,
            timestamp: Date.now()
          }
        })
      })
    } catch (error) {
      console.error('Conversion tracking error:', error)
    }
  }

  const updateConfig = (newConfig: Partial<AnalyticsConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }))
  }

  // Auto-track page changes in SPAs
  useEffect(() => {
    if (!initialized || !config.enableAutoTracking) return

    const handleRouteChange = () => {
      setTimeout(() => {
        trackPageView()
      }, 100) // Small delay to ensure page title is updated
    }

    // Listen for pushState/replaceState
    const originalPushState = window.history.pushState
    const originalReplaceState = window.history.replaceState

    window.history.pushState = function(...args) {
      originalPushState.apply(this, args)
      handleRouteChange()
    }

    window.history.replaceState = function(...args) {
      originalReplaceState.apply(this, args)
      handleRouteChange()
    }

    // Listen for back/forward navigation
    window.addEventListener('popstate', handleRouteChange)

    return () => {
      window.history.pushState = originalPushState
      window.history.replaceState = originalReplaceState
      window.removeEventListener('popstate', handleRouteChange)
    }
  }, [initialized, config.enableAutoTracking])

  const contextValue: AnalyticsContextValue = {
    config,
    visitorId,
    sessionId,
    trackEvent,
    trackConversion,
    updateConfig
  }

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  )
}

/**
 * Hook to use analytics context
 */
export function usePrivacyAnalytics() {
  const context = useContext(AnalyticsContext)
  
  if (!context) {
    throw new Error('usePrivacyAnalytics must be used within a PrivacyAnalyticsProvider')
  }
  
  return context
}

/**
 * Higher-order component to track component interactions
 */
export function withAnalyticsTracking<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  eventPrefix: string = 'component'
) {
  const ComponentWithAnalytics = (props: T) => {
    const { trackEvent } = usePrivacyAnalytics()

    const handleInteraction = (action: string, metadata?: Record<string, any>) => {
      trackEvent(`${eventPrefix}_${action}`, {
        component: WrappedComponent.displayName || WrappedComponent.name,
        ...metadata
      })
    }

    return (
      <WrappedComponent
        {...props}
        onAnalyticsEvent={handleInteraction}
      />
    )
  }

  ComponentWithAnalytics.displayName = `withAnalyticsTracking(${WrappedComponent.displayName || WrappedComponent.name})`
  
  return ComponentWithAnalytics
}

/**
 * Component to display privacy notice
 */
export function PrivacyNotice({ className = '' }: { className?: string }) {
  return (
    <div className={`text-xs text-muted-gray ${className}`}>
      <span className="inline-flex items-center gap-1">
        🔒 <span>Privacy-first analytics • No personal data collected</span>
      </span>
    </div>
  )
}
