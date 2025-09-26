import { NextRequest, NextResponse } from 'next/server'
import { adminApiMiddleware } from '@/lib/admin-middleware'

interface SimpleMetrics {
  unique_visitors: number
  total_pageviews: number
  top_pages: Array<{ path: string; views: number }>
  recent_activity: Array<{
    page_path: string
    timestamp: string
    visitor_id: string | null
  }>
}

/**
 * Simple Analytics Metrics API
 * Provides basic analytics data from the existing page_analytics table
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const authResponse = await adminApiMiddleware(request)
    if (authResponse) {
      return authResponse
    }

    const { supabaseAdmin } = await import('@/lib/supabase')
    if (!supabaseAdmin) {
      return NextResponse.json(
        {
          error: 'Database connection not available',
        },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days)

    // Get analytics data for the period
    const { data: records, error: fetchError } = await supabaseAdmin
      .from('page_analytics')
      .select('*')
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString())
      .order('timestamp', { ascending: false })

    if (fetchError) {
      console.error('Error fetching analytics records:', fetchError)
      return NextResponse.json(
        {
          error: 'Failed to fetch analytics data',
        },
        { status: 500 }
      )
    }

    if (!records || records.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          unique_visitors: 0,
          total_pageviews: 0,
          top_pages: [],
          recent_activity: [],
        } as SimpleMetrics,
      })
    }

    // Calculate metrics safely with type checking
    const uniqueVisitors = new Set()
    const pageMap = new Map<string, number>()
    const recentActivity: any[] = []

    records.forEach((record: any) => {
      // Count unique visitors
      if (record.visitor_id) {
        uniqueVisitors.add(record.visitor_id)
      }

      // Count page views
      if (record.page_path) {
        const count = pageMap.get(record.page_path) || 0
        pageMap.set(record.page_path, count + 1)
      }

      // Collect recent activity (last 20)
      if (recentActivity.length < 20) {
        recentActivity.push({
          page_path: record.page_path || 'Unknown',
          timestamp: record.timestamp,
          visitor_id: record.visitor_id,
        })
      }
    })

    // Top pages
    const topPages = Array.from(pageMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([path, views]) => ({ path, views }))

    const metrics: SimpleMetrics = {
      unique_visitors: uniqueVisitors.size,
      total_pageviews: records.length,
      top_pages: topPages,
      recent_activity: recentActivity,
    }

    return NextResponse.json({
      success: true,
      data: metrics,
    })
  } catch (error) {
    console.error('Aggregated metrics API error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

/**
 * Store analytics summary
 */
export async function POST(request: NextRequest) {
  try {
    const authResponse = await adminApiMiddleware(request)
    if (authResponse) {
      return authResponse
    }

    const { supabaseAdmin } = await import('@/lib/supabase')
    if (!supabaseAdmin) {
      return NextResponse.json(
        {
          error: 'Database connection not available',
        },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { metrics, dateRange } = body

    // Store summary record
    const record = {
      page_path: '/analytics/summary',
      visitor_id: 'system',
      session_id: `summary-${Date.now()}`,
      event_type: 'analytics_summary',
      timestamp: new Date().toISOString(),
      referrer: null,
      user_agent_hash: null,
      metadata: {
        metrics,
        dateRange,
        generatedAt: new Date().toISOString(),
      },
    }

    const { error: insertError } = await supabaseAdmin
      .from('page_analytics')
      .insert([record])

    if (insertError) {
      console.error('Error storing analytics summary:', insertError)
      return NextResponse.json(
        {
          error: 'Failed to store summary',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Analytics summary stored successfully',
    })
  } catch (error) {
    console.error('Store analytics summary error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
