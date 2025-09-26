/**
 * Server-Side Error Logging Service
 * Phase 6: Performance Monitoring - Server Error Handling
 * 
 * Provides server-side error logging, alerting, and monitoring
 */

import { supabaseAdmin } from '@/lib/supabase'

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ErrorCategory {
  API = 'api',
  DATABASE = 'database',
  EMAIL = 'email',
  EXTERNAL_SERVICE = 'external_service',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  SYSTEM = 'system'
}

interface ServerErrorDetails {
  message: string
  stack?: string
  severity: ErrorSeverity
  category: ErrorCategory
  endpoint?: string
  method?: string
  userId?: string
  requestId?: string
  userAgent?: string
  ip?: string
  statusCode?: number
  metadata?: Record<string, any>
  context?: Record<string, any>
}

interface AlertRule {
  id: string
  errorPattern: RegExp | string
  severity: ErrorSeverity
  threshold: number // Number of occurrences within timeWindow
  timeWindow: number // Minutes
  alertMethod: 'console' | 'database' | 'webhook'
  webhookUrl?: string
  enabled: boolean
}

class ServerErrorLogger {
  private static instance: ServerErrorLogger
  private alertRules: AlertRule[] = []
  private errorCounts: Map<string, { count: number; lastReset: number }> = new Map()
  
  private constructor() {
    this.initializeAlertRules()
    this.startErrorCountReset()
  }
  
  public static getInstance(): ServerErrorLogger {
    if (!ServerErrorLogger.instance) {
      ServerErrorLogger.instance = new ServerErrorLogger()
    }
    return ServerErrorLogger.instance
  }
  
  /**
   * Initialize default alert rules
   */
  private initializeAlertRules() {
    this.alertRules = [
      {
        id: 'critical-errors',
        errorPattern: /critical|fatal|crash/i,
        severity: ErrorSeverity.CRITICAL,
        threshold: 1,
        timeWindow: 5,
        alertMethod: 'database',
        enabled: true
      },
      {
        id: 'database-errors',
        errorPattern: /database|supabase|sql/i,
        severity: ErrorSeverity.HIGH,
        threshold: 5,
        timeWindow: 10,
        alertMethod: 'database',
        enabled: true
      },
      {
        id: 'auth-errors',
        errorPattern: /unauthorized|forbidden|auth/i,
        severity: ErrorSeverity.MEDIUM,
        threshold: 10,
        timeWindow: 15,
        alertMethod: 'database',
        enabled: true
      },
      {
        id: 'api-errors',
        errorPattern: /api|endpoint|route/i,
        severity: ErrorSeverity.MEDIUM,
        threshold: 20,
        timeWindow: 15,
        alertMethod: 'database',
        enabled: true
      }
    ]
  }
  
