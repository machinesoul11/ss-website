/**
 * Performance Monitoring Dashboard
 * Phase 6: Performance Monitoring - Enhanced Analytics Dashboard
 *
 * Real-time monitoring of Core Web Vitals, API performance, and error tracking
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useErrorTracking } from '@/lib/services/error-tracking'

interface PerformanceMetrics {
  lcp?: number
  fid?: number
  cls?: number
  fcp?: number
  ttfb?: number
  performanceScore: number
}

interface APIMetrics {
  averageResponseTime: number
  errorRate: number
  slowRequests: number
  totalRequests: number
}

interface ErrorStats {
  total: number
  critical: number
  high: number
  medium: number
  low: number
}

interface SystemAlert {
  id: string
  type: 'error' | 'performance' | 'api'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  timestamp: string
  resolved: boolean
}

export function PerformanceMonitoringDashboard() {
  const [performanceData, setPerformanceData] =
    useState<PerformanceMetrics | null>(null)
  const [apiMetrics, setApiMetrics] = useState<APIMetrics | null>(null)
  const [errorStats, setErrorStats] = useState<ErrorStats | null>(null)
  const [alerts, setAlerts] = useState<SystemAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState<number>(30000) // 30 seconds
  const { reportError } = useErrorTracking()

  // Load performance data
  useEffect(() => {
    loadDashboardData()

    const interval = setInterval(() => {
      loadDashboardData()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [refreshInterval])

  const loadDashboardData = async () => {
    try {
      const [perfResponse, apiResponse, errorResponse] = await Promise.all([
        fetch('/api/analytics/performance?days=1'),
        fetch('/api/analytics/api-performance?days=1'),
        fetch('/api/analytics/error-tracking?days=1'),
      ])

      if (perfResponse.ok) {
        const perfData = await perfResponse.json()
        setPerformanceData(perfData.data?.summary || null)
      }

      if (apiResponse.ok) {
        const apiData = await apiResponse.json()
        setApiMetrics(apiData.data?.summary || null)
      }

      if (errorResponse.ok) {
        const errorData = await errorResponse.json()
        setErrorStats(errorData.data?.stats?.errors || null)

        // Extract alerts from recent errors
        const recentErrors = errorData.data?.errors || []
        const systemAlerts = recentErrors
          .filter(
            (error: any) => error.metadata?.error?.severity === 'critical'
          )
          .slice(0, 10)
          .map((error: any, index: number) => ({
            id: `error_${index}`,
            type: 'error' as const,
            severity: 'critical' as const,
            message: error.metadata?.error?.message || 'Unknown error',
            timestamp: error.timestamp,
            resolved: false,
          }))

        setAlerts(systemAlerts)
      }

      setIsLoading(false)
    } catch (error) {
      reportError('Failed to load dashboard data', {
        error: error instanceof Error ? error.message : String(error),
      })
      setIsLoading(false)
    }
  }

  const getPerformanceScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50'
    if (score >= 50) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return date.toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-100 h-24 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <span className="mr-2">📊</span>
            Performance Monitoring
          </h2>

          <div className="flex items-center space-x-4">
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="text-sm border border-gray-300 rounded-md px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={10000}>10 seconds</option>
              <option value={30000}>30 seconds</option>
              <option value={60000}>1 minute</option>
              <option value={300000}>5 minutes</option>
            </select>

            <button
              onClick={loadDashboardData}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Core Web Vitals */}
      {performanceData && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Core Web Vitals
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {performanceData.lcp
                  ? formatDuration(performanceData.lcp)
                  : 'N/A'}
              </div>
              <div className="text-sm text-gray-600 mt-1">LCP</div>
              <div className="text-xs text-gray-500 mt-1">
                Largest Contentful Paint
              </div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {performanceData.fid
                  ? formatDuration(performanceData.fid)
                  : 'N/A'}
              </div>
              <div className="text-sm text-gray-600 mt-1">FID</div>
              <div className="text-xs text-gray-500 mt-1">
                First Input Delay
              </div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {performanceData.cls ? performanceData.cls.toFixed(3) : 'N/A'}
              </div>
              <div className="text-sm text-gray-600 mt-1">CLS</div>
              <div className="text-xs text-gray-500 mt-1">
                Cumulative Layout Shift
              </div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {performanceData.ttfb
                  ? formatDuration(performanceData.ttfb)
                  : 'N/A'}
              </div>
              <div className="text-sm text-gray-600 mt-1">TTFB</div>
              <div className="text-xs text-gray-500 mt-1">
                Time to First Byte
              </div>
            </div>

            <div
              className={`text-center p-4 rounded-lg border ${getPerformanceScoreColor(performanceData.performanceScore)}`}
            >
              <div className="text-2xl font-bold">
                {performanceData.performanceScore}/100
              </div>
              <div className="text-sm mt-1">Performance Score</div>
              <div className="text-xs mt-1">Overall Rating</div>
            </div>
          </div>
        </div>
      )}

      {/* API Performance and Error Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Performance */}
        {apiMetrics && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              API Performance
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm font-medium text-gray-700">
                  Average Response Time
                </span>
                <span className="text-lg font-semibold text-gray-900">
                  {formatDuration(apiMetrics.averageResponseTime)}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm font-medium text-gray-700">
                  Error Rate
                </span>
                <span
                  className={`text-lg font-semibold ${apiMetrics.errorRate > 5 ? 'text-red-600' : 'text-green-600'}`}
                >
                  {apiMetrics.errorRate.toFixed(1)}%
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm font-medium text-gray-700">
                  Slow Requests (&gt;3s)
                </span>
                <span
                  className={`text-lg font-semibold ${apiMetrics.slowRequests > 0 ? 'text-yellow-600' : 'text-green-600'}`}
                >
                  {apiMetrics.slowRequests}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm font-medium text-gray-700">
                  Total Requests
                </span>
                <span className="text-lg font-semibold text-gray-900">
                  {apiMetrics.totalRequests.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error Statistics */}
        {errorStats && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Error Statistics
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-red-50 rounded border border-red-200">
                <span className="text-sm font-medium text-red-700">
                  Critical Errors
                </span>
                <span className="text-lg font-semibold text-red-900">
                  {errorStats.critical}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-orange-50 rounded border border-orange-200">
                <span className="text-sm font-medium text-orange-700">
                  High Priority
                </span>
                <span className="text-lg font-semibold text-orange-900">
                  {errorStats.high}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded border border-yellow-200">
                <span className="text-sm font-medium text-yellow-700">
                  Medium Priority
                </span>
                <span className="text-lg font-semibold text-yellow-900">
                  {errorStats.medium}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-blue-50 rounded border border-blue-200">
                <span className="text-sm font-medium text-blue-700">
                  Low Priority
                </span>
                <span className="text-lg font-semibold text-blue-900">
                  {errorStats.low}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-200">
                <span className="text-sm font-medium text-gray-700">
                  Total Errors
                </span>
                <span className="text-lg font-semibold text-gray-900">
                  {errorStats.total}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Alerts */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Recent Critical Alerts
          </h3>

          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium capitalize">
                        {alert.type} Alert
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${getSeverityColor(alert.severity)}`}
                      >
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimestamp(alert.timestamp)}
                    </p>
                  </div>

                  {!alert.resolved && (
                    <div className="ml-4">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Indicators */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          System Status
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <div className="text-sm font-medium text-green-900">
                Performance Monitoring
              </div>
              <div className="text-xs text-green-700">Active</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <div className="text-sm font-medium text-green-900">
                Error Tracking
              </div>
              <div className="text-xs text-green-700">Active</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <div className="text-sm font-medium text-green-900">
                API Monitoring
              </div>
              <div className="text-xs text-green-700">Active</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
