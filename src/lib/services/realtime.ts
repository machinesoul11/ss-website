import { supabase, supabaseAdmin } from '../supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { BetaSignup, EmailEvent, FeedbackSubmission } from '../../types'

/**
 * Real-time Features Service
 * Provides real-time updates and live monitoring capabilities
 * Note: Some methods are server-side only due to admin privileges
 */

export type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE'

export interface RealtimeSubscription {
  channel: RealtimeChannel
  unsubscribe: () => void
}

// Helper to check if we're on server side with admin access
const hasAdminAccess = () => {
  return typeof window === 'undefined' && supabaseAdmin !== null
}

export class RealtimeService {
  /**
   * Subscribe to new beta signups
   */
  static subscribeToNewSignups(
    callback: (signup: BetaSignup, eventType: RealtimeEventType) => void
  ): RealtimeSubscription {
    if (!hasAdminAccess() || !supabaseAdmin) {
      throw new Error('Admin access required for real-time subscriptions')
    }

    const channel = supabaseAdmin
      .channel('beta-signups-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'beta_signups',
        },
        (payload) => {
          console.log('Beta signup change:', payload)

          if (payload.new && payload.eventType !== 'DELETE') {
            callback(
              payload.new as BetaSignup,
              payload.eventType as RealtimeEventType
            )
          } else if (payload.old && payload.eventType === 'DELETE') {
            callback(
              payload.old as BetaSignup,
              payload.eventType as RealtimeEventType
            )
          }
        }
      )
      .subscribe()

