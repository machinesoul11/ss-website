/**
 * Custom Analytics API - Anonymous Visitor Identification
 * Phase 6: Privacy-Compliant Analytics System
 *
 * Handles anonymous visitor identification and session-based tracking
 * without cookies or personal data collection
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import crypto from 'crypto'

interface VisitorData {
  userAgent?: string
  timezone?: number
  screenResolution?: string
  language?: string
  referrer?: string
  utmParams?: Record<string, string>
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      visitorData,
      sessionId,
      pagePath = '/',
      eventType = 'visitor_identification',
    }: {
      visitorData: VisitorData
      sessionId?: string
      pagePath?: string
      eventType?: string
    } = body

    // Generate anonymous visitor fingerprint
    const visitorFingerprint = generateVisitorFingerprint(visitorData)

    // Get or create visitor record using page_analytics table
    const { visitor, isNewVisitor } = await getOrCreateVisitor(
      visitorFingerprint,
      visitorData
    )

    // Track the visitor identification event
    await trackVisitorEvent(
      visitor.id,
      sessionId || undefined,
      eventType,
      pagePath,
      {
        isNewVisitor,
        fingerprint: visitorFingerprint,
        timezone: visitorData.timezone,
        screenResolution: visitorData.screenResolution,
        language: visitorData.language,
        referrer: visitorData.referrer,
        utmParams: visitorData.utmParams,
      }
    )

    return NextResponse.json({
      success: true,
      data: {
        visitorId: visitor.id,
        sessionId: sessionId || generateSessionId(),
        isNewVisitor,
        fingerprint: visitorFingerprint,
      },
    })
  } catch (error) {
    console.error('Anonymous visitor identification error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to identify anonymous visitor',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const visitorId = searchParams.get('visitorId')
    const sessionId = searchParams.get('sessionId')
    const days = parseInt(searchParams.get('days') || '7')

    if (!visitorId) {
      return NextResponse.json(
        { success: false, error: 'visitorId is required' },
        { status: 400 }
      )
    }

    // Get visitor session history
    const sessionHistory = await getVisitorSessionHistory(
      visitorId,
      sessionId || undefined,
      days
    )

    // Get visitor analytics summary
    const analyticsSummary = await getVisitorAnalyticsSummary(visitorId, days)

    return NextResponse.json({
      success: true,
      data: {
        visitorId,
        sessionHistory,
        analyticsSummary,
      },
    })
  } catch (error) {
    console.error('Get visitor analytics error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get visitor analytics',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

/**
 * Generate anonymous visitor fingerprint from browser characteristics
 */
function generateVisitorFingerprint(data: VisitorData): string {
  const components = [
    hashString(data.userAgent || 'unknown', 8),
    (data.timezone || 0).toString(),
    data.screenResolution || 'unknown',
    data.language?.split(',')[0] || 'unknown',
  ]

  const fingerprint = components.join('|')
  return hashString(fingerprint, 12)
}

/**
 * Get or create anonymous visitor using page_analytics table
 */
async function getOrCreateVisitor(fingerprint: string, data: VisitorData) {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not available')
  }

  try {
    // Check if visitor exists by looking for recent records with same fingerprint
    const { data: existingRecords } = await supabaseAdmin
      .from('page_analytics')
      .select('*')
      .eq('event_type', 'visitor_session')
      .eq('visitor_id', fingerprint)
      .gte(
        'timestamp',
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      ) // Last 30 days
      .order('timestamp', { ascending: false })
      .limit(1)

    const isNewVisitor = !existingRecords || existingRecords.length === 0

    // Create a visitor session record
    const visitorRecord = {
      id: crypto.randomUUID(),
      page_path: '/',
      visitor_id: fingerprint,
      session_id: generateSessionId(),
      event_type: 'visitor_session',
      timestamp: new Date().toISOString(),
      referrer: data.referrer || null,
      user_agent_hash: data.userAgent ? hashString(data.userAgent, 10) : null,
      metadata: {
        timezone: data.timezone,
        screenResolution: data.screenResolution,
        language: data.language,
        utmParams: data.utmParams,
        isNewVisitor,
        fingerprint,
      },
    }

    const { data: createdRecord, error } = await supabaseAdmin
      .from('page_analytics')
      .insert([visitorRecord])
      .select()
      .single()

    if (error) {
      console.error('Error creating visitor record:', error)
      throw error
    }

    return {
      visitor: createdRecord || visitorRecord,
      isNewVisitor,
    }
  } catch (error) {
    console.error('Error managing visitor:', error)
    throw error
  }
}

/**
 * Track visitor event in page_analytics table
 */
