import sgMail from '@sendgrid/mail'
import { supabaseAdmin } from './supabase'

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
  templateId?: string
  dynamicTemplateData?: Record<string, unknown>
}

export interface SendEmailOptions {
  to: string
  templateId: string
  personalData?: Record<string, string>
  campaignId?: string
}

export async function sendEmail(options: EmailOptions) {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SendGrid API key not configured')
    }

    const msg = {
      to: options.to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'hello@silentscribe.dev',
        name: 'Silent Scribe Team'
      },
      subject: options.subject,
      html: options.html,
      text: options.text,
      ...(options.templateId && {
        templateId: options.templateId,
        dynamicTemplateData: options.dynamicTemplateData,
      }),
    }

    const response = await sgMail.send(msg)
    
    // Note: Email event logging moved to calling function where user_id is available

    return { success: true, data: response }
  } catch (error) {
    console.error('Email sending failed:', error)
    return { success: false, error }
  }
}

/**
 * Send comprehensive welcome email to new beta signups
 */
export async function sendWelcomeEmail(email: string, githubUsername?: string) {
  const personalizedGreeting = githubUsername ? `Hi ${githubUsername},` : 'Hi there,'
  
  const subject = 'Welcome to the Silent Scribe Beta Program!'
  
  const text = `
${personalizedGreeting}

Welcome to the Silent Scribe beta program! We're thrilled to have you join us on this journey to create the first truly privacy-first writing assistant designed specifically for developers and technical writers.

What makes Silent Scribe different?
• 🔒 Complete Privacy: All processing happens locally on your machine
• 🛠 Developer-Focused: Built for technical documentation and code comments
• ⚡ Seamless Integration: Works directly in VS Code and your favorite editors
• 🎯 Customizable Rules: Adapt to your team's style guide and preferences

What's Next?
1. We'll be sending development updates as we build out the core features
2. You'll get early access as soon as we have a working prototype
3. Your feedback will directly shape the final product

In the meantime, feel free to:
• Join our Discord community for updates and discussions
• Follow us on Twitter @SilentScribeDev
• Check out our blog for technical deep-dives

Thank you for believing in our mission to make technical writing better while keeping your data private.

Best regards,
The Silent Scribe Team

---
Unsubscribe: https://silentscribe.dev/unsubscribe?email=${encodeURIComponent(email)}
  `
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to Silent Scribe</title>
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 40px;">
    <h1 style="color: #1f2937; margin-bottom: 10px;">Welcome to Silent Scribe!</h1>
    <p style="color: #6b7280; margin: 0;">Privacy-first writing assistance for developers</p>
  </div>
  
  <p>${personalizedGreeting}</p>
  
  <p>Welcome to the Silent Scribe beta program! We're thrilled to have you join us on this journey to create the first truly privacy-first writing assistant designed specifically for developers and technical writers.</p>
  
  <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="color: #1f2937; margin-top: 0;">What makes Silent Scribe different?</h3>
    <ul style="margin-bottom: 0;">
      <li>🔒 <strong>Complete Privacy:</strong> All processing happens locally on your machine</li>
      <li>🛠 <strong>Developer-Focused:</strong> Built for technical documentation and code comments</li>
      <li>⚡ <strong>Seamless Integration:</strong> Works directly in VS Code and your favorite editors</li>
      <li>🎯 <strong>Customizable Rules:</strong> Adapt to your team's style guide and preferences</li>
    </ul>
  </div>
  
  <h3>What's Next?</h3>
  <ol>
    <li>We'll be sending development updates as we build out the core features</li>
    <li>You'll get early access as soon as we have a working prototype</li>
    <li>Your feedback will directly shape the final product</li>
  </ol>
  
  <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h4 style="color: #1f2937; margin-top: 0;">In the meantime, feel free to:</h4>
    <p style="margin-bottom: 10px;">
      <a href="https://discord.gg/silent-scribe" style="color: #3b82f6; text-decoration: none;">• Join our Discord community</a> for updates and discussions
    </p>
    <p style="margin-bottom: 10px;">
      <a href="https://twitter.com/SilentScribeDev" style="color: #3b82f6; text-decoration: none;">• Follow us on Twitter</a> @SilentScribeDev
    </p>
    <p style="margin-bottom: 0;">
      <a href="https://silentscribe.dev/blog" style="color: #3b82f6; text-decoration: none;">• Check out our blog</a> for technical deep-dives
    </p>
  </div>
  
  <p>Thank you for believing in our mission to make technical writing better while keeping your data private.</p>
  
  <p>Best regards,<br><strong>The Silent Scribe Team</strong></p>
  
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 40px 0 20px;">
  <p style="font-size: 12px; color: #9ca3af; text-align: center;">
    <a href="https://silentscribe.dev/unsubscribe?email=${encodeURIComponent(email)}" style="color: #9ca3af;">Unsubscribe</a>
  </p>
</body>
</html>
  `

  return sendEmail({
    to: email,
    subject,
    html,
    text,
    templateId: 'welcome'
  })
}

/**
 * Send development update email to beta users
 */
export async function sendDevelopmentUpdate(
  email: string, 
  updateContent: string,
  githubUsername?: string
): Promise<{ success: boolean; data?: any; error?: any }> {
  const personalizedGreeting = githubUsername ? `Hi ${githubUsername},` : 'Hi there,'
  
  const subject = 'Silent Scribe Development Update'
  
  const text = `
${personalizedGreeting}

Here's the latest update on Silent Scribe development:

${updateContent}

We're making great progress and can't wait to get this into your hands!

Best regards,
The Silent Scribe Team

---
Unsubscribe: https://silentscribe.dev/unsubscribe?email=${encodeURIComponent(email)}
  `
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Silent Scribe Development Update</title>
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 40px;">
    <h1 style="color: #1f2937; margin-bottom: 10px;">Development Update</h1>
    <p style="color: #6b7280; margin: 0;">Latest progress on Silent Scribe</p>
  </div>
  
  <p>${personalizedGreeting}</p>
  
  <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
    ${updateContent.split('\n').map(line => line.trim() ? `<p>${line}</p>` : '').join('')}
  </div>
  
  <p>We're making great progress and can't wait to get this into your hands!</p>
  
  <p>Best regards,<br><strong>The Silent Scribe Team</strong></p>
  
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 40px 0 20px;">
  <p style="font-size: 12px; color: #9ca3af; text-align: center;">
    <a href="https://silentscribe.dev/unsubscribe?email=${encodeURIComponent(email)}" style="color: #9ca3af;">Unsubscribe</a>
  </p>
</body>
</html>
  `

  return sendEmail({
    to: email,
    subject,
    html,
    text,
    templateId: 'development_update'
  })
}

