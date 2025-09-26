import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import crypto from 'crypto'

/**
 * Dedicated page view tracking endpoint
 * Handles page views with privacy-compliant visitor identification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      path,
      title,
      referrer,
      visitorId,
      sessionId,
      viewport,
      timestamp
    } = body

    if (!path) {
      return NextResponse.json(
        { success: false, error: 'Path is required' },
        { status: 400 }
      )
    }

    // Privacy-compliant tracking
    const userAgent = request.headers.get('user-agent') || ''
    const userAgentHash = crypto.createHash('sha256').update(userAgent).digest('hex').substring(0, 16)
    
    const clientIp = getClientIP(request)
    const ipHash = crypto.createHash('sha256').update(clientIp).digest('hex').substring(0, 16)
    
    const finalVisitorId = visitorId || generateVisitorId(ipHash, userAgentHash)
    const finalSessionId = sessionId || crypto.randomUUID()

    // Log page view
    const { error } = await supabaseAdmin
      .from('page_analytics')
      .insert({
        page_path: path,
        visitor_id: finalVisitorId,
        session_id: finalSessionId,
        event_type: 'page_view',
        referrer: referrer || request.headers.get('referer'),
        user_agent_hash: userAgentHash,
        metadata: {
          title: title || null,
          viewport: viewport || null,
          load_time: timestamp ? Date.now() - new Date(timestamp).getTime() : null,
          is_bounce: false, // Will be updated by subsequent events
          timestamp: new Date().toISOString()
        }
      })

    if (error) {
      console.error('Page view tracking error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to track page view' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      visitorId: finalVisitorId,
      sessionId: finalSessionId
    })

  } catch (error) {
    console.error('Page view API error:', error)
    return NextResponse.json(
      { success: false, error: 'Page view tracking failed' },
      { status: 500 }
    )
  }
}

/**
 * Get page view statistics for admin dashboard
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
    
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

    let query = supabaseAdmin
      .from('page_analytics')
      .select('page_path, visitor_id, session_id, timestamp, referrer, metadata')
      .eq('event_type', 'page_view')
      .gte('timestamp', startDate)
      .order('timestamp', { ascending: false })

    if (page) {
      query = query.eq('page_path', page)
    }

    const { data: pageViews, error } = await query

    if (error) {
      throw error
    }

    // Calculate statistics
    const stats = {
      totalViews: pageViews?.length || 0,
      uniqueVisitors: new Set(pageViews?.map(pv => pv.visitor_id)).size,
      uniqueSessions: new Set(pageViews?.map(pv => pv.session_id)).size,
      topPages: getTopPages(pageViews || []),
      topReferrers: getTopReferrers(pageViews || []),
      viewsByDay: getViewsByDay(pageViews || []),
      avgViewsPerSession: calculateAvgViewsPerSession(pageViews || [])
    }

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Page view stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch page view statistics' },
      { status: 500 }
    )
  }
}

// Helper functions
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const real = request.headers.get('x-real-ip')
  
  if (forwarded) return forwarded.split(',')[0].trim()
  if (real) return real.trim()
  return 'unknown'
}

function generateVisitorId(ipHash: string, userAgentHash: string): string {
  const combined = `${ipHash}-${userAgentHash}`
  return crypto.createHash('sha256').update(combined).digest('hex').substring(0, 32)
}

function getTopPages(pageViews: any[]): Array<{ page: string; views: number }> {
  const pageCounts: Record<string, number> = {}
  
  pageViews.forEach(pv => {
    pageCounts[pv.page_path] = (pageCounts[pv.page_path] || 0) + 1
  })

  return Object.entries(pageCounts)
    .map(([page, views]) => ({ page, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10)
}

function getTopReferrers(pageViews: any[]): Array<{ referrer: string; views: number }> {
  const referrerCounts: Record<string, number> = {}
  
  pageViews.forEach(pv => {
    const referrer = pv.referrer || 'Direct'
    referrerCounts[referrer] = (referrerCounts[referrer] || 0) + 1
  })

  return Object.entries(referrerCounts)
    .map(([referrer, views]) => ({ referrer, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10)
}

function getViewsByDay(pageViews: any[]): Record<string, number> {
  const viewsByDay: Record<string, number> = {}
  
  pageViews.forEach(pv => {
    const date = new Date(pv.timestamp).toISOString().split('T')[0]
    viewsByDay[date] = (viewsByDay[date] || 0) + 1
  })

  return viewsByDay
}

function calculateAvgViewsPerSession(pageViews: any[]): number {
  const sessionCounts: Record<string, number> = {}
  
  pageViews.forEach(pv => {
    sessionCounts[pv.session_id] = (sessionCounts[pv.session_id] || 0) + 1
  })

  const totalSessions = Object.keys(sessionCounts).length
  if (totalSessions === 0) return 0

  const totalViews = Object.values(sessionCounts).reduce((sum, count) => sum + count, 0)
  return Math.round((totalViews / totalSessions) * 100) / 100
}
