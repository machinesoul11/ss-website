import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

/**
 * SendGrid webhook handler for email events
 *
 * Webhook URL: https://silentscribe.dev/api/sendgrid-webhook
 * Webhook ID: 6ae42398-d7a8-451a-bfdc-cfca20225273
 * Events: sent, delivered, opened, clicked, bounce, dropped, spamreport, unsubscribe
 */

// Verify webhook signature
function verifyWebhookSignature(
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const events = JSON.parse(body)

    // Verify webhook signature if configured
    const publicKey = process.env.SENDGRID_WEBHOOK_PUBLIC_KEY
    if (publicKey) {
      const signature = request.headers.get(
        'x-twilio-email-event-webhook-signature'
      )
      const timestamp = request.headers.get(
        'x-twilio-email-event-webhook-timestamp'
      )

      if (!signature || !timestamp) {
        console.error('Missing webhook signature or timestamp')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const isValid = verifyWebhookSignature(
        publicKey,
        body,
        signature,
        timestamp
      )
      if (!isValid) {
        console.error('Invalid webhook signature')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    if (!Array.isArray(events)) {
      return NextResponse.json(
        { error: 'Invalid payload format' },
        { status: 400 }
      )
    }

    // Process webhook events using our service
    const { SendGridWebhookService } = await import(
      '@/lib/services/sendgrid-webhook'
    )

    // Convert NextRequest to a format our service expects
    const mockReq = {
      body: events,
      headers: Object.fromEntries(request.headers.entries()),
    }

    const mockRes = {
      status: (code: number) => ({
        json: (data: any) => ({ status: code, data }),
      }),
    }

    await SendGridWebhookService.processWebhookEvents(
      mockReq as any,
      mockRes as any
    )

    return NextResponse.json({ success: true, processed: events.length })
  } catch (error) {
    console.error('SendGrid webhook error:', error)
    return NextResponse.json(
      { success: false, error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Handle GET requests for webhook verification
export async function GET() {
  return NextResponse.json({ message: 'SendGrid webhook endpoint' })
}
