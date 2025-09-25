import sgMail from '@sendgrid/mail'

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
  templateId?: string
  dynamicTemplateData?: Record<string, unknown>
}

export async function sendEmail(options: EmailOptions) {
  try {
    const msg = {
      to: options.to,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@silentscribe.dev',
      subject: options.subject,
      html: options.html,
      text: options.text,
      ...(options.templateId && {
        templateId: options.templateId,
        dynamicTemplateData: options.dynamicTemplateData,
      }),
    }

    const response = await sgMail.send(msg)
    return { success: true, data: response }
  } catch (error) {
    console.error('Email sending failed:', error)
    return { success: false, error }
  }
}

export async function sendWelcomeEmail(email: string) {
  return sendEmail({
    to: email,
    subject: 'Welcome to Silent Scribe Beta!',
    html: `
      <h1>Welcome to Silent Scribe!</h1>
      <p>Thank you for signing up for our beta program.</p>
      <p>We'll keep you updated on our progress and let you know when early access becomes available.</p>
      <p>Best regards,<br>The Silent Scribe Team</p>
    `,
    text: `Welcome to Silent Scribe! Thank you for signing up for our beta program. We'll keep you updated on our progress and let you know when early access becomes available.`,
  })
}
