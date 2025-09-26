/**
 * Privacy-compliant analytics tracking utility
 * Client-side library for tracking user interactions and page events
 */

export interface AnalyticsConfig {
  apiEndpoint?: string
  visitorId?: string
  sessionId?: string
  enableAutoTracking?: boolean
  trackScrollDepth?: boolean
  trackTimeOnPage?: boolean
  trackClicks?: boolean
  respectDoNotTrack?: boolean
}

export interface TrackingEvent {
  eventType: string
  properties?: Record<string, any>
  timestamp?: number
}

class AnalyticsTracker {
  private config: Required<AnalyticsConfig>
  private visitorId: string = ''
  private sessionId: string = ''
  private startTime: number = 0
  private scrollDepthTracked: Set<number> = new Set()
  private isTracking: boolean = true

  constructor(config: AnalyticsConfig = {}) {
    this.config = {
      apiEndpoint: '/api/analytics',
      visitorId: '',
      sessionId: '',
      enableAutoTracking: true,
      trackScrollDepth: true,
      trackTimeOnPage: true,
      trackClicks: true,
      respectDoNotTrack: true,
      ...config
    }

    // Only initialize if we're in the browser
    if (typeof window === 'undefined') {
      this.isTracking = false
      return
    }

    // Check Do Not Track preference
    if (this.config.respectDoNotTrack && this.isDNTEnabled()) {
      this.isTracking = false
      return
    }

    this.visitorId = this.config.visitorId || this.generateVisitorId()
    this.sessionId = this.config.sessionId || this.generateSessionId()
    this.startTime = Date.now()

    if (this.config.enableAutoTracking) {
      this.initializeAutoTracking()
    }
  }

  /**
   * Track a custom event
   */
  async track(eventType: string, properties: Record<string, any> = {}): Promise<void> {
    if (!this.isTracking || typeof window === 'undefined') return

    try {
      const event: TrackingEvent = {
        eventType,
        properties: {
          ...properties,
          page: window.location.pathname,
          timestamp: Date.now()
        }
      }

      await this.sendEvent(event)
    } catch (error) {
      console.error('Analytics tracking error:', error)
    }
  }

  /**
   * Track page view
   */
  async trackPageView(path?: string, title?: string): Promise<void> {
    if (!this.isTracking || typeof window === 'undefined') return

    const properties = {
      path: path || window.location.pathname,
      title: title || document.title,
      referrer: document.referrer,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      url: window.location.href,
      search: window.location.search
    }

    await this.track('page_view', properties)
  }

