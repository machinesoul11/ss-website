import { NextRequest, NextResponse } from 'next/server'

interface PublicMetrics {
  total_pageviews: number
  unique_visitors: number
  top_pages: Array<{ path: string; views: number }>
}

/**
 * Public Analytics API
 * Provides basic, non-sensitive analytics data without authentication
 */
export async function GET(request: NextRequest) {
  try {
    const { supabaseAdmin } = await import('@/lib/supabase')
    if (!supabaseAdmin) {
      return NextResponse.json({ 
        error: 'Database connection not available' 
      }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const days = Math.min(parseInt(searchParams.get('days') || '7'), 30) // Max 30 days for public API
    
    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days)

    // Get basic analytics data
    const { data: records, error: fetchError } = await supabaseAdmin
      .from('page_analytics')
      .select('page_path, visitor_id, timestamp')
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString())
      .limit(1000) // Limit results for performance

    if (fetchError) {
      console.error('Error fetching analytics records:', fetchError)
      return NextResponse.json({ 
        error: 'Failed to fetch analytics data' 
      }, { status: 500 })
    }

    if (!records || records.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          total_pageviews: 0,
          unique_visitors: 0,
          top_pages: []
        } as PublicMetrics
      })
    }

    // Calculate basic metrics
    const uniqueVisitors = new Set()
    const pageMap = new Map<string, number>()

    records.forEach((record: any) => {
      // Count unique visitors
      if (record.visitor_id) {
        uniqueVisitors.add(record.visitor_id)
      }

      // Count page views (exclude admin and API paths from public stats)
      if (record.page_path && 
          !record.page_path.startsWith('/admin') && 
          !record.page_path.startsWith('/api')) {
        const count = pageMap.get(record.page_path) || 0
        pageMap.set(record.page_path, count + 1)
      }
    })

    // Get top 5 pages only for public API
    const topPages = Array.from(pageMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([path, views]) => ({ path, views }))

    const metrics: PublicMetrics = {
      total_pageviews: records.filter((r: any) => 
        r.page_path && 
        !r.page_path.startsWith('/admin') && 
        !r.page_path.startsWith('/api')
      ).length,
      unique_visitors: uniqueVisitors.size,
      top_pages: topPages
    }

    return NextResponse.json({
      success: true,
      data: metrics,
      generated_at: new Date().toISOString(),
      period_days: days
    })

  } catch (error) {
    console.error('Public analytics API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
