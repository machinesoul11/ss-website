import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { EmailCampaignService } from '@/lib/services/email-campaigns'
import { SegmentationService } from '@/lib/services'
import { supabaseAdmin } from '@/lib/supabase'

// Validation schemas
const campaignSchema = z.object({
  type: z.enum(['welcome', 'development_update', 'feedback_request', 'early_access', 're_engagement', 'custom']),
  subject: z.string().min(1, 'Subject is required'),
  content: z.string().min(1, 'Content is required'),
  segmentFilter: z.enum(['all', 'high_engagement', 'has_github', 'large_teams', 'recent_signups', 'inactive_users']).optional().default('all'),
  templateId: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
  testMode: z.boolean().optional().default(false)
})



/**
 * Send email campaigns to beta users
 */
export async function POST(request: NextRequest) {
  try {
    // Basic auth check (in production, use proper authentication)
    const authHeader = request.headers.get('authorization')
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = campaignSchema.parse(body)

    // Handle different campaign types using our new service
    let campaignResult: { campaign_id: string; total_sent: number; errors: string[] }

    switch (validatedData.type) {
      case 'welcome':
        // For welcome emails, we need a specific user
        return NextResponse.json({ 
          error: 'Welcome emails should be sent individually via POST /api/beta-signup' 
        }, { status: 400 })

      case 'development_update':
        // Map segment filter to our service format
        const segmentFilter = validatedData.segmentFilter === 'high_engagement' 
          ? { engagement_level: 'high' as const }
          : validatedData.segmentFilter === 'recent_signups'
          ? { beta_status: 'pending' as const }
          : undefined

        campaignResult = await EmailCampaignService.sendDevelopmentUpdate({
          update_title: validatedData.subject,
          update_content: validatedData.content,
          features_highlights: [], // Should be passed in request
          feedback_link: `${process.env.NEXT_PUBLIC_SITE_URL}/feedback`
        }, segmentFilter)
        break

      case 'feedback_request':
        const fbSegmentFilter = validatedData.segmentFilter === 'high_engagement' 
          ? { engagement_level: 'high' as const }
          : undefined

        campaignResult = await EmailCampaignService.sendFeedbackRequest({
          feedback_type: 'general',
          survey_link: `${process.env.NEXT_PUBLIC_SITE_URL}/feedback`,
          estimated_time: '3 minutes'
        }, undefined, fbSegmentFilter)
        break

      default:
        return NextResponse.json({ 
          error: `Campaign type ${validatedData.type} not yet implemented in new service` 
        }, { status: 400 })
    }

    const sentCount = campaignResult.total_sent
    const errors = campaignResult.errors

    return NextResponse.json({
      success: true,
      message: `Campaign sent successfully`,
      campaign_id: campaignResult.campaign_id,
      stats: {
        totalRecipients: sentCount + errors.length,
        sentCount,
        errorCount: errors.length,
        errors: errors.slice(0, 5) // Return first 5 errors for debugging
      }
    })

  } catch (error) {
    console.error('Campaign sending error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid campaign data',
          details: error.issues
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Campaign sending failed' },
      { status: 500 }
    )
  }
}

/**
 * Get campaign analytics and user segments
 */
export async function GET(request: NextRequest) {
  try {
    // Basic auth check
    const authHeader = request.headers.get('authorization')
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user segments info using our new service
    const { segments: engagementSegments } = await SegmentationService.segmentByEngagement()
    const { segments: toolSegments } = await SegmentationService.segmentByTools()
    const { segments: teamSegments } = await SegmentationService.segmentByTeamSize()
    
    // Get recent campaigns
    const { data: recentCampaigns } = await supabaseAdmin
      .from('email_campaigns')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    // Get email event stats
    const { data: emailStats } = await supabaseAdmin
      .from('email_events')
      .select('event_type, count(*)')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days

    return NextResponse.json({
      success: true,
      data: {
        segments: {
          highEngagement: engagementSegments.find(s => s.id === 'high-engagement')?.count || 0,
          mediumEngagement: engagementSegments.find(s => s.id === 'medium-engagement')?.count || 0,
          lowEngagement: engagementSegments.find(s => s.id === 'low-engagement')?.count || 0,
          valeUsers: toolSegments.find(s => s.id === 'vale-users')?.count || 0,
          grammarlyUsers: toolSegments.find(s => s.id === 'grammarly-users')?.count || 0,
          individualContributors: teamSegments.find(s => s.id === 'individual')?.count || 0,
          smallTeams: teamSegments.find(s => s.id === 'small-team')?.count || 0
        },
        recentCampaigns,
        emailStats
      }
    })

  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
