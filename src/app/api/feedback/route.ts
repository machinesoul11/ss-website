import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'

// Validation schema for feedback submissions
const feedbackSchema = z.object({
  email: z.string().email('Valid email is required'),
  feedbackType: z.enum(['survey', 'bug_report', 'feature_request']),
  surveyId: z.string().optional(),
  responses: z.record(z.string(), z.unknown()).optional(),
  freeFormFeedback: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
})

/**
 * Submit feedback from beta users
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = feedbackSchema.parse(body)

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

    // Insert feedback submission
    const { data: feedback, error: insertError } = await supabaseAdmin
      .from('feedback_submissions')
      .insert({
        user_id: user.id,
        feedback_type: validatedData.feedbackType,
        survey_id: validatedData.surveyId || null,
        responses: validatedData.responses || null,
        free_form_feedback: validatedData.freeFormFeedback || null,
        rating: validatedData.rating || null,
        internal_status: 'new',
      })
      .select()
      .single()

    if (insertError) {
      console.error('Feedback insertion error:', insertError)
      return NextResponse.json(
        { success: false, error: 'Failed to save feedback' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
      data: { id: feedback.id },
    })
  } catch (error) {
    console.error('Feedback submission error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid feedback data',
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
 * Get feedback submissions for admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    // Basic auth check
    const authHeader = request.headers.get('authorization')
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // Filter by internal_status
    const type = searchParams.get('type') // Filter by feedback_type
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabaseAdmin
      .from('feedback_submissions')
      .select(
        `
        *,
        beta_signups (
          email,
          github_username
        )
      `
      )
      .order('submitted_at', { ascending: false })
      .limit(limit)

    if (status) {
      query = query.eq('internal_status', status)
    }

    if (type) {
      query = query.eq('feedback_type', type)
    }

    const { data: feedback, error } = await query

    if (error) {
      console.error('Feedback fetch error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch feedback' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: feedback,
    })
  } catch (error) {
    console.error('Feedback GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Update feedback status (admin only)
 */
export async function PATCH(request: NextRequest) {
  try {
    // Basic auth check
    const authHeader = request.headers.get('authorization')
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { feedbackId, status } = body

    if (!feedbackId || !status) {
      return NextResponse.json(
        { error: 'feedbackId and status are required' },
        { status: 400 }
      )
    }

    if (!['new', 'reviewed', 'addressed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: new, reviewed, or addressed' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('feedback_submissions')
      .update({ internal_status: status })
      .eq('id', feedbackId)
      .select()
      .single()

    if (error) {
      console.error('Feedback update error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update feedback status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback status updated',
      data,
    })
  } catch (error) {
    console.error('Feedback PATCH error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
