/**
 * Error Monitoring Initialization
 * Phase 6: Performance Monitoring - Error Handling System Setup
 * 
 * Initializes error tracking, performance monitoring, and recovery systems
 */

'use client'

import React, { useEffect } from 'react'
import { errorTracker, PerformanceMonitor } from '@/lib/services/error-tracking'

interface ErrorMonitoringProviderProps {
  children: React.ReactNode
  enablePerformanceMonitoring?: boolean
  enableWebVitalsTracking?: boolean
  enableMemoryMonitoring?: boolean
  enableBundleMonitoring?: boolean
}

export function ErrorMonitoringProvider({
  children,
  enablePerformanceMonitoring = true,
  enableWebVitalsTracking = true,
  enableMemoryMonitoring = true,
  enableBundleMonitoring = true
}: ErrorMonitoringProviderProps) {
  useEffect(() => {
    // Initialize error monitoring only on client side
    if (typeof window === 'undefined') return

    console.log('🚀 Initializing error monitoring system...')

    // Start performance monitoring
    if (enablePerformanceMonitoring) {
      if (enableWebVitalsTracking) {
        PerformanceMonitor.monitorWebVitals()
      }
      
      if (enableMemoryMonitoring) {
        PerformanceMonitor.monitorMemoryUsage()
      }
      
      if (enableBundleMonitoring) {
        PerformanceMonitor.monitorBundlePerformance()
      }
    }

    // Log successful initialization
    console.log('✅ Error monitoring system initialized')

    // Test error reporting disabled by default to avoid noise
    // Uncomment to test error reporting in development:
    // if (process.env.NODE_ENV === 'development') {
    //   setTimeout(() => {
    //     errorTracker.reportError('Test error for monitoring system', {
    //       component: 'ErrorMonitoringProvider',
    //       test: true
    //     }, 'low')
    //   }, 2000)
    // }

    // Log performance statistics periodically
    const statsInterval = setInterval(() => {
      const stats = errorTracker.getErrorStats()
      if (stats.queuedErrors > 0 || stats.queuedPerformanceIssues > 0) {
        console.log('📊 Error monitoring stats:', stats)
      }
    }, 30000) // Every 30 seconds

    return () => {
      clearInterval(statsInterval)
      console.log('🛑 Error monitoring cleanup completed')
    }
  }, [enablePerformanceMonitoring, enableWebVitalsTracking, enableMemoryMonitoring, enableBundleMonitoring])

  return <>{children}</>
}

/**
 * Hook to get error monitoring statistics
 */
export function useErrorMonitoringStats() {
  const [stats, setStats] = React.useState(() => errorTracker.getErrorStats())
  
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(errorTracker.getErrorStats())
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])
  
  return stats
}

/**
 * Development helper component for testing error boundaries
 * Hidden by default, can be shown by pressing Ctrl+Shift+E
 */
export function ErrorTestingWidget() {
  const [isVisible, setIsVisible] = React.useState(false)

  // Keyboard shortcut to toggle visibility (Ctrl+Shift+E)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'E') {
        setIsVisible(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Only available in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const triggerJavaScriptError = () => {
    throw new Error('Test JavaScript error from ErrorTestingWidget')
  }

  const triggerAsyncError = async () => {
    throw new Error('Test async error from ErrorTestingWidget')
  }

  const triggerNetworkError = async () => {
    try {
      await fetch('/api/non-existent-endpoint')
    } catch (error) {
      console.log('Network error triggered:', error)
    }
  }

  const triggerComponentError = () => {
    errorTracker.captureComponentError(
      new Error('Test component error'),
      { componentStack: 'ErrorTestingWidget > TestButton' }
    )
  }

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded opacity-50 hover:opacity-100 transition-opacity">
          Press Ctrl+Shift+E for error testing
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-red-600 text-white p-3 rounded-lg shadow-lg z-50">
      <div className="flex justify-between items-center mb-2">
        <div className="text-xs font-medium">Error Testing (Dev Mode)</div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-red-200 hover:text-white text-xs"
        >
          ✕
        </button>
      </div>
      <div className="space-y-1">
        <button
          onClick={triggerJavaScriptError}
          className="block w-full text-xs bg-red-700 hover:bg-red-800 px-2 py-1 rounded"
        >
          JS Error
        </button>
        <button
          onClick={triggerAsyncError}
          className="block w-full text-xs bg-red-700 hover:bg-red-800 px-2 py-1 rounded"
        >
          Async Error
        </button>
        <button
          onClick={triggerNetworkError}
          className="block w-full text-xs bg-red-700 hover:bg-red-800 px-2 py-1 rounded"
        >
          Network Error
        </button>
        <button
          onClick={triggerComponentError}
          className="block w-full text-xs bg-red-700 hover:bg-red-800 px-2 py-1 rounded"
        >
          Component Error
        </button>
      </div>
    </div>
  )
}

/**
 * Error monitoring status indicator
 */
export function ErrorMonitoringStatusIndicator() {
  const stats = useErrorMonitoringStats()
  const [isVisible, setIsVisible] = React.useState(false)

  // Show indicator if there are queued errors or performance issues
  useEffect(() => {
    setIsVisible(stats.queuedErrors > 0 || stats.queuedPerformanceIssues > 0)
  }, [stats])

  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 bg-amber-100 border border-amber-400 text-amber-800 px-3 py-2 rounded-md shadow-lg z-50">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
        <div className="text-sm">
          {stats.queuedErrors > 0 && `${stats.queuedErrors} errors`}
          {stats.queuedErrors > 0 && stats.queuedPerformanceIssues > 0 && ', '}
          {stats.queuedPerformanceIssues > 0 && `${stats.queuedPerformanceIssues} perf issues`}
          {' '}pending
        </div>
      </div>
      <div className="text-xs text-amber-600 mt-1">
        Status: {stats.isOnline ? 'Online' : 'Offline'}
      </div>
    </div>
  )
}

export default ErrorMonitoringProvider
