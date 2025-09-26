import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'

// Validation schema for user preferences
const preferencesSchema = z.object({
  email: z.string().email('Valid email is required'),
  communicationFrequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
  preferredContactMethod: z.string().optional(),
  timezone: z.string().optional(),
  betaTestingAvailability: z.record(z.string(), z.unknown()).optional(),
  technicalBackground: z
    .enum(['beginner', 'intermediate', 'expert'])
    .optional(),
  areasOfInterest: z.array(z.string()).optional(),
})

/**
 * Update user preferences
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = preferencesSchema.parse(body)

    // Find the user by email to get user_id
    const { data: user, error: userError } = await supabaseAdmin
      .from('beta_signups')
      .select('id')
      .eq('email', validatedData.email)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error:
            'User not found. Please ensure you are registered for the beta program.',
        },
        { status: 404 }
      )
    }

    // Prepare preferences data (only include fields that were provided)
    const preferencesData: Record<string, unknown> = { user_id: user.id }

    if (validatedData.communicationFrequency) {
      preferencesData.communication_frequency =
        validatedData.communicationFrequency
    }
    if (validatedData.preferredContactMethod) {
      preferencesData.preferred_contact_method =
        validatedData.preferredContactMethod
    }
    if (validatedData.timezone) {
      preferencesData.timezone = validatedData.timezone
    }
    if (validatedData.betaTestingAvailability) {
      preferencesData.beta_testing_availability =
        validatedData.betaTestingAvailability
    }
    if (validatedData.technicalBackground) {
      preferencesData.technical_background = validatedData.technicalBackground
    }
    if (validatedData.areasOfInterest) {
      preferencesData.areas_of_interest = validatedData.areasOfInterest
    }

    // Use upsert to handle both insert and update cases
    const { data: preferences, error: upsertError } = await supabaseAdmin
      .from('user_preferences')
      .upsert(preferencesData)
      .select()
      .single()

    if (upsertError) {
      console.error('Preferences upsert error:', upsertError)
      return NextResponse.json(
        { success: false, error: 'Failed to save preferences' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Preferences updated successfully',
      data: preferences,
    })
  } catch (error) {
    console.error('Preferences update error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid preferences data',
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

/**
 * Get user preferences
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      )
    }

    // Find the user by email
    const { data: user, error: userError } = await supabaseAdmin
      .from('beta_signups')
      .select('id')
      .eq('email', email)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      )
    }

    // Get user preferences
    const { data: preferences, error: prefError } = await supabaseAdmin
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (prefError && prefError.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      console.error('Preferences fetch error:', prefError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch preferences' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: preferences || {
        user_id: user.id,
        communication_frequency: 'weekly',
        preferred_contact_method: 'email',
        timezone: null,
        beta_testing_availability: null,
        technical_background: null,
        areas_of_interest: null,
        updated_at: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Preferences GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
