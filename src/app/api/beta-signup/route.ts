import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import {
  BetaSignupService,
  EmailCampaignService,
  AnalyticsService,
} from '@/lib/services'

// Validation schema matching Supabase table structure
const betaSignupSchema = z.object({
  email: z.string().email('Invalid email address'),
  githubUsername: z.string().optional(),
  gitlabUsername: z.string().optional(),
  currentTools: z
    .array(z.string())
    .min(1, 'At least one tool must be selected'),
  documentationPlatforms: z
    .array(z.string())
    .min(1, 'At least one platform must be selected'),
  painPoints: z
    .string()
    .min(10, 'Please describe your main pain points (at least 10 characters)'),
  teamSize: z
    .enum([
      'individual',
      'small_team',
      'medium_team',
      'large_team',
      'enterprise',
    ])
    .optional(),
  useCaseDescription: z
    .string()
    .min(10, 'Use case description must be at least 10 characters'),
  signupSource: z.string().optional(),
  referrerCode: z.string().optional(),
  privacyConsent: z
    .boolean()
    .refine((val) => val === true, 'Privacy consent is required'),
  marketingOptIn: z.boolean().default(true),
  researchOptIn: z.boolean().default(true),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate the request data
    const validatedData = betaSignupSchema.parse(body)

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('beta_signups')
      .select('email')
      .eq('email', validatedData.email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already registered for beta program' },
        { status: 409 }
      )
    }

    // Insert into database using service layer
    // Insert into database using service layer
    const insertResult = await BetaSignupService.create(validatedData)

    if (insertResult.error || !insertResult.data) {
      console.error('Database insertion error:', insertResult.error)
      return NextResponse.json(
        { success: false, error: 'Failed to save signup data' },
        { status: 500 }
      )
    }

    const insertedUser = insertResult.data

    // Send welcome email if SendGrid is configured and user opted in
    if (process.env.SENDGRID_API_KEY && validatedData.marketingOptIn) {
      try {
        // Use our new email campaign service
        const welcomeResult =
          await EmailCampaignService.sendWelcomeEmail(insertedUser)

        if (!welcomeResult.success) {
          console.error('Failed to send welcome email:', welcomeResult.error)
          // Don't fail the signup if email fails
        }

        // Email event is automatically logged by the service
      } catch (emailError) {
        console.error('Email sending error:', emailError)
        // Don't fail the request if email fails - user is still registered
      }
    }

    // Log analytics event (privacy-compliant) using our service
    try {
      await AnalyticsService.trackEvent({
        page_path: '/api/beta-signup',
        event_type: 'beta_signup',
        metadata: {
          has_github: !!validatedData.githubUsername,
          has_gitlab: !!validatedData.gitlabUsername,
          team_size: validatedData.teamSize,
          tools_count: validatedData.currentTools.length,
          platforms_count: validatedData.documentationPlatforms.length,
          pain_points_length: validatedData.painPoints.length,
          use_case_length: validatedData.useCaseDescription.length,
          marketing_opt_in: validatedData.marketingOptIn,
          research_opt_in: validatedData.researchOptIn,
        },
      })
    } catch (analyticsError) {
      console.error('Analytics logging error:', analyticsError)
      // Don't fail signup if analytics fails
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully registered for beta program',
      data: { email: insertedUser.email },
    })
  } catch (error) {
    console.error('Beta signup error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid form data',
          details: error.issues,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
