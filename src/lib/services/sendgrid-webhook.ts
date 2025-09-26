import { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'
import { EmailEventService } from '@/lib/services'

/**
 * SendGrid Webhook Handler
 * Processes delivery events: sent, delivered, opened, clicked, bounce, dropped, spamreport, unsubscribe
 *
 * Webhook ID: 6ae42398-d7a8-451a-bfdc-cfca20225273
 * Events: sent, delivered, opened, clicked, bounce, dropped, spamreport, unsubscribe
 */

interface SendGridEvent {
  email: string
  timestamp: number
  event:
    | 'delivered'
    | 'opened'
    | 'clicked'
    | 'bounce'
    | 'dropped'
    | 'spamreport'
    | 'unsubscribe'
  sg_event_id: string
  sg_message_id: string
  useragent?: string
  ip?: string
  url?: string
  reason?: string
  status?: string
  response?: string
  bounce_classification?: string
  type?: string
  // Custom args we send with emails
  user_id?: string
  email_type?: string
  campaign_id?: string
  sent_at?: string
}

export class SendGridWebhookService {
  private static verifyWebhookSignature(
    publicKey: string,
    payload: string,
    signature: string,
    timestamp: string
  ): boolean {
    try {
      const timestampedPayload = timestamp + payload
      const expectedSignature = crypto
        .createHmac('sha256', publicKey)
        .update(timestampedPayload)
        .digest('base64')

      return crypto.timingSafeEqual(
        Buffer.from(signature, 'base64'),
        Buffer.from(expectedSignature, 'base64')
      )
    } catch (err) {
      console.error('Error verifying webhook signature:', err)
      return false
    }
  }

  /**
   * Process SendGrid webhook events
   */
  static async processWebhookEvents(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<void> {
    try {
      // Verify webhook signature if public key is configured
      const publicKey = process.env.SENDGRID_WEBHOOK_PUBLIC_KEY
      if (publicKey) {
        const signature = req.headers[
          'x-twilio-email-event-webhook-signature'
        ] as string
        const timestamp = req.headers[
          'x-twilio-email-event-webhook-timestamp'
        ] as string
        const payload = JSON.stringify(req.body)

        if (!signature || !timestamp) {
          console.error('Missing webhook signature or timestamp')
          return res.status(401).json({ error: 'Unauthorized' })
        }

        const isValid = this.verifyWebhookSignature(
          publicKey,
          payload,
          signature,
          timestamp
        )
        if (!isValid) {
          console.error('Invalid webhook signature')
          return res.status(401).json({ error: 'Unauthorized' })
        }
      }

      const events: SendGridEvent[] = Array.isArray(req.body)
        ? req.body
        : [req.body]

      for (const event of events) {
        await this.processEvent(event)
      }

      res.status(200).json({ message: 'Events processed successfully' })
    } catch (err) {
      console.error('Error processing SendGrid webhook:', err)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  /**
   * Process individual SendGrid event
   */
  private static async processEvent(event: SendGridEvent): Promise<void> {
    try {
      console.log('Processing SendGrid event:', {
        event: event.event,
        email: event.email,
        sg_event_id: event.sg_event_id,
      })

      // Map SendGrid event types to our database event types
      let eventType: 'sent' | 'delivered' | 'opened' | 'clicked'

      switch (event.event) {
        case 'delivered':
          eventType = 'delivered'
          break
        case 'opened':
          eventType = 'opened'
          break
        case 'clicked':
          eventType = 'clicked'
          break
        case 'bounce':
        case 'dropped':
        case 'spamreport':
          // Handle bounces and spam reports separately
          await this.handleBounceOrSpam(event)
          return
        case 'unsubscribe':
          await this.handleUnsubscribe(event)
          return
        default:
          console.log('Unhandled event type:', event.event)
          return
      }

      // Find user_id from custom args or email lookup
      let userId = event.user_id

      if (!userId) {
        // Fallback: lookup user by email
        const { BetaSignupService } = await import('@/lib/services')
        const { data: user } = await BetaSignupService.getByEmail(event.email)

        if (user) {
          userId = user.id
        } else {
          console.log('User not found for email:', event.email)
          return
        }
      }

      // Log the email event
      const { error } = await EmailEventService.logEvent({
        user_id: userId,
        email_type: (event.email_type as any) || 'unknown',
        event_type: eventType,
        campaign_id: event.campaign_id || undefined,
        metadata: {
          sg_event_id: event.sg_event_id,
          sg_message_id: event.sg_message_id,
          timestamp: event.timestamp,
          ip: event.ip,
          useragent: event.useragent,
          url: event.url, // For click events
        },
      })

      if (error) {
        console.error('Error logging email event:', error)
      }
    } catch (err) {
      console.error('Error processing event:', err, event)
    }
  }

  /**
   * Handle bounce, dropped, or spam report events
   */
  private static async handleBounceOrSpam(event: SendGridEvent): Promise<void> {
    try {
      const { supabaseAdmin } = await import('@/lib/supabase')

      if (event.event === 'bounce' || event.event === 'dropped') {
        // Log to bounces table
        await supabaseAdmin.from('email_bounces').insert([
          {
            email: event.email,
            bounce_type: event.type === 'bounce' ? 'hard' : 'soft',
            reason: event.reason,
            status_code: event.status,
            response_text: event.response,
            sg_event_id: event.sg_event_id,
          },
        ])

        // Update user email status
        await supabaseAdmin
          .from('beta_signups')
          .update({
            email_status: 'bounced',
            bounce_reason: event.reason,
            updated_at: new Date().toISOString(),
          })
          .eq('email', event.email)
      } else if (event.event === 'spamreport') {
        // Log spam complaint
        await supabaseAdmin.from('spam_complaints').insert([
          {
            email: event.email,
            sg_event_id: event.sg_event_id,
            metadata: {
              sg_message_id: event.sg_message_id,
              timestamp: event.timestamp,
            },
          },
        ])

        // Update user email status
        await supabaseAdmin
          .from('beta_signups')
          .update({
            email_status: 'spam_complaint',
            updated_at: new Date().toISOString(),
          })
          .eq('email', event.email)
      }
    } catch (err) {
      console.error('Error handling bounce/spam event:', err)
    }
  }

  /**
   * Handle unsubscribe events
   */
  private static async handleUnsubscribe(event: SendGridEvent): Promise<void> {
    try {
      const { supabaseAdmin } = await import('@/lib/supabase')

      // Update user marketing opt-in status
      await supabaseAdmin
        .from('beta_signups')
        .update({
          opted_in_marketing: false,
          email_status: 'unsubscribed',
          updated_at: new Date().toISOString(),
        })
        .eq('email', event.email)

      // Log the unsubscribe event for tracking
      const { BetaSignupService } = await import('@/lib/services')
      const { data: user } = await BetaSignupService.getByEmail(event.email)

      if (user) {
        await EmailEventService.logEvent({
          user_id: user.id,
          email_type: 'system' as any,
          event_type: 'clicked', // Use clicked as closest analog
          campaign_id: event.campaign_id || undefined,
          metadata: {
            action: 'unsubscribe',
            sg_event_id: event.sg_event_id,
            timestamp: event.timestamp,
          },
        })
      }
    } catch (err) {
      console.error('Error handling unsubscribe event:', err)
    }
  }

  /**
   * Get email deliverability health metrics
   */
  static async getDeliverabilityMetrics(days = 30): Promise<{
    metrics: {
      total_sent: number
      delivered_rate: number
      open_rate: number
      click_rate: number
      bounce_rate: number
      spam_rate: number
      unsubscribe_rate: number
    }
    issues: string[]
  }> {
    try {
      const { supabaseAdmin } = await import('@/lib/supabase')
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      // Get email events from last N days
      const { data: events, error: eventsError } = await supabaseAdmin
        .from('email_events')
        .select('event_type')
        .gte('timestamp', startDate.toISOString())

      if (eventsError) {
        throw new Error(eventsError.message)
      }

      // Get bounces
      const { count: bounces, error: bouncesError } = await supabaseAdmin
        .from('email_bounces')
        .select('id', { count: 'exact' })
        .gte('timestamp', startDate.toISOString())

      if (bouncesError) {
        throw new Error(bouncesError.message)
      }

      // Get spam complaints
      const { count: spamComplaints, error: spamError } = await supabaseAdmin
        .from('spam_complaints')
        .select('id', { count: 'exact' })
        .gte('timestamp', startDate.toISOString())

      if (spamError) {
        throw new Error(spamError.message)
      }

      // Get unsubscribes
      const { count: unsubscribes, error: unsubError } = await supabaseAdmin
        .from('beta_signups')
        .select('id', { count: 'exact' })
        .eq('opted_in_marketing', false)
        .gte('updated_at', startDate.toISOString())

      if (unsubError) {
        throw new Error(unsubError.message)
      }

      // Calculate metrics
      const sent = events.filter((e) => e.event_type === 'sent').length
      const delivered = events.filter(
        (e) => e.event_type === 'delivered'
      ).length
      const opened = events.filter((e) => e.event_type === 'opened').length
      const clicked = events.filter((e) => e.event_type === 'clicked').length

      const deliveredRate = sent > 0 ? (delivered / sent) * 100 : 0
      const openRate = delivered > 0 ? (opened / delivered) * 100 : 0
      const clickRate = delivered > 0 ? (clicked / delivered) * 100 : 0
      const bounceRate = sent > 0 ? ((bounces || 0) / sent) * 100 : 0
      const spamRate = sent > 0 ? ((spamComplaints || 0) / sent) * 100 : 0
      const unsubscribeRate = sent > 0 ? ((unsubscribes || 0) / sent) * 100 : 0

      // Identify potential issues
      const issues: string[] = []

      if (deliveredRate < 95) {
        issues.push(
          `Low delivery rate: ${deliveredRate.toFixed(1)}% (target: >95%)`
        )
      }

      if (bounceRate > 5) {
        issues.push(`High bounce rate: ${bounceRate.toFixed(1)}% (target: <5%)`)
      }

      if (spamRate > 0.1) {
        issues.push(
          `High spam complaint rate: ${spamRate.toFixed(2)}% (target: <0.1%)`
        )
      }

      if (openRate < 20) {
        issues.push(`Low open rate: ${openRate.toFixed(1)}% (typical: 20-30%)`)
      }

      return {
        metrics: {
          total_sent: sent,
          delivered_rate: Math.round(deliveredRate * 100) / 100,
          open_rate: Math.round(openRate * 100) / 100,
          click_rate: Math.round(clickRate * 100) / 100,
          bounce_rate: Math.round(bounceRate * 100) / 100,
          spam_rate: Math.round(spamRate * 100) / 100,
          unsubscribe_rate: Math.round(unsubscribeRate * 100) / 100,
        },
        issues,
      }
    } catch (err) {
      console.error('Error getting deliverability metrics:', err)
      return {
        metrics: {
          total_sent: 0,
          delivered_rate: 0,
          open_rate: 0,
          click_rate: 0,
          bounce_rate: 0,
          spam_rate: 0,
          unsubscribe_rate: 0,
        },
        issues: ['Failed to fetch deliverability metrics'],
      }
    }
  }
}
