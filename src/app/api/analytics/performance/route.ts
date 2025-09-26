/**
 * Performance Monitoring API
 * Phase 6: Custom Analytics System
 * 
 * Collects and stores Core Web Vitals and performance metrics
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

interface PerformanceMetrics {
  lcp?: number
  fid?: number
  cls?: number
  fcp?: number
  ttfb?: number
  domContentLoaded?: number
  loadComplete?: number
  navigationTiming?: Record<string, number>
  memoryUsage?: Record<string, number>
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      metrics,
      page,
      userAgent,
      timestamp
    }: {
      metrics: PerformanceMetrics
      page: string
      userAgent: string
      timestamp: number
    } = body

    if (!metrics || !page) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Store performance metrics in page_analytics table
    await storePerformanceMetrics(metrics, page, userAgent, timestamp, request)

    // Check if performance is degraded and create alert
    const performanceScore = calculatePerformanceScore(metrics)
    if (performanceScore < 50) {
      await createPerformanceAlert(page, performanceScore, metrics)
    }

    return NextResponse.json({
      success: true,
      performanceScore,
      message: 'Performance metrics recorded'
    })

  } catch (error) {
    console.error('Performance monitoring error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to record performance metrics',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page')
    const days = parseInt(searchParams.get('days') || '7')
    const metric = searchParams.get('metric') // lcp, fid, cls, etc.

    // Get performance data for the period
    const performanceData = await getPerformanceData(page, days, metric)
    
    // Calculate performance trends
    const trends = await calculatePerformanceTrends(page, days)

    return NextResponse.json({
      success: true,
      data: {
        metrics: performanceData,
        trends,
        summary: {
          averageScore: calculateAverageScore(performanceData),
          worstPerforming: getWorstPerformingPages(performanceData),
          coreWebVitals: getCoreWebVitalsSummary(performanceData)
        }
      }
    })

  } catch (error) {
    console.error('Get performance data error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get performance data',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

/**
 * Store performance metrics in database
 */
async function storePerformanceMetrics(
  metrics: PerformanceMetrics,
  page: string,
  userAgent: string,
  timestamp: number,
  request: NextRequest
) {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not available')
  }

  try {
    const userAgentHash = hashString(userAgent)
    const performanceScore = calculatePerformanceScore(metrics)
    
    const record = {
      page_path: page,
      visitor_id: `performance_${Date.now()}`,
      session_id: `perf_session_${Date.now()}`,
      event_type: 'performance_metrics',
      timestamp: new Date(timestamp).toISOString(),
      referrer: request.headers.get('referer') || null,
      user_agent_hash: userAgentHash,
      metadata: {
        performance: metrics,
        score: performanceScore,
        coreWebVitals: {
          lcp: metrics.lcp,
          fid: metrics.fid,
          cls: metrics.cls
        },
        timing: {
          fcp: metrics.fcp,
          ttfb: metrics.ttfb,
          domContentLoaded: metrics.domContentLoaded,
          loadComplete: metrics.loadComplete
        },
        navigation: metrics.navigationTiming,
        memory: metrics.memoryUsage,
        recordedAt: new Date().toISOString()
      }
    }

    await supabaseAdmin
      .from('page_analytics')
      .insert([record])

  } catch (error) {
    console.error('Error storing performance metrics:', error)
    throw error
  }
}

/**
 * Get performance data from database
 */
async function getPerformanceData(
  page?: string | null,
  days: number = 7,
  metric?: string | null
) {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not available')
  }

  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  try {
    let query = supabaseAdmin
      .from('page_analytics')
      .select('*')
      .eq('event_type', 'performance_metrics')
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: false })

    if (page) {
      query = query.eq('page_path', page)
    }

    const { data: records } = await query.limit(1000)

    if (!records || records.length === 0) {
      return []
    }

    // Process and filter by specific metric if requested
    return records.map(record => {
      const metadata = record.metadata as any
      const performance = metadata?.performance || {}
      
      return {
        page: record.page_path,
        timestamp: record.timestamp,
        score: metadata?.score || 0,
        lcp: performance.lcp,
        fid: performance.fid,
        cls: performance.cls,
        fcp: performance.fcp,
        ttfb: performance.ttfb,
        domContentLoaded: performance.domContentLoaded,
        loadComplete: performance.loadComplete,
        navigation: performance.navigationTiming,
        memory: performance.memoryUsage
      }
    }).filter(record => {
      // Filter by specific metric if requested
      if (metric && metric in record) {
        return record[metric as keyof typeof record] !== undefined
      }
      return true
    })

  } catch (error) {
    console.error('Error getting performance data:', error)
    throw error
  }
}

/**
 * Calculate performance trends
 */
