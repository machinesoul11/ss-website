/**
 * Error Monitoring Dashboard
 * Phase 6: Performance Monitoring - Error Tracking Dashboard
 * 
 * Provides comprehensive error monitoring and alerting interface
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useErrorHandler } from '@/components/ui/error-boundary'
import { AutoRetryWrapper } from '@/components/ui/error-recovery'

interface ErrorStats {
  totalErrors: number
  errorsBySeverity: Record<string, number>
  errorsByCategory: Record<string, number>
  topErrors: Array<{ message: string; count: number }>
}

interface ErrorData {
  id: string
  timestamp: string
  page_path: string
  event_type: string
  metadata: {
    error?: {
      message: string
      severity: string
      category: string
      stack?: string
    }
    server_error?: {
      message: string
      severity: string
      category: string
      stack?: string
      endpoint?: string
      method?: string
    }
    performance_issue?: {
      type: string
      severity: string
      message: string
      metrics?: Record<string, number>
    }
  }
}

export function ErrorMonitoringDashboard() {
  const [errorStats, setErrorStats] = useState<ErrorStats | null>(null)
  const [recentErrors, setRecentErrors] = useState<ErrorData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')
  const [timeRange, setTimeRange] = useState(7)
  const handleError = useErrorHandler()

  const severityColors = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-blue-100 text-blue-800 border-blue-200'
  }

  const categoryIcons = {
    javascript: '⚡',
    network: '🌐',
    api: '🔌',
    render: '🎨',
    user: '👤',
    system: '⚙️',
    database: '🗄️',
    email: '📧',
    external_service: '🔗',
    validation: '✅',
    authentication: '🔐'
  }

  useEffect(() => {
    fetchErrorData()
  }, [timeRange, selectedCategory, selectedSeverity])

  const fetchErrorData = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        days: timeRange.toString(),
        limit: '50'
      })
      
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory)
      }
      
      if (selectedSeverity !== 'all') {
        params.append('severity', selectedSeverity)
      }

      const response = await fetch(`/api/analytics/error-tracking?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch error data')
      }
      
      setErrorStats(data.data.stats)
      setRecentErrors(data.data.errors || [])
    } catch (error) {
      handleError(error as Error, { 
        component: 'ErrorMonitoringDashboard',
        action: 'fetchErrorData' 
      })
    } finally {
      setLoading(false)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const getSeverityBadge = (severity: string) => {
    const colorClass = severityColors[severity as keyof typeof severityColors] || severityColors.medium
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${colorClass}`}>
        {severity.toUpperCase()}
      </span>
    )
  }

  const getCategoryIcon = (category: string) => {
    return categoryIcons[category as keyof typeof categoryIcons] || '📝'
  }

  if (loading && !errorStats) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <AutoRetryWrapper
      fallbackComponent={({ error, retry }) => (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Dashboard Unavailable</h3>
          <p className="text-red-700 mb-4">Unable to load error monitoring dashboard.</p>
          <button 
            onClick={retry}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}
    >
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Error Monitoring</h2>
            
            <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(parseInt(e.target.value))}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>Last 24 hours</option>
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
              </select>
              
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="javascript">JavaScript</option>
                <option value="api">API</option>
                <option value="network">Network</option>
                <option value="render">Render</option>
                <option value="database">Database</option>
                <option value="system">System</option>
              </select>
              
              <button
                onClick={fetchErrorData}
                disabled={loading}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <svg className="animate-spin h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                Refresh
              </button>
            </div>
          </div>
        </div>

        {errorStats && (
          <div className="p-6">
            {/* Error Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-600">Total Errors</div>
                <div className="text-2xl font-bold text-gray-900">{errorStats.totalErrors}</div>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-red-600">Critical</div>
                <div className="text-2xl font-bold text-red-900">{errorStats.errorsBySeverity.critical || 0}</div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-orange-600">High</div>
                <div className="text-2xl font-bold text-orange-900">{errorStats.errorsBySeverity.high || 0}</div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-yellow-600">Medium</div>
                <div className="text-2xl font-bold text-yellow-900">{errorStats.errorsBySeverity.medium || 0}</div>
              </div>
            </div>

            {/* Top Errors */}
            {errorStats.topErrors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Most Frequent Errors</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    {errorStats.topErrors.slice(0, 5).map((error, index) => (
                      <div key={index} className="flex justify-between items-center py-2">
                        <div className="text-sm text-gray-700 truncate flex-1 mr-4">
                          {error.message}
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {error.count} times
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Recent Errors Table */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Recent Errors</h3>
              
              {recentErrors.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="h-12 w-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>No errors found for the selected criteria</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Message
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Severity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Page
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentErrors.map((error, index) => {
                        const errorData = error.metadata?.error || error.metadata?.server_error || error.metadata?.performance_issue
                        return (
                          <tr key={error.id || index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatTimestamp(error.timestamp)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              <div className="max-w-xs truncate" title={errorData?.message}>
                                {errorData?.message || 'Unknown error'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getSeverityBadge(errorData?.severity || 'medium')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center">
                                <span className="mr-2">
                                  {getCategoryIcon((errorData as any)?.category || (errorData as any)?.type || 'system')}
                                </span>
                                {(errorData as any)?.category || (errorData as any)?.type || 'system'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                                {error.page_path}
                              </code>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AutoRetryWrapper>
  )
}
