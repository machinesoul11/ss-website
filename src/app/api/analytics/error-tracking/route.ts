/**
 * Error Tracking API Endpoint
 * Phase 6: Performance Monitoring - Error Handling System
 *
 * Receives and stores error reports and performance issues
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

interface ErrorDetails {
  message: string
  stack?: string
  componentStack?: string
  errorBoundary?: boolean
  userId?: string
  sessionId?: string
  page: string
  userAgent: string
  timestamp: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'javascript' | 'network' | 'api' | 'render' | 'user' | 'system'
  metadata?: Record<string, any>
}

interface PerformanceIssue {
  type:
    | 'slow-api'
    | 'memory-leak'
    | 'large-bundle'
    | 'poor-vitals'
    | 'failed-request'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  page: string
  metrics: Record<string, number>
  timestamp: number
  userAgent: string
  resolved?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      errors,
      performanceIssues,
    }: {
      errors: ErrorDetails[]
      performanceIssues: PerformanceIssue[]
      timestamp?: number
    } = body

    if (!errors?.length && !performanceIssues?.length) {
      return NextResponse.json(
        { success: false, error: 'No errors or performance issues provided' },
        { status: 400 }
      )
    }

    const results = {
      errorsStored: 0,
      performanceIssuesStored: 0,
      alertsCreated: 0,
    }

    // Store errors
    if (errors?.length > 0) {
      for (const error of errors) {
        await storeError(error, request)
        results.errorsStored++

        // Create alerts for critical errors
        if (error.severity === 'critical') {
          await createErrorAlert(error)
          results.alertsCreated++
        }
      }
    }

    // Store performance issues
    if (performanceIssues?.length > 0) {
      for (const issue of performanceIssues) {
        await storePerformanceIssue(issue, request)
        results.performanceIssuesStored++

        // Create alerts for critical performance issues
        if (issue.severity === 'critical') {
          await createPerformanceAlert(issue)
          results.alertsCreated++
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Error reports and performance issues recorded',
      results,
    })
  } catch (error) {
    console.error('Error tracking API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to record error reports',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page')
    const severity = searchParams.get('severity')
    const category = searchParams.get('category')
    const days = parseInt(searchParams.get('days') || '7')
    const limit = parseInt(searchParams.get('limit') || '100')

    // Get error data
    const errorData = await getErrorData({
      page,
      severity,
      category,
      days,
      limit,
    })

    // Get performance issues
    const performanceIssues = await getPerformanceIssues({
      page,
      severity,
      days,
      limit,
    })

    // Calculate error statistics
    const stats = await calculateErrorStats(days)

    return NextResponse.json({
      success: true,
      data: {
        errors: errorData,
        performanceIssues,
        stats,
      },
    })
  } catch (error) {
    console.error('Get error data error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get error data',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

/**
 * Store error in database
 */
async function storeError(error: ErrorDetails, request: NextRequest) {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not available')
  }

  // Get IP and hash user agent for anonymity
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded
    ? forwarded.split(',')[0]
    : request.headers.get('x-real-ip') || 'unknown'
  const ipHash = await hashString(ip)
  const userAgentHash = await hashString(error.userAgent)

  const { error: dbError } = await supabaseAdmin.from('page_analytics').insert([
    {
      page_path: error.page,
      visitor_id: ipHash,
      session_id: `error_${error.timestamp}`,
      event_type: 'error',
      timestamp: new Date(error.timestamp).toISOString(),
      user_agent_hash: userAgentHash,
      metadata: {
        error: {
          message: error.message,
          stack: error.stack,
          componentStack: error.componentStack,
          errorBoundary: error.errorBoundary,
          severity: error.severity,
          category: error.category,
          ...error.metadata,
        },
      },
    },
  ])

  if (dbError) {
    console.error('Failed to store error:', dbError)
    throw new Error(`Database error: ${dbError.message}`)
  }
}

/**
 * Store performance issue in database
 */
async function storePerformanceIssue(
  issue: PerformanceIssue,
  request: NextRequest
) {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not available')
  }

  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded
    ? forwarded.split(',')[0]
    : request.headers.get('x-real-ip') || 'unknown'
  const ipHash = await hashString(ip)
  const userAgentHash = await hashString(issue.userAgent)

  const { error: dbError } = await supabaseAdmin.from('page_analytics').insert([
    {
      page_path: issue.page,
      visitor_id: ipHash,
      session_id: `perf_${issue.timestamp}`,
      event_type: 'performance_issue',
      timestamp: new Date(issue.timestamp).toISOString(),
      user_agent_hash: userAgentHash,
      metadata: {
        performance_issue: {
          type: issue.type,
          message: issue.message,
          severity: issue.severity,
          metrics: issue.metrics,
          resolved: issue.resolved || false,
        },
      },
    },
  ])

  if (dbError) {
    console.error('Failed to store performance issue:', dbError)
    throw new Error(`Database error: ${dbError.message}`)
  }
}