async function trackVisitorEvent(
  visitorId: string,
  sessionId: string | undefined,
  eventType: string,
  pagePath: string,
  properties: Record<string, any>
) {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not available')
  }

  try {
    const eventRecord = {
      page_path: pagePath,
      visitor_id: visitorId,
      session_id: sessionId || generateSessionId(),
      event_type: eventType,
      timestamp: new Date().toISOString(),
      referrer: properties.referrer || null,
      user_agent_hash: properties.userAgentHash || null,
      metadata: {
        ...properties,
        tracked_at: new Date().toISOString(),
      },
    }

    await supabaseAdmin.from('page_analytics').insert([eventRecord])
  } catch (error) {
    console.error('Error tracking visitor event:', error)
    throw error
  }
}

/**
 * Get visitor session history from page_analytics
 */
async function getVisitorSessionHistory(
  visitorId: string,
  currentSessionId?: string,
  days: number = 7
) {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not available')
  }

  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  try {
    const { data: sessions } = await supabaseAdmin
      .from('page_analytics')
      .select('*')
      .eq('visitor_id', visitorId)
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: false })

    // Group by session_id to create session summaries
    const sessionMap = new Map()

    sessions?.forEach((record: any) => {
      const sessionId = record.session_id || 'unknown'

      if (!sessionMap.has(sessionId)) {
        sessionMap.set(sessionId, {
          sessionId,
          startTime: record.timestamp,
          endTime: record.timestamp,
          pageViews: 0,
          events: [],
          totalTimeOnSite: 0,
          entryPage: record.page_path,
          exitPage: record.page_path,
        })
      }

      const session = sessionMap.get(sessionId)
      session.pageViews++
      session.events.push({
        eventType: record.event_type,
        pagePath: record.page_path,
        timestamp: record.timestamp,
        metadata: record.metadata,
      })

      // Update session times
      if (record.timestamp < session.startTime) {
        session.startTime = record.timestamp
        session.entryPage = record.page_path
      }
      if (record.timestamp > session.endTime) {
        session.endTime = record.timestamp
        session.exitPage = record.page_path
      }
    })

    // Calculate session durations
    const sessionSummaries = Array.from(sessionMap.values()).map((session) => {
      const duration =
        new Date(session.endTime).getTime() -
        new Date(session.startTime).getTime()
      return {
        ...session,
        duration: Math.max(duration, 0),
        isCurrentSession: session.sessionId === currentSessionId,
      }
    })

    return sessionSummaries
  } catch (error) {
    console.error('Error getting visitor session history:', error)
    throw error
  }
}

/**
 * Get visitor analytics summary
 */
async function getVisitorAnalyticsSummary(visitorId: string, days: number = 7) {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not available')
  }

  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  try {
    const { data: records } = await supabaseAdmin
      .from('page_analytics')
      .select('*')
      .eq('visitor_id', visitorId)
      .gte('timestamp', startDate.toISOString())

    if (!records || records.length === 0) {
      return {
        totalSessions: 0,
        totalPageViews: 0,
        totalTimeOnSite: 0,
        averageSessionDuration: 0,
        mostVisitedPages: [],
        eventTypeCounts: {},
      }
    }

    // Calculate metrics
    const sessions = new Set(records.map((r: any) => r.session_id))
    const pages = new Map<string, number>()
    const eventTypes = new Map<string, number>()

    records.forEach((record: any) => {
      // Count pages
      const pageCount = pages.get(record.page_path) || 0
      pages.set(record.page_path, pageCount + 1)

      // Count event types
      const eventCount = eventTypes.get(record.event_type) || 0
      eventTypes.set(record.event_type, eventCount + 1)
    })

    const mostVisitedPages = Array.from(pages.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([page, views]) => ({ page, views }))

    const eventTypeCounts = Object.fromEntries(eventTypes)

    return {
      totalSessions: sessions.size,
      totalPageViews: records.length,
      totalTimeOnSite: 0, // Would need to calculate from session durations
      averageSessionDuration: 0, // Would need session duration calculation
      mostVisitedPages,
      eventTypeCounts,
      firstVisit: records[records.length - 1]?.timestamp,
      lastVisit: records[0]?.timestamp,
    }
  } catch (error) {
    console.error('Error getting visitor analytics summary:', error)
    throw error
  }
}

/**
 * Utility functions
 */
function hashString(input: string, length: number = 10): string {
  return crypto
    .createHash('sha256')
    .update(input)
    .digest('hex')
    .substring(0, length)
}

function generateSessionId(): string {
  return crypto.randomUUID()
}
