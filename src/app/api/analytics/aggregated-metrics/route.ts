/**
 * Aggregated Metrics API - Privacy-Compliant Analytics
 * Phase 6: Custom Analytics System
 * 
 * Generates and stores aggregated analytics metrics without personal data
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

interface AggregatedMetrics {
  date: string
  unique_visitors: number
  total_sessions: number
  total_page_views: number
  bounce_rate: number
  avg_session_duration: number
  top_pages: Array<{ page: string; views: number }>
  referrer_breakdown: Array<{ referrer: string; count: number }>
  utm_performance: Array<{ campaign: string; visitors: number; conversions: number }>
  device_breakdown: Array<{ resolution: string; count: number }>
  timezone_distribution: Array<{ timezone: string; count: number }>
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      dateRange = '7d',
      generateNew = false 
    } = body

    const endDate = new Date()
    const startDate = new Date()
    
    switch (dateRange) {
      case '1d':
        startDate.setDate(endDate.getDate() - 1)
        break
      case '7d':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(endDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(endDate.getDate() - 90)
        break
      default:
        startDate.setDate(endDate.getDate() - 7)
    }

    // Generate aggregated metrics
    const metrics = await generateAggregatedMetrics(startDate, endDate)
    
    // Store metrics if requested
    if (generateNew) {
      await storeAggregatedMetrics(metrics, dateRange)
    }

    return NextResponse.json({
      success: true,
      data: metrics,
      generatedAt: new Date().toISOString(),
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        range: dateRange
      }
    })

  } catch (error) {
    console.error('Aggregated metrics generation error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate aggregated metrics',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateRange = searchParams.get('range') || '7d'
    const metric = searchParams.get('metric') // specific metric to query
    const live = searchParams.get('live') === 'true' // generate live metrics

    if (live) {
      // Generate live metrics
      const endDate = new Date()
      const startDate = new Date()
      
      switch (dateRange) {
        case '1d':
          startDate.setDate(endDate.getDate() - 1)
          break
        case '7d':
          startDate.setDate(endDate.getDate() - 7)
          break
        case '30d':
          startDate.setDate(endDate.getDate() - 30)
          break
        case '90d':
          startDate.setDate(endDate.getDate() - 90)
          break
        default:
          startDate.setDate(endDate.getDate() - 7)
      }

      const metrics = await generateAggregatedMetrics(startDate, endDate)
      
      return NextResponse.json({
        success: true,
        data: metrics,
        isLive: true,
        generatedAt: new Date().toISOString()
      })
    }

    // Get stored aggregated metrics
    const storedMetrics = await getStoredMetrics(dateRange, metric)

    return NextResponse.json({
      success: true,
      data: storedMetrics,
      isLive: false
    })

  } catch (error) {
    console.error('Get aggregated metrics error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get aggregated metrics',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

/**
 * Generate aggregated metrics from page_analytics data
 */
