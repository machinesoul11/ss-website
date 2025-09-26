import { supabase, supabaseAdmin } from '../supabase'
import type {
  BetaSignup,
  EmailEvent,
  FeedbackSubmission,
  PageAnalytics,
  UserPreferences,
  BetaSignupFormData,
} from '../../types'

/**
 * Database Service Layer
 * Provides type-safe database operations for all Supabase tables
 */

// Beta Signups Service
export class BetaSignupService {
  /**
   * Create a new beta signup from form data
   */
  static async create(
    formData: BetaSignupFormData
  ): Promise<{ data: BetaSignup | null; error: string | null }> {
    try {
      const signupData = {
        email: formData.email,
        github_username: formData.githubUsername,
        gitlab_username: formData.gitlabUsername,
        current_tools: formData.currentTools,
        documentation_platform: formData.documentationPlatforms,
        pain_points: formData.painPoints,
        use_case_description: formData.useCaseDescription,
        team_size: formData.teamSize,
        signup_source: formData.signupSource,
        referrer_code: formData.referrerCode,
        opted_in_marketing: formData.marketingOptIn,
        opted_in_research: formData.researchOptIn,
        engagement_score: 0,
        email_verified: false,
        beta_status: 'pending' as const,
      }

      const { data, error } = await supabase
        .from('beta_signups')
        .insert([signupData])
        .select()
        .single()

      if (error) {
        console.error('Error creating beta signup:', error)
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (err) {
      console.error('Unexpected error in BetaSignupService.create:', err)
      return { data: null, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Get beta signup by email
   */
  static async getByEmail(
    email: string
  ): Promise<{ data: BetaSignup | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('beta_signups')
        .select('*')
        .eq('email', email)
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "not found"
        return { data: null, error: error.message }
      }

      return { data: data || null, error: null }
    } catch (err) {
      console.error('Error in BetaSignupService.getByEmail:', err)
      return { data: null, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Update beta signup status (admin only)
   */
  static async updateStatus(
    userId: string,
    status: 'pending' | 'invited' | 'active'
  ): Promise<{ data: BetaSignup | null; error: string | null }> {
    try {
      const { data, error } = await supabaseAdmin
        .from('beta_signups')
        .update({
          beta_status: status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (err) {
      console.error('Error in BetaSignupService.updateStatus:', err)
      return { data: null, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Update engagement score
   */
  static async updateEngagementScore(
    userId: string,
    scoreIncrement: number
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      // First get current score
      const { data: current, error: fetchError } = await supabaseAdmin
        .from('beta_signups')
        .select('engagement_score')
        .eq('id', userId)
        .single()

      if (fetchError) {
        return { success: false, error: fetchError.message }
      }

      const newScore = (current?.engagement_score || 0) + scoreIncrement

      const { error } = await supabaseAdmin
        .from('beta_signups')
        .update({
          engagement_score: newScore,
        })
        .eq('id', userId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (err) {
      console.error('Error in BetaSignupService.updateEngagementScore:', err)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Get all beta signups with optional filtering (admin only)
   */
  static async getAll(filters?: {
    status?: 'pending' | 'invited' | 'active'
    limit?: number
    offset?: number
  }): Promise<{
    data: BetaSignup[] | null
    error: string | null
    count?: number
  }> {
    try {
      let query = supabaseAdmin
        .from('beta_signups')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (filters?.status) {
        query = query.eq('beta_status', filters.status)
      }

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      if (filters?.offset) {
        query = query.range(
          filters.offset,
          filters.offset + (filters.limit || 10) - 1
        )
      }

      const { data, error, count } = await query

      if (error) {
        return { data: null, error: error.message }
      }

      return { data, error: null, count: count || 0 }
    } catch (err) {
      console.error('Error in BetaSignupService.getAll:', err)
      return { data: null, error: 'An unexpected error occurred' }
    }
  }
}

// Email Events Service
export class EmailEventService {
  /**
   * Log an email event
   */
  static async logEvent(
    event: Omit<EmailEvent, 'id' | 'timestamp'>
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabaseAdmin.from('email_events').insert([
        {
          ...event,
          timestamp: new Date().toISOString(),
        },
      ])

      if (error) {
        console.error('Error logging email event:', error)
        return { success: false, error: error.message }
      }

      // Update engagement score for certain events
      if (['opened', 'clicked'].includes(event.event_type)) {
        const scoreIncrement = event.event_type === 'clicked' ? 5 : 2
        await BetaSignupService.updateEngagementScore(
          event.user_id,
          scoreIncrement
        )
      }

      return { success: true, error: null }
    } catch (err) {
      console.error('Error in EmailEventService.logEvent:', err)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Get email events for a user
   */
  static async getByUser(
    userId: string
  ): Promise<{ data: EmailEvent[] | null; error: string | null }> {
    try {
      const { data, error } = await supabaseAdmin
        .from('email_events')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })

      if (error) {
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (err) {
      console.error('Error in EmailEventService.getByUser:', err)
      return { data: null, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Get email campaign statistics
   */
  static async getCampaignStats(campaignId: string): Promise<{
    data: {
      sent: number
      delivered: number
      opened: number
      clicked: number
    } | null
    error: string | null
  }> {
    try {
      const { data, error } = await supabaseAdmin
        .from('email_events')
        .select('event_type')
        .eq('campaign_id', campaignId)

      if (error) {
        return { data: null, error: error.message }
      }

      const stats = {
        sent: data.filter((e) => e.event_type === 'sent').length,
        delivered: data.filter((e) => e.event_type === 'delivered').length,
        opened: data.filter((e) => e.event_type === 'opened').length,
        clicked: data.filter((e) => e.event_type === 'clicked').length,
      }

      return { data: stats, error: null }
    } catch (err) {
      console.error('Error in EmailEventService.getCampaignStats:', err)
      return { data: null, error: 'An unexpected error occurred' }
    }
  }
}

// Feedback Service
export class FeedbackService {
  /**
   * Submit new feedback
   */
  static async create(
    feedback: Omit<
      FeedbackSubmission,
      'id' | 'submitted_at' | 'internal_status'
    >
  ): Promise<{
    data: FeedbackSubmission | null
    error: string | null
  }> {
    try {
      const { data, error } = await supabase
        .from('feedback_submissions')
        .insert([
          {
            ...feedback,
            submitted_at: new Date().toISOString(),
            internal_status: 'new' as const,
          },
        ])
        .select()
        .single()

      if (error) {
        console.error('Error creating feedback:', error)
        return { data: null, error: error.message }
      }

      // Update engagement score for feedback submission
      await BetaSignupService.updateEngagementScore(feedback.user_id, 10)

      return { data, error: null }
    } catch (err) {
      console.error('Error in FeedbackService.create:', err)
      return { data: null, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Get feedback by user
   */
  static async getByUser(
    userId: string
  ): Promise<{ data: FeedbackSubmission[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('feedback_submissions')
        .select('*')
        .eq('user_id', userId)
        .order('submitted_at', { ascending: false })

      if (error) {
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (err) {
      console.error('Error in FeedbackService.getByUser:', err)
      return { data: null, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Update feedback status (admin only)
   */
  static async updateStatus(
    feedbackId: string,
    status: 'new' | 'reviewed' | 'addressed'
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabaseAdmin
        .from('feedback_submissions')
        .update({ internal_status: status })
        .eq('id', feedbackId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (err) {
      console.error('Error in FeedbackService.updateStatus:', err)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Get all feedback with filtering (admin only)
   */
  static async getAll(filters?: {
    type?: 'survey' | 'bug_report' | 'feature_request'
    status?: 'new' | 'reviewed' | 'addressed'
    limit?: number
    offset?: number
  }): Promise<{
    data:
      | (FeedbackSubmission & {
          user: Pick<BetaSignup, 'email' | 'github_username'>
        })[]
      | null
    error: string | null
    count?: number
  }> {
    try {
      let query = supabaseAdmin
        .from('feedback_submissions')
        .select(
          `
          *,
          user:beta_signups(email, github_username)
        `,
          { count: 'exact' }
        )
        .order('submitted_at', { ascending: false })

      if (filters?.type) {
        query = query.eq('feedback_type', filters.type)
      }

      if (filters?.status) {
        query = query.eq('internal_status', filters.status)
      }

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      if (filters?.offset) {
        query = query.range(
          filters.offset,
          filters.offset + (filters.limit || 10) - 1
        )
      }

      const { data, error, count } = await query

      if (error) {
        return { data: null, error: error.message }
      }

      return { data, error: null, count: count || 0 }
    } catch (err) {
      console.error('Error in FeedbackService.getAll:', err)
      return { data: null, error: 'An unexpected error occurred' }
    }
  }
}

// Analytics Service
export class AnalyticsService {
  /**
   * Track page view or interaction event
   */
  static async trackEvent(
    event: Omit<PageAnalytics, 'id' | 'timestamp'>
  ): Promise<{
    success: boolean
    error: string | null
  }> {
    try {
      const { error } = await supabase.from('page_analytics').insert([
        {
          ...event,
          timestamp: new Date().toISOString(),
        },
      ])

      if (error) {
        console.error('Error tracking analytics event:', error)
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (err) {
      console.error('Error in AnalyticsService.trackEvent:', err)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Get page views analytics (admin only)
   */
  static async getPageViews(filters?: {
    path?: string
    startDate?: string
    endDate?: string
    limit?: number
  }): Promise<{
    data:
      | {
          page_path: string
          views: number
          unique_visitors: number
        }[]
      | null
    error: string | null
  }> {
    try {
      let query = supabaseAdmin
        .from('page_analytics')
        .select('page_path, visitor_id, timestamp')
        .eq('event_type', 'page_view')

      if (filters?.path) {
        query = query.eq('page_path', filters.path)
      }

      if (filters?.startDate) {
        query = query.gte('timestamp', filters.startDate)
      }

      if (filters?.endDate) {
        query = query.lte('timestamp', filters.endDate)
      }

      const { data, error } = await query

      if (error) {
        return { data: null, error: error.message }
      }

      // Aggregate the data
      const aggregated = data.reduce(
        (
          acc: Record<string, { views: number; visitors: Set<string> }>,
          row
        ) => {
          if (!acc[row.page_path]) {
            acc[row.page_path] = { views: 0, visitors: new Set() }
          }
          acc[row.page_path].views++
          if (row.visitor_id) {
            acc[row.page_path].visitors.add(row.visitor_id)
          }
          return acc
        },
        {}
      )

      const result = Object.entries(aggregated).map(([page_path, stats]) => ({
        page_path,
        views: stats.views,
        unique_visitors: stats.visitors.size,
      }))

      return { data: result, error: null }
    } catch (err) {
      console.error('Error in AnalyticsService.getPageViews:', err)
      return { data: null, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Get conversion funnel data (admin only)
   */
  static async getConversionFunnel(
    startDate?: string,
    endDate?: string
  ): Promise<{
    data: {
      landing_views: number
      beta_page_views: number
      signups: number
      conversion_rate: number
    } | null
    error: string | null
  }> {
    try {
      // Get page views
      let analyticsQuery = supabaseAdmin
        .from('page_analytics')
        .select('page_path, visitor_id')
        .eq('event_type', 'page_view')

      if (startDate) {
        analyticsQuery = analyticsQuery.gte('timestamp', startDate)
      }

      if (endDate) {
        analyticsQuery = analyticsQuery.lte('timestamp', endDate)
      }

      const { data: analyticsData, error: analyticsError } =
        await analyticsQuery

      if (analyticsError) {
        return { data: null, error: analyticsError.message }
      }

      // Get signups
      let signupsQuery = supabaseAdmin
        .from('beta_signups')
        .select('id', { count: 'exact' })

      if (startDate) {
        signupsQuery = signupsQuery.gte('created_at', startDate)
      }

      if (endDate) {
        signupsQuery = signupsQuery.lte('created_at', endDate)
      }

      const { count: signups, error: signupsError } = await signupsQuery

      if (signupsError) {
        return { data: null, error: signupsError.message }
      }

      // Calculate metrics
      const landingViews = analyticsData.filter(
        (row) => row.page_path === '/'
      ).length
      const betaPageViews = analyticsData.filter(
        (row) => row.page_path === '/beta'
      ).length
      const conversionRate =
        landingViews > 0 ? ((signups || 0) / landingViews) * 100 : 0

      const result = {
        landing_views: landingViews,
        beta_page_views: betaPageViews,
        signups: signups || 0,
        conversion_rate: Math.round(conversionRate * 100) / 100,
      }

      return { data: result, error: null }
    } catch (err) {
      console.error('Error in AnalyticsService.getConversionFunnel:', err)
      return { data: null, error: 'An unexpected error occurred' }
    }
  }
}

// User Preferences Service
export class UserPreferencesService {
  /**
   * Create or update user preferences
   */
  static async upsert(
    preferences: Omit<UserPreferences, 'updated_at'>
  ): Promise<{
    data: UserPreferences | null
    error: string | null
  }> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert(
          [
            {
              ...preferences,
              updated_at: new Date().toISOString(),
            },
          ],
          {
            onConflict: 'user_id',
          }
        )
        .select()
        .single()

      if (error) {
        console.error('Error upserting user preferences:', error)
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (err) {
      console.error('Error in UserPreferencesService.upsert:', err)
      return { data: null, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Get user preferences
   */
  static async getByUserId(
    userId: string
  ): Promise<{ data: UserPreferences | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "not found"
        return { data: null, error: error.message }
      }

      return { data: data || null, error: null }
    } catch (err) {
      console.error('Error in UserPreferencesService.getByUserId:', err)
      return { data: null, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Update communication preferences
   */
  static async updateCommunication(
    userId: string,
    frequency: 'daily' | 'weekly' | 'monthly',
    method: string
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase.from('user_preferences').upsert(
        [
          {
            user_id: userId,
            communication_frequency: frequency,
            preferred_contact_method: method,
            updated_at: new Date().toISOString(),
          },
        ],
        {
          onConflict: 'user_id',
        }
      )

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (err) {
      console.error('Error in UserPreferencesService.updateCommunication:', err)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }
}
