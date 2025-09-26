import { NextRequest, NextResponse } from 'next/server'
import { SendGridWebhookService } from '@/lib/services'

/**
 * Email Health Monitoring API
 * GET /api/email-health - Get deliverability metrics and health status
 */
export async function GET(request: NextRequest) {
  try {
    // Basic auth check
    const authHeader = request.headers.get('authorization')
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    if (days < 1 || days > 365) {
      return NextResponse.json(
        { error: 'Days parameter must be between 1 and 365' },
        { status: 400 }
      )
    }

    // Use our new comprehensive service
    const healthMetrics =
      await SendGridWebhookService.getDeliverabilityMetrics(days)

    return NextResponse.json({
      success: true,
      period: `${days} days`,
      ...healthMetrics,
    })
  } catch (error) {
    console.error('Email health API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch email health metrics' },
      { status: 500 }
    )
  }
}
