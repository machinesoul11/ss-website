import { supabaseAdmin } from '@/lib/supabase'
import type { BetaSignup } from '../../types'

/**
 * Engagement Scoring Service
 * Calculates and manages user engagement metrics
 */

export class EngagementService {
  /**
   * Calculate comprehensive engagement score for a user
   */
  static async calculateEngagementScore(userId: string): Promise<{
    score: number
    breakdown: {
      email_interactions: number
      feedback_submissions: number
      profile_completeness: number
      activity_recency: number
    }
    error: string | null
  }> {
    try {
      // Ensure admin client is available
      const admin = supabaseAdmin
      if (!admin) {
        throw new Error('supabaseAdmin not available')
      }

      // Get user data with type assertion for deployment
      const { data: user, error: userError } = await admin
        .from('beta_signups')
        .select('*')
        .eq('id', userId)
        .single() as any

      if (userError) {
        return {
          score: 0,
          breakdown: {
            email_interactions: 0,
            feedback_submissions: 0,
            profile_completeness: 0,
            activity_recency: 0,
          },
          error: userError.message,
        }
      }

      // Get email interactions with type assertion for deployment
      const { data: emailEvents, error: emailError } = await admin
        .from('email_events')
        .select('event_type, timestamp')
        .eq('user_id', userId) as any

      if (emailError) {
        return {
          score: 0,
          breakdown: {
            email_interactions: 0,
            feedback_submissions: 0,
            profile_completeness: 0,
            activity_recency: 0,
          },
          error: emailError.message,
        }
      }

      // Get feedback submissions
      const { data: feedback, error: feedbackError } = await supabaseAdmin
        .from('feedback_submissions')
        .select('id, submitted_at')
        .eq('user_id', userId)

      if (feedbackError) {
        return {
          score: 0,
          breakdown: {
            email_interactions: 0,
            feedback_submissions: 0,
            profile_completeness: 0,
            activity_recency: 0,
          },
          error: feedbackError.message,
        }
      }

      // Calculate email interaction score (0-40 points)
      const emailOpens =
        emailEvents?.filter((e) => e.event_type === 'opened').length || 0
      const emailClicks =
        emailEvents?.filter((e) => e.event_type === 'clicked').length || 0
      const emailInteractionScore = Math.min(
        40,
        emailOpens * 2 + emailClicks * 5
      )

      // Calculate feedback score (0-30 points)
      const feedbackCount = feedback?.length || 0
      const feedbackScore = Math.min(30, feedbackCount * 10)

      // Calculate profile completeness (0-20 points)
      let completenessScore = 0
      if (user.github_username) completenessScore += 5
      if (user.current_tools?.length > 0) completenessScore += 5
      if (user.documentation_platform?.length > 0) completenessScore += 5
      if (user.use_case_description?.length > 50) completenessScore += 5

      // Calculate activity recency (0-10 points)
      const now = new Date()
      const lastActivity = [
        ...(emailEvents?.map((e) => new Date(e.timestamp)) || []),
        ...(feedback?.map((f) => new Date(f.submitted_at)) || []),
        new Date(user.created_at),
      ].sort((a, b) => b.getTime() - a.getTime())[0]

      const daysSinceActivity =
        (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
      let recencyScore = 0
      if (daysSinceActivity <= 7) recencyScore = 10
      else if (daysSinceActivity <= 30) recencyScore = 5
      else if (daysSinceActivity <= 60) recencyScore = 2

      const totalScore =
        emailInteractionScore + feedbackScore + completenessScore + recencyScore

      return {
        score: totalScore,
        breakdown: {
          email_interactions: emailInteractionScore,
          feedback_submissions: feedbackScore,
          profile_completeness: completenessScore,
          activity_recency: recencyScore,
        },
        error: null,
      }
    } catch (err) {
      console.error('Error calculating engagement score:', err)
      return {
        score: 0,
        breakdown: {
          email_interactions: 0,
          feedback_submissions: 0,
          profile_completeness: 0,
          activity_recency: 0,
        },
        error: 'An unexpected error occurred',
      }
    }
  }

  /**
   * Update engagement scores for all users
   */
  static async updateAllEngagementScores(): Promise<{
    updated: number
    errors: string[]
  }> {
    try {
      const { data: users, error } = await supabaseAdmin
        .from('beta_signups')
        .select('id')

      if (error) {
        return { updated: 0, errors: [error.message] }
      }

      let updated = 0
      const errors: string[] = []

      for (const user of users) {
        const { score, error: scoreError } =
          await this.calculateEngagementScore(user.id)

        if (scoreError) {
          errors.push(`User ${user.id}: ${scoreError}`)
          continue
        }

        const { error: updateError } = await supabaseAdmin
          .from('beta_signups')
          .update({ engagement_score: score })
          .eq('id', user.id)

        if (updateError) {
          errors.push(`User ${user.id} update: ${updateError.message}`)
        } else {
          updated++
        }
      }

      return { updated, errors }
    } catch (err) {
      console.error('Error updating all engagement scores:', err)
      return { updated: 0, errors: ['An unexpected error occurred'] }
    }
  }
}

/**
 * User Segmentation Service
 * Provides intelligent user grouping for targeted campaigns
 */

export interface UserSegment {
  id: string
  name: string
  description: string
  users: BetaSignup[]
  count: number
}

export class SegmentationService {
  /**
   * Segment users by engagement level
   */
  static async segmentByEngagement(): Promise<{
    segments: UserSegment[]
    error: string | null
  }> {
    try {
      const { data: users, error } = await supabaseAdmin
        .from('beta_signups')
        .select('*')
        .order('engagement_score', { ascending: false })

      if (error) {
        return { segments: [], error: error.message }
      }

      const highEngagement = users.filter((u) => u.engagement_score >= 70)
      const mediumEngagement = users.filter(
        (u) => u.engagement_score >= 30 && u.engagement_score < 70
      )
      const lowEngagement = users.filter((u) => u.engagement_score < 30)

      const segments: UserSegment[] = [
        {
          id: 'high-engagement',
          name: 'High Engagement',
          description: 'Users with engagement score 70+',
          users: highEngagement,
          count: highEngagement.length,
        },
        {
          id: 'medium-engagement',
          name: 'Medium Engagement',
          description: 'Users with engagement score 30-69',
          users: mediumEngagement,
          count: mediumEngagement.length,
        },
        {
          id: 'low-engagement',
          name: 'Low Engagement',
          description: 'Users with engagement score 0-29',
          users: lowEngagement,
          count: lowEngagement.length,
        },
      ]

      return { segments, error: null }
    } catch (err) {
      console.error('Error segmenting by engagement:', err)
      return { segments: [], error: 'An unexpected error occurred' }
    }
  }