async function calculatePerformanceTrends(page?: string | null, days: number = 7) {
  const data = await getPerformanceData(page, days)
  
  if (data.length === 0) {
    return {
      lcp: { trend: 'stable', change: 0 },
      fid: { trend: 'stable', change: 0 },
      cls: { trend: 'stable', change: 0 },
      score: { trend: 'stable', change: 0 }
    }
  }

  // Calculate trends for the last 7 days vs previous 7 days
  const midpoint = Math.floor(data.length / 2)
  const recent = data.slice(0, midpoint)
  const previous = data.slice(midpoint)

  const calculateTrend = (recentValues: number[], previousValues: number[]) => {
    const recentAvg = recentValues.reduce((a, b) => a + b, 0) / recentValues.length
    const previousAvg = previousValues.reduce((a, b) => a + b, 0) / previousValues.length
    const change = ((recentAvg - previousAvg) / previousAvg) * 100
    
    return {
      trend: Math.abs(change) < 5 ? 'stable' : change > 0 ? 'improving' : 'degrading',
      change: Math.round(change * 100) / 100
    }
  }

  return {
    lcp: calculateTrend(
      recent.map(r => r.lcp).filter(v => v !== undefined) as number[],
      previous.map(r => r.lcp).filter(v => v !== undefined) as number[]
    ),
    fid: calculateTrend(
      recent.map(r => r.fid).filter(v => v !== undefined) as number[],
      previous.map(r => r.fid).filter(v => v !== undefined) as number[]
    ),
    cls: calculateTrend(
      recent.map(r => r.cls).filter(v => v !== undefined) as number[],
      previous.map(r => r.cls).filter(v => v !== undefined) as number[]
    ),
    score: calculateTrend(
      recent.map(r => r.score),
      previous.map(r => r.score)
    )
  }
}

/**
 * Create performance alert for poor performance
 */
async function createPerformanceAlert(
  page: string,
  score: number,
  metrics: PerformanceMetrics
) {
  if (!supabaseAdmin) return

  try {
    const alert = {
      page_path: `/alerts/performance`,
      visitor_id: `alert_system`,
      session_id: `alert_${Date.now()}`,
      event_type: 'performance_alert',
      timestamp: new Date().toISOString(),
      referrer: null,
      user_agent_hash: null,
      metadata: {
        alertType: 'performance_degradation',
        page,
        score,
        metrics: {
          lcp: metrics.lcp,
          fid: metrics.fid,
          cls: metrics.cls
        },
        severity: score < 25 ? 'critical' : score < 50 ? 'warning' : 'info',
        createdAt: new Date().toISOString()
      }
    }

    await supabaseAdmin
      .from('page_analytics')
      .insert([alert])

  } catch (error) {
    console.error('Error creating performance alert:', error)
  }
}

/**
 * Calculate performance score from metrics
 */
function calculatePerformanceScore(metrics: PerformanceMetrics): number {
  let score = 0
  let factors = 0

  // LCP Score (0-40 points)
  if (metrics.lcp !== undefined) {
    factors++
    if (metrics.lcp <= 2500) score += 40
    else if (metrics.lcp <= 4000) score += 20
    else score += 0
  }

  // FID Score (0-30 points)
  if (metrics.fid !== undefined) {
    factors++
    if (metrics.fid <= 100) score += 30
    else if (metrics.fid <= 300) score += 15
    else score += 0
  }

  // CLS Score (0-30 points)
  if (metrics.cls !== undefined) {
    factors++
    if (metrics.cls <= 0.1) score += 30
    else if (metrics.cls <= 0.25) score += 15
    else score += 0
  }

  return factors > 0 ? Math.round(score) : 0
}

function calculateAverageScore(data: any[]): number {
  if (data.length === 0) return 0
  return data.reduce((sum, record) => sum + record.score, 0) / data.length
}

function getWorstPerformingPages(data: any[]): Array<{ page: string; score: number }> {
  const pageScores = new Map<string, number[]>()
  
  data.forEach(record => {
    if (!pageScores.has(record.page)) {
      pageScores.set(record.page, [])
    }
    pageScores.get(record.page)?.push(record.score)
  })
  
  return Array.from(pageScores.entries())
    .map(([page, scores]) => ({
      page,
      score: scores.reduce((a, b) => a + b, 0) / scores.length
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 5)
}

function getCoreWebVitalsSummary(data: any[]): {
  lcp: { good: number; needs_improvement: number; poor: number }
  fid: { good: number; needs_improvement: number; poor: number }
  cls: { good: number; needs_improvement: number; poor: number }
} {
  const summary = {
    lcp: { good: 0, needs_improvement: 0, poor: 0 },
    fid: { good: 0, needs_improvement: 0, poor: 0 },
    cls: { good: 0, needs_improvement: 0, poor: 0 }
  }
  
  data.forEach(record => {
    // LCP thresholds: good <= 2.5s, needs improvement <= 4s, poor > 4s
    if (record.lcp !== undefined) {
      if (record.lcp <= 2500) summary.lcp.good++
      else if (record.lcp <= 4000) summary.lcp.needs_improvement++
      else summary.lcp.poor++
    }
    
    // FID thresholds: good <= 100ms, needs improvement <= 300ms, poor > 300ms
    if (record.fid !== undefined) {
      if (record.fid <= 100) summary.fid.good++
      else if (record.fid <= 300) summary.fid.needs_improvement++
      else summary.fid.poor++
    }
    
    // CLS thresholds: good <= 0.1, needs improvement <= 0.25, poor > 0.25
    if (record.cls !== undefined) {
      if (record.cls <= 0.1) summary.cls.good++
      else if (record.cls <= 0.25) summary.cls.needs_improvement++
      else summary.cls.poor++
    }
  })
  
  return summary
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
