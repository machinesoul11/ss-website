import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import crypto from 'crypto'

/**
 * Privacy-compliant analytics tracking endpoint
 * Supports: page views, interactions, conversions, engagement events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      eventType, 
      properties = {}, 
      visitorId, 
      sessionId,
      anonymousId 
    } = body

    // Validate required fields
    if (!eventType) {
      return NextResponse.json(
        { success: false, error: 'eventType is required' },
        { status: 400 }
      )
    }

    // Privacy-compliant visitor identification
    const userAgent = request.headers.get('user-agent') || ''
    const userAgentHash = hashUserAgent(userAgent)
    const clientIp = getClientIP(request)
    const ipHash = hashIP(clientIp)
    
    // Generate or use provided anonymous visitor ID
    const finalVisitorId = visitorId || anonymousId || generateAnonymousId(ipHash, userAgentHash)
    
    // Get page path and referrer
    const pagePath = properties.page || properties.path || '/'
    const referrer = request.headers.get('referer') || properties.referrer || null
    
    // Enhanced metadata with privacy-safe information
    const enhancedMetadata = {
      ...properties,
      timestamp: new Date().toISOString(),
      viewport: properties.viewport || null,
      scroll_depth: properties.scrollDepth || null,
      time_on_page: properties.timeOnPage || null,
      click_target: properties.clickTarget || null,
      form_field: properties.formField || null,
      cta_position: properties.ctaPosition || null,
      ab_test_variant: properties.abTestVariant || null
    }

    // Log the analytics event
    const { error: insertError } = await supabaseAdmin
      .from('page_analytics')
      .insert({
        page_path: pagePath,
        visitor_id: finalVisitorId,
        session_id: sessionId || generateSessionId(),
        event_type: eventType,
        referrer: referrer,
        user_agent_hash: userAgentHash,
        metadata: enhancedMetadata
      })

    if (insertError) {
      console.error('Database insert error:', insertError)
      return NextResponse.json(
        { success: false, error: 'Failed to log analytics event' },
        { status: 500 }
      )
    }

    // Handle conversion events (beta signups)
    if (eventType === 'beta_signup' || eventType === 'conversion') {
      await trackConversion(finalVisitorId, sessionId, properties)
    }

    // Update engagement score for repeat visitors
    if (eventType === 'page_view' || eventType === 'interaction') {
      await updateEngagementScore(finalVisitorId, eventType, enhancedMetadata)
    }

    return NextResponse.json({ 
      success: true,
      visitorId: finalVisitorId,
      sessionId: sessionId || generateSessionId()
    })

  } catch (error) {
    console.error('Analytics logging error:', error)
    return NextResponse.json(
      { success: false, error: 'Analytics logging failed' },
      { status: 500 }
    )
  }
}

/**
 * Get analytics data for admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    // Basic auth check
    const authHeader = request.headers.get('authorization')
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

    // Beta signup metrics
    const { data: signupStats } = await supabaseAdmin
      .from('beta_signups')
      .select('created_at, team_size, engagement_score, opted_in_marketing')
      .gte('created_at', startDate)

    // Page analytics
    const { data: pageViews } = await supabaseAdmin
      .from('page_analytics')
      .select('page_path, event_type, created_at, metadata')
      .gte('created_at', startDate)

    // Email engagement
    const { data: emailEvents } = await supabaseAdmin
      .from('email_events')
      .select('event_type, template_id, created_at')
      .gte('created_at', startDate)

    // Process and aggregate data
    const analytics = {
      signups: {
        total: signupStats?.length || 0,
        byDay: aggregateByDay(signupStats || [], 'created_at'),
        byTeamSize: aggregateByField(signupStats || [], 'team_size'),
        averageEngagement: calculateAverage(signupStats || [], 'engagement_score'),
        marketingOptInRate: calculateOptInRate(signupStats || [])
      },
      traffic: {
        totalPageViews: pageViews?.length || 0,
        uniqueVisitors: countUniqueVisitors(pageViews || []),
        topPages: aggregateByField(pageViews || [], 'page_path'),
        conversionEvents: pageViews?.filter(p => p.event_type === 'beta_signup').length || 0
      },
      email: {
        totalSent: emailEvents?.filter(e => e.event_type === 'sent').length || 0,
        openRate: calculateEmailRate(emailEvents || [], 'opened', 'sent'),
        clickRate: calculateEmailRate(emailEvents || [], 'clicked', 'sent'),
        byTemplate: aggregateByField(emailEvents || [], 'template_id')
      }
    }

    return NextResponse.json({
      success: true,
      data: analytics
    })

  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

// Helper functions

function hashUserAgent(userAgent: string): string {
  return crypto.createHash('sha256').update(userAgent).digest('hex').substring(0, 16)
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const real = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  if (real) {
    return real.trim()
  }
  return 'unknown'
}

function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16)
}

function generateAnonymousId(ipHash: string, userAgentHash: string): string {
  const combined = `${ipHash}-${userAgentHash}-${Date.now()}`
  return crypto.createHash('sha256').update(combined).digest('hex').substring(0, 32)
}

function generateSessionId(): string {
  return crypto.randomUUID()
}

async function trackConversion(visitorId: string, sessionId: string | null, properties: any) {
  try {
    // Log conversion event with additional metadata
    await supabaseAdmin
      .from('page_analytics')
      .insert({
        page_path: '/conversion',
        visitor_id: visitorId,
        session_id: sessionId,
        event_type: 'conversion_tracked',
        metadata: {
          conversion_type: 'beta_signup',
          conversion_value: 1,
          signup_source: properties.signupSource || 'direct',
          referrer_code: properties.referrerCode || null,
          team_size: properties.teamSize || null,
          timestamp: new Date().toISOString()
        }
      })

    // Update engagement score for converters
    await updateEngagementScore(visitorId, 'conversion', { conversion_value: 10 })
  } catch (error) {
    console.error('Conversion tracking error:', error)
  }
}

async function updateEngagementScore(visitorId: string, eventType: string, metadata: any) {
  try {
    // Calculate engagement points based on event type
    let points = 0
    switch (eventType) {
      case 'page_view':
        points = 1
        break
      case 'scroll_depth':
        points = Math.floor((metadata.scroll_depth || 0) / 25) // 1 point per 25% scroll
        break
      case 'time_on_page':
        points = Math.min(Math.floor((metadata.time_on_page || 0) / 30000), 5) // 1 point per 30s, max 5
        break
      case 'cta_click':
        points = 5
        break
      case 'form_interaction':
        points = 3
        break
      case 'conversion':
        points = metadata.conversion_value || 10
        break
      default:
        points = 1
    }

    // Note: In a real implementation, you'd want to maintain visitor engagement scores
    // in a separate table. For now, we'll just log the engagement event
    await supabaseAdmin
      .from('page_analytics')
      .insert({
        page_path: '/engagement',
        visitor_id: visitorId,
        event_type: 'engagement_score_update',
        metadata: {
          event_type: eventType,
          points_awarded: points,
          timestamp: new Date().toISOString()
        }
      })
  } catch (error) {
    console.error('Engagement score update error:', error)
  }
}

function aggregateByDay(data: any[], dateField: string): Record<string, number> {
  const aggregated: Record<string, number> = {}
  
  data.forEach(item => {
    const date = new Date(item[dateField]).toISOString().split('T')[0]
    aggregated[date] = (aggregated[date] || 0) + 1
  })
  
  return aggregated
}

function aggregateByField(data: any[], field: string): Record<string, number> {
  const aggregated: Record<string, number> = {}
  
  data.forEach(item => {
    const value = item[field] || 'unknown'
    aggregated[value] = (aggregated[value] || 0) + 1
  })
  
  return aggregated
}

function calculateAverage(data: any[], field: string): number {
  if (data.length === 0) return 0
  
  const sum = data.reduce((acc, item) => acc + (item[field] || 0), 0)
  return Math.round((sum / data.length) * 100) / 100
}

function calculateOptInRate(signups: any[]): number {
  if (signups.length === 0) return 0
  
  const optedIn = signups.filter(s => s.opted_in_marketing).length
  return Math.round((optedIn / signups.length) * 100)
}

function countUniqueVisitors(pageViews: any[]): number {
  const uniqueVisitors = new Set()
  pageViews.forEach(view => {
    if (view.metadata?.visitor_id) {
      uniqueVisitors.add(view.metadata.visitor_id)
    }
  })
  return uniqueVisitors.size
}

function calculateEmailRate(events: any[], eventType: string, baseType: string): number {
  const baseEvents = events.filter(e => e.event_type === baseType).length
  const targetEvents = events.filter(e => e.event_type === eventType).length
  
  if (baseEvents === 0) return 0
  return Math.round((targetEvents / baseEvents) * 100)
}
