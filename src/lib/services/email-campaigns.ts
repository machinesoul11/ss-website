import { supabaseAdmin } from '../supabase'
import { EmailEventService } from './database'
import type { 
  BetaSignup, 
  EarlyAccessEmailData, 
  ReEngagementEmailData, 
  MonthlyNewsletterData, 
  EmailCampaign 
} from '../../types'

/**
 * SendGrid Email Campaign Management
 * Handles template-based email sending with tracking and personalization
 */

// SendGrid Template IDs - Welcome Email Series
export const EMAIL_TEMPLATES = {
  // Welcome Series
  WELCOME_IMMEDIATE: 'd-d81e561c996840d494c15dd695b1b57b',
  WELCOME_DAY_3: 'd-welcome-day3-silentscribe-dev',
  WELCOME_WEEK_1: 'd-welcome-week1-silentscribe-dev',
  
  // Regular Communications
  DEVELOPMENT_UPDATE: 'd-afa3d31882344069a28ecd9b982a6b6e',
  MONTHLY_NEWSLETTER: 'd-monthly-newsletter-silentscribe',
  
  // Feedback & Research
  FEEDBACK_REQUEST: 'd-c0c4ed1081b84e0a883a8d49b872e1a9',
  
  // Special Campaigns
  EARLY_ACCESS_INVITATION: 'd-early-access-silentscribe-dev',
  RE_ENGAGEMENT: 'd-re-engagement-silentscribe-dev',
  
  // Feature-Specific
  BETA_FEATURE_ANNOUNCEMENT: 'd-beta-feature-silentscribe-dev',
  COMMUNITY_HIGHLIGHTS: 'd-community-highlights-silentscribe'
} as const

// Template variable interfaces based on common SendGrid patterns
export interface WelcomeEmailData {
  first_name?: string
  github_username?: string
  user_email: string
  unsubscribe_url: string
  beta_signup_date: string
  community_links: {
    discord?: string
    github?: string
    twitter?: string
  }
}

export interface DevelopmentUpdateData {
  first_name?: string
  user_email: string
  update_title: string
  update_content: string
  features_highlights: string[]
  roadmap_items?: string[]
  feedback_link: string
  unsubscribe_url: string
  update_date: string
}

export interface FeedbackRequestData {
  first_name?: string
  user_email: string
  feedback_type: 'general' | 'feature' | 'beta_experience'
  survey_link: string
  estimated_time: string
  incentive_message?: string
  unsubscribe_url: string
  request_date: string
}

export type EmailTemplateData = WelcomeEmailData | DevelopmentUpdateData | FeedbackRequestData | EarlyAccessEmailData | ReEngagementEmailData | MonthlyNewsletterData



export class EmailCampaignService {
  private static sendGridApiKey = process.env.SENDGRID_API_KEY!
  private static fromEmail = process.env.FROM_EMAIL || 'hello@silentscribe.dev'
  private static fromName = process.env.FROM_NAME || 'Silent Scribe'