  /**
   * Segment users by tools they currently use
   */
  static async segmentByTools(): Promise<{
    segments: UserSegment[]
    error: string | null
  }> {
    try {
      const { data: users, error } = await supabaseAdmin
        .from('beta_signups')
        .select('*')

      if (error) {
        return { segments: [], error: error.message }
      }

      const toolGroups: Record<string, BetaSignup[]> = {}

      users.forEach((user) => {
        const tools = user.current_tools || []

        // Group by primary tool categories
        if (tools.some((t: string) => t.toLowerCase().includes('vale'))) {
          if (!toolGroups['vale-users']) toolGroups['vale-users'] = []
          toolGroups['vale-users'].push(user)
        } else if (
          tools.some((t: string) => t.toLowerCase().includes('grammarly'))
        ) {
          if (!toolGroups['grammarly-users']) toolGroups['grammarly-users'] = []
          toolGroups['grammarly-users'].push(user)
        } else if (
          tools.some((t: string) => t.toLowerCase().includes('notion'))
        ) {
          if (!toolGroups['notion-users']) toolGroups['notion-users'] = []
          toolGroups['notion-users'].push(user)
        } else if (tools.length === 0 || tools.includes('none')) {
          if (!toolGroups['no-tools']) toolGroups['no-tools'] = []
          toolGroups['no-tools'].push(user)
        } else {
          if (!toolGroups['other-tools']) toolGroups['other-tools'] = []
          toolGroups['other-tools'].push(user)
        }
      })

      const segments: UserSegment[] = Object.entries(toolGroups).map(
        ([key, userList]) => ({
          id: key,
          name: this.formatSegmentName(key),
          description: this.getToolDescription(key),
          users: userList,
          count: userList.length,
        })
      )

      return { segments, error: null }
    } catch (err) {
      console.error('Error segmenting by tools:', err)
      return { segments: [], error: 'An unexpected error occurred' }
    }
  }

