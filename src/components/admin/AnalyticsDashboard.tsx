/**
 * Analytics Dashboard Component
 * Shows combined analytics from Plausible and custom tracking
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useCombinedAnalytics } from '@/lib/combined-analytics'

interface AnalyticsData {
  pageViews: number
  uniqueVisitors: number
  betaSignups: number
  conversionRate: number
  topPages: Array<{ page: string; views: number }>
  topSources: Array<{ source: string; visits: number }>
  goals: Array<{ name: string; conversions: number }>
  realTimeVisitors: number
}

// interface PlausibleStats {
//   page_views: { value: number }
//   visitors: { value: number }
//   visit_duration: { value: number }
//   bounce_rate: { value: number }
// }

export function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d' | '90d'>('7d')

  const analytics = useCombinedAnalytics()

  const fetchAnalyticsData = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // For now, use mock data until the API is properly typed
      // TODO: Replace with real API call once database types are fixed
      const mockData: AnalyticsData = {
        pageViews: 1250,
        uniqueVisitors: 890,
        betaSignups: 45,
        conversionRate: 5.06,
        topPages: [
          { page: '/', views: 423 },
          { page: '/beta', views: 234 },
          { page: '/about', views: 156 },
          { page: '/privacy', views: 89 },
          { page: '/contact', views: 67 }
        ],
        topSources: [
          { source: 'Direct', visits: 456 },
          { source: 'Google', visits: 234 },
          { source: 'GitHub', visits: 123 },
          { source: 'Twitter', visits: 67 },
          { source: 'Reddit', visits: 45 }
        ],
        goals: [
          { name: 'Beta Signup', conversions: 45 },
          { name: 'Form Submit', conversions: 78 },
          { name: 'CTA Click', conversions: 156 },
          { name: 'Page View', conversions: 1250 }
        ],
        realTimeVisitors: 8
      }

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500))
      setAnalyticsData(mockData)

      // If Plausible is available, log that it's enabled
      if (analytics.isPlausibleEnabled) {
        console.log('Plausible Analytics is enabled')
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [timeframe, analytics.isPlausibleEnabled])

  useEffect(() => {
    fetchAnalyticsData()
  }, [fetchAnalyticsData])



  // const fetchPlausibleStats = async () => {
  //   try {
  //     // Note: This would require Plausible API key configuration
  //     // For now, we'll show a placeholder or use only custom analytics
  //     console.log('Plausible API integration would go here')
  //   } catch (err) {
  //     console.error('Error fetching Plausible stats:', err)
  //   }
  // }

  const handleTimeframeChange = (newTimeframe: '24h' | '7d' | '30d' | '90d') => {
    setTimeframe(newTimeframe)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-red-600">
          <h3 className="text-lg font-semibold mb-2">Error Loading Analytics</h3>
          <p>{error}</p>
          <button 
            onClick={fetchAnalyticsData}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-center text-gray-500">No analytics data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        
        {/* Timeframe Selector */}
        <div className="flex space-x-2">
          {(['24h', '7d', '30d', '90d'] as const).map((period) => (
            <button
              key={period}
              onClick={() => handleTimeframeChange(period)}
              className={`px-3 py-1 rounded text-sm font-medium ${
                timeframe === period
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {period === '24h' ? 'Last 24h' : 
               period === '7d' ? 'Last 7 days' :
               period === '30d' ? 'Last 30 days' :
               'Last 90 days'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Page Views"
          value={analyticsData.pageViews.toLocaleString()}
          change={null}
          icon="📊"
        />
        <MetricCard
          title="Unique Visitors"
          value={analyticsData.uniqueVisitors.toLocaleString()}
          change={null}
          icon="👥"
        />
        <MetricCard
          title="Beta Signups"
          value={analyticsData.betaSignups.toLocaleString()}
          change={null}
          icon="🚀"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${analyticsData.conversionRate.toFixed(2)}%`}
          change={null}
          icon="📈"
        />
      </div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Top Pages</h3>
          <div className="space-y-3">
            {analyticsData.topPages.map((page) => (
              <div key={page.page} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 truncate">{page.page}</span>
                <span className="text-sm font-medium">{page.views}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Traffic Sources</h3>
          <div className="space-y-3">
            {analyticsData.topSources.map((source) => (
              <div key={source.source} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{source.source}</span>
                <span className="text-sm font-medium">{source.visits}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Goal Conversions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Goal Conversions</h3>
          <div className="space-y-3">
            {analyticsData.goals.map((goal) => (
              <div key={goal.name} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{goal.name}</span>
                <span className="text-sm font-medium">{goal.conversions}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Real-time</h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-500">
              {analyticsData.realTimeVisitors}
            </div>
            <div className="text-sm text-gray-600">Visitors online now</div>
          </div>
        </div>
      </div>

      {/* Plausible Integration Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className="text-blue-400">ℹ️</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Plausible Analytics Integration
            </h3>
            <p className="mt-1 text-sm text-blue-700">
              {analytics.isPlausibleEnabled ? 
                'Plausible Analytics is active. Visit your Plausible dashboard for additional privacy-compliant insights.' :
                'Enable Plausible Analytics by setting NEXT_PUBLIC_PLAUSIBLE_DOMAIN environment variable.'
              }
            </p>
            {analytics.isPlausibleEnabled && (
              <a 
                href={`https://plausible.io/${process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
              >
                Open Plausible Dashboard →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string
  change: number | null
  icon: string
}

function MetricCard({ title, value, change, icon }: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== null && (
            <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '↗' : '↘'} {Math.abs(change)}%
            </p>
          )}
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  )
}