  /**
   * Send welcome email to new beta signup
   */
  static async sendWelcomeEmail(user: BetaSignup): Promise<{ 
    success: boolean; 
    error: string | null;
    messageId?: string;
  }> {
    try {
      const templateData: WelcomeEmailData = {
        first_name: user.github_username || 'Developer',
        github_username: user.github_username || '',
        user_email: user.email,
        unsubscribe_url: `${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe?email=${encodeURIComponent(user.email)}`,
        beta_signup_date: new Date(user.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        community_links: {
          discord: 'https://discord.gg/silentscribe', // Replace with actual links
          github: 'https://github.com/silentscribe',
          twitter: 'https://twitter.com/silentscribe'
        }
      }

      const result = await this.sendTemplateEmail({
        to_email: user.email,
        template_id: EMAIL_TEMPLATES.WELCOME_IMMEDIATE,
        template_data: templateData,
        subject: 'Welcome to Silent Scribe Beta! 🚀',
        user_id: user.id,
        email_type: 'welcome'
      })

      return result
    } catch (err) {
      console.error('Error sending welcome email:', err)
      return { success: false, error: 'Failed to send welcome email' }
    }
  }

  /**
   * Send welcome email series - Day 3 follow-up
   */
  static async sendWelcomeDayThree(user: BetaSignup): Promise<{ 
    success: boolean; 
    error: string | null;
    messageId?: string;
  }> {
    try {
      const templateData: WelcomeEmailData = {
        first_name: user.github_username || 'Developer',
        github_username: user.github_username || '',
        user_email: user.email,
        unsubscribe_url: `${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe?email=${encodeURIComponent(user.email)}`,
        beta_signup_date: new Date(user.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        community_links: {
          discord: 'https://discord.gg/silentscribe',
          github: 'https://github.com/silentscribe',
          twitter: 'https://twitter.com/silentscribe'
        }
      }

      const result = await this.sendTemplateEmail({
        to_email: user.email,
        template_id: EMAIL_TEMPLATES.WELCOME_DAY_3,
        template_data: templateData,
        subject: 'Silent Scribe Development Philosophy - Privacy First 🔒',
        user_id: user.id,
        email_type: 'welcome'
      })

      return result
    } catch (err) {
      console.error('Error sending day 3 welcome email:', err)
      return { success: false, error: 'Failed to send day 3 welcome email' }
    }
  }

  /**
   * Send welcome email series - Week 1 community highlights
   */
  static async sendWelcomeWeekOne(user: BetaSignup): Promise<{ 
    success: boolean; 
    error: string | null;
    messageId?: string;
  }> {
    try {
      const templateData: WelcomeEmailData = {
        first_name: user.github_username || 'Developer',
        github_username: user.github_username || '',
        user_email: user.email,
        unsubscribe_url: `${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe?email=${encodeURIComponent(user.email)}`,
        beta_signup_date: new Date(user.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        community_links: {
          discord: 'https://discord.gg/silentscribe',
          github: 'https://github.com/silentscribe',
          twitter: 'https://twitter.com/silentscribe'
        }
      }

      const result = await this.sendTemplateEmail({
        to_email: user.email,
        template_id: EMAIL_TEMPLATES.WELCOME_WEEK_1,
        template_data: templateData,
        subject: 'Community Highlights & What\'s Coming Next 🚀',
        user_id: user.id,
        email_type: 'welcome'
      })

      return result
    } catch (err) {
      console.error('Error sending week 1 welcome email:', err)
      return { success: false, error: 'Failed to send week 1 welcome email' }
    }
  }

  /**
   * Send monthly development update newsletter
   */
  static async sendMonthlyNewsletter(
    newsletterData: Omit<DevelopmentUpdateData, 'first_name' | 'user_email' | 'unsubscribe_url' | 'update_date'>,
    segmentFilter?: {
      engagement_level?: 'high' | 'medium' | 'low'
      beta_status?: 'pending' | 'invited' | 'active'
      team_size?: string[]
    }
  ): Promise<{
    campaign_id: string;
    total_sent: number;
    errors: string[];
  }> {
    try {
      const campaignId = `newsletter-${Date.now()}`
      const users = await this.getSegmentedUsers(segmentFilter)
      
      if (users.length === 0) {
        return {
          campaign_id: campaignId,
          total_sent: 0,
          errors: ['No users found matching segment criteria']
        }
      }

      // Create campaign record
      await this.insertCampaign({
        campaign_id: campaignId,
        campaign_type: 'monthly_newsletter',
        subject: newsletterData.update_title,
        segment_filter: JSON.stringify(segmentFilter),
        total_recipients: users.length,
        status: 'sending'
      })

      const errors: string[] = []
      let sentCount = 0

      for (const user of users) {
        const templateData: DevelopmentUpdateData = {
          ...newsletterData,
          first_name: user.github_username || 'Developer',
          user_email: user.email,
          unsubscribe_url: `${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe?email=${encodeURIComponent(user.email)}`,
          update_date: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long', 
            day: 'numeric'
          })
        }

        const result = await this.sendTemplateEmail({
          to_email: user.email,
          template_id: EMAIL_TEMPLATES.MONTHLY_NEWSLETTER,
          template_data: templateData,
          subject: newsletterData.update_title,
          user_id: user.id,
          email_type: 'update',
          campaign_id: campaignId
        })

        if (result.success) {
          sentCount++
        } else {
          errors.push(`${user.email}: ${result.error}`)
        }

        // Small delay between emails
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // Update campaign status
      await this.updateCampaignStatus(campaignId, {
        status: 'sent',
        sent_count: sentCount,
        error_count: errors.length,
        sent_at: new Date().toISOString()
      })

      return {
        campaign_id: campaignId,
        total_sent: sentCount,
        errors
      }
    } catch (err) {
      console.error('Error sending monthly newsletter:', err)
      return {
        campaign_id: '',
        total_sent: 0,
        errors: ['Failed to send monthly newsletter']
      }
    }
  }

  /**
   * Send early access invitation
   */
  static async sendEarlyAccessInvitation(
    targetUsers: string[], // User IDs for early access
    invitationData: {
      access_level: 'alpha' | 'beta' | 'preview'
      download_link?: string
      instructions_link?: string
      exclusive_features: string[]
    }
  ): Promise<{
    campaign_id: string;
    total_sent: number;
    errors: string[];
  }> {
    try {
      const campaignId = `early-access-${Date.now()}`
      
      if (!supabaseAdmin) {
        throw new Error('Supabase admin client not available')
      }

      // Get specific users
      const { data: users, error } = await supabaseAdmin
        .from('beta_signups')
        .select('*')
        .in('id', targetUsers)
      
      if (error || !users) {
        throw new Error(error?.message || 'Failed to fetch users')
      }

      // Type assertion to fix the never type issue
      const typedUsers = users as BetaSignup[]

      if (typedUsers.length === 0) {
        return {
          campaign_id: campaignId,
          total_sent: 0,
          errors: ['No users found with provided IDs']
        }
      }

      // Create campaign record
      await this.insertCampaign({
        campaign_id: campaignId,
        campaign_type: 'early_access',
        subject: `Silent Scribe ${invitationData.access_level.toUpperCase()} Access - You're In! 🎉`,
        segment_filter: JSON.stringify({ user_ids: targetUsers }),
        total_recipients: typedUsers.length,
        status: 'sending'
      })

      const errors: string[] = []
      let sentCount = 0

      for (const user of typedUsers) {
        const templateData = {
          first_name: user.github_username || 'Developer',
          user_email: user.email,
          access_level: invitationData.access_level,
          download_link: invitationData.download_link || '',
          instructions_link: invitationData.instructions_link || '',
          exclusive_features: invitationData.exclusive_features,
          unsubscribe_url: `${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe?email=${encodeURIComponent(user.email)}`,
          invitation_date: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        }

        const result = await this.sendTemplateEmail({
          to_email: user.email,
          template_id: EMAIL_TEMPLATES.EARLY_ACCESS_INVITATION,
          template_data: templateData,
          subject: `Silent Scribe ${invitationData.access_level.toUpperCase()} Access - You're In! 🎉`,
          user_id: user.id,
          email_type: 'early_access',
          campaign_id: campaignId
        })

        if (result.success) {
          sentCount++
          // Update user beta status
          if (supabaseAdmin) {
            await (supabaseAdmin as any)
              .from('beta_signups')
              .update({ 
                beta_status: 'active',
                notes: `Granted ${invitationData.access_level} access on ${new Date().toISOString()}`
              })
              .eq('id', user.id)
          }
        } else {
          errors.push(`${user.email}: ${result.error}`)
        }

        // Small delay between emails
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // Update campaign status
      await this.updateCampaignStatus(campaignId, {
        status: 'sent',
        sent_count: sentCount,
        error_count: errors.length,
        sent_at: new Date().toISOString()
      })

      return {
        campaign_id: campaignId,
        total_sent: sentCount,
        errors
      }
    } catch (err) {
      console.error('Error sending early access invitations:', err)
      return {
        campaign_id: '',
        total_sent: 0,
        errors: ['Failed to send early access invitations']
      }
    }
  }

  /**
   * Send re-engagement campaign to inactive users
   */
  static async sendReEngagementCampaign(
    inactivityThresholdDays: number = 30
  ): Promise<{
    campaign_id: string;
    total_sent: number;
    errors: string[];
  }> {
    try {
      const campaignId = `re-engagement-${Date.now()}`
      
      if (!supabaseAdmin) {
        throw new Error('Supabase admin client not available')
      }

      // Get users who haven't engaged in the threshold period
      const thresholdDate = new Date()
      thresholdDate.setDate(thresholdDate.getDate() - inactivityThresholdDays)
      
      const { data: users, error } = await supabaseAdmin
        .from('beta_signups')
        .select('*')
        .eq('opted_in_marketing', true)
        .lt('engagement_score', 20) // Low engagement score
        .lt('created_at', thresholdDate.toISOString()) // Signed up before threshold
      
      if (error || !users) {
        throw new Error(error?.message || 'Failed to fetch inactive users')
      }

      // Type assertion to fix the never type issue
      const typedUsers = users as BetaSignup[]

      if (typedUsers.length === 0) {
        return {
          campaign_id: campaignId,
          total_sent: 0,
          errors: ['No inactive users found']
        }
      }

      // Create campaign record
      await this.insertCampaign({
        campaign_id: campaignId,
        campaign_type: 're_engagement',
        subject: 'We Miss You! Silent Scribe Updates & What You Might Have Missed',
        segment_filter: JSON.stringify({ 
          engagement_level: 'low',
          inactivity_days: inactivityThresholdDays 
        }),
        total_recipients: typedUsers.length,
        status: 'sending'
      })

      const errors: string[] = []
      let sentCount = 0

      for (const user of typedUsers) {
        const templateData = {
          first_name: user.github_username || 'Developer',
          user_email: user.email,
          inactivity_days: inactivityThresholdDays,
          recent_updates: [
            'Privacy-first architecture completed',
            'Local processing engine optimized',
            'VS Code extension alpha ready'
          ],
          feedback_link: `${process.env.NEXT_PUBLIC_SITE_URL}/feedback`,
          unsubscribe_url: `${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe?email=${encodeURIComponent(user.email)}`,
          campaign_date: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        }

        const result = await this.sendTemplateEmail({
          to_email: user.email,
          template_id: EMAIL_TEMPLATES.RE_ENGAGEMENT,
          template_data: templateData,
          subject: 'We Miss You! Silent Scribe Updates & What You Might Have Missed',
          user_id: user.id,
          email_type: 'update',
          campaign_id: campaignId
        })

        if (result.success) {
          sentCount++
        } else {
          errors.push(`${user.email}: ${result.error}`)
        }

        // Small delay between emails
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // Update campaign status
      await this.updateCampaignStatus(campaignId, {
        status: 'sent',
        sent_count: sentCount,
        error_count: errors.length,
        sent_at: new Date().toISOString()
      })

      return {
        campaign_id: campaignId,
        total_sent: sentCount,
        errors
      }
    } catch (err) {
      console.error('Error sending re-engagement campaign:', err)
      return {
        campaign_id: '',
        total_sent: 0,
        errors: ['Failed to send re-engagement campaign']
      }
    }
  }

  // Helper methods to handle database operations safely
  private static async insertCampaign(campaignData: any) {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not available')
    }
    
    // Type assertion to bypass the 'never' type issue
    const { error } = await (supabaseAdmin as any).from('email_campaigns').insert([campaignData])
    if (error) {
      throw new Error(`Failed to create campaign: ${error.message}`)
    }
  }

  private static async updateCampaignStatus(campaignId: string, updates: any) {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not available')
    }
    
    // Type assertion to bypass the 'never' type issue
    const { error } = await (supabaseAdmin as any)
      .from('email_campaigns')
      .update(updates)
      .eq('campaign_id', campaignId)
      
    if (error) {
      throw new Error(`Failed to update campaign: ${error.message}`)
    }
  }

  /**
   * Send development update to user segments
   */
  static async sendDevelopmentUpdate(
    updateData: Omit<DevelopmentUpdateData, 'first_name' | 'user_email' | 'unsubscribe_url' | 'update_date'>,
    segmentFilter?: {
      engagement_level?: 'high' | 'medium' | 'low'
      beta_status?: 'pending' | 'invited' | 'active'
      team_size?: string[]
    }
  ): Promise<{
    campaign_id: string;
    total_sent: number;
    errors: string[];
  }> {
    try {
      // Generate campaign ID
      const campaignId = `dev-update-${Date.now()}`
      
      // Get target users based on segment filter
      const users = await this.getSegmentedUsers(segmentFilter)
      
      if (users.length === 0) {
        return {
          campaign_id: campaignId,
          total_sent: 0,
          errors: ['No users found matching segment criteria']
        }
      }

      // Create campaign record
      await this.insertCampaign({
        campaign_id: campaignId,
        campaign_type: 'development_update',
        subject: updateData.update_title,
        segment_filter: JSON.stringify(segmentFilter),
        total_recipients: users.length,
        status: 'sending'
      })

      const errors: string[] = []
      let sentCount = 0

      // Send emails in batches to avoid rate limits
      const batchSize = 10
      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize)
        
        const batchPromises = batch.map(async (user) => {
          const templateData: DevelopmentUpdateData = {
            ...updateData,
            first_name: user.github_username || 'Developer',
            user_email: user.email,
            unsubscribe_url: `${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe?email=${encodeURIComponent(user.email)}`,
            update_date: new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long', 
              day: 'numeric'
            })
          }

          const result = await this.sendTemplateEmail({
            to_email: user.email,
            template_id: EMAIL_TEMPLATES.DEVELOPMENT_UPDATE,
            template_data: templateData,
            subject: updateData.update_title,
            user_id: user.id,
            email_type: 'update',
            campaign_id: campaignId
          })

          if (result.success) {
            sentCount++
          } else {
            errors.push(`${user.email}: ${result.error}`)
          }

          return result
        })

        await Promise.all(batchPromises)
        
        // Small delay between batches
        if (i + batchSize < users.length) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }

