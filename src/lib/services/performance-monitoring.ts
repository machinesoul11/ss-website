/**
 * Performance Monitoring Utilities
 * Phase 6: Custom Analytics System - Performance Tracking
 * 
 * Monitors Core Web Vitals, page load times, and API performance
 */

'use client'

import { useEffect, useRef } from 'react'

interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay  
  cls?: number // Cumulative Layout Shift
  fcp?: number // First Contentful Paint
  ttfb?: number // Time to First Byte
  
  // Page Performance
  domContentLoaded?: number
  loadComplete?: number
  
  // Navigation
  navigationTiming?: {
    domainLookup: number
    connection: number
    request: number
    response: number
    domProcessing: number
    domContentLoaded: number
    loadComplete: number
  }
  
  // Memory (if available)
  memoryUsage?: {
    usedJSHeapSize?: number
    totalJSHeapSize?: number
    jsHeapSizeLimit?: number
  }
}

interface APIPerformanceMetrics {
  endpoint: string
  method: string
  duration: number
  status: number
  success: boolean
  timestamp: number
  size?: number
}

/**
 * Performance monitoring hook
 */
export function usePerformanceMonitoring() {
  const metricsRef = useRef<PerformanceMetrics>({})
  const observerRef = useRef<PerformanceObserver | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Initialize performance monitoring
    initializeWebVitalsMonitoring()
    initializeNavigationTiming()
    
    // Send metrics after page load
    const timeout = setTimeout(() => {
      sendPerformanceMetrics()
    }, 2000) // Wait 2 seconds after load

    return () => {
      clearTimeout(timeout)
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  /**
   * Initialize Core Web Vitals monitoring
   */
  const initializeWebVitalsMonitoring = () => {
    try {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        if (entries.length > 0) {
          const lastEntry = entries[entries.length - 1] as any
          metricsRef.current.lcp = Math.round(lastEntry.startTime)
        }
      })
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        entries.forEach((entry: any) => {
          if (entry.processingStart && entry.startTime) {
            metricsRef.current.fid = Math.round(entry.processingStart - entry.startTime)
          }
        })
      })
      fidObserver.observe({ type: 'first-input', buffered: true })

      // Cumulative Layout Shift (CLS)
      let clsValue = 0
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
            metricsRef.current.cls = Math.round(clsValue * 1000) / 1000 // Round to 3 decimal places
          }
        }
      })
      clsObserver.observe({ type: 'layout-shift', buffered: true })

      observerRef.current = lcpObserver // Store one observer for cleanup
      
    } catch (error) {
      console.warn('Performance monitoring not supported:', error)
    }
  }

  /**
   * Initialize navigation timing metrics
   */
  const initializeNavigationTiming = () => {
    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      if (navigation) {
        const timing = {
          domainLookup: Math.round(navigation.domainLookupEnd - navigation.domainLookupStart),
          connection: Math.round(navigation.connectEnd - navigation.connectStart),
          request: Math.round(navigation.requestStart - navigation.connectEnd),
          response: Math.round(navigation.responseEnd - navigation.requestStart),
          domProcessing: Math.round(navigation.domContentLoadedEventStart - navigation.responseEnd),
          domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
          loadComplete: Math.round(navigation.loadEventEnd - navigation.loadEventStart)
        }
        
        metricsRef.current.navigationTiming = timing
        metricsRef.current.domContentLoaded = Math.round(navigation.domContentLoadedEventEnd)
        metricsRef.current.loadComplete = Math.round(navigation.loadEventEnd)
        metricsRef.current.ttfb = Math.round(navigation.responseStart - navigation.requestStart)
      }

      // First Contentful Paint
      const paintEntries = performance.getEntriesByType('paint')
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint')
      if (fcpEntry) {
        metricsRef.current.fcp = Math.round(fcpEntry.startTime)
      }

    } catch (error) {
      console.warn('Navigation timing not available:', error)
    }
  }

  /**
   * Get memory usage if available
   */
  const getMemoryUsage = (): PerformanceMetrics['memoryUsage'] => {
    try {
      const memory = (performance as any).memory
      if (memory) {
        return {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit
        }
      }
    } catch {
      // Memory API not available
    }
    return undefined
  }

  /**
   * Send performance metrics to analytics
   */
  const sendPerformanceMetrics = async () => {
    try {
      const metrics: PerformanceMetrics = {
        ...metricsRef.current,
        memoryUsage: getMemoryUsage()
      }

      // Send to analytics API
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics,
          page: window.location.pathname,
          userAgent: navigator.userAgent,
          timestamp: Date.now()
        })
      })

    } catch (error) {
      console.error('Failed to send performance metrics:', error)
    }
  }

  /**
   * Track API performance
   */
  const trackAPIPerformance = (metrics: APIPerformanceMetrics) => {
    try {
      fetch('/api/analytics/api-performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics)
      }).catch(error => {
        console.error('Failed to track API performance:', error)
      })
    } catch (error) {
      console.error('API performance tracking error:', error)
    }
  }

  /**
   * Get current performance metrics
   */
  const getCurrentMetrics = (): PerformanceMetrics => {
    return {
      ...metricsRef.current,
      memoryUsage: getMemoryUsage()
    }
  }

  return {
    getCurrentMetrics,
    trackAPIPerformance,
    sendPerformanceMetrics
  }
}

