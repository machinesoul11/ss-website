/**
 * API Performance Tracking Endpoint
 * Phase 6: Custom Analytics System
 * 
 * Tracks API response times, error rates, and performance metrics
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

interface APIPerformanceMetrics {
  endpoint: string
  method: string
  duration: number
  status: number
  success: boolean
  timestamp: number
  size?: number
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const metrics: APIPerformanceMetrics = body

    if (!metrics.endpoint || !metrics.method || !metrics.duration) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Store API performance metrics
    await storeAPIPerformanceMetrics(metrics, request)

    // Check for performance issues and create alerts if needed
    if (metrics.duration > 5000 || !metrics.success) {
      await createAPIPerformanceAlert(metrics)
    }

    return NextResponse.json({
      success: true,
      message: 'API performance metrics recorded'
    })

  } catch (error) {
    console.error('API performance tracking error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to record API performance metrics',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const endpoint = searchParams.get('endpoint')
    const method = searchParams.get('method')
    const days = parseInt(searchParams.get('days') || '7')

    // Get API performance data
    const performanceData = await getAPIPerformanceData(endpoint, method, days)
    
    // Calculate API performance summary
    const summary = calculateAPIPerformanceSummary(performanceData)

    return NextResponse.json({
      success: true,
      data: {
        metrics: performanceData,
        summary
      }
    })

  } catch (error) {
    console.error('Get API performance data error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get API performance data',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

/**
 * Store API performance metrics in database
 */
async function storeAPIPerformanceMetrics(
  metrics: APIPerformanceMetrics,
  request: NextRequest
) {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not available')
  }

  try {
    const record = {
      page_path: `/api${metrics.endpoint}`,
      visitor_id: `api_performance_${Date.now()}`,
      session_id: `api_session_${Date.now()}`,
      event_type: 'api_performance',
      timestamp: new Date(metrics.timestamp).toISOString(),
      referrer: request.headers.get('referer') || null,
      user_agent_hash: hashString(request.headers.get('user-agent') || ''),
      metadata: {
        api: {
          endpoint: metrics.endpoint,
          method: metrics.method,
          duration: metrics.duration,
          status: metrics.status,
          success: metrics.success,
          size: metrics.size
        },
        performance: {
          responseTime: metrics.duration,
          errorRate: metrics.success ? 0 : 1,
          throughput: metrics.size ? (metrics.size / metrics.duration) * 1000 : 0 // bytes per second
        },
        recordedAt: new Date().toISOString()
      }
    }

    await supabaseAdmin
      .from('page_analytics')
      .insert([record])

  } catch (error) {
    console.error('Error storing API performance metrics:', error)
    throw error
  }
}

/**
 * Get API performance data from database
 */
async function getAPIPerformanceData(
  endpoint?: string | null,
  method?: string | null,
  days: number = 7
) {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not available')
  }

  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  try {
    const query = supabaseAdmin
      .from('page_analytics')
      .select('*')
      .eq('event_type', 'api_performance')
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: false })

    const { data: records } = await query.limit(1000)

    if (!records || records.length === 0) {
      return []
    }

    // Filter and process records
    return records
      .map(record => {
        const metadata = record.metadata as any
        const api = metadata?.api || {}
        
        return {
          endpoint: api.endpoint,
          method: api.method,
          duration: api.duration,
          status: api.status,
          success: api.success,
          size: api.size,
          timestamp: record.timestamp,
          page: record.page_path
        }
      })
      .filter(record => {
        let match = true
        if (endpoint && !record.endpoint.includes(endpoint)) match = false
        if (method && record.method !== method.toUpperCase()) match = false
        return match
      })

  } catch (error) {
    console.error('Error getting API performance data:', error)
    throw error
  }
}

/**
 * Calculate API performance summary
 */
function calculateAPIPerformanceSummary(data: any[]) {
  if (data.length === 0) {
    return {
      totalRequests: 0,
      averageResponseTime: 0,
      errorRate: 0,
      slowestEndpoints: [],
      errorsByStatus: {},
      requestsByMethod: {}
    }
  }

  const totalRequests = data.length
  const averageResponseTime = data.reduce((sum, record) => sum + record.duration, 0) / totalRequests
  const errorCount = data.filter(record => !record.success).length
  const errorRate = (errorCount / totalRequests) * 100

  // Group by endpoint for slowest analysis
  const endpointPerformance = new Map<string, { durations: number[], errors: number }>()
  const statusCounts = new Map<number, number>()
  const methodCounts = new Map<string, number>()

  data.forEach(record => {
    // Endpoint performance
    if (!endpointPerformance.has(record.endpoint)) {
      endpointPerformance.set(record.endpoint, { durations: [], errors: 0 })
    }
    const perf = endpointPerformance.get(record.endpoint)!
    perf.durations.push(record.duration)
    if (!record.success) perf.errors++

    // Status code counts
    statusCounts.set(record.status, (statusCounts.get(record.status) || 0) + 1)

    // Method counts
    methodCounts.set(record.method, (methodCounts.get(record.method) || 0) + 1)
  })

  // Calculate slowest endpoints
  const slowestEndpoints = Array.from(endpointPerformance.entries())
    .map(([endpoint, data]) => ({
      endpoint,
      averageResponseTime: data.durations.reduce((a, b) => a + b, 0) / data.durations.length,
      errorCount: data.errors,
      requestCount: data.durations.length
    }))
    .sort((a, b) => b.averageResponseTime - a.averageResponseTime)
    .slice(0, 10)

  return {
    totalRequests,
    averageResponseTime: Math.round(averageResponseTime),
    errorRate: Math.round(errorRate * 100) / 100,
    slowestEndpoints,
    errorsByStatus: Object.fromEntries(statusCounts),
    requestsByMethod: Object.fromEntries(methodCounts)
  }
}

/**
 * Create performance alert for slow or failing API calls
 */
async function createAPIPerformanceAlert(metrics: APIPerformanceMetrics) {
  if (!supabaseAdmin) return

  try {
    let alertType = 'api_performance_issue'
    let severity = 'warning'

    if (!metrics.success) {
      alertType = 'api_error'
      severity = metrics.status >= 500 ? 'critical' : 'warning'
    } else if (metrics.duration > 10000) {
      alertType = 'api_slow_response'
      severity = 'critical'
    } else if (metrics.duration > 5000) {
      alertType = 'api_slow_response'
      severity = 'warning'
    }

    const alert = {
      page_path: `/alerts/api-performance`,
      visitor_id: `alert_system_api`,
      session_id: `alert_${Date.now()}`,
      event_type: 'api_performance_alert',
      timestamp: new Date().toISOString(),
      referrer: null,
      user_agent_hash: null,
      metadata: {
        alertType,
        severity,
        api: {
          endpoint: metrics.endpoint,
          method: metrics.method,
          duration: metrics.duration,
          status: metrics.status,
          success: metrics.success
        },
        threshold: {
          slowResponse: metrics.duration > 5000,
          verySlowResponse: metrics.duration > 10000,
          error: !metrics.success
        },
        createdAt: new Date().toISOString()
      }
    }

    await supabaseAdmin
      .from('page_analytics')
      .insert([alert])

  } catch (error) {
    console.error('Error creating API performance alert:', error)
  }
}

function hashString(input: string): string {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16)
}
