/**
 * Performance Monitoring Middleware
 * Phase 6: Performance Monitoring - API Response Time Tracking
 *
 * Automatically tracks API performance metrics for all requests
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Performance metrics storage (in memory for demo, should use database in production)
const performanceMetrics: Array<{
  endpoint: string
  method: string
  duration: number
  status: number
  timestamp: number
  size?: number
}> = []

export function middleware(request: NextRequest) {
  const startTime = performance.now()

  // Clone the request to measure size
  const url = request.url
  const method = request.method
  const pathname = new URL(url).pathname

  // Skip monitoring for static files and non-API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    !pathname.startsWith('/api')
  ) {
    return NextResponse.next()
  }

  // Continue with the request
  const response = NextResponse.next()

  // Track performance metrics after response
  response.headers.set('x-performance-start', startTime.toString())
  response.headers.set('x-performance-endpoint', pathname)
  response.headers.set('x-performance-method', method)

  return response
}

/**
 * Utility to complete performance tracking (call this in API routes)
 */
export async function trackApiPerformance(
  request: NextRequest,
  response: NextResponse,
  additionalMetrics?: Record<string, any>
) {
  const startTime = parseFloat(
    response.headers.get('x-performance-start') || '0'
  )
  const endpoint = response.headers.get('x-performance-endpoint') || 'unknown'
  const method = response.headers.get('x-performance-method') || 'GET'

  if (startTime > 0) {
    const endTime = performance.now()
    const duration = Math.round(endTime - startTime)

    const metrics = {
      endpoint,
      method,
      duration,
      status: response.status,
      timestamp: Date.now(),
      size:
        parseInt(response.headers.get('content-length') || '0', 10) ||
        undefined,
      ...additionalMetrics,
    }

    // Store metrics (in production, send to database)
    performanceMetrics.push(metrics)

    // Keep only last 1000 metrics to prevent memory issues
    if (performanceMetrics.length > 1000) {
      performanceMetrics.shift()
    }

    // Send to analytics if duration is significant or if there's an error
    if (duration > 1000 || !response.ok) {
      try {
        await fetch('/api/analytics/api-performance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(metrics),
        })
      } catch (error) {
        console.warn('Failed to send API performance metrics:', error)
      }
    }
  }
}

/**
 * Get recent performance metrics (for debugging/monitoring)
 */
export function getRecentMetrics(limit = 100) {
  return performanceMetrics.slice(-limit)
}

/**
 * Calculate performance statistics
 */
export function getPerformanceStats() {
  if (performanceMetrics.length === 0) {
    return null
  }

  const recentMetrics = performanceMetrics.slice(-100) // Last 100 requests

  const durations = recentMetrics.map((m) => m.duration)
  const averageDuration =
    durations.reduce((a, b) => a + b, 0) / durations.length

  const errorRate =
    (recentMetrics.filter((m) => m.status >= 400).length /
      recentMetrics.length) *
    100
  const slowRequests = recentMetrics.filter((m) => m.duration > 3000).length

  return {
    totalRequests: recentMetrics.length,
    averageResponseTime: Math.round(averageDuration),
    errorRate: parseFloat(errorRate.toFixed(2)),
    slowRequests,
    p95Duration: Math.round(
      durations.sort((a, b) => a - b)[Math.floor(durations.length * 0.95)] || 0
    ),
    p99Duration: Math.round(
      durations.sort((a, b) => a - b)[Math.floor(durations.length * 0.99)] || 0
    ),
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