/**
 * Higher-order function to wrap fetch with performance tracking
 */
export function createPerformanceTrackedFetch(trackAPIPerformance: (url: string, duration: number, success: boolean, status?: number) => void) {  
  return async (url: string, options?: RequestInit): Promise<Response> => {
    const startTime = performance.now()
    
    try {
      const response = await fetch(url, options)
      const endTime = performance.now()
      const duration = Math.round(endTime - startTime)
      
      // Track the API call performance
      trackAPIPerformance(url, duration, response.ok, response.status)
      
      return response
      
    } catch (error) {
      const endTime = performance.now()
      const duration = Math.round(endTime - startTime)
      
      // Track failed API call
      trackAPIPerformance(url, duration, false, 0)
      
      throw error
    }
  }
}

/**
 * Performance utility functions
 */
export const PerformanceUtils = {
  
  /**
   * Check if Core Web Vitals are good
   */
  isGoodPerformance(metrics: PerformanceMetrics): {
    lcp: boolean
    fid: boolean
    cls: boolean
    overall: boolean
  } {
    const lcpGood = (metrics.lcp ?? 0) <= 2500 // 2.5 seconds
    const fidGood = (metrics.fid ?? 0) <= 100   // 100 milliseconds
    const clsGood = (metrics.cls ?? 0) <= 0.1   // 0.1 score
    
    return {
      lcp: lcpGood,
      fid: fidGood,
      cls: clsGood,
      overall: lcpGood && fidGood && clsGood
    }
  },

  /**
   * Get performance score (0-100)
   */
  getPerformanceScore(metrics: PerformanceMetrics): number {
    let score = 0
    let factors = 0

    // LCP Score (0-40 points)
    if (metrics.lcp !== undefined) {
      factors++
      if (metrics.lcp <= 2500) score += 40
      else if (metrics.lcp <= 4000) score += 20
    }

    // FID Score (0-30 points)
    if (metrics.fid !== undefined) {
      factors++
      if (metrics.fid <= 100) score += 30
      else if (metrics.fid <= 300) score += 15
    }

    // CLS Score (0-30 points)
    if (metrics.cls !== undefined) {
      factors++
      if (metrics.cls <= 0.1) score += 30
      else if (metrics.cls <= 0.25) score += 15
    }

    return factors > 0 ? Math.round(score / factors * 100) : 0
  },

  /**
   * Format duration in human-readable format
   */
  formatDuration(ms: number): string {
    if (ms < 1000) return `${Math.round(ms)}ms`
    return `${(ms / 1000).toFixed(1)}s`
  },

  /**
   * Format bytes in human-readable format
   */
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }
}