/**
 * Send feedback request email
 */
export async function sendFeedbackRequest(email: string, githubUsername?: string): Promise<{ success: boolean; data?: any; error?: any }> {
  const personalizedGreeting = githubUsername ? `Hi ${githubUsername},` : 'Hi there,'
  
  const subject = "We'd love your feedback on Silent Scribe"
  
  const text = `
${personalizedGreeting}

We hope you're excited about Silent Scribe! As we continue building, your input is invaluable.

We'd love to hear:
• What features are you most excited about?
• What pain points are we missing?
• How do you currently handle writing assistance?
• Any specific style guides or workflows we should consider?

Reply to this email or visit our feedback page: https://silentscribe.dev/feedback

Thank you for being part of our beta community!

Best regards,
The Silent Scribe Team

---
Unsubscribe: https://silentscribe.dev/unsubscribe?email=${encodeURIComponent(email)}
  `
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Silent Scribe Feedback Request</title>
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 40px;">
    <h1 style="color: #1f2937; margin-bottom: 10px;">We'd love your feedback!</h1>
    <p style="color: #6b7280; margin: 0;">Help us build the perfect writing assistant</p>
  </div>
  
  <p>${personalizedGreeting}</p>
  
  <p>We hope you're excited about Silent Scribe! As we continue building, your input is invaluable.</p>
  
  <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="color: #1f2937; margin-top: 0;">We'd love to hear:</h3>
    <ul>
      <li>What features are you most excited about?</li>
      <li>What pain points are we missing?</li>
      <li>How do you currently handle writing assistance?</li>
      <li>Any specific style guides or workflows we should consider?</li>
    </ul>
  </div>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="https://silentscribe.dev/feedback" style="background: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">Share Your Feedback</a>
  </div>
  
  <p>Reply to this email or visit our feedback page if the button doesn't work.</p>
  
  <p>Thank you for being part of our beta community!</p>
  
  <p>Best regards,<br><strong>The Silent Scribe Team</strong></p>
  
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 40px 0 20px;">
  <p style="font-size: 12px; color: #9ca3af; text-align: center;">
    <a href="https://silentscribe.dev/unsubscribe?email=${encodeURIComponent(email)}" style="color: #9ca3af;">Unsubscribe</a>
  </p>
</body>
</html>
  `

  return sendEmail({
    to: email,
    subject,
    html,
    text,
    templateId: 'feedback_request'
  })
}

/**
 * Send re-engagement email to inactive users
 */
export async function sendReEngagementEmail(email: string, githubUsername?: string): Promise<{ success: boolean; data?: any; error?: any }> {
  const personalizedGreeting = githubUsername ? `Hi ${githubUsername},` : 'Hi there,'
  
  const subject = "We miss you! Silent Scribe updates inside"
  
  const text = `
${personalizedGreeting}

We noticed you haven't engaged with our recent updates, and we wanted to reach out!

Silent Scribe has made significant progress since you joined our beta program:
• Core linting engine is now functional
• VS Code extension alpha is ready for testing  
• Privacy-first architecture fully implemented
• Custom style guide support added

We'd hate for you to miss out on early access. If you're still interested in helping us build the future of technical writing tools, we'd love to have you back!

What you can do:
• Reply to let us know you're still interested
• Visit our progress page: https://silentscribe.dev/progress
• Join our Discord for real-time updates

If you're no longer interested, no worries! You can unsubscribe below.

Best regards,
The Silent Scribe Team

---
Unsubscribe: https://silentscribe.dev/unsubscribe?email=${encodeURIComponent(email)}
  `
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>We Miss You - Silent Scribe Update</title>
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 40px;">
    <h1 style="color: #1f2937; margin-bottom: 10px;">We miss you! 🚀</h1>
    <p style="color: #6b7280; margin: 0;">Silent Scribe has made incredible progress</p>
  </div>
  
  <p>${personalizedGreeting}</p>
  
  <p>We noticed you haven't engaged with our recent updates, and we wanted to reach out!</p>
  
  <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
    <h3 style="color: #1f2937; margin-top: 0;">Silent Scribe has made significant progress:</h3>
    <ul style="margin-bottom: 0;">
      <li>✅ Core linting engine is now functional</li>
      <li>🔧 VS Code extension alpha is ready for testing</li>
      <li>🔒 Privacy-first architecture fully implemented</li>
      <li>📝 Custom style guide support added</li>
    </ul>
  </div>
  
  <p>We'd hate for you to miss out on early access. If you're still interested in helping us build the future of technical writing tools, we'd love to have you back!</p>
  
  <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h4 style="color: #1f2937; margin-top: 0;">What you can do:</h4>
    <p style="margin-bottom: 10px;">
      <a href="mailto:hello@silentscribe.dev?subject=Re-engagement%20Response" style="color: #3b82f6; text-decoration: none;">• Reply to let us know you're still interested</a>
    </p>
    <p style="margin-bottom: 10px;">
      <a href="https://silentscribe.dev/progress" style="color: #3b82f6; text-decoration: none;">• Visit our progress page</a> to see what we've built
    </p>
    <p style="margin-bottom: 0;">
      <a href="https://discord.gg/silent-scribe" style="color: #3b82f6; text-decoration: none;">• Join our Discord</a> for real-time updates
    </p>
  </div>
  
  <p>If you're no longer interested, no worries! You can unsubscribe below.</p>
  
  <p>Best regards,<br><strong>The Silent Scribe Team</strong></p>
  
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 40px 0 20px;">
  <p style="font-size: 12px; color: #9ca3af; text-align: center;">
    <a href="https://silentscribe.dev/unsubscribe?email=${encodeURIComponent(email)}" style="color: #9ca3af;">Unsubscribe</a>
  </p>
</body>
</html>
  `

  return sendEmail({
    to: email,
    subject,
    html,
    text,
    templateId: 're_engagement'
  })
}

