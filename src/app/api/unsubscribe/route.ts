import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'

const unsubscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  unsubscribeType: z.enum(['marketing', 'research', 'all']).optional().default('marketing')
})

const preferenceUpdateSchema = z.object({
  email: z.string().email('Invalid email address'),
  opted_in_marketing: z.boolean().optional(),
  opted_in_research: z.boolean().optional(),
  communication_frequency: z.enum(['daily', 'weekly', 'monthly']).optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, unsubscribeType } = unsubscribeSchema.parse(body)

    // Determine what to update based on unsubscribe type
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
    
    switch (unsubscribeType) {
      case 'marketing':
        updateData.opted_in_marketing = false
        updateData.email_status = 'unsubscribed'
        break
      case 'research':
        updateData.opted_in_research = false
        break  
      case 'all':
        updateData.opted_in_marketing = false
        updateData.opted_in_research = false
        updateData.email_status = 'unsubscribed'
        break
    }

    // Update the user's preferences
    const { error } = await supabaseAdmin
      .from('beta_signups')
      .update(updateData)
      .eq('email', email)

    if (error) {
      console.error('Unsubscribe error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update preferences' },
        { status: 500 }
      )
    }

    // Find user ID for event logging
    const { data: user } = await supabaseAdmin
      .from('beta_signups')
      .select('id')
      .eq('email', email)
      .single()

    if (user) {
      // Log the unsubscribe event
      await supabaseAdmin
        .from('email_events')
        .insert({
          user_id: user.id,
          email_type: 'update',
          event_type: 'unsubscribe',
          email_subject: 'User Unsubscribe',
          metadata: {
            source: 'unsubscribe_page',
            unsubscribe_type: unsubscribeType,
            user_agent_hash: hashUserAgent(request.headers.get('user-agent') || ''),
          }
        })
    }

    const messages = {
      marketing: 'Successfully unsubscribed from marketing communications',
      research: 'Successfully unsubscribed from research communications', 
      all: 'Successfully unsubscribed from all communications'
    }

    return NextResponse.json({
      success: true,
      message: messages[unsubscribeType]
    })

  } catch (error) {
    console.error('Unsubscribe error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function hashUserAgent(userAgent: string): string {
  let hash = 0
  for (let i = 0; i < userAgent.length; i++) {
    const char = userAgent.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString()
}

/**
 * Update communication preferences without full unsubscribe
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = preferenceUpdateSchema.parse(body)

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
    
    if (validatedData.opted_in_marketing !== undefined) {
      updateData.opted_in_marketing = validatedData.opted_in_marketing
    }
    if (validatedData.opted_in_research !== undefined) {
      updateData.opted_in_research = validatedData.opted_in_research
    }

    // Update beta_signups table
    const { error: signupError } = await supabaseAdmin
      .from('beta_signups')
      .update(updateData)
      .eq('email', validatedData.email)

    if (signupError) {
      console.error('Preference update error:', signupError)
      return NextResponse.json(
        { success: false, error: 'Failed to update preferences' },
        { status: 500 }
      )
    }

    // Update user_preferences table if communication frequency provided
    if (validatedData.communication_frequency) {
      const { data: user } = await supabaseAdmin
        .from('beta_signups')
        .select('id')
        .eq('email', validatedData.email)
        .single()

      if (user) {
        await supabaseAdmin
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            communication_frequency: validatedData.communication_frequency,
            updated_at: new Date().toISOString()
          })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Preferences updated successfully'
    })

  } catch (error) {
    console.error('Preference update error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid preference data', details: error.issues },
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
 * Get current subscription status
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

    // Get user data
    const { data: user, error } = await supabaseAdmin
      .from('beta_signups')
      .select('opted_in_marketing, opted_in_research, email_status')
      .eq('email', email)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        email,
        opted_in_marketing: user.opted_in_marketing,
        opted_in_research: user.opted_in_research,
        email_status: user.email_status
      }
    })

  } catch (error) {
    console.error('Subscription status fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
