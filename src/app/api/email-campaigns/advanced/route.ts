import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { EmailCampaignService } from '@/lib/services/email-campaigns'
import { EmailOptimizationService } from '@/lib/services/email-optimization'

/**
 * Advanced Email Campaign Management API
 * Handles welcome series, A/B testing, optimization, and analytics
 */

// Enhanced campaign schemas
const welcomeSeriesSchema = z.object({
  user_ids: z.array(z.string()).min(1, 'At least one user ID required'),
  series_type: z.enum(['day_3', 'week_1']),
  schedule_delay_hours: z.number().optional().default(0),
})

const abTestSchema = z.object({
  campaign_type: z.enum([
    'development_update',
    'newsletter',
    'feedback_request',
  ]),
  test_name: z.string().min(1, 'Test name is required'),
  test_type: z.enum(['subject_line', 'send_time', 'content', 'sender_name']),
  variant_a: z.object({
    name: z.string(),
    subject: z.string().optional(),
    content: z.string().optional(),
    send_hour: z.number().optional(),
    sender_name: z.string().optional(),
  }),
  variant_b: z.object({
    name: z.string(),
    subject: z.string().optional(),
    content: z.string().optional(),
    send_hour: z.number().optional(),
    sender_name: z.string().optional(),
  }),
  split_percentage: z.number().min(10).max(90).default(50),
  sample_size: z.number().min(20).max(1000).default(100),
  duration_hours: z.number().min(24).max(168).default(72),
  success_metric: z.enum(['open_rate', 'click_rate']).default('open_rate'),
  segment_filter: z
    .object({
      engagement_level: z.enum(['high', 'medium', 'low']).optional(),
      team_size: z.array(z.string()).optional(),
      beta_status: z.enum(['pending', 'invited', 'active']).optional(),
    })
    .optional(),
})

const earlyAccessSchema = z.object({
  user_ids: z.array(z.string()).min(1, 'At least one user ID required'),
  access_level: z.enum(['alpha', 'beta', 'preview']),
  download_link: z.string().url().optional(),
  instructions_link: z.string().url().optional(),
  exclusive_features: z
    .array(z.string())
    .min(1, 'At least one feature required'),
  personal_message: z.string().optional(),
})

const reEngagementSchema = z.object({
  inactivity_threshold_days: z.number().min(7).max(180).default(30),
  exclude_recent_openers: z.boolean().default(true),
  include_incentive: z.boolean().default(false),
  custom_message: z.string().optional(),
})

/**
 * POST /api/email-campaigns/advanced
 * Handle advanced email campaign operations
 */
