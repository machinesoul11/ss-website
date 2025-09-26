import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import crypto from 'crypto'

/**
 * User engagement tracking endpoint
 * Tracks interactions, scroll depth, time on page, and calculates engagement scores
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      visitorId,
      sessionId,
      eventType,
      pagePath,
      scrollDepth,
      timeOnPage,
      clickTarget,
      formField,
      ctaPosition,
      mouseMovements,
      keystrokes,
      metadata = {},
    } = body

    if (!visitorId || !eventType) {
      return NextResponse.json(
        { success: false, error: 'visitorId and eventType are required' },
        { status: 400 }
      )
    }

    // Calculate engagement score for this interaction
    const engagementScore = calculateInteractionScore(eventType, {
      scrollDepth,
      timeOnPage,
      clickTarget,
      formField,
      mouseMovements,
      keystrokes,
    })

    // Enhanced engagement metadata
    const engagementMetadata = {
      ...metadata,
      scroll_depth: scrollDepth,
      time_on_page: timeOnPage,
      click_target: clickTarget,
      form_field: formField,
      cta_position: ctaPosition,
      mouse_movements: mouseMovements,
      keystroke_count: keystrokes,
      engagement_score: engagementScore,
      interaction_quality: getInteractionQuality(engagementScore),
      timestamp: new Date().toISOString(),
    }

    // Log engagement event
    const { error } = await supabaseAdmin.from('page_analytics').insert({
      page_path: pagePath || '/',
      visitor_id: visitorId,
      session_id: sessionId,
      event_type: eventType,
      user_agent_hash: crypto
        .createHash('sha256')
        .update(request.headers.get('user-agent') || '')
        .digest('hex')
        .substring(0, 16),
      metadata: engagementMetadata,
    })

    if (error) {
      throw error
    }

    // Update cumulative engagement score
    await updateCumulativeEngagement(visitorId, sessionId, engagementScore)

    return NextResponse.json({
      success: true,
      engagementScore,
      message: 'Engagement tracked successfully',
    })
  } catch (error) {
    console.error('Engagement tracking error:', error)
    return NextResponse.json(
      { success: false, error: 'Engagement tracking failed' },
      { status: 500 }
    )
  }
}

/**
 * Get engagement analytics for admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')
    const page = searchParams.get('page')

    const startDate = new Date(
      Date.now() - days * 24 * 60 * 60 * 1000
    ).toISOString()

    // Get engagement events
    let query = supabaseAdmin
      .from('page_analytics')
      .select(
        'visitor_id, session_id, event_type, page_path, timestamp, metadata'
      )
      .in('event_type', [
        'scroll_depth',
        'time_on_page',
        'cta_click',
        'form_interaction',
        'mouse_movement',
        'keystroke',
        'engagement_score',
      ])
      .gte('timestamp', startDate)

    if (page) {
      query = query.eq('page_path', page)
    }

    const { data: engagementEvents, error } = await query

    if (error) throw error

    // Calculate engagement metrics
    const engagementStats = {
      totalEngagementEvents: engagementEvents?.length || 0,
      uniqueEngagedVisitors: getUniqueEngagedVisitors(engagementEvents || []),
      averageEngagementScore: getAverageEngagementScore(engagementEvents || []),
      engagementByPage: getEngagementByPage(engagementEvents || []),
      engagementDistribution: getEngagementDistribution(engagementEvents || []),
      topEngagementEvents: getTopEngagementEvents(engagementEvents || []),
      engagementTrend: getEngagementTrend(engagementEvents || []),
      bounceRate: await calculateBounceRate(startDate),
      averageTimeOnSite: getAverageTimeOnSite(engagementEvents || []),
      ctaEffectiveness: getCTAEffectiveness(engagementEvents || []),
    }

    return NextResponse.json({
      success: true,
      data: engagementStats,
    })
  } catch (error) {
    console.error('Engagement analytics error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch engagement analytics' },
      { status: 500 }
    )
  }
}

// Helper functions
function calculateInteractionScore(eventType: string, data: any): number {
  let score = 0

  switch (eventType) {
    case 'scroll_depth':
      score = Math.min(Math.floor((data.scrollDepth || 0) / 10), 10) // Max 10 points
      break
    case 'time_on_page':
      score = Math.min(Math.floor((data.timeOnPage || 0) / 15000), 20) // 1 point per 15s, max 20
      break
    case 'cta_click':
      score = 15
      if (data.ctaPosition === 'hero') score += 5
      if (data.ctaPosition === 'footer') score += 2
      break
    case 'form_interaction':
      score = 8
      if (data.formField === 'email') score += 4
      if (data.formField === 'submit') score += 8
      break
    case 'mouse_movement':
      score = Math.min(Math.floor((data.mouseMovements || 0) / 100), 5) // Max 5 points
      break
    case 'keystroke':
      score = Math.min(Math.floor((data.keystrokes || 0) / 10), 8) // Max 8 points
      break
    default:
      score = 1
  }

  return Math.max(0, score)
}

function getInteractionQuality(score: number): string {
  if (score >= 25) return 'high'
  if (score >= 10) return 'medium'
  if (score >= 5) return 'low'
  return 'minimal'
}

async function updateCumulativeEngagement(
  visitorId: string,
  sessionId: string | null,
  score: number
) {
  try {
    // Get existing cumulative score
    const { data: existingScore } = await supabaseAdmin
      .from('page_analytics')
      .select('metadata')
      .eq('visitor_id', visitorId)
      .eq('event_type', 'cumulative_engagement')
      .order('timestamp', { ascending: false })
      .limit(1)

    const currentScore = existingScore?.[0]?.metadata?.total_score || 0
    const newScore = currentScore + score

    // Update cumulative engagement
    await supabaseAdmin.from('page_analytics').insert({
      page_path: '/engagement/cumulative',
      visitor_id: visitorId,
      session_id: sessionId,
      event_type: 'cumulative_engagement',
      metadata: {
        total_score: newScore,
        score_increment: score,
        engagement_level: getEngagementLevel(newScore),
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Cumulative engagement update error:', error)
  }
}

function getEngagementLevel(score: number): string {
  if (score >= 100) return 'very_high'
  if (score >= 50) return 'high'
  if (score >= 25) return 'medium'
  if (score >= 10) return 'low'
  return 'minimal'
}

function getUniqueEngagedVisitors(events: any[]): number {
  return new Set(events.map((e) => e.visitor_id)).size
}

function getAverageEngagementScore(events: any[]): number {
  const scoreEvents = events.filter((e) => e.metadata?.engagement_score)
  if (scoreEvents.length === 0) return 0

  const totalScore = scoreEvents.reduce(
    (sum, e) => sum + (e.metadata.engagement_score || 0),
    0
  )
  return Math.round((totalScore / scoreEvents.length) * 100) / 100
}

function getEngagementByPage(
  events: any[]
): Record<string, { events: number; avgScore: number }> {
  const pageStats: Record<
    string,
    { total: number; count: number; scores: number[] }
  > = {}

  events.forEach((e) => {
    const page = e.page_path
    if (!pageStats[page]) {
      pageStats[page] = { total: 0, count: 0, scores: [] }
    }
    pageStats[page].count++
    if (e.metadata?.engagement_score) {
      pageStats[page].scores.push(e.metadata.engagement_score)
    }
  })

  const result: Record<string, { events: number; avgScore: number }> = {}
  Object.entries(pageStats).forEach(([page, stats]) => {
    result[page] = {
      events: stats.count,
      avgScore:
        stats.scores.length > 0
          ? Math.round(
              (stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length) *
                100
            ) / 100
          : 0,
    }
  })

  return result
}

function getEngagementDistribution(events: any[]): Record<string, number> {
  const distribution = { minimal: 0, low: 0, medium: 0, high: 0 }

  events.forEach((e) => {
    const quality = e.metadata?.interaction_quality
    if (quality && quality in distribution) {
      distribution[quality as keyof typeof distribution]++
    }
  })

  return distribution
}

function getTopEngagementEvents(
  events: any[]
): Array<{ eventType: string; count: number; avgScore: number }> {
  const eventStats: Record<string, { count: number; scores: number[] }> = {}

  events.forEach((e) => {
    if (!eventStats[e.event_type]) {
      eventStats[e.event_type] = { count: 0, scores: [] }
    }
    eventStats[e.event_type].count++
    if (e.metadata?.engagement_score) {
      eventStats[e.event_type].scores.push(e.metadata.engagement_score)
    }
  })

  return Object.entries(eventStats)
    .map(([eventType, stats]) => ({
      eventType,
      count: stats.count,
      avgScore:
        stats.scores.length > 0
          ? Math.round(
              (stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length) *
                100
            ) / 100
          : 0,
    }))
    .sort((a, b) => b.avgScore - a.avgScore)
}

function getEngagementTrend(events: any[]): Record<string, number> {
  const trendData: Record<string, number> = {}

  events.forEach((e) => {
    const date = new Date(e.timestamp).toISOString().split('T')[0]
    const score = e.metadata?.engagement_score || 0
    trendData[date] = (trendData[date] || 0) + score
  })

  return trendData
}

async function calculateBounceRate(startDate: string): Promise<number> {
  try {
    const { data: sessions } = await supabaseAdmin
      .from('page_analytics')
      .select('session_id')
      .eq('event_type', 'page_view')
      .gte('timestamp', startDate)

    if (!sessions) return 0

    const sessionCounts: Record<string, number> = {}
    sessions.forEach((s) => {
      sessionCounts[s.session_id] = (sessionCounts[s.session_id] || 0) + 1
    })

    const totalSessions = Object.keys(sessionCounts).length
    const bounceSessions = Object.values(sessionCounts).filter(
      (count) => count === 1
    ).length

    return totalSessions > 0
      ? Math.round((bounceSessions / totalSessions) * 100)
      : 0
  } catch (error) {
    console.error('Bounce rate calculation error:', error)
    return 0
  }
}

function getAverageTimeOnSite(events: any[]): number {
  const timeEvents = events.filter((e) => e.metadata?.time_on_page)
  if (timeEvents.length === 0) return 0

  const totalTime = timeEvents.reduce(
    (sum, e) => sum + (e.metadata.time_on_page || 0),
    0
  )
  return Math.round(totalTime / timeEvents.length / 1000) // Convert to seconds
}

function getCTAEffectiveness(
  events: any[]
): Record<string, { clicks: number; impressions: number; ctr: number }> {
  const ctaStats: Record<string, { clicks: number; impressions: number }> = {}

  events.forEach((e) => {
    if (e.event_type === 'cta_click' && e.metadata?.cta_position) {
      const position = e.metadata.cta_position
      if (!ctaStats[position])
        ctaStats[position] = { clicks: 0, impressions: 0 }
      ctaStats[position].clicks++
    }
    // Note: We'd need separate impression tracking for accurate CTR
    if (e.event_type === 'cta_view' && e.metadata?.cta_position) {
      const position = e.metadata.cta_position
      if (!ctaStats[position])
        ctaStats[position] = { clicks: 0, impressions: 0 }
      ctaStats[position].impressions++
    }
  })

  const result: Record<
    string,
    { clicks: number; impressions: number; ctr: number }
  > = {}
  Object.entries(ctaStats).forEach(([position, stats]) => {
    result[position] = {
      clicks: stats.clicks,
      impressions: stats.impressions,
      ctr:
        stats.impressions > 0
          ? Math.round((stats.clicks / stats.impressions) * 100)
          : 0,
    }
  })

  return result
}