  /**
   * Segment users by team size
   */
  static async segmentByTeamSize(): Promise<{
    segments: UserSegment[]
    error: string | null
  }> {
    try {
      const { data: users, error } = await supabaseAdmin
        .from('beta_signups')
        .select('*')

      if (error) {
        return { segments: [], error: error.message }
      }

      const sizeGroups: Record<string, BetaSignup[]> = {
        individual: [],
        'small-team': [],
        'medium-team': [],
        'large-team': [],
        enterprise: [],
      }

      users.forEach((user) => {
        const size = user.team_size || 'individual'
        if (sizeGroups[size]) {
          sizeGroups[size].push(user)
        }
      })

      const segments: UserSegment[] = Object.entries(sizeGroups)
        .filter(([, userList]) => userList.length > 0)
        .map(([key, userList]) => ({
          id: key,
          name: this.formatTeamSizeName(key),
          description: this.getTeamSizeDescription(key),
          users: userList,
          count: userList.length,
        }))

      return { segments, error: null }
    } catch (err) {
      console.error('Error segmenting by team size:', err)
      return { segments: [], error: 'An unexpected error occurred' }
    }
  }

  /**
   * Get users ready for early access invitation
   */
  static async getEarlyAccessCandidates(): Promise<{
    candidates: BetaSignup[]
    error: string | null
  }> {
    try {
      const { data: users, error } = await supabaseAdmin
        .from('beta_signups')
        .select('*')
        .eq('beta_status', 'pending')
        .gte('engagement_score', 50)
        .order('engagement_score', { ascending: false })

      if (error) {
        return { candidates: [], error: error.message }
      }

      return { candidates: users, error: null }
    } catch (err) {
      console.error('Error getting early access candidates:', err)
      return { candidates: [], error: 'An unexpected error occurred' }
    }
  }

  // Helper methods
  private static formatSegmentName(key: string): string {
    const names: Record<string, string> = {
      'vale-users': 'Vale Users',
      'grammarly-users': 'Grammarly Users',
      'notion-users': 'Notion Users',
      'no-tools': 'No Current Tools',
      'other-tools': 'Other Tools',
    }
    return names[key] || key
  }

  private static getToolDescription(key: string): string {
    const descriptions: Record<string, string> = {
      'vale-users': 'Users currently using Vale for documentation linting',
      'grammarly-users':
        'Users currently using Grammarly for writing assistance',
      'notion-users': 'Users currently using Notion for documentation',
      'no-tools': 'Users not currently using any documentation tools',
      'other-tools': 'Users using various other documentation tools',
    }
    return descriptions[key] || 'User segment based on tool usage'
  }

  private static formatTeamSizeName(key: string): string {
    const names: Record<string, string> = {
      individual: 'Individual Contributors',
      'small-team': 'Small Teams (2-5 people)',
      'medium-team': 'Medium Teams (6-20 people)',
      'large-team': 'Large Teams (21-100 people)',
      enterprise: 'Enterprise (100+ people)',
    }
    return names[key] || key
  }

  private static getTeamSizeDescription(key: string): string {
    const descriptions: Record<string, string> = {
      individual: 'Solo developers and technical writers',
      'small-team': 'Small development or documentation teams',
      'medium-team': 'Medium-sized teams with structured processes',
      'large-team': 'Large teams with complex documentation needs',
      enterprise: 'Enterprise organizations with advanced requirements',
    }
    return descriptions[key] || 'User segment based on team size'
  }
}
