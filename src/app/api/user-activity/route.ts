import { NextRequest, NextResponse } from 'next/server'
import { RealtimeService } from '@/lib/services/realtime'
import { adminApiMiddleware } from '@/lib/admin-middleware'

/**
 * User Activity Monitoring API
 * Tracks and provides real-time user activity for specific users
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const authResponse = await adminApiMiddleware(request)
    if (authResponse) {
      return authResponse // Return unauthorized response
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'Missing userId parameter' 
      }, { status: 400 })
    }

    // Get user activity from the last 24 hours
    const { supabaseAdmin } = await import('@/lib/supabase')
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const [user, emailEvents, feedback, analytics] = await Promise.all([
      supabaseAdmin
        .from('beta_signups')
        .select('*')
        .eq('id', userId)
        .single(),
      
      supabaseAdmin
        .from('email_events')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', yesterday.toISOString())
        .order('timestamp', { ascending: false })
        .limit(50),
      
      supabaseAdmin
        .from('feedback_submissions')
        .select('*')
        .eq('user_id', userId)
        .gte('submitted_at', yesterday.toISOString())
        .order('submitted_at', { ascending: false }),
      
      supabaseAdmin
        .from('page_analytics')
        .select('*')
        .eq('visitor_id', userId)
        .gte('timestamp', yesterday.toISOString())
        .order('timestamp', { ascending: false })
        .limit(100)
    ])

    if (user.error) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 })
    }

    // Combine activity timeline
    const activity = [
      ...(emailEvents.data?.map(e => ({
        type: 'email_event' as const,
        timestamp: e.timestamp,
        details: `${e.email_type} email ${e.event_type}`,
        metadata: e.metadata
      })) || []),
      
      ...(feedback.data?.map(f => ({
        type: 'feedback' as const,
        timestamp: f.submitted_at,
        details: `${f.feedback_type} feedback submitted`,
        metadata: { rating: f.rating, type: f.feedback_type }
      })) || []),
      
      ...(analytics.data?.map(a => ({
        type: 'page_view' as const,
        timestamp: a.timestamp,
        details: `Visited ${a.page_path}`,
        metadata: { page: a.page_path, duration: a.session_duration }
      })) || [])
    ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Calculate engagement metrics
    const emailOpens = emailEvents.data?.filter(e => e.event_type === 'opened').length || 0
    const emailClicks = emailEvents.data?.filter(e => e.event_type === 'clicked').length || 0
    const pageViews = analytics.data?.length || 0
    const avgSessionTime = analytics.data?.reduce((sum, a) => sum + (a.session_duration || 0), 0) / Math.max(pageViews, 1)

    return NextResponse.json({
      success: true,
      data: {
        user: user.data,
        activity,
        metrics: {
          emailOpens,
          emailClicks,
          pageViews,
          feedbackSubmissions: feedback.data?.length || 0,
          avgSessionTime: Math.round(avgSessionTime || 0),
          engagementScore: user.data.engagement_score,
          lastActive: activity[0]?.timestamp || user.data.created_at
        },
        summary: {
          totalEvents: activity.length,
          last24Hours: activity.length,
          mostRecentActivity: activity[0]?.details || 'No recent activity'
        }
      }
    })

  } catch (error) {
    console.error('User activity monitoring error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch user activity'
    }, { status: 500 })
  }
}

/**
 * Start real-time monitoring for a specific user
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const authResponse = await adminApiMiddleware(request)
    if (authResponse) {
      return authResponse // Return unauthorized response
    }

    const body = await request.json()
    const { userId, action } = body

    if (!userId) {
      return NextResponse.json({ 
        error: 'Missing userId' 
      }, { status: 400 })
    }

    if (action === 'start_monitoring') {
      // In a real implementation, you would store this monitoring request
      // and set up WebSocket connections or server-sent events
      
      // For now, broadcast that monitoring has started
      await RealtimeService.broadcastNotification(
        'info',
        `Started monitoring user activity for ${userId}`,
        { userId, action, timestamp: new Date().toISOString() }
      )

      return NextResponse.json({
        success: true,
        message: 'Real-time monitoring started',
        monitoringId: `monitor-${userId}-${Date.now()}`
      })
    }

    if (action === 'stop_monitoring') {
      await RealtimeService.broadcastNotification(
        'info',
        `Stopped monitoring user activity for ${userId}`,
        { userId, action, timestamp: new Date().toISOString() }
      )

      return NextResponse.json({
        success: true,
        message: 'Real-time monitoring stopped'
      })
    }

    return NextResponse.json({ 
      error: 'Invalid action. Use "start_monitoring" or "stop_monitoring"' 
    }, { status: 400 })

  } catch (error) {
    console.error('User activity monitoring setup error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to setup user activity monitoring'
    }, { status: 500 })
  }
}