  /**
   * Track conversion events (beta signups, purchases, etc.)
   */
  async trackConversion(conversionType: string, value: number = 1, metadata: Record<string, any> = {}): Promise<void> {
    if (!this.isTracking || typeof window === 'undefined') return

    try {
      const response = await fetch('/api/analytics/conversions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversionType,
          visitorId: this.visitorId,
          sessionId: this.sessionId,
          conversionValue: value,
          metadata: {
            ...metadata,
            page: window.location.pathname,
            timestamp: Date.now()
          }
        })
      })

      if (!response.ok) {
        throw new Error('Conversion tracking failed')
      }
    } catch (error) {
      console.error('Conversion tracking error:', error)
    }
  }

  /**
   * Track engagement events
   */
  async trackEngagement(eventType: string, data: Record<string, any> = {}): Promise<void> {
    if (!this.isTracking || typeof window === 'undefined') return

    try {
      const response = await fetch('/api/analytics/engagement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorId: this.visitorId,
          sessionId: this.sessionId,
          eventType,
          pagePath: window.location.pathname,
          ...data,
          metadata: {
            ...data,
            timestamp: Date.now()
          }
        })
      })

      if (!response.ok) {
        throw new Error('Engagement tracking failed')
      }
    } catch (error) {
      console.error('Engagement tracking error:', error)
    }
  }

  /**
   * Track CTA clicks
   */
  async trackCTAClick(ctaText: string, position: string, destination?: string): Promise<void> {
    await this.track('cta_click', {
      cta_text: ctaText,
      cta_position: position,
      destination,
      click_target: ctaText
    })

    await this.trackEngagement('cta_click', {
      ctaPosition: position,
      clickTarget: ctaText
    })
  }

  /**
   * Track form interactions
   */
  async trackFormInteraction(formId: string, field: string, action: string): Promise<void> {
    await this.track('form_interaction', {
      form_id: formId,
      field_name: field,
      action, // 'focus', 'blur', 'submit', 'error'
      form_field: field
    })

    await this.trackEngagement('form_interaction', {
      formField: field
    })
  }

  /**
   * Track scroll depth
   */
  private trackScrollDepth(): void {
    if (!this.config.trackScrollDepth || !this.isTracking || typeof window === 'undefined') return

    const scrollPercentage = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    )

    // Track every 25% milestone
    const milestones = [25, 50, 75, 100]
    const milestone = milestones.find(m => scrollPercentage >= m && !this.scrollDepthTracked.has(m))

    if (milestone) {
      this.scrollDepthTracked.add(milestone)
      this.track('scroll_depth', {
        scroll_percentage: milestone,
        scroll_depth: milestone
      })

      this.trackEngagement('scroll_depth', {
        scrollDepth: milestone
      })
    }
  }

  /**
   * Track time on page
   */
  private trackTimeOnPage(): void {
    if (!this.config.trackTimeOnPage || !this.isTracking) return

    const timeOnPage = Date.now() - this.startTime

    // Track time milestones
    const milestones = [15000, 30000, 60000, 120000, 300000] // 15s, 30s, 1m, 2m, 5m

    milestones.forEach(milestone => {
      if (timeOnPage >= milestone && !this.hasTrackedTimeMilestone(milestone)) {
        this.track('time_on_page', {
          time_milestone: milestone,
          total_time: timeOnPage,
          time_on_page: timeOnPage
        })

        this.trackEngagement('time_on_page', {
          timeOnPage: timeOnPage
        })

        this.setTimeMilestoneTracked(milestone)
      }
    })
  }

  /**
   * Initialize automatic tracking
   */
  private initializeAutoTracking(): void {
    if (typeof window === 'undefined') return

    // Track initial page view
    this.trackPageView()

    // Track scroll depth
    if (this.config.trackScrollDepth) {
      let scrollTimeout: NodeJS.Timeout
      window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout)
        scrollTimeout = setTimeout(() => this.trackScrollDepth(), 100)
      }, { passive: true })
    }

    // Track time on page
    if (this.config.trackTimeOnPage) {
      setInterval(() => this.trackTimeOnPage(), 15000) // Check every 15 seconds
    }

    // Track clicks
    if (this.config.trackClicks) {
      document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement
        if (target) {
          this.trackClick(target, event)
        }
      })
    }

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackTimeOnPage() // Final time tracking when page becomes hidden
      } else {
        this.startTime = Date.now() // Reset timer when page becomes visible again
      }
    })

    // Track page unload
    window.addEventListener('beforeunload', () => {
      this.trackTimeOnPage()
    })
  }

  /**
   * Track click events
   */
  private async trackClick(target: HTMLElement, event: MouseEvent): Promise<void> {
    const tagName = target.tagName.toLowerCase()
    const text = target.textContent?.trim() || ''
    const href = target.getAttribute('href')
    const id = target.id
    const className = target.className

    // Identify CTA clicks
    if (this.isCTAElement(target)) {
      const position = this.getCTAPosition(target)
      await this.trackCTAClick(text, position, href || undefined)
      return
    }

    // Track general clicks
    await this.track('click', {
      element_type: tagName,
      element_text: text.substring(0, 100), // Limit text length
      element_id: id,
      element_class: className,
      href,
      x: event.clientX,
      y: event.clientY,
      click_target: `${tagName}${id ? '#' + id : ''}${className ? '.' + className.split(' ').join('.') : ''}`
    })
  }

  /**
   * Check if element is a CTA
   */
  private isCTAElement(element: HTMLElement): boolean {
    const ctaKeywords = ['cta', 'button', 'signup', 'register', 'download', 'get-started', 'try-now']
    const elementString = (element.className + ' ' + element.id + ' ' + element.textContent).toLowerCase()
    
    return ctaKeywords.some(keyword => elementString.includes(keyword)) ||
           element.tagName.toLowerCase() === 'button' ||
           (element.tagName.toLowerCase() === 'a' && element.textContent !== null && element.textContent.length < 50)
  }

  /**
   * Determine CTA position
   */
  private getCTAPosition(element: HTMLElement): string {
    const rect = element.getBoundingClientRect()
    const viewportHeight = window.innerHeight

    if (rect.top < viewportHeight * 0.3) return 'hero'
    if (rect.top > viewportHeight * 0.7) return 'footer'
    return 'content'
  }

  /**
   * Send event to analytics API
   */
  private async sendEvent(event: TrackingEvent): Promise<void> {
    try {
      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: event.eventType,
          properties: event.properties,
          visitorId: this.visitorId,
          sessionId: this.sessionId
        })
      })

      if (!response.ok) {
        throw new Error(`Analytics API error: ${response.statusText}`)
      }
    } catch (error) {
      // Silently fail for analytics to not break user experience
      console.error('Failed to send analytics event:', error)
    }
  }

  /**
   * Generate anonymous visitor ID
   */
  private generateVisitorId(): string {
    if (typeof window === 'undefined') return 'ssr_visitor'
    
    let visitorId = localStorage.getItem('analytics_visitor_id')
    
    if (!visitorId) {
      visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      localStorage.setItem('analytics_visitor_id', visitorId)
    }
    
    return visitorId
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    if (typeof window === 'undefined') return 'ssr_session'
    
    let sessionId = sessionStorage.getItem('analytics_session_id')
    
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      sessionStorage.setItem('analytics_session_id', sessionId)
    }
    
    return sessionId
  }

  /**
   * Check if Do Not Track is enabled
   */
  private isDNTEnabled(): boolean {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return false // Default to allowing tracking on server-side
    }
    
    return navigator.doNotTrack === '1' || 
           (window as any).doNotTrack === '1' || 
           (navigator as any).msDoNotTrack === '1'
  }

  /**
   * Time milestone tracking helpers
   */
  private hasTrackedTimeMilestone(milestone: number): boolean {
    if (typeof window === 'undefined') return false
    const tracked = sessionStorage.getItem(`time_milestone_${milestone}`)
    return tracked === 'true'
  }

  private setTimeMilestoneTracked(milestone: number): void {
    if (typeof window === 'undefined') return
    sessionStorage.setItem(`time_milestone_${milestone}`, 'true')
  }

  /**
   * Get visitor and session IDs
   */
  public getIds(): { visitorId: string; sessionId: string } {
    return {
      visitorId: this.visitorId,
      sessionId: this.sessionId
    }
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }
}

