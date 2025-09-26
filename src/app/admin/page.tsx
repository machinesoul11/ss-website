'use client'

import React, { useEffect, useState } from 'react'
import type { BetaSignup, EmailEvent, FeedbackSubmission } from '@/types'
import { LiveStatsCard } from '../../components/admin/LiveStatsCard'
import { RecentActivityFeed } from '../../components/admin/RecentActivityFeed'
import { NotificationCenter } from '../../components/admin/NotificationCenter'
import { SystemHealthMonitor } from '../../components/admin/SystemHealthMonitor'
import { RealTimeSignupCounter } from '../../components/admin/RealTimeSignupCounter'
import { PrivacyAnalyticsDashboard, PerformanceMonitoringDashboard, ErrorMonitoringDashboard } from '../../components/admin'

/**
 * Admin Dashboard with Real-Time Features
 * Displays live statistics, notifications, and system health monitoring
 */
export default function AdminDashboard() {
  const [liveStats, setLiveStats] = useState<{
    total_signups: number
    signups_today: number
    pending_signups: number
    active_users: number
    recent_activity: Array<{
      type: 'signup' | 'email_event' | 'feedback'
      timestamp: string
      user_email?: string
      details: string
    }>
  } | null>(null)

  const [realtimeSignups, setRealtimeSignups] = useState<BetaSignup[]>([])
  const [notifications, setNotifications] = useState<Array<{
    type: 'info' | 'warning' | 'error' | 'success'
    message: string
    timestamp: string
    data: Record<string, unknown>
  }>>([])

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Wait a bit to ensure client-side hydration is complete
        await new Promise(resolve => setTimeout(resolve, 200))
        
        // Only run on client side
        if (typeof window === 'undefined') {
          return
        }

        // Get authentication token from localStorage
        const token = localStorage.getItem('admin_auth_token')
        if (!token) {
          setError('Authentication required - please login first')
          setIsLoading(false)
          return
        }

        const response = await fetch('/api/live-analytics', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        const result = await response.json()
        
        if (response.ok && result.success) {
          setLiveStats(result.data)
          setError(null)
        } else {
          if (response.status === 401) {
            // Token is invalid, clear it and force re-login
            localStorage.removeItem('admin_auth_token')
            localStorage.removeItem('admin_auth_expiry')
            setError('Session expired - please refresh and login again')
          } else {
            setError(result.error || 'Failed to load dashboard data')
          }
        }
      } catch (err) {
        setError('Failed to load dashboard data')
        console.error('Dashboard error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()
  }, [])

  // Set up real-time subscriptions using regular client Supabase
  useEffect(() => {
    if (!liveStats) return

    // Import Supabase client for real-time subscriptions (client-safe)
    const setupRealtimeSubscriptions = async () => {
      const { supabase } = await import('@/lib/supabase')
      
      // Subscribe to new signups
      const signupChannel = supabase
        .channel('admin-beta-signups')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'beta_signups'
          },
          (payload) => {
            const signup = payload.new as BetaSignup
            setRealtimeSignups(prev => [signup, ...prev].slice(0, 10))
            
            // Update live stats
            setLiveStats(prev => prev ? {
              ...prev,
              total_signups: prev.total_signups + 1,
              signups_today: prev.signups_today + 1,
              pending_signups: signup.beta_status === 'pending' ? prev.pending_signups + 1 : prev.pending_signups,
              recent_activity: [{
                type: 'signup' as const,
                timestamp: signup.created_at,
                user_email: signup.email,
                details: 'New beta signup'
              }, ...prev.recent_activity].slice(0, 20)
            } : null)

            // Show notification
            setNotifications(prev => [{
              type: 'success' as const,
              message: `New beta signup: ${signup.email}`,
              timestamp: new Date().toISOString(),
              data: { signup }
            }, ...prev].slice(0, 50))
          }
        )
        .subscribe()

      // Subscribe to email events
      const emailChannel = supabase
        .channel('admin-email-events')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'email_events'
          },
          (payload) => {
            const event = payload.new as EmailEvent
            setLiveStats(prev => prev ? {
              ...prev,
              recent_activity: [{
                type: 'email_event' as const,
                timestamp: event.timestamp,
                details: `Email ${event.event_type}: ${event.email_type}`
              }, ...prev.recent_activity].slice(0, 20)
            } : null)

            // Show notification for important email events
            if (event.event_type === 'opened' || event.event_type === 'clicked') {
              setNotifications(prev => [{
                type: 'info' as const,
                message: `Email ${event.event_type}: ${event.email_type}`,
                timestamp: new Date().toISOString(),
                data: { event }
              }, ...prev].slice(0, 50))
            }
          }
        )
        .subscribe()

      // Subscribe to feedback
      const feedbackChannel = supabase
        .channel('admin-feedback')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'feedback_submissions'
          },
          (payload) => {
            const feedback = payload.new as FeedbackSubmission
            setLiveStats(prev => prev ? {
              ...prev,
              recent_activity: [{
                type: 'feedback' as const,
                timestamp: feedback.submitted_at,
                details: `${feedback.feedback_type} feedback submitted`
              }, ...prev.recent_activity].slice(0, 20)
            } : null)

            setNotifications(prev => [{
              type: 'info' as const,
              message: `New ${feedback.feedback_type} feedback received`,
              timestamp: new Date().toISOString(),
              data: { feedback }
            }, ...prev].slice(0, 50))
          }
        )
        .subscribe()

      // Cleanup function
      return () => {
        supabase.removeChannel(signupChannel)
        supabase.removeChannel(emailChannel)
        supabase.removeChannel(feedbackChannel)
      }
    }

    let cleanup: (() => void) | undefined

    setupRealtimeSubscriptions().then((cleanupFn) => {
      cleanup = cleanupFn
    })

    // Cleanup subscriptions
    return () => {
      if (cleanup) cleanup()
    }
  }, [liveStats])

  // Refresh stats every 5 minutes
  useEffect(() => {
    const interval = setInterval(async () => {
      const token = localStorage.getItem('admin_auth_token')
      if (token) {
        try {
          const response = await fetch('/api/live-analytics', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
          const result = await response.json()
          if (response.ok && result.success) {
            setLiveStats(result.data)
          }
        } catch (error) {
          console.error('Error refreshing stats:', error)
        }
      }
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <h2 className="text-xl font-semibold mb-2">Dashboard Error</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Real-time monitoring and analytics for Silent Scribe</p>
          <div className="mt-2 flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-600 font-medium">Live Updates Active</span>
          </div>
        </div>

        {/* Live Stats Grid */}
        {liveStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <LiveStatsCard
              title="Total Signups"
              value={liveStats.total_signups}
              icon="👥"
              trend="+12%"
              trendColor="green"
            />
            <LiveStatsCard
              title="Today's Signups"
              value={liveStats.signups_today}
              icon="📈"
              trend="Real-time"
              trendColor="blue"
            />
            <LiveStatsCard
              title="Pending Users"
              value={liveStats.pending_signups}
              icon="⏳"
              trend={`${Math.round((liveStats.pending_signups / liveStats.total_signups) * 100)}%`}
              trendColor="yellow"
            />
            <LiveStatsCard
              title="Active Users"
              value={liveStats.active_users}
              icon="🚀"
              trend="+8%"
              trendColor="green"
            />
          </div>
        )}

        {/* Real-time Components Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {/* Real-time Signup Counter */}
          <div className="lg:col-span-1">
            <RealTimeSignupCounter signups={realtimeSignups} />
          </div>

          {/* Notification Center */}
          <div className="lg:col-span-1">
            <NotificationCenter 
              notifications={notifications}
              onDismiss={(index: number) => {
                setNotifications(prev => prev.filter((_, i) => i !== index))
              }}
            />
          </div>

          {/* System Health Monitor */}
          <div className="lg:col-span-1 xl:col-span-1">
            <SystemHealthMonitor />
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="mb-8">
          <RecentActivityFeed 
            activities={liveStats?.recent_activity || []}
            title="Live Activity Feed"
          />
        </div>

        {/* Privacy Analytics Dashboard */}
        <div className="mb-8">
          <PrivacyAnalyticsDashboard />
        </div>

        {/* Performance Monitoring Dashboard */}
        <div className="mb-8">
          <PerformanceMonitoringDashboard />
        </div>

        {/* Error Monitoring Dashboard */}
        <div className="mb-8">
          <ErrorMonitoringDashboard />
        </div>

        {/* Additional Admin Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={async () => {
                  const token = localStorage.getItem('admin_auth_token')
                  if (token) {
                    try {
                      await fetch('/api/live-analytics', {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                          type: 'info',
                          message: 'Manual system check initiated by admin',
                          data: { timestamp: new Date().toISOString() }
                        })
                      })
                    } catch (error) {
                      console.error('Error sending notification:', error)
                    }
                  }
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-left"
              >
                📡 Send Test Notification
              </button>
              <button className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-left">
                📊 Export Analytics
              </button>
              <button className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-left">
                ✉️ Send Campaign
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Database</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Healthy</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Email Service</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Active</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Real-time Updates</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600">Live</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