async function generateAggregatedMetrics(
  startDate: Date,
  endDate: Date
): Promise<AggregatedMetrics> {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not available')
  }

  try {
    // Get all analytics records for the period
    const { data: records, error: fetchError } = await supabaseAdmin!
      .from('page_analytics')
      .select('*')
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString())
      .order('timestamp', { ascending: true })

    if (fetchError) {
      console.error('Error fetching analytics records:', fetchError)
      throw fetchError
    }

    if (!records || records.length === 0) {
      return {
        date: new Date().toISOString().split('T')[0],
        unique_visitors: 0,
        total_sessions: 0,
        total_page_views: 0,
        bounce_rate: 0,
        avg_session_duration: 0,
        top_pages: [],
        referrer_breakdown: [],
        utm_performance: [],
        device_breakdown: [],
        timezone_distribution: []
      }
    }

    // Calculate unique visitors (unique visitor_id values)
    const uniqueVisitors = new Set(records.map((r: any) => r.visitor_id).filter(Boolean))
    
    // Calculate sessions using visitor + date combination as proxy
    const sessionKeys = new Set(
      records
        .filter((r: any) => r.visitor_id)
        .map((r: any) => `${r.visitor_id}-${new Date(r.timestamp).toDateString()}`)
    )
    const uniqueSessions = sessionKeys.size
    
    // All records in page_analytics are page views
    const pageViews = records
    
    // Calculate top pages
    const pageMap = new Map<string, number>()
    pageViews.forEach(record => {
      const count = pageMap.get(record.page_path) || 0
      pageMap.set(record.page_path, count + 1)
    })
    
    const topPages = Array.from(pageMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([page, views]) => ({ page, views }))

    // Calculate referrer breakdown
    const referrerMap = new Map<string, number>()
    records.forEach(record => {
      if (record.referrer) {
        try {
          const domain = new URL(record.referrer).hostname || 'direct'
          const count = referrerMap.get(domain) || 0
          referrerMap.set(domain, count + 1)
        } catch {
          const count = referrerMap.get('direct') || 0
          referrerMap.set('direct', count + 1)
        }
      } else {
        const count = referrerMap.get('direct') || 0
        referrerMap.set('direct', count + 1)
      }
    })
    
    const referrerBreakdown = Array.from(referrerMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([referrer, count]) => ({ referrer, count }))

    // Calculate UTM performance
    const utmMap = new Map<string, { visitors: Set<string>, conversions: number }>()
    records.forEach(record => {
      const metadata = record.metadata as any
      if (metadata?.utmParams?.utm_campaign) {
        const campaign = metadata.utmParams.utm_campaign
        if (!utmMap.has(campaign)) {
          utmMap.set(campaign, { visitors: new Set(), conversions: 0 })
        }
        if (record.visitor_id) {
          utmMap.get(campaign)?.visitors.add(record.visitor_id)
        }
        if (record.event_type === 'conversion' || record.event_type === 'beta_signup') {
          const utm = utmMap.get(campaign)
          if (utm) utm.conversions++
        }
      }
    })
    
    const utmPerformance = Array.from(utmMap.entries())
      .map(([campaign, data]) => ({
        campaign,
        visitors: data.visitors.size,
        conversions: data.conversions
      }))

    // Calculate device breakdown (screen resolution)
    const deviceMap = new Map<string, number>()
    records.forEach(record => {
      const metadata = record.metadata as any
      const resolution = metadata?.screenResolution || 'unknown'
      const count = deviceMap.get(resolution) || 0
      deviceMap.set(resolution, count + 1)
    })
    
    const deviceBreakdown = Array.from(deviceMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([resolution, count]) => ({ resolution, count }))

    // Calculate timezone distribution
    const timezoneMap = new Map<string, number>()
    records.forEach(record => {
      const metadata = record.metadata as any
      const timezone = metadata?.timezone ? `GMT${metadata.timezone > 0 ? '+' : ''}${metadata.timezone}` : 'unknown'
      const count = timezoneMap.get(timezone) || 0
      timezoneMap.set(timezone, count + 1)
    })
    
    const timezoneDistribution = Array.from(timezoneMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([timezone, count]) => ({ timezone, count }))

    // Calculate session durations and bounce rate
    const sessionMap = new Map<string, { start: Date, end: Date, pageViews: number }>()
    records.forEach(record => {
      if (record.session_id) {
        const timestamp = new Date(record.timestamp)
        if (!sessionMap.has(record.session_id)) {
          sessionMap.set(record.session_id, {
            start: timestamp,
            end: timestamp,
            pageViews: 0
          })
        }
        const session = sessionMap.get(record.session_id)!
        if (timestamp < session.start) session.start = timestamp
        if (timestamp > session.end) session.end = timestamp
        if (record.event_type === 'page_view' || record.event_type === 'visitor_session') {
          session.pageViews++
        }
      }
    })

    const sessions = Array.from(sessionMap.values())
    const bouncedSessions = sessions.filter(s => s.pageViews <= 1)
    const bounceRate = sessions.length > 0 ? (bouncedSessions.length / sessions.length) * 100 : 0
    
    const totalSessionTime = sessions.reduce((sum, session) => {
      return sum + (session.end.getTime() - session.start.getTime())
    }, 0)
    const avgSessionDuration = sessions.length > 0 ? totalSessionTime / sessions.length : 0

    return {
      date: new Date().toISOString().split('T')[0],
      unique_visitors: uniqueVisitors.size,
      total_sessions: uniqueSessions.size,
      total_page_views: pageViews.length,
      bounce_rate: Math.round(bounceRate * 100) / 100,
      avg_session_duration: Math.round(avgSessionDuration),
      top_pages: topPages,
      referrer_breakdown: referrerBreakdown,
      utm_performance: utmPerformance,
      device_breakdown: deviceBreakdown,
      timezone_distribution: timezoneDistribution
    }

  } catch (error) {
    console.error('Error generating aggregated metrics:', error)
    throw error
  }
}

/**
 * Store aggregated metrics in database
 */
async function storeAggregatedMetrics(
  metrics: AggregatedMetrics,
  dateRange: string
): Promise<void> {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not available')
  }

  try {
    // Store as a special record in page_analytics with event_type 'aggregated_metrics'
    const record = {
      page_path: '/analytics/aggregated',
      visitor_id: `system_${dateRange}`,
      session_id: `aggregation_${Date.now()}`,
      event_type: 'aggregated_metrics',
      timestamp: new Date().toISOString(),
      referrer: null,
      user_agent_hash: null,
      metadata: {
        metrics,
        dateRange,
        generatedAt: new Date().toISOString()
      }
    }

    await supabaseAdmin
      .from('page_analytics')
      .insert([record])

  } catch (error) {
    console.error('Error storing aggregated metrics:', error)
    throw error
  }
}

/**
 * Get stored aggregated metrics
 */
async function getStoredMetrics(
  dateRange: string,
  specificMetric?: string | null
): Promise<any> {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not available')
  }

  try {
    const { data: records } = await supabaseAdmin
      .from('page_analytics')
      .select('*')
      .eq('event_type', 'aggregated_metrics')
      .like('visitor_id', `system_${dateRange}%`)
      .order('timestamp', { ascending: false })
      .limit(10)

    if (!records || records.length === 0) {
      return null
    }

    const latestRecord = records[0]
    const metrics = (latestRecord.metadata as any)?.metrics

    if (specificMetric && metrics) {
      return metrics[specificMetric] || null
    }

    return metrics

  } catch (error) {
    console.error('Error getting stored metrics:', error)
    throw error
  }
}