// Export singleton instance (only create in browser)
export const analytics = typeof window !== 'undefined' ? new AnalyticsTracker() : {} as AnalyticsTracker

// Export class for custom instances
export default AnalyticsTracker

// Utility functions for React components
export const useAnalytics = () => {
  return {
    track: analytics.track.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackConversion: analytics.trackConversion.bind(analytics),
    trackEngagement: analytics.trackEngagement.bind(analytics),
    trackCTAClick: analytics.trackCTAClick.bind(analytics),
    trackFormInteraction: analytics.trackFormInteraction.bind(analytics),
    getIds: analytics.getIds.bind(analytics)
  }
}

// Utility functions for React components
export const useAnalyticsUtils = () => {
  if (typeof window === 'undefined') {
    // Return no-op functions for SSR
    return {
      track: async () => {},
      trackPageView: async () => {},
      trackConversion: async () => {},
      trackEngagement: async () => {},
      trackCTAClick: async () => {},
      trackFormInteraction: async () => {},
      getIds: () => ({ visitorId: '', sessionId: '' })
    }
  }
  
  return {
    track: analytics.track.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackConversion: analytics.trackConversion.bind(analytics),
    trackEngagement: analytics.trackEngagement.bind(analytics),
    trackCTAClick: analytics.trackCTAClick.bind(analytics),
    trackFormInteraction: analytics.trackFormInteraction.bind(analytics),
    getIds: analytics.getIds.bind(analytics)
  }
}

// React hook for conversion tracking
export const useConversionTrackingUtils = () => {
  if (typeof window === 'undefined') {
    return {
      trackBetaSignup: async () => {},
      trackNewsletterSignup: async () => {},
      trackDownload: async () => {}
    }
  }
  
  return {
    trackBetaSignup: (email: string, source?: string, teamSize?: string) => 
      analytics.trackConversion('beta_signup', 1, { email, source, teamSize }),
    trackNewsletterSignup: (email: string) => 
      analytics.trackConversion('newsletter_signup', 1, { email }),
    trackDownload: (resource: string) => 
      analytics.trackConversion('download', 1, { resource })
  }
}