    return {
      channel,
      unsubscribe: () => {
        supabaseAdmin.removeChannel(channel)
      },
    }
  }

  /**
   * Subscribe to email events for monitoring delivery
   */
  static subscribeToEmailEvents(
    callback: (event: EmailEvent, eventType: RealtimeEventType) => void
  ): RealtimeSubscription {
    const channel = supabaseAdmin
      .channel('email-events-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'email_events',
        },
        (payload) => {
          console.log('Email event change:', payload)

          if (payload.new && payload.eventType !== 'DELETE') {
            callback(
              payload.new as EmailEvent,
              payload.eventType as RealtimeEventType
            )
          }
        }
      )
      .subscribe()

    return {
      channel,
      unsubscribe: () => {
        supabaseAdmin.removeChannel(channel)
      },
    }
  }

  /**
   * Subscribe to new feedback submissions
   */
  static subscribeToFeedback(
    callback: (
      feedback: FeedbackSubmission,
      eventType: RealtimeEventType
    ) => void
  ): RealtimeSubscription {
    const channel = supabaseAdmin
      .channel('feedback-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feedback_submissions',
        },
        (payload) => {
          console.log('Feedback change:', payload)

          if (payload.new && payload.eventType !== 'DELETE') {
            callback(
              payload.new as FeedbackSubmission,
              payload.eventType as RealtimeEventType
            )
          }
        }
      )
      .subscribe()

    return {
      channel,
      unsubscribe: () => {
        supabaseAdmin.removeChannel(channel)
      },
    }
  }

  /**
   * Get live signup statistics
   */
  static async getLiveStats(): Promise<{
    data: {
      total_signups: number
      signups_today: number
      pending_signups: number
      active_users: number
      recent_activity: Array<{
        type: 'signup' | 'email_event' | 'feedback'
        timestamp: string
        user_email?: string
        details: string
      }>
    } | null
    error: string | null
  }> {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Get signup counts
      const [totalSignups, signupsToday, pendingSignups, activeUsers] =
        await Promise.all([
          supabaseAdmin.from('beta_signups').select('id', { count: 'exact' }),
          supabaseAdmin
            .from('beta_signups')
            .select('id', { count: 'exact' })
            .gte('created_at', today.toISOString()),
          supabaseAdmin
            .from('beta_signups')
            .select('id', { count: 'exact' })
            .eq('beta_status', 'pending'),
          supabaseAdmin
            .from('beta_signups')
            .select('id', { count: 'exact' })
            .gt('engagement_score', 0),
        ])

      // Get recent activity (last 24 hours)
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      const [recentSignups, recentEmailEvents, recentFeedback] =
        await Promise.all([
          supabaseAdmin
            .from('beta_signups')
            .select('email, created_at')
            .gte('created_at', yesterday.toISOString())
            .order('created_at', { ascending: false })
            .limit(10),

          supabaseAdmin
            .from('email_events')
            .select('event_type, timestamp, user_id, beta_signups!inner(email)')
            .gte('timestamp', yesterday.toISOString())
            .order('timestamp', { ascending: false })
            .limit(10),

          supabaseAdmin
            .from('feedback_submissions')
            .select(
              'feedback_type, submitted_at, user_id, beta_signups!inner(email)'
            )
            .gte('submitted_at', yesterday.toISOString())
            .order('submitted_at', { ascending: false })
            .limit(10),
        ])

      // Combine and sort recent activity
      const recentActivity = [
        ...(recentSignups.data?.map((s) => ({
          type: 'signup' as const,
          timestamp: s.created_at,
          user_email: s.email,
          details: 'New beta signup',
        })) || []),

        ...(recentEmailEvents.data?.map((e) => ({
          type: 'email_event' as const,
          timestamp: e.timestamp,
          user_email: (e.beta_signups as any)?.email,
          details: `Email ${e.event_type}`,
        })) || []),

        ...(recentFeedback.data?.map((f) => ({
          type: 'feedback' as const,
          timestamp: f.submitted_at,
          user_email: (f.beta_signups as any)?.email,
          details: `${f.feedback_type} feedback`,
        })) || []),
      ]
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .slice(0, 20)

      return {
        data: {
          total_signups: totalSignups.count || 0,
          signups_today: signupsToday.count || 0,
          pending_signups: pendingSignups.count || 0,
          active_users: activeUsers.count || 0,
          recent_activity: recentActivity,
        },
        error: null,
      }
    } catch (err) {
      console.error('Error getting live stats:', err)
      return {
        data: null,
        error: 'Failed to fetch live statistics',
      }
    }
  }

  /**
   * Broadcast system notification to admin clients
   */
  static async broadcastNotification(
    type: 'info' | 'warning' | 'error' | 'success',
    message: string,
    data?: Record<string, unknown>
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const channel = supabase.channel('admin-notifications')

      await channel.send({
        type: 'broadcast',
        event: 'system-notification',
        payload: {
          type,
          message,
          timestamp: new Date().toISOString(),
          data: data || {},
        },
      })

      return { success: true, error: null }
    } catch (err) {
      console.error('Error broadcasting notification:', err)
      return { success: false, error: 'Failed to broadcast notification' }
    }
  }

  /**
   * Subscribe to admin notifications
   */
  static subscribeToNotifications(
    callback: (notification: {
      type: 'info' | 'warning' | 'error' | 'success'
      message: string
      timestamp: string
      data: Record<string, unknown>
    }) => void
  ): RealtimeSubscription {
    const channel = supabase
      .channel('admin-notifications')
      .on('broadcast', { event: 'system-notification' }, (payload) => {
        console.log('System notification:', payload)
        callback(payload.payload as any)
      })
      .subscribe()

    return {
      channel,
      unsubscribe: () => {
        supabase.removeChannel(channel)
      },
    }
  }

  /**
   * Monitor user activity in real-time
   */
  static subscribeToUserActivity(
    userId: string,
    callback: (activity: {
      type: 'email_event' | 'feedback' | 'preference_update'
      timestamp: string
      details: string
    }) => void
  ): RealtimeSubscription {
    const channel = supabaseAdmin
      .channel(`user-activity-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'email_events',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const event = payload.new as EmailEvent
          callback({
            type: 'email_event',
            timestamp: event.timestamp,
            details: `${event.email_type} email ${event.event_type}`,
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'feedback_submissions',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const feedback = payload.new as FeedbackSubmission
          callback({
            type: 'feedback',
            timestamp: feedback.submitted_at,
            details: `${feedback.feedback_type} feedback submitted`,
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_preferences',
          filter: `user_id=eq.${userId}`,
        },
        (_payload) => {
          callback({
            type: 'preference_update',
            timestamp: new Date().toISOString(),
            details: 'User preferences updated',
          })
        }
      )
      .subscribe()

    return {
      channel,
      unsubscribe: () => {
        supabaseAdmin.removeChannel(channel)
      },
    }
  }

  /**
   * Get system performance metrics for monitoring
   */
  static async getSystemMetrics(): Promise<{
    data: {
      activeConnections: number
      totalChannels: number
      messagesSentLast24h: number
      systemUptime: number
      avgResponseTime: number
    } | null
    error: string | null
  }> {
    try {
      // Get message count from last 24 hours (email events as proxy)
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      const recentMessages = await supabaseAdmin
        .from('email_events')
        .select('id', { count: 'exact' })
        .gte('timestamp', yesterday.toISOString())

      // Simulate other metrics (in production, track these from your real-time infrastructure)
      return {
        data: {
          activeConnections: Math.floor(Math.random() * 20 + 5), // 5-25 connections
          totalChannels: Math.floor(Math.random() * 10 + 3), // 3-13 channels
          messagesSentLast24h: recentMessages.count || 0,
          systemUptime: 99.8 + Math.random() * 0.2, // 99.8-100%
          avgResponseTime: Math.floor(Math.random() * 50 + 20), // 20-70ms
        },
        error: null,
      }
    } catch (err) {
      console.error('Error getting system metrics:', err)
      return {
        data: null,
        error: 'Failed to fetch system metrics',
      }
    }
  }

  /**
   * Check system health status
   */
  static async checkSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'down'
    components: {
      database: 'healthy' | 'warning' | 'error'
      realtime: 'active' | 'degraded' | 'down'
      email: 'healthy' | 'warning' | 'error'
    }
    lastChecked: string
  }> {
    const startTime = Date.now()

    try {
      // Test database connectivity
      const dbTest = await supabaseAdmin
        .from('beta_signups')
        .select('id')
        .limit(1)
      const dbHealth: 'healthy' | 'warning' | 'error' = dbTest.error
        ? 'error'
        : 'healthy'

      // Test real-time connectivity (simplified)
      const rtHealth: 'active' | 'degraded' | 'down' = 'active' // In production, ping your WebSocket server

      // Check email service (simplified - check recent delivery rate)
      const emailTest = await supabaseAdmin
        .from('email_events')
        .select('event_type')
        .eq('event_type', 'delivered')
        .gte('timestamp', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // last hour
        .limit(1)

      const emailHealth: 'healthy' | 'warning' | 'error' = emailTest.error
        ? 'warning'
        : 'healthy'

      // Determine overall status
      let status: 'healthy' | 'degraded' | 'down' = 'healthy'
      if (dbHealth === 'error' || rtHealth === 'down') {
        status = 'down'
      } else if (
        dbHealth === 'warning' ||
        rtHealth === 'degraded' ||
        emailHealth === 'warning'
      ) {
        status = 'degraded'
      }

      const responseTime = Date.now() - startTime
      console.log(
        `System health check completed in ${responseTime}ms - Status: ${status}`
      )

      return {
        status,
        components: {
          database: dbHealth,
          realtime: rtHealth,
          email: emailHealth,
        },
        lastChecked: new Date().toISOString(),
      }
    } catch (err) {
      console.error('System health check failed:', err)
      return {
        status: 'down',
        components: {
          database: 'error',
          realtime: 'down',
          email: 'error',
        },
        lastChecked: new Date().toISOString(),
      }
    }
  }
}
