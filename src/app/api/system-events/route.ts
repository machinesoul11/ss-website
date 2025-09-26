import { NextRequest, NextResponse } from 'next/server'
import { RealtimeService } from '@/lib/services/realtime'

/**
 * System Events Webhook Handler
 * Receives system events from external services and broadcasts real-time notifications
 * This demonstrates how external services can trigger real-time updates in the admin dashboard
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature (simplified - in production, verify with proper HMAC)
    const signature = request.headers.get('x-webhook-signature')
    const expectedSignature = process.env.WEBHOOK_SECRET
    
    if (!signature || signature !== expectedSignature) {
      console.warn('Invalid webhook signature received')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = await request.json()
    const { type, source, data, timestamp } = event

    console.log('System event received:', { type, source, timestamp })

    // Handle different types of system events
    switch (type) {
      case 'database.slow_query':
        await RealtimeService.broadcastNotification(
          'warning',
          `Slow database query detected (${data.duration}ms)`,
          { source, query: data.query, duration: data.duration }
        )
        break

      case 'email.delivery_failure':
        await RealtimeService.broadcastNotification(
          'error',
          `Email delivery failed: ${data.error}`,
          { source, recipient: data.recipient, error: data.error }
        )
        break

      case 'email.high_bounce_rate':
        await RealtimeService.broadcastNotification(
          'warning',
          `High email bounce rate detected: ${data.bounceRate}%`,
          { source, bounceRate: data.bounceRate, campaign: data.campaign }
        )
        break

      case 'signup.milestone':
        await RealtimeService.broadcastNotification(
          'success',
          `🎉 Milestone reached: ${data.count} total signups!`,
          { source, milestone: data.count, growth: data.growth }
        )
        break

      case 'system.high_load':
        await RealtimeService.broadcastNotification(
          'warning',
          `High system load detected: ${data.cpuUsage}% CPU`,
          { source, cpuUsage: data.cpuUsage, memoryUsage: data.memoryUsage }
        )
        break

      case 'security.suspicious_activity':
        await RealtimeService.broadcastNotification(
          'error',
          `🚨 Security Alert: ${data.description}`,
          { source, ip: data.ip, userAgent: data.userAgent, description: data.description }
        )
        break

      case 'api.rate_limit_exceeded':
        await RealtimeService.broadcastNotification(
          'warning',
          `API rate limit exceeded from ${data.ip}`,
          { source, ip: data.ip, endpoint: data.endpoint, requestCount: data.requestCount }
        )
        break

      case 'feedback.negative_sentiment':
        await RealtimeService.broadcastNotification(
          'info',
          `Negative feedback received (rating: ${data.rating}/5)`,
          { source, rating: data.rating, feedback: data.feedback, userId: data.userId }
        )
        break

      case 'conversion.drop':
        await RealtimeService.broadcastNotification(
          'warning',
          `Conversion rate drop detected: ${data.currentRate}% (was ${data.previousRate}%)`,
          { source, currentRate: data.currentRate, previousRate: data.previousRate }
        )
        break

      case 'system.backup_completed':
        await RealtimeService.broadcastNotification(
          'success',
          `✅ System backup completed successfully`,
          { source, backupSize: data.size, duration: data.duration }
        )
        break

      default:
        console.warn('Unknown event type received:', type)
        await RealtimeService.broadcastNotification(
          'info',
          `Unknown system event: ${type} from ${source}`,
          { source, type, data }
        )
    }

    return NextResponse.json({
      success: true,
      message: 'Event processed successfully',
      eventType: type,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Webhook processing error:', error)
    
    // Broadcast error notification
    try {
      await RealtimeService.broadcastNotification(
        'error',
        'Webhook processing failed - check system logs',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      )
    } catch (broadcastError) {
      console.error('Failed to broadcast webhook error notification:', broadcastError)
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to process webhook event'
    }, { status: 500 })
  }
}

/**
 * Get webhook configuration and status
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return webhook configuration info
    return NextResponse.json({
      success: true,
      webhook: {
        endpoint: '/api/system-events',
        methods: ['POST'],
        authentication: 'x-webhook-signature header required',
        supportedEvents: [
          'database.slow_query',
          'email.delivery_failure',
          'email.high_bounce_rate',
          'signup.milestone',
          'system.high_load',
          'security.suspicious_activity',
          'api.rate_limit_exceeded',
          'feedback.negative_sentiment',
          'conversion.drop',
          'system.backup_completed'
        ],
        status: 'active',
        lastReceived: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Webhook status error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to get webhook status'
    }, { status: 500 })
  }
}
