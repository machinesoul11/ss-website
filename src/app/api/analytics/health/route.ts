/**
 * Analytics Health API Endpoint
 * Provides health monitoring for production analytics
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAnalyticsHealthReport } from '@/lib/analytics-health-monitor'

export async function GET(request: NextRequest) {
    try {
        // Basic auth check (optional - add your own auth logic)
        const authHeader = request.headers.get('authorization')
        if (process.env.ANALYTICS_HEALTH_TOKEN && authHeader !== `Bearer ${process.env.ANALYTICS_HEALTH_TOKEN}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const health = getAnalyticsHealthReport()

        return NextResponse.json({
            status: health.healthy ? 'healthy' : 'unhealthy',
            timestamp: health.timestamp,
            metrics: health.metrics,
            errors: health.errors.slice(-3), // Only recent errors
            warnings: health.warnings.slice(-3), // Only recent warnings
        })
    } catch (error) {
        return NextResponse.json({
            status: 'error',
            error: 'Failed to get health report',
        }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        // Reset health monitoring (for testing/recovery)
        const body = await request.json()

        if (body.action === 'reset') {
            // You could implement reset logic here
            return NextResponse.json({ message: 'Health monitor reset' })
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    } catch (error) {
        return NextResponse.json({
            error: 'Failed to process request',
        }, { status: 500 })
    }
}
