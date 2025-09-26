/**
 * Example API Route with Error Handling
 * Phase 6: Performance Monitoring - Server Error Handling Example
 * 
 * Demonstrates how to implement comprehensive error handling in API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandler, logApiError, logDatabaseError } from '@/lib/server-error-logger'
import { supabaseAdmin } from '@/lib/supabase'

async function handler(request: NextRequest) {
  // Example endpoint that demonstrates error handling patterns
  
  if (request.method !== 'GET') {
    // Log validation error
    await logApiError(
      'Method not allowed',
      request.url,
      request.method,
      405
    )
    
    return NextResponse.json(
      { success: false, error: 'Method not allowed' },
      { status: 405 }
    )
  }

  try {
    // Example database operation with error handling
    if (!supabaseAdmin) {
      throw new Error('Database connection unavailable')
    }

    const { data, error } = await (supabaseAdmin as any)
      .from('page_analytics')
      .select('count(*)')
      .eq('event_type', 'error')
      .single()

    if (error) {
      // Log database error with context
      await logDatabaseError(error.message, {
        operation: 'count_errors',
        table: 'page_analytics',
        filter: 'event_type = error'
      })
      throw new Error(`Database query failed: ${error.message}`)
    }

    // Success response
    return NextResponse.json({
      success: true,
      data: {
        errorCount: data?.count || 0,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    // This will be caught by withErrorHandler and logged automatically
    throw error
  }
}

// Export the wrapped handler with automatic error logging
export const GET = withErrorHandler(handler)

/**
 * Example of manual error logging in a route handler
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    if (!body || typeof body !== 'object') {
      await logApiError(
        'Invalid request body',
        request.url,
        'POST',
        400
      )
      
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      )
    }

    // Example business logic with error handling
    if (body.action === 'test_error') {
      // Simulate different types of errors for testing
      switch (body.errorType) {
        case 'database':
          await logDatabaseError('Simulated database connection error', {
            test: true,
            errorType: body.errorType
          })
          throw new Error('Database connection failed')
          
        case 'validation':
          await logApiError(
            'Required field missing: email',
            request.url,
            'POST',
            400
          )
          return NextResponse.json(
            { success: false, error: 'Required field missing: email' },
            { status: 400 }
          )
          
        case 'external_service':
          await logApiError(
            'External API timeout',
            request.url,
            'POST',
            502
          )
          return NextResponse.json(
            { success: false, error: 'External service unavailable' },
            { status: 502 }
          )
          
        default:
          throw new Error('Simulated server error')
      }
    }

    // Normal successful response
    return NextResponse.json({
      success: true,
      message: 'Request processed successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    // Manual error logging with additional context
    await logApiError(
      error instanceof Error ? error : new Error(String(error)),
      request.url,
      'POST',
      500,
      request.headers.get('user-id') || undefined
    )

    return NextResponse.json(
      {
        success: false,
        error: process.env.NODE_ENV === 'production' 
          ? 'Internal server error' 
          : error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