      // Update campaign status
      await this.updateCampaignStatus(campaignId, {
        status: 'sent',
        sent_count: sentCount,
        error_count: errors.length,
        sent_at: new Date().toISOString()
      })

      return {
        campaign_id: campaignId,
        total_sent: sentCount,
        errors
      }
    } catch (err) {
      console.error('Error sending development update:', err)
      return {
        campaign_id: '',
        total_sent: 0,
        errors: ['Failed to send development update']
      }
    }
  }

  /**
   * Send feedback request to specific users or segments
   */
  static async sendFeedbackRequest(
    feedbackData: Omit<FeedbackRequestData, 'first_name' | 'user_email' | 'unsubscribe_url' | 'request_date'>,
    targetUsers?: string[], // User IDs, if not provided will use segment
    segmentFilter?: {
      engagement_level?: 'high' | 'medium' | 'low'
      beta_status?: 'pending' | 'invited' | 'active'
    }
  ): Promise<{
    campaign_id: string;
    total_sent: number;
    errors: string[];
  }> {
    try {
      const campaignId = `feedback-${Date.now()}`
      
      let users: BetaSignup[]
      
      if (!supabaseAdmin) {
        throw new Error('Supabase admin client not available')
      }

      if (targetUsers && targetUsers.length > 0) {
        // Get specific users
        const { data, error } = await supabaseAdmin
          .from('beta_signups')
          .select('*')
          .in('id', targetUsers)
        
        if (error) {
          throw new Error(error.message)
        }
        
        users = data as BetaSignup[]
      } else {
        // Get segmented users
        users = await this.getSegmentedUsers(segmentFilter)
      }

      if (users.length === 0) {
        return {
          campaign_id: campaignId,
          total_sent: 0,
          errors: ['No users found matching criteria']
        }
      }

      // Create campaign record
      const campaignData = {
        campaign_id: campaignId,
        campaign_type: 'feedback_request',
        subject: `Help us improve Silent Scribe - ${feedbackData.feedback_type} feedback`,
        segment_filter: JSON.stringify(segmentFilter || {}),
        total_recipients: users.length,
        status: 'sending'
      }

      const { error: insertError } = await (supabaseAdmin
        .from('email_campaigns') as any)
        .insert([campaignData])
      
      if (insertError) {
        throw new Error(`Failed to record campaign: ${insertError.message}`)
      }

      const errors: string[] = []
      let sentCount = 0

      for (const user of users) {
        const templateData: FeedbackRequestData = {
          ...feedbackData,
          first_name: user.github_username || 'Developer',
          user_email: user.email,
          unsubscribe_url: `${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe?email=${encodeURIComponent(user.email)}`,
          request_date: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        }

        const result = await this.sendTemplateEmail({
          to_email: user.email,
          template_id: EMAIL_TEMPLATES.FEEDBACK_REQUEST,
          template_data: templateData,
          subject: `Help us improve Silent Scribe - ${feedbackData.feedback_type} feedback`,
          user_id: user.id,
          email_type: 'feedback_request',
          campaign_id: campaignId
        })

        if (result.success) {
          sentCount++
        } else {
          errors.push(`${user.email}: ${result.error}`)
        }

        // Small delay between emails
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // Update campaign status
      await (supabaseAdmin.from('email_campaigns') as any)
        .update({
          status: 'sent',
          sent_count: sentCount,
          error_count: errors.length,
          sent_at: new Date().toISOString()
        })
        .eq('campaign_id', campaignId)

      return {
        campaign_id: campaignId,
        total_sent: sentCount,
        errors
      }
    } catch (err) {
      console.error('Error sending feedback request:', err)
      return {
        campaign_id: '',
        total_sent: 0,
        errors: ['Failed to send feedback request']
      }
    }
  }

  /**
   * Send template email via SendGrid
   */
  private static async sendTemplateEmail({
    to_email,
    template_id,
    template_data,
    subject,
    user_id,
    email_type,
    campaign_id
  }: {
    to_email: string
    template_id: string
    template_data: EmailTemplateData
    subject: string
    user_id: string
    email_type: 'welcome' | 'update' | 'feedback_request' | 'early_access' | 're_engagement' | 'monthly_newsletter'
    campaign_id?: string
  }): Promise<{ success: boolean; error: string | null; messageId?: string }> {
    try {
      const sgMail = await import('@sendgrid/mail')
      sgMail.default.setApiKey(this.sendGridApiKey)

      const msg = {
        to: to_email,
        from: {
          email: this.fromEmail,
          name: this.fromName
        },
        templateId: template_id,
        dynamicTemplateData: template_data,
        // Custom args for tracking
        customArgs: {
          user_id,
          email_type,
          campaign_id: campaign_id || '',
          sent_at: new Date().toISOString()
        },
        // Enable click and open tracking
        trackingSettings: {
          clickTracking: { enable: true },
          openTracking: { enable: true }
        }
      }

      const [response] = await sgMail.default.send(msg)
      
      // Log the email event
      await EmailEventService.logEvent({
        user_id,
        email_type: email_type as any,
        event_type: 'sent',
        email_subject: subject,
        campaign_id: campaign_id || undefined
      })

      return { 
        success: true, 
        error: null,
        messageId: response.headers['x-message-id'] as string
      }
    } catch (err: any) {
      console.error('SendGrid error:', err)
      
      // Log failed send as sent with metadata indicating failure
      await EmailEventService.logEvent({
        user_id,
        email_type: email_type as any,
        event_type: 'sent',
        email_subject: subject,
        campaign_id: campaign_id || undefined,
        metadata: { 
          error: err.message,
          code: err.code,
          failed: true
        }
      })
      
      return { 
        success: false, 
        error: err.message || 'Failed to send email' 
      }
    }
  }

  /**
   * Get users based on segment criteria
   */
  private static async getSegmentedUsers(segmentFilter?: {
    engagement_level?: 'high' | 'medium' | 'low'
    beta_status?: 'pending' | 'invited' | 'active'
    team_size?: string[]
  }): Promise<BetaSignup[]> {
    try {
      if (!supabaseAdmin) {
        throw new Error('Supabase admin client not available')
      }

      let query = supabaseAdmin
        .from('beta_signups')
        .select('*')
        .eq('opted_in_marketing', true) // Only send to users who opted in

      if (segmentFilter?.engagement_level) {
        switch (segmentFilter.engagement_level) {
          case 'high':
            query = query.gte('engagement_score', 70)
            break
          case 'medium':
            query = query.gte('engagement_score', 30).lt('engagement_score', 70)
            break
          case 'low':
            query = query.lt('engagement_score', 30)
            break
        }
      }

      if (segmentFilter?.beta_status) {
        query = query.eq('beta_status', segmentFilter.beta_status)
      }

      if (segmentFilter?.team_size && segmentFilter.team_size.length > 0) {
        query = query.in('team_size', segmentFilter.team_size)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error getting segmented users:', error)
        return []
      }

      return data
    } catch (err) {
      console.error('Error in getSegmentedUsers:', err)
      return []
    }
  }

  /**
   * Get campaign statistics
   */
  static async getCampaignStats(campaignId: string): Promise<{
    campaign: EmailCampaign | null
    stats: {
      sent: number
      delivered: number
      opened: number
      clicked: number
      bounced: number
      open_rate: number
      click_rate: number
    } | null
    error: string | null
  }> {
    try {
      if (!supabaseAdmin) {
        throw new Error('Supabase admin client not available')
      }

      // Get campaign info
      const { data: campaign, error: campaignError } = await supabaseAdmin
        .from('email_campaigns')
        .select('*')
        .eq('campaign_id', campaignId)
        .single()

      if (campaignError) {
        return { campaign: null, stats: null, error: campaignError.message }
      }

      // Get email event stats
      const { data: stats, error: statsError } = await EmailEventService.getCampaignStats(campaignId)

      if (statsError || !stats) {
        return { campaign, stats: null, error: statsError || 'No stats available' }
      }

      const openRate = stats.delivered > 0 ? (stats.opened / stats.delivered) * 100 : 0
      const clickRate = stats.delivered > 0 ? (stats.clicked / stats.delivered) * 100 : 0

      return {
        campaign,
        stats: {
          sent: stats.sent,
          delivered: stats.delivered,
          opened: stats.opened,
          clicked: stats.clicked,
          bounced: 0, // Will be updated by webhook
          open_rate: Math.round(openRate * 100) / 100,
          click_rate: Math.round(clickRate * 100) / 100
        },
        error: null
      }
    } catch (err) {
      console.error('Error getting campaign stats:', err)
      return { campaign: null, stats: null, error: 'Failed to get campaign stats' }
    }
  }

  /**
   * Schedule a campaign for later sending
   */
  static async scheduleCampaign(
    campaignData: {
      name: string
      template_id: string
      subject: string
      template_data: Partial<EmailTemplateData>
      segment_filter?: any
      scheduled_at: string
    }
  ): Promise<{ campaign_id: string; error: string | null }> {
    try {
      if (!supabaseAdmin) {
        throw new Error('Supabase admin client not available')
      }

      const campaignId = `scheduled-${Date.now()}`

      const { error } = await (supabaseAdmin.from('email_campaigns') as any).insert([{
        campaign_id: campaignId,
        campaign_type: 'scheduled',
        ...campaignData,
        segment_filter: JSON.stringify(campaignData.segment_filter || {}),
        status: 'scheduled',
        total_recipients: 0 // Will be calculated when sent
      }])

      if (error) {
        return { campaign_id: '', error: error.message }
      }

      return { campaign_id: campaignId, error: null }
    } catch (err) {
      console.error('Error scheduling campaign:', err)
      return { campaign_id: '', error: 'Failed to schedule campaign' }
    }
  }
}
