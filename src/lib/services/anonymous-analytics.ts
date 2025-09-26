/**
 * Anonymous Visitor Analytics Service
 * Phase 6: Privacy-Compliant Analytics Implementation
 *
 * Provides anonymous visitor identification and session-based tracking
 * without cookies or personal data collection
 */

import { supabaseAdmin } from '@/lib/supabase'
import { AnonymousVisitor, AnalyticsSession } from '@/types'
import crypto from 'crypto'

// Type alias for session data to match our interface
export type SessionData = AnalyticsSession

/**
 * Anonymous visitor identification and tracking service
 */
export class AnonymousAnalyticsService {
  /**
   * Generate anonymous visitor ID from browser fingerprint
   * Uses timezone, screen resolution, and user agent for identification
   * without storing personal data
   */
  static generateVisitorFingerprint(
    userAgent: string,
    timezone: number = 0,
    screenResolution: string = '',
    acceptLanguage: string = ''
  ): string {
    const fingerprint = [
      this.hashString(userAgent, 8), // First 8 chars of UA hash
      timezone.toString(),
      screenResolution,
      acceptLanguage.split(',')[0], // Primary language only
    ]
      .filter(Boolean)
      .join('|')

    return this.hashString(fingerprint, 12)
  }

  /**
   * Create or retrieve anonymous visitor record
   */
  static async getOrCreateVisitor(
    visitorFingerprint: string,
    sessionData: {
      userAgent?: string
      timezone?: number
      screenResolution?: string
      referrer?: string
      utmData?: Record<string, string>
    }
  ): Promise<{ visitor: AnonymousVisitor; isNew: boolean }> {
    try {
      // Try to find existing visitor
      const { data: existingVisitor } = await supabaseAdmin
        .from('anonymous_visitors')
        .select('*')
        .eq('visitor_hash', visitorFingerprint)
        .single()

      if (existingVisitor) {
        // Update last seen and increment counters
        const { data: updatedVisitor } = await supabaseAdmin
          .from('anonymous_visitors')
          .update({
            last_seen: new Date().toISOString(),
            page_views: existingVisitor.page_views + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingVisitor.id)
          .select()
          .single()

        return { visitor: updatedVisitor || existingVisitor, isNew: false }
      }

      // Create new anonymous visitor
      const newVisitor: Partial<AnonymousVisitor> = {
        visitor_hash: visitorFingerprint,
        session_id: this.generateSessionId(),
        first_seen: new Date().toISOString(),
        last_seen: new Date().toISOString(),
        page_views: 1,
        total_sessions: 1,
        user_agent_hash: sessionData.userAgent
          ? this.hashString(sessionData.userAgent, 10)
          : undefined,
        timezone_offset: sessionData.timezone,
        screen_resolution: sessionData.screenResolution,
        referrer_domain: sessionData.referrer
          ? this.extractDomain(sessionData.referrer)
          : undefined,
        utm_source: sessionData.utmData?.utm_source,
        utm_medium: sessionData.utmData?.utm_medium,
        utm_campaign: sessionData.utmData?.utm_campaign,
        is_returning: false,
      }

      const { data: createdVisitor } = await supabaseAdmin
        .from('anonymous_visitors')
        .insert([newVisitor])
        .select()
        .single()

      if (!createdVisitor) {
        throw new Error('Failed to create anonymous visitor')
      }

      return { visitor: createdVisitor, isNew: true }
    } catch (error) {
      console.error('Error managing anonymous visitor:', error)
      throw error
    }
  }

  /**
   * Create new session for visitor
   */
  static async createSession(
    visitorId: string,
    entryPage: string,
    referrer?: string,
    utmData?: Record<string, string>,
    deviceData?: Record<string, any>
  ): Promise<SessionData> {
    // const sessionId = this.generateSessionId()

    const sessionData: Partial<SessionData> = {
      visitor_id: visitorId,
      session_start: new Date().toISOString(),
      pages_visited: 1,
      total_interactions: 0,
      max_scroll_depth: 0,
      time_on_site: 0,
      entry_page: entryPage,
      referrer: referrer,
      utm_data: utmData,
      device_data: deviceData,
      engagement_score: 0,
      converted: false,
      bounce: true, // Will be updated if user interacts
    }

    const { data: createdSession } = await supabaseAdmin
      .from('analytics_sessions')
      .insert([sessionData])
      .select()
      .single()

    if (!createdSession) {
      throw new Error('Failed to create session')
    }

    return createdSession
  }

  /**
   * Update session with engagement data
   */
  static async updateSession(
    sessionId: string,
    updates: Partial<{
      pages_visited: number
      total_interactions: number
      max_scroll_depth: number
      time_on_site: number
      exit_page: string
      engagement_score: number
      converted: boolean
      bounce: boolean
    }>
  ): Promise<void> {
    try {
      await supabaseAdmin
        .from('analytics_sessions')
        .update({
          ...updates,
          session_end: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId)
    } catch (error) {
      console.error('Error updating session:', error)
      throw error
    }
  }

  /**
   * Track analytics event
   */
  static async trackEvent(
    visitorId: string,
    sessionId: string,
    eventType: string,
    pagePath: string,
    properties?: Record<string, any>,
    userAgentHash?: string
  ): Promise<void> {
    try {
      const eventData: Partial<AnalyticsEvent> = {
        visitor_id: visitorId,
        session_id: sessionId,
        event_type: eventType,
        page_path: pagePath,
        timestamp: new Date().toISOString(),
        properties: properties,
        user_agent_hash: userAgentHash,
      }

      await supabaseAdmin.from('analytics_events').insert([eventData])
    } catch (error) {
      console.error('Error tracking analytics event:', error)
      throw error
    }
  }

  /**
   * Get visitor session history
   */
  static async getVisitorSessions(
    visitorId: string,
    limit: number = 10
  ): Promise<SessionData[]> {
    const { data: sessions } = await supabaseAdmin
      .from('analytics_sessions')
      .select('*')
      .eq('visitor_id', visitorId)
      .order('session_start', { ascending: false })
      .limit(limit)

    return sessions || []
  }

  /**
   * Generate aggregated metrics for time period
   */
  static async generateAggregatedMetrics(
    startDate: Date,
    endDate: Date
  ): Promise<{
    unique_visitors: number
    total_sessions: number
    total_page_views: number
    bounce_rate: number
    avg_session_duration: number
    top_pages: Array<{ page: string; views: number }>
    referrer_breakdown: Array<{ referrer: string; count: number }>
    utm_performance: Array<{
      campaign: string
      visitors: number
      conversions: number
    }>
  }> {
    try {
      const [
        visitorsData,
        sessionsData,
        pageViewsData,
        bounceData,
        topPagesData,
        referrerData,
        utmData,
      ] = await Promise.all([
        // Unique visitors
        supabaseAdmin
          .from('anonymous_visitors')
          .select('id')
          .gte('first_seen', startDate.toISOString())
          .lte('first_seen', endDate.toISOString()),

        // Total sessions
        supabaseAdmin
          .from('analytics_sessions')
          .select('id, time_on_site, bounce')
          .gte('session_start', startDate.toISOString())
          .lte('session_start', endDate.toISOString()),

        // Page views from events
        supabaseAdmin
          .from('analytics_events')
          .select('id')
          .eq('event_type', 'page_view')
          .gte('timestamp', startDate.toISOString())
          .lte('timestamp', endDate.toISOString()),

        // Bounce rate calculation
        supabaseAdmin
          .from('analytics_sessions')
          .select('bounce')
          .eq('bounce', true)
          .gte('session_start', startDate.toISOString())
          .lte('session_start', endDate.toISOString()),

        // Top pages
        supabaseAdmin.rpc('get_top_pages_by_period', {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          limit_count: 10,
        }),

        // Referrer breakdown
        supabaseAdmin.rpc('get_referrer_breakdown', {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        }),

        // UTM performance
        supabaseAdmin.rpc('get_utm_performance', {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        }),
      ])

      const totalSessions = sessionsData.data?.length || 0
      const bouncedSessions = bounceData.data?.length || 0
      const totalSessionTime =
        sessionsData.data?.reduce(
          (sum, session) => sum + (session.time_on_site || 0),
          0
        ) || 0

      return {
        unique_visitors: visitorsData.data?.length || 0,
        total_sessions: totalSessions,
        total_page_views: pageViewsData.data?.length || 0,
        bounce_rate:
          totalSessions > 0 ? (bouncedSessions / totalSessions) * 100 : 0,
        avg_session_duration:
          totalSessions > 0 ? totalSessionTime / totalSessions : 0,
        top_pages: topPagesData.data || [],
        referrer_breakdown: referrerData.data || [],
        utm_performance: utmData.data || [],
      }
    } catch (error) {
      console.error('Error generating aggregated metrics:', error)
      throw error
    }
  }

  // Utility methods
  private static hashString(input: string, length: number = 10): string {
    return crypto
      .createHash('sha256')
      .update(input)
      .digest('hex')
      .substring(0, length)
  }

  private static generateSessionId(): string {
    return crypto.randomUUID()
  }

  private static extractDomain(url: string): string {
    try {
      return new URL(url).hostname
    } catch {
      return 'unknown'
    }
  }
}