/**
 * Create error alert
 */
async function createErrorAlert(error: ErrorDetails) {
  if (!supabaseAdmin) return

  // Store alert in system_events table (if it exists) or page_analytics
  const { error: dbError } = await supabaseAdmin.from('page_analytics').insert([
    {
      page_path: '/admin',
      event_type: 'system_alert',
      timestamp: new Date().toISOString(),
      metadata: {
        alert: {
          type: 'error',
          severity: error.severity,
          message: `Critical error on ${error.page}: ${error.message}`,
          page: error.page,
          category: error.category,
          timestamp: error.timestamp,
        },
      },
    },
  ])

  if (dbError) {
    console.error('Failed to create error alert:', dbError)
  }
}

/**
 * Create performance alert
 */
async function createPerformanceAlert(issue: PerformanceIssue) {
  if (!supabaseAdmin) return

  const { error: dbError } = await supabaseAdmin.from('page_analytics').insert([
    {
      page_path: '/admin',
      event_type: 'system_alert',
      timestamp: new Date().toISOString(),
      metadata: {
        alert: {
          type: 'performance',
          severity: issue.severity,
          message: `Performance issue on ${issue.page}: ${issue.message}`,
          page: issue.page,
          issueType: issue.type,
          metrics: issue.metrics,
          timestamp: issue.timestamp,
        },
      },
    },
  ])

  if (dbError) {
    console.error('Failed to create performance alert:', dbError)
  }
}

/**
 * Get error data from database
 */
async function getErrorData(filters: {
  page?: string | null
  severity?: string | null
  category?: string | null
  days: number
  limit: number
}) {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not available')
  }

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - filters.days)

  let query = supabaseAdmin
    .from('page_analytics')
    .select('*')
    .eq('event_type', 'error')
    .gte('timestamp', startDate.toISOString())
    .order('timestamp', { ascending: false })
    .limit(filters.limit)

  if (filters.page) {
    query = query.eq('page_path', filters.page)
  }

  // Filter by severity in metadata
  if (filters.severity) {
    query = query.filter('metadata->error->severity', 'eq', filters.severity)
  }

  // Filter by category in metadata
  if (filters.category) {
    query = query.filter('metadata->error->category', 'eq', filters.category)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Database error: ${error.message}`)
  }

  return data || []
}

/**
 * Get performance issues from database
 */
async function getPerformanceIssues(filters: {
  page?: string | null
  severity?: string | null
  days: number
  limit: number
}) {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not available')
  }

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - filters.days)

  let query = supabaseAdmin
    .from('page_analytics')
    .select('*')
    .eq('event_type', 'performance_issue')
    .gte('timestamp', startDate.toISOString())
    .order('timestamp', { ascending: false })
    .limit(filters.limit)

  if (filters.page) {
    query = query.eq('page_path', filters.page)
  }

  if (filters.severity) {
    query = query.filter(
      'metadata->performance_issue->severity',
      'eq',
      filters.severity
    )
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Database error: ${error.message}`)
  }

  return data || []
}

/**
 * Calculate error statistics
 */
async function calculateErrorStats(days: number) {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not available')
  }

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // Get error counts by severity
  const { data: errorData, error: errorError } = await supabaseAdmin
    .from('page_analytics')
    .select('metadata')
    .eq('event_type', 'error')
    .gte('timestamp', startDate.toISOString())

  if (errorError) {
    throw new Error(`Database error: ${errorError.message}`)
  }

  // Get performance issue counts
  const { data: perfData, error: perfError } = await supabaseAdmin
    .from('page_analytics')
    .select('metadata')
    .eq('event_type', 'performance_issue')
    .gte('timestamp', startDate.toISOString())

  if (perfError) {
    throw new Error(`Database error: ${perfError.message}`)
  }

  // Calculate statistics
  const errorStats = {
    total: errorData?.length || 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  }

  const performanceStats = {
    total: perfData?.length || 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  }

  // Count errors by severity
  errorData?.forEach((item) => {
    const severity = item.metadata?.error?.severity
    if (severity && severity in errorStats) {
      errorStats[severity as keyof typeof errorStats]++
    }
  })

  // Count performance issues by severity
  perfData?.forEach((item) => {
    const severity = item.metadata?.performance_issue?.severity
    if (severity && severity in performanceStats) {
      performanceStats[severity as keyof typeof performanceStats]++
    }
  })

  return {
    errors: errorStats,
    performance: performanceStats,
    period: `${days} days`,
  }
}

/**
 * Hash string for anonymity
 */
async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}