/**
 * Send early access invitation email
 */
export async function sendEarlyAccessInvite(email: string, downloadLink: string, githubUsername?: string): Promise<{ success: boolean; data?: any; error?: any }> {
  const personalizedGreeting = githubUsername ? `Hi ${githubUsername},` : 'Hi there,'
  
  const subject = "🎉 Your Silent Scribe early access is ready!"
  
  const text = `
${personalizedGreeting}

The moment you've been waiting for is here! Silent Scribe is ready for early access testing.

Your early access includes:
• VS Code extension with real-time linting
• Support for Markdown, MDX, and code comments
• Privacy-first architecture (nothing leaves your machine)
• Pre-configured style guides for technical writing
• Custom rule configuration

Download your early access version:
${downloadLink}

Installation instructions and documentation:
https://silentscribe.dev/docs/early-access

We'd love your feedback as you use it! Report issues or share thoughts:
• GitHub Issues: https://github.com/silent-scribe/extension/issues
• Discord: https://discord.gg/silent-scribe
• Email: feedback@silentscribe.dev

Thank you for being an early supporter!

Best regards,
The Silent Scribe Team

---
Unsubscribe: https://silentscribe.dev/unsubscribe?email=${encodeURIComponent(email)}
  `
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your Silent Scribe Early Access is Ready!</title>
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 40px;">
    <h1 style="color: #1f2937; margin-bottom: 10px;">🎉 Early Access is Ready!</h1>
    <p style="color: #6b7280; margin: 0;">Your Silent Scribe download awaits</p>
  </div>
  
  <p>${personalizedGreeting}</p>
  
  <p>The moment you've been waiting for is here! Silent Scribe is ready for early access testing.</p>
  
  <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
    <h3 style="color: #1f2937; margin-top: 0;">Your early access includes:</h3>
    <ul style="margin-bottom: 0;">
      <li>🔧 VS Code extension with real-time linting</li>
      <li>📝 Support for Markdown, MDX, and code comments</li>
      <li>🔒 Privacy-first architecture (nothing leaves your machine)</li>
      <li>📋 Pre-configured style guides for technical writing</li>
      <li>⚙️ Custom rule configuration</li>
    </ul>
  </div>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="${downloadLink}" style="background: #10b981; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: 600; font-size: 16px;">Download Silent Scribe</a>
  </div>
  
  <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p style="margin-bottom: 10px; font-weight: 600;">Need help getting started?</p>
    <p style="margin-bottom: 10px;">
      <a href="https://silentscribe.dev/docs/early-access" style="color: #3b82f6; text-decoration: none;">📖 Installation instructions and documentation</a>
    </p>
  </div>
  
  <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p style="margin-bottom: 10px; font-weight: 600;">We'd love your feedback:</p>
    <p style="margin-bottom: 10px;">
      <a href="https://github.com/silent-scribe/extension/issues" style="color: #3b82f6; text-decoration: none;">🐛 Report issues on GitHub</a>
    </p>
    <p style="margin-bottom: 10px;">
      <a href="https://discord.gg/silent-scribe" style="color: #3b82f6; text-decoration: none;">💬 Join our Discord community</a>
    </p>
    <p style="margin-bottom: 0;">
      <a href="mailto:feedback@silentscribe.dev" style="color: #3b82f6; text-decoration: none;">📧 Email us directly</a>
    </p>
  </div>
  
  <p>Thank you for being an early supporter!</p>
  
  <p>Best regards,<br><strong>The Silent Scribe Team</strong></p>
  
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 40px 0 20px;">
  <p style="font-size: 12px; color: #9ca3af; text-align: center;">
    <a href="https://silentscribe.dev/unsubscribe?email=${encodeURIComponent(email)}" style="color: #9ca3af;">Unsubscribe</a>
  </p>
</body>
</html>
  `

  return sendEmail({
    to: email,
    subject,
    html,
    text,
    templateId: 'early_access'
  })
}

/**
 * Create and track email campaign
 */
export async function createCampaign(campaignData: {
  type: string
  subject: string
  segmentFilter: string
  scheduledAt?: string
  testMode?: boolean
}): Promise<{ id: string; campaignId: string }> {
  const campaignId = `camp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  const { data, error } = await supabaseAdmin
    .from('email_campaigns')
    .insert({
      campaign_id: campaignId,
      campaign_type: campaignData.type,
      subject: campaignData.subject,
      segment_filter: campaignData.segmentFilter,
      scheduled_at: campaignData.scheduledAt,
      test_mode: campaignData.testMode || false,
      status: campaignData.scheduledAt ? 'scheduled' : 'draft',
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create campaign: ${error.message}`)
  }

  return { id: data.id, campaignId }
}

/**
 * Get available email templates
 */
export async function getEmailTemplates(): Promise<{
  welcome: string
  development_update: string
  feedback_request: string
  early_access: string
  re_engagement: string
}> {
  // In a real implementation, these would come from SendGrid template IDs
  // For now, return the template types we support
  return {
    welcome: 'welcome_template_id',
    development_update: 'dev_update_template_id', 
    feedback_request: 'feedback_template_id',
    early_access: 'early_access_template_id',
    re_engagement: 're_engagement_template_id'
  }
}

/**
 * Handle SendGrid webhook events including bounces and spam complaints
 */
export async function handleSendGridWebhook(events: any[]): Promise<void> {
  for (const event of events) {
    // Process all event types including bounces and spam complaints
    const supportedEvents = ['sent', 'delivered', 'opened', 'clicked', 'bounce', 'dropped', 'spamreport', 'unsubscribe']
    if (!supportedEvents.includes(event.event)) {
      console.warn(`Unsupported event type: ${event.event}`)
      continue
    }

    // Find user by email to get user_id
    const { data: user } = await supabaseAdmin
      .from('beta_signups')
      .select('id')
      .eq('email', event.email)
      .single()

    if (!user) {
      console.warn(`User not found for email: ${event.email}`)
      continue
    }

    // Handle special cases for bounces and spam complaints
    if (event.event === 'bounce' || event.event === 'dropped') {
      await handleEmailBounce(event.email, event.reason, event)
    } else if (event.event === 'spamreport') {
      await handleSpamComplaint(event.email, event)
    } else if (event.event === 'unsubscribe') {
      await handleUnsubscribeEvent(event.email, event)
    }

    // Log all events for analytics
    await logEmailEvent({
      userId: user.id,
      emailType: event.email_type || 'update',
      eventType: event.event as 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounce' | 'dropped' | 'spamreport' | 'unsubscribe',
      emailSubject: event.subject || 'Unknown Subject',
      campaignId: event.campaign_id,
      metadata: {
        timestamp: event.timestamp,
        sg_event_id: event.sg_event_id,
        ip: event.ip,
        useragent: event.useragent,
        url: event.url, // for click events
        bounce_reason: event.reason, // for bounces
        bounce_type: event.type, // hard or soft bounce
        status: event.status,
        response: event.response
      }
    })
  }
}

/**
 * Handle email bounces - mark users as undeliverable if hard bounce
 */
async function handleEmailBounce(email: string, reason: string, event: any): Promise<void> {
  try {
    // Check if it's a hard bounce (permanent failure)
    const hardBounceReasons = ['550', '551', '553', '554', '556']
    const isHardBounce = hardBounceReasons.some(code => event.status?.includes(code)) || event.type === 'bounce'

    if (isHardBounce) {
      // Mark user as undeliverable to prevent future sends
      await supabaseAdmin
        .from('beta_signups')
        .update({ 
          opted_in_marketing: false,
          email_status: 'bounced',
          bounce_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('email', email)

      console.log(`Marked email as bounced: ${email} - Reason: ${reason}`)
    }

    // Log bounce for monitoring
    await supabaseAdmin
      .from('email_bounces')
      .insert({
        email,
        bounce_type: isHardBounce ? 'hard' : 'soft',
        reason,
        status_code: event.status,
        response_text: event.response,
        sg_event_id: event.sg_event_id,
        timestamp: new Date().toISOString()
      })

  } catch (error) {
    console.error(`Failed to handle bounce for ${email}:`, error)
  }
}

/**
 * Handle spam complaints - immediately unsubscribe and flag
 */
async function handleSpamComplaint(email: string, event: any): Promise<void> {
  try {
    // Immediately unsubscribe user who reported spam
    await supabaseAdmin
      .from('beta_signups')
      .update({ 
        opted_in_marketing: false,
        opted_in_research: false,
        email_status: 'spam_complaint',
        updated_at: new Date().toISOString()
      })
      .eq('email', email)

    // Log spam complaint for review
    await supabaseAdmin
      .from('spam_complaints')
      .insert({
        email,
        sg_event_id: event.sg_event_id,
        timestamp: new Date().toISOString(),
        metadata: {
          user_agent: event.useragent,
          ip: event.ip
        }
      })

    console.log(`Processed spam complaint for: ${email}`)

  } catch (error) {
    console.error(`Failed to handle spam complaint for ${email}:`, error)
  }
}

/**
 * Handle unsubscribe events from email links
 */
async function handleUnsubscribeEvent(email: string, _event: any): Promise<void> {
  try {
    await supabaseAdmin
      .from('beta_signups')
      .update({ 
        opted_in_marketing: false,
        email_status: 'unsubscribed',
        updated_at: new Date().toISOString()
      })
      .eq('email', email)

    console.log(`Processed unsubscribe for: ${email}`)

  } catch (error) {
    console.error(`Failed to handle unsubscribe for ${email}:`, error)
  }
}

/**
 * Get user segments for targeted campaigns
 */
export async function getUserSegments(): Promise<{
  highEngagement: string[]
  hasGitHub: string[]
  largeTeams: string[]
  recentSignups: string[]
  inactiveUsers: string[]
}> {
  const { data: users } = await supabaseAdmin
    .from('beta_signups')
    .select('id, email, engagement_score, github_username, team_size, created_at')
    .eq('opted_in_marketing', true)

  if (!users) return { highEngagement: [], hasGitHub: [], largeTeams: [], recentSignups: [], inactiveUsers: [] }

  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  // Get users who haven't had any email events in the last 2 weeks
  const { data: recentEmailActivity } = await supabaseAdmin
    .from('email_events')
    .select('user_id')
    .gte('timestamp', twoWeeksAgo.toISOString())

  const activeUserIds = new Set(recentEmailActivity?.map(e => e.user_id) || [])

  return {
    highEngagement: users
      .filter(u => u.engagement_score > 70)
      .map(u => u.email),
    hasGitHub: users
      .filter(u => u.github_username)
      .map(u => u.email),
    largeTeams: users
      .filter(u => u.team_size && !['individual', 'small_team'].includes(u.team_size))
      .map(u => u.email),
    recentSignups: users
      .filter(u => new Date(u.created_at) > weekAgo)
      .map(u => u.email),
    inactiveUsers: users
      .filter(u => {
        // Find user ID for this email
        const userId = u.id || null
        return userId && !activeUserIds.has(userId) && new Date(u.created_at) < twoWeeksAgo
      })
      .map(u => u.email)
  }
}

// Helper functions

interface EmailEventOptions {
  userId: string
  emailType: 'welcome' | 'update' | 'early_access' | 'feedback_request' | 're_engagement'
  eventType: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounce' | 'dropped' | 'spamreport' | 'unsubscribe'
  emailSubject: string
  campaignId?: string
  metadata?: Record<string, any>
}

async function logEmailEvent(options: EmailEventOptions): Promise<void> {
  try {
    await supabaseAdmin
      .from('email_events')
      .insert({
        user_id: options.userId,
        email_type: options.emailType,
        event_type: options.eventType,
        email_subject: options.emailSubject,
        campaign_id: options.campaignId,
        metadata: options.metadata,
      })
  } catch (error) {
    console.error('Failed to log email event:', error)
    // Don't throw - email events are not critical
  }
}