  /**
   * Log an error with automatic alerting
   */
  async logError(error: Error | string, details?: Partial<ServerErrorDetails>): Promise<void> {
    const errorMessage = error instanceof Error ? error.message : error
    const stack = error instanceof Error ? error.stack : undefined
    
    const errorDetails: ServerErrorDetails = {
      message: errorMessage,
      stack,
      severity: details?.severity || ErrorSeverity.MEDIUM,
      category: details?.category || ErrorCategory.SYSTEM,
      endpoint: details?.endpoint,
      method: details?.method,
      userId: details?.userId,
      requestId: details?.requestId,
      userAgent: details?.userAgent,
      ip: details?.ip,
      statusCode: details?.statusCode,
      metadata: details?.metadata,
      context: details?.context
    }
    
    try {
      // Store error in database
      await this.storeError(errorDetails)
      
      // Check for alerts
      await this.checkAlertRules(errorDetails)
      
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Server Error:', errorDetails)
      }
    } catch (logError) {
      // Fallback to console if database logging fails
      console.error('Failed to log error:', logError)
      console.error('Original error:', errorDetails)
    }
  }
  
  /**
   * Store error in database
   */
  private async storeError(error: ServerErrorDetails): Promise<void> {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not available')
    }
    
    const { error: dbError } = await (supabaseAdmin as any)
      .from('page_analytics')
      .insert([
        {
          page_path: error.endpoint || '/server',
          event_type: 'server_error',
          timestamp: new Date().toISOString(),
          user_agent_hash: error.userAgent ? await this.hashString(error.userAgent) : null,
          metadata: {
            server_error: {
              message: error.message,
              stack: error.stack,
              severity: error.severity,
              category: error.category,
              method: error.method,
              userId: error.userId,
              requestId: error.requestId,
              statusCode: error.statusCode,
              ip_hash: error.ip ? await this.hashString(error.ip) : null,
              context: error.context,
              ...error.metadata
            }
          }
        }
      ])
    
    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`)
    }
  }
  
  /**
   * Check alert rules and trigger alerts if thresholds are met
   */
  private async checkAlertRules(error: ServerErrorDetails): Promise<void> {
    for (const rule of this.alertRules) {
      if (!rule.enabled) continue
      
      const matches = this.errorMatchesRule(error, rule)
      if (!matches) continue
      
      // Update error count for this rule
      const countKey = `${rule.id}-${Math.floor(Date.now() / (rule.timeWindow * 60000))}`
      const current = this.errorCounts.get(countKey) || { count: 0, lastReset: Date.now() }
      current.count++
      this.errorCounts.set(countKey, current)
      
      // Check if threshold is exceeded
      if (current.count >= rule.threshold) {
        await this.triggerAlert(rule, error, current.count)
        // Reset count to prevent duplicate alerts
        current.count = 0
        this.errorCounts.set(countKey, current)
      }
    }
  }
  
  /**
   * Check if error matches alert rule
   */
  private errorMatchesRule(error: ServerErrorDetails, rule: AlertRule): boolean {
    const pattern = rule.errorPattern
    const searchText = `${error.message} ${error.category} ${error.endpoint || ''}`
    
    if (pattern instanceof RegExp) {
      return pattern.test(searchText)
    }
    
    return searchText.toLowerCase().includes(pattern.toLowerCase())
  }
  
  /**
   * Trigger alert based on rule
   */
  private async triggerAlert(rule: AlertRule, error: ServerErrorDetails, count: number): Promise<void> {
    const alertMessage = `Alert: ${rule.id} triggered. ${count} ${error.severity} errors in ${rule.timeWindow} minutes. Latest: ${error.message}`
    
    switch (rule.alertMethod) {
      case 'console':
        console.error(`🚨 ${alertMessage}`)
        break
        
      case 'database':
        await this.storeAlert(rule, error, count, alertMessage)
        break
        
      case 'webhook':
        if (rule.webhookUrl) {
          await this.sendWebhookAlert(rule.webhookUrl, alertMessage, error)
        }
        break
    }
  }
  
  /**
   * Store alert in database
   */
  private async storeAlert(rule: AlertRule, error: ServerErrorDetails, count: number, message: string): Promise<void> {
    if (!supabaseAdmin) return
    
    try {
      await (supabaseAdmin as any)
        .from('page_analytics')
        .insert([
          {
            page_path: '/admin/alerts',
            event_type: 'system_alert',
            timestamp: new Date().toISOString(),
            metadata: {
              alert: {
                ruleId: rule.id,
                severity: rule.severity,
                message,
                count,
                timeWindow: rule.timeWindow,
                originalError: {
                  message: error.message,
                  category: error.category,
                  endpoint: error.endpoint,
                  severity: error.severity
                }
              }
            }
          }
        ])
    } catch (dbError) {
      console.error('Failed to store alert:', dbError)
    }
  }
  
  /**
   * Send webhook alert
   */
  private async sendWebhookAlert(url: string, message: string, error: ServerErrorDetails): Promise<void> {
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: message,
          error: {
            message: error.message,
            severity: error.severity,
            category: error.category,
            endpoint: error.endpoint,
            timestamp: new Date().toISOString()
          }
        })
      })
    } catch (webhookError) {
      console.error('Failed to send webhook alert:', webhookError)
    }
  }
  
  /**
   * Reset error counts periodically
   */
  private startErrorCountReset(): void {
    setInterval(() => {
      const now = Date.now()
      const cutoff = 60 * 60 * 1000 // 1 hour
      
      for (const [key, value] of this.errorCounts.entries()) {
        if (now - value.lastReset > cutoff) {
          this.errorCounts.delete(key)
        }
      }
    }, 5 * 60 * 1000) // Clean up every 5 minutes
  }
  
  /**
   * Get error statistics
   */
  async getErrorStats(days = 7): Promise<{
    totalErrors: number
    errorsBySeverity: Record<ErrorSeverity, number>
    errorsByCategory: Record<ErrorCategory, number>
    topErrors: Array<{ message: string; count: number }>
  }> {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not available')
    }
    
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const { data, error } = await (supabaseAdmin as any)
      .from('page_analytics')
      .select('metadata')
      .eq('event_type', 'server_error')
      .gte('timestamp', startDate.toISOString())
    
    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }
    
    const stats = {
      totalErrors: data?.length || 0,
      errorsBySeverity: {
        [ErrorSeverity.LOW]: 0,
        [ErrorSeverity.MEDIUM]: 0,
        [ErrorSeverity.HIGH]: 0,
        [ErrorSeverity.CRITICAL]: 0
      },
      errorsByCategory: {
        [ErrorCategory.API]: 0,
        [ErrorCategory.DATABASE]: 0,
        [ErrorCategory.EMAIL]: 0,
        [ErrorCategory.EXTERNAL_SERVICE]: 0,
        [ErrorCategory.VALIDATION]: 0,
        [ErrorCategory.AUTHENTICATION]: 0,
        [ErrorCategory.SYSTEM]: 0
      },
      topErrors: [] as Array<{ message: string; count: number }>
    }
    
    const errorMessages: Record<string, number> = {}
    
    data?.forEach((item: any) => {
      const serverError = item.metadata?.server_error
      if (serverError) {
        // Count by severity
        if (serverError.severity in stats.errorsBySeverity) {
          stats.errorsBySeverity[serverError.severity as ErrorSeverity]++
        }
        
        // Count by category
        if (serverError.category in stats.errorsByCategory) {
          stats.errorsByCategory[serverError.category as ErrorCategory]++
        }
        
        // Count error messages
        const message = serverError.message || 'Unknown error'
        errorMessages[message] = (errorMessages[message] || 0) + 1
      }
    })
    
    // Get top errors
    stats.topErrors = Object.entries(errorMessages)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([message, count]) => ({ message, count }))
    
    return stats
  }
  
  /**
   * Add custom alert rule
   */
  addAlertRule(rule: AlertRule): void {
    this.alertRules.push(rule)
  }
  
  /**
   * Remove alert rule
   */
  removeAlertRule(ruleId: string): void {
    this.alertRules = this.alertRules.filter(rule => rule.id !== ruleId)
  }
  
  /**
   * Hash string for privacy
   */
  private async hashString(input: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(input)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }
}

// Singleton instance
const serverErrorLogger = ServerErrorLogger.getInstance()

/**
 * Utility functions for easy error logging
 */
export const logError = (error: Error | string, details?: Partial<ServerErrorDetails>) => {
  return serverErrorLogger.logError(error, details)
}

export const logApiError = (error: Error | string, endpoint: string, method: string, statusCode?: number, userId?: string) => {
  return serverErrorLogger.logError(error, {
    category: ErrorCategory.API,
    endpoint,
    method,
    statusCode,
    userId,
    severity: statusCode && statusCode >= 500 ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM
  })
}

export const logDatabaseError = (error: Error | string, context?: Record<string, any>) => {
  return serverErrorLogger.logError(error, {
    category: ErrorCategory.DATABASE,
    severity: ErrorSeverity.HIGH,
    context
  })
}

export const logEmailError = (error: Error | string, context?: Record<string, any>) => {
  return serverErrorLogger.logError(error, {
    category: ErrorCategory.EMAIL,
    severity: ErrorSeverity.MEDIUM,
    context
  })
}

export const getErrorStats = (days?: number) => {
  return serverErrorLogger.getErrorStats(days)
}

export { serverErrorLogger }

/**
 * Next.js API route error handler middleware
 */
export function withErrorHandler(handler: Function) {
  return async (req: any, res: any) => {
    try {
      return await handler(req, res)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      await logApiError(
        error instanceof Error ? error : new Error(errorMessage),
        req.url || 'unknown',
        req.method || 'unknown',
        500,
        req.headers['user-id'] || undefined
      )
      
      // Don't expose internal errors in production
      const isProduction = process.env.NODE_ENV === 'production'
      
      return res.status(500).json({
        success: false,
        error: isProduction ? 'Internal server error' : errorMessage,
        ...(isProduction ? {} : { stack: error instanceof Error ? error.stack : undefined })
      })
    }
  }
}
