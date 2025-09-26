import { NextRequest, NextResponse } from 'next/server'
import { RealtimeService } from '@/lib/services/realtime'
import { adminApiMiddleware } from '@/lib/admin-middleware'

/**
 * Live Analytics API for Real-Time Dashboard Updates
 * Provides streaming analytics data for the admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const authResponse = await adminApiMiddleware(request)
    if (authResponse) {
      return authResponse // Return unauthorized response
    }

    // Get live statistics
    const liveStats = await RealtimeService.getLiveStats()
    
    if (liveStats.error) {
      return NextResponse.json({ 
        success: false, 
        error: liveStats.error 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: liveStats.data,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Live analytics error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch live analytics'
    }, { status: 500 })
  }
}

/**
 * Broadcast notification to admin dashboard
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const authResponse = await adminApiMiddleware(request)
    if (authResponse) {
      return authResponse // Return unauthorized response
    }

    const body = await request.json()
    const { type, message, data } = body

    if (!type || !message) {
      return NextResponse.json({ 
        error: 'Missing required fields: type, message' 
      }, { status: 400 })
    }

    const result = await RealtimeService.broadcastNotification(type, message, data)
    
    if (!result.success) {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Notification broadcasted successfully'
    })

  } catch (error) {
    console.error('Broadcast notification error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to broadcast notification'
    }, { status: 500 })
  }
}
