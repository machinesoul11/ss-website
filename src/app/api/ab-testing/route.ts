import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { sendEmail, getUserSegments, createCampaign } from '@/lib/email'

// Validation schema for A/B test
const abTestSchema = z.object({
  testName: z.string().min(1, 'Test name is required'),
  segmentFilter: z
    .enum([
      'all',
      'high_engagement',
      'has_github',
      'large_teams',
      'recent_signups',
    ])
    .default('all'),
  variantA: z.object({
    subject: z.string().min(1, 'Subject A is required'),
    content: z.string().min(1, 'Content A is required'),
    templateId: z.string().optional(),
  }),
  variantB: z.object({
    subject: z.string().min(1, 'Subject B is required'),
    content: z.string().min(1, 'Content B is required'),
    templateId: z.string().optional(),
  }),
  splitPercentage: z.number().min(10).max(90).default(50), // Percentage for variant A
  emailType: z
    .enum(['development_update', 'feedback_request', 'custom'])
    .default('custom'),
  testMode: z.boolean().default(false),
})

/**
 * Create and run A/B test email campaign
 */
export async function POST(request: NextRequest) {
  try {
    // Basic auth check
    const authHeader = request.headers.get('authorization')
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const testData = abTestSchema.parse(body)

    // Get target users for the segment
    const segments = await getUserSegments()
    let targetEmails: string[] = []

    if (testData.segmentFilter === 'all') {
      if (!supabaseAdmin) {
        return NextResponse.json(
          { error: 'Database connection failed' },
          { status: 500 }
        )
      }

      const { data: users } = await supabaseAdmin
        .from('beta_signups')
        .select('email')
        .eq('opted_in_marketing', true)
        .eq('email_status', 'active')

      targetEmails = (users as any[])?.map((u) => u.email) || []
    } else {
      targetEmails =
        segments[testData.segmentFilter as keyof typeof segments] || []
    }

    if (targetEmails.length < 20) {
      return NextResponse.json(
        {
          success: false,
          error: 'Insufficient users for A/B test (minimum 20 required)',
        },
        { status: 400 }
      )
    }

    // Shuffle emails and split into variants
    const shuffledEmails = targetEmails.sort(() => Math.random() - 0.5)
    const splitIndex = Math.floor(
      (shuffledEmails.length * testData.splitPercentage) / 100
    )
    const variantAEmails = shuffledEmails.slice(0, splitIndex)
    const variantBEmails = shuffledEmails.slice(splitIndex)

    // Create campaigns for both variants
    const { campaignId: campaignIdA } = await createCampaign({
      type: `${testData.emailType}_ab_variant_a`,
      subject: testData.variantA.subject,
      segmentFilter: testData.segmentFilter,
      testMode: testData.testMode,
    })

    const { campaignId: campaignIdB } = await createCampaign({
      type: `${testData.emailType}_ab_variant_b`,
      subject: testData.variantB.subject,
      segmentFilter: testData.segmentFilter,
      testMode: testData.testMode,
    })

    // Create A/B test record
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      )
    }

    const { data: abTest } = await (supabaseAdmin.from('ab_tests') as any)
      .insert({
        test_name: testData.testName,
        campaign_a_id: campaignIdA,
        campaign_b_id: campaignIdB,
        variant_a_count: variantAEmails.length,
        variant_b_count: variantBEmails.length,
        split_percentage: testData.splitPercentage,
        status: 'running',
        test_type: 'subject_line',
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    // Send variant A emails
    let sentCountA = 0
    const errorsA: string[] = []

    for (const email of variantAEmails) {
      try {
        await sendEmail({
          to: email,
          subject: testData.variantA.subject,
          html: testData.variantA.content,
          templateId: testData.variantA.templateId,
        })
        sentCountA++
      } catch (error) {
        errorsA.push(`${email}: ${error}`)
      }

      // Rate limiting
      if (sentCountA % 10 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    // Send variant B emails
    let sentCountB = 0
    const errorsB: string[] = []

    for (const email of variantBEmails) {
      try {
        await sendEmail({
          to: email,
          subject: testData.variantB.subject,
          html: testData.variantB.content,
          templateId: testData.variantB.templateId,
        })
        sentCountB++
      } catch (error) {
        errorsB.push(`${email}: ${error}`)
      }

      // Rate limiting
      if (sentCountB % 10 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    // Update campaign records with results
    await (supabaseAdmin?.from('email_campaigns') as any)
      ?.update({
        sent_count: sentCountA,
        error_count: errorsA.length,
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      ?.eq('campaign_id', campaignIdA)

    await (supabaseAdmin?.from('email_campaigns') as any)
      ?.update({
        sent_count: sentCountB,
        error_count: errorsB.length,
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      ?.eq('campaign_id', campaignIdB)

    return NextResponse.json({
      success: true,
      message: 'A/B test campaign launched successfully',
      data: {
        testId: abTest?.id,
        variantA: {
          campaignId: campaignIdA,
          sent: sentCountA,
          errors: errorsA.length,
        },
        variantB: {
          campaignId: campaignIdB,
          sent: sentCountB,
          errors: errorsB.length,
        },
      },
    })
  } catch (error) {
    console.error('A/B test error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid test data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'A/B test failed' },
      { status: 500 }
    )
  }
}

/**
 * Get A/B test results and analytics
 */
export async function GET(request: NextRequest) {
  try {
    // Basic auth check
    const authHeader = request.headers.get('authorization')
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const testId = searchParams.get('testId')

    if (testId) {
      // Get specific test results
      if (!supabaseAdmin) {
        return NextResponse.json(
          { error: 'Database connection failed' },
          { status: 500 }
        )
      }

      const { data: test } = await supabaseAdmin
        .from('ab_tests')
        .select(
          `
          *,
          campaign_a:email_campaigns!campaign_a_id(*),
          campaign_b:email_campaigns!campaign_b_id(*)
        `
        )
        .eq('id', testId)
        .single()

      if (!test) {
        return NextResponse.json(
          { success: false, error: 'Test not found' },
          { status: 404 }
        )
      }

      // Get email events for both campaigns to calculate metrics
      const { data: eventsA } = await supabaseAdmin
        .from('email_events')
        .select('event_type, count(*)')
        .eq('campaign_id', (test as any)?.campaign_a_id)

      const { data: eventsB } = await supabaseAdmin
        .from('email_events')
        .select('event_type, count(*)')
        .eq('campaign_id', (test as any)?.campaign_b_id)

      return NextResponse.json({
        success: true,
        data: {
          test,
          metrics: {
            variantA: eventsA,
            variantB: eventsB,
          },
        },
      })
    } else {
      // Get all A/B tests
      if (!supabaseAdmin) {
        return NextResponse.json(
          { error: 'Database connection failed' },
          { status: 500 }
        )
      }

      const { data: tests } = await supabaseAdmin
        .from('ab_tests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      return NextResponse.json({
        success: true,
        data: tests,
      })
    }
  } catch (error) {
    console.error('A/B test results error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch test results' },
      { status: 500 }
    )
  }
}