export async function POST(request: NextRequest) {
  try {
    // Basic auth check
    const authHeader = request.headers.get('authorization')
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const action = url.searchParams.get('action')

    if (!action) {
      return NextResponse.json(
        {
          error: 'Action parameter required',
          available_actions: [
            'welcome_series',
            'early_access',
            're_engagement',
            'monthly_newsletter',
            'ab_test',
            'optimization_analysis',
          ],
        },
        { status: 400 }
      )
    }

    const body = await request.json()

    switch (action) {
      case 'welcome_series':
        return await handleWelcomeSeries(body)

      case 'early_access':
        return await handleEarlyAccess(body)

      case 're_engagement':
        return await handleReEngagement(body)

      case 'monthly_newsletter':
        return await handleMonthlyNewsletter(body)

      case 'ab_test':
        return await handleABTest(body)

      case 'optimization_analysis':
        return await handleOptimizationAnalysis(body)

      default:
        return NextResponse.json(
          {
            error: `Unknown action: ${action}`,
          },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Advanced campaign error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.issues,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/email-campaigns/advanced
 * Get campaign analytics and performance data
 */
export async function GET(request: NextRequest) {
  try {
    // Basic auth check
    const authHeader = request.headers.get('authorization')
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const type = url.searchParams.get('type')
    const timeframe =
      (url.searchParams.get('timeframe') as 'week' | 'month' | 'quarter') ||
      'month'

    switch (type) {
      case 'engagement':
        const analytics =
          await EmailOptimizationService.getEngagementAnalytics(timeframe)
        return NextResponse.json({
          success: true,
          data: analytics.analytics,
          error: analytics.error,
        })

      case 'send_times':
        const sendTimeAnalysis =
          await EmailOptimizationService.analyzeOptimalSendTimes()
        return NextResponse.json({
          success: true,
          data: sendTimeAnalysis.analysis,
          error: sendTimeAnalysis.error,
        })

      case 'ab_test':
        const testId = url.searchParams.get('test_id')
        if (!testId) {
          return NextResponse.json(
            {
              error: 'test_id parameter required for A/B test results',
            },
            { status: 400 }
          )
        }

        const abResults = await EmailOptimizationService.analyzeABTest(testId)
        return NextResponse.json({
          success: true,
          data: abResults.results,
          error: abResults.error,
        })

      default:
        return NextResponse.json(
          {
            error: 'Type parameter required',
            available_types: ['engagement', 'send_times', 'ab_test'],
          },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Get analytics error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve analytics',
      },
      { status: 500 }
    )
  }
}

// Handler functions for different campaign types
async function handleWelcomeSeries(body: unknown) {
  const data = welcomeSeriesSchema.parse(body)

  const results = []
  const errors = []

  for (const userId of data.user_ids) {
    try {
      // Get user data (simplified - would use proper Supabase query)
      const user = {
        id: userId,
        email: `user-${userId}@example.com`,
        github_username: 'developer',
        created_at: new Date().toISOString(),
      }

      let result
      if (data.series_type === 'day_3') {
        result = await EmailCampaignService.sendWelcomeDayThree(user as any)
      } else {
        result = await EmailCampaignService.sendWelcomeWeekOne(user as any)
      }

      if (result.success) {
        results.push({ user_id: userId, message_id: result.messageId })
      } else {
        errors.push({ user_id: userId, error: result.error })
      }
    } catch (err) {
      errors.push({ user_id: userId, error: `Failed to process user: ${err}` })
    }
  }

  return NextResponse.json({
    success: true,
    message: `Welcome series ${data.series_type} sent`,
    results: {
      successful: results.length,
      failed: errors.length,
      details: { results, errors },
    },
  })
}

async function handleEarlyAccess(body: unknown) {
  const data = earlyAccessSchema.parse(body)

  const result = await EmailCampaignService.sendEarlyAccessInvitation(
    data.user_ids,
    {
      access_level: data.access_level,
      download_link: data.download_link,
      instructions_link: data.instructions_link,
      exclusive_features: data.exclusive_features,
    }
  )

  return NextResponse.json({
    success: true,
    message: 'Early access invitations sent',
    stats: {
      campaign_id: result.campaign_id,
      total_sent: result.total_sent,
      errors: result.errors,
    },
  })
}

async function handleReEngagement(body: unknown) {
  const data = reEngagementSchema.parse(body)

  const result = await EmailCampaignService.sendReEngagementCampaign(
    data.inactivity_threshold_days
  )

  return NextResponse.json({
    success: true,
    message: 'Re-engagement campaign sent',
    stats: {
      campaign_id: result.campaign_id,
      total_sent: result.total_sent,
      errors: result.errors,
    },
  })
}

async function handleMonthlyNewsletter(body: unknown) {
  const bodyData = body as any
  const newsletterData = {
    update_title: bodyData.subject || 'Silent Scribe Monthly Update',
    update_content: bodyData.content || 'Latest developments in Silent Scribe',
    features_highlights: bodyData.features_highlights || [],
    roadmap_items: bodyData.roadmap_items || [],
    feedback_link: `${process.env.NEXT_PUBLIC_SITE_URL}/feedback`,
  }

  const result = await EmailCampaignService.sendMonthlyNewsletter(
    newsletterData,
    bodyData.segment_filter
  )

  return NextResponse.json({
    success: true,
    message: 'Monthly newsletter sent',
    stats: {
      campaign_id: result.campaign_id,
      total_sent: result.total_sent,
      errors: result.errors,
    },
  })
}

async function handleABTest(body: unknown) {
  const data = abTestSchema.parse(body)

  // Create the A/B test configuration
  const testConfig = {
    campaign_id: `campaign-${Date.now()}`,
    test_name: data.test_name,
    test_type: data.test_type,
    variant_a: {
      name: data.variant_a.name,
      config: data.variant_a,
    },
    variant_b: {
      name: data.variant_b.name,
      config: data.variant_b,
    },
    split_percentage: data.split_percentage,
    sample_size: data.sample_size,
    duration_hours: data.duration_hours,
    success_metric: data.success_metric,
    confidence_level: 95,
  }

  const result = await EmailOptimizationService.createABTest(testConfig)

  if (result.error) {
    return NextResponse.json(
      {
        success: false,
        error: result.error,
      },
      { status: 400 }
    )
  }

  return NextResponse.json({
    success: true,
    message: 'A/B test created successfully',
    test_id: result.test_id,
    config: testConfig,
  })
}

async function handleOptimizationAnalysis(body: unknown) {
  const bodyData = body as any
  const timeframe = bodyData.timeframe || 'month'

  // Get multiple analytics types
  const [engagementAnalytics, sendTimeAnalysis] = await Promise.all([
    EmailOptimizationService.getEngagementAnalytics(timeframe),
    EmailOptimizationService.analyzeOptimalSendTimes(bodyData.segment_filter),
  ])

  // Generate recommendations based on analytics
  const recommendations = []

  if (engagementAnalytics.analytics) {
    const { overall_rates, by_day_of_week, by_hour } =
      engagementAnalytics.analytics

    if (overall_rates.open_rate < 20) {
      recommendations.push({
        type: 'open_rate',
        priority: 'high',
        message:
          'Overall open rate is below industry average (20-25%). Consider improving subject lines.',
        action: 'Test different subject line strategies',
      })
    }

    if (overall_rates.click_rate < 3) {
      recommendations.push({
        type: 'click_rate',
        priority: 'medium',
        message:
          'Click rate is below average. Consider improving email content and CTAs.',
        action: 'A/B test different content approaches',
      })
    }

    // Find best day of week
    const bestDay = by_day_of_week.reduce((best, current) =>
      current.open_rate > best.open_rate ? current : best
    )

    if (bestDay.open_rate > overall_rates.open_rate * 1.2) {
      recommendations.push({
        type: 'timing',
        priority: 'medium',
        message: `${bestDay.day} shows significantly higher engagement (${bestDay.open_rate.toFixed(1)}% vs ${overall_rates.open_rate.toFixed(1)}% average)`,
        action: `Consider sending more campaigns on ${bestDay.day}`,
      })
    }

    // Find best hour
    const bestHour = by_hour.reduce((best, current) =>
      current.send_count > 5 && current.open_rate > best.open_rate
        ? current
        : best
    )

    if (bestHour.open_rate > overall_rates.open_rate * 1.3) {
      recommendations.push({
        type: 'timing',
        priority: 'low',
        message: `Hour ${bestHour.hour}:00 shows strong engagement (${bestHour.open_rate.toFixed(1)}%)`,
        action: `Consider scheduling campaigns around ${bestHour.hour}:00`,
      })
    }
  }

  return NextResponse.json({
    success: true,
    message: 'Optimization analysis completed',
    data: {
      engagement: engagementAnalytics.analytics,
      send_times: sendTimeAnalysis.analysis,
      recommendations,
      generated_at: new Date().toISOString(),
    },
  })
}
