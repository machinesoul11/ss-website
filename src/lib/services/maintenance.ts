import { supabaseAdmin } from '../supabase'
import { EngagementService } from './engagement'

/**
 * Database Maintenance & Monitoring Utilities
 * Provides functions for data cleanup, health checks, and system monitoring
 */

export class DatabaseMaintenanceService {
  /**
   * Clean up old analytics data (older than specified days)
   */
  static async cleanupOldAnalytics(daysToKeep = 90): Promise<{ 
    deleted: number; 
    error: string | null 
  }> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

      const { count, error } = await supabaseAdmin
        .from('page_analytics')
        .delete({ count: 'exact' })
        .lt('timestamp', cutoffDate.toISOString())

      if (error) {
        return { deleted: 0, error: error.message }
      }

      return { deleted: count || 0, error: null }
    } catch (err) {
      console.error('Error cleaning up old analytics:', err)
      return { deleted: 0, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Clean up old email events (older than specified days)
   */
  static async cleanupOldEmailEvents(daysToKeep = 365): Promise<{ 
    deleted: number; 
    error: string | null 
  }> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

      const { count, error } = await supabaseAdmin
        .from('email_events')
        .delete({ count: 'exact' })
        .lt('timestamp', cutoffDate.toISOString())

      if (error) {
        return { deleted: 0, error: error.message }
      }

      return { deleted: count || 0, error: null }
    } catch (err) {
      console.error('Error cleaning up old email events:', err)
      return { deleted: 0, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Update all engagement scores (should be run periodically)
   */
  static async updateAllEngagementScores(): Promise<{ 
    updated: number; 
    errors: string[] 
  }> {
    return await EngagementService.updateAllEngagementScores()
  }

  /**
   * Database health check
   */
  static async healthCheck(): Promise<{
    healthy: boolean;
    metrics: {
      total_signups: number;
      active_users: number;
      recent_signups_24h: number;
      recent_email_events_24h: number;
      database_size_estimate: string;
    };
    issues: string[];
  }> {
    const issues: string[] = []
    let healthy = true

    try {
      // Check total signups
      const { count: totalSignups, error: signupsError } = await supabaseAdmin
        .from('beta_signups')
        .select('id', { count: 'exact' })

      if (signupsError) {
        issues.push(`Cannot access beta_signups table: ${signupsError.message}`)
        healthy = false
      }

      // Check active users (engagement score > 0)
      const { count: activeUsers, error: activeError } = await supabaseAdmin
        .from('beta_signups')
        .select('id', { count: 'exact' })
        .gt('engagement_score', 0)

      if (activeError) {
        issues.push(`Cannot check active users: ${activeError.message}`)
      }

      // Check recent signups (last 24h)
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      const { count: recentSignups, error: recentSignupsError } = await supabaseAdmin
        .from('beta_signups')
        .select('id', { count: 'exact' })
        .gte('created_at', yesterday.toISOString())

      if (recentSignupsError) {
        issues.push(`Cannot check recent signups: ${recentSignupsError.message}`)
      }

      // Check recent email events (last 24h)
      const { count: recentEmailEvents, error: recentEmailError } = await supabaseAdmin
        .from('email_events')
        .select('id', { count: 'exact' })
        .gte('timestamp', yesterday.toISOString())

      if (recentEmailError) {
        issues.push(`Cannot check recent email events: ${recentEmailError.message}`)
      }

      // Check for users with missing preferences
      const { count: usersWithoutPrefs, error: prefsError } = await supabaseAdmin
        .from('beta_signups')
        .select(`
          id,
          user_preferences!left(user_id)
        `, { count: 'exact' })
        .is('user_preferences.user_id', null)

      if (prefsError) {
        issues.push(`Cannot check user preferences: ${prefsError.message}`)
      } else if ((usersWithoutPrefs || 0) > (totalSignups || 0) * 0.1) {
        // If more than 10% of users don't have preferences, flag as issue
        issues.push(`${usersWithoutPrefs} users missing preferences (${Math.round(((usersWithoutPrefs || 0) / (totalSignups || 1)) * 100)}%)`)
      }

      return {
        healthy: healthy && issues.length === 0,
        metrics: {
          total_signups: totalSignups || 0,
          active_users: activeUsers || 0,
          recent_signups_24h: recentSignups || 0,
          recent_email_events_24h: recentEmailEvents || 0,
          database_size_estimate: 'N/A' // Supabase doesn't expose this easily
        },
        issues
      }
    } catch (err) {
      console.error('Error during health check:', err)
      return {
        healthy: false,
        metrics: {
          total_signups: 0,
          active_users: 0,
          recent_signups_24h: 0,
          recent_email_events_24h: 0,
          database_size_estimate: 'N/A'
        },
        issues: ['Health check failed with unexpected error']
      }
    }
  }

  /**
   * Generate database statistics report
   */
  static async generateStatsReport(): Promise<{
    report: {
      user_stats: {
        total_signups: number;
        by_status: Record<string, number>;
        by_team_size: Record<string, number>;
        avg_engagement_score: number;
      };
      email_stats: {
        total_events: number;
        by_type: Record<string, number>;
        by_event: Record<string, number>;
      };
      feedback_stats: {
        total_submissions: number;
        by_type: Record<string, number>;
        by_status: Record<string, number>;
        avg_rating: number;
      };
      analytics_stats: {
        total_events: number;
        unique_visitors: number;
        top_pages: { path: string; views: number }[];
      };
    };
    error: string | null;
  }> {
    try {
      // User statistics
      const { data: users, error: usersError } = await supabaseAdmin
        .from('beta_signups')
        .select('beta_status, team_size, engagement_score')

      if (usersError) {
        return { report: {} as any, error: usersError.message }
      }

      const userStats = {
        total_signups: users.length,
        by_status: users.reduce((acc: Record<string, number>, u) => {
          acc[u.beta_status] = (acc[u.beta_status] || 0) + 1
          return acc
        }, {}),
        by_team_size: users.reduce((acc: Record<string, number>, u) => {
          const size = u.team_size || 'individual'
          acc[size] = (acc[size] || 0) + 1
          return acc
        }, {}),
        avg_engagement_score: users.reduce((sum, u) => sum + (u.engagement_score || 0), 0) / users.length
      }

      // Email statistics
      const { data: emailEvents, error: emailError } = await supabaseAdmin
        .from('email_events')
        .select('email_type, event_type')

      if (emailError) {
        return { report: {} as any, error: emailError.message }
      }

      const emailStats = {
        total_events: emailEvents.length,
        by_type: emailEvents.reduce((acc: Record<string, number>, e) => {
          acc[e.email_type] = (acc[e.email_type] || 0) + 1
          return acc
        }, {}),
        by_event: emailEvents.reduce((acc: Record<string, number>, e) => {
          acc[e.event_type] = (acc[e.event_type] || 0) + 1
          return acc
        }, {})
      }

      // Feedback statistics
      const { data: feedback, error: feedbackError } = await supabaseAdmin
        .from('feedback_submissions')
        .select('feedback_type, internal_status, rating')

      if (feedbackError) {
        return { report: {} as any, error: feedbackError.message }
      }

      const ratingsWithValues = feedback.filter(f => f.rating !== null)
      const avgRating = ratingsWithValues.length > 0 
        ? ratingsWithValues.reduce((sum, f) => sum + (f.rating || 0), 0) / ratingsWithValues.length
        : 0

      const feedbackStats = {
        total_submissions: feedback.length,
        by_type: feedback.reduce((acc: Record<string, number>, f) => {
          acc[f.feedback_type] = (acc[f.feedback_type] || 0) + 1
          return acc
        }, {}),
        by_status: feedback.reduce((acc: Record<string, number>, f) => {
          acc[f.internal_status] = (acc[f.internal_status] || 0) + 1
          return acc
        }, {}),
        avg_rating: Math.round(avgRating * 100) / 100
      }

      // Analytics statistics
      const { data: analytics, error: analyticsError } = await supabaseAdmin
        .from('page_analytics')
        .select('page_path, visitor_id, event_type')

      if (analyticsError) {
        return { report: {} as any, error: analyticsError.message }
      }

      const pageViews = analytics.filter(a => a.event_type === 'page_view')
      const uniqueVisitors = new Set(analytics.map(a => a.visitor_id).filter(Boolean)).size
      
      const pageCounts = pageViews.reduce((acc: Record<string, number>, a) => {
        acc[a.page_path] = (acc[a.page_path] || 0) + 1
        return acc
      }, {})

      const topPages = Object.entries(pageCounts)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 10)
        .map(([path, views]) => ({ path, views: views as number }))

      const analyticsStats = {
        total_events: analytics.length,
        unique_visitors: uniqueVisitors,
        top_pages: topPages
      }

      return {
        report: {
          user_stats: userStats,
          email_stats: emailStats,
          feedback_stats: feedbackStats,
          analytics_stats: analyticsStats
        },
        error: null
      }
    } catch (err) {
      console.error('Error generating stats report:', err)
      return { 
        report: {} as any, 
        error: 'An unexpected error occurred' 
      }
    }
  }
}
