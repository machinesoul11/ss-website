import { supabaseAdmin } from '../supabase'
import { EmailEvent } from '../../types'

/**
 * A/B Testing and Email Campaign Optimization Service
 * Handles split testing, performance tracking, and optimization recommendations
 */

export interface ABTestConfig {
  campaign_id: string
  test_name: string
  test_type: 'subject_line' | 'send_time' | 'content' | 'sender_name'
  variant_a: {
    name: string
    config: Record<string, unknown>
  }
  variant_b: {
    name: string
    config: Record<string, unknown>
  }
  split_percentage: number // e.g., 50 for 50/50 split
  sample_size: number
  duration_hours: number
  success_metric: 'open_rate' | 'click_rate' | 'conversion_rate'
  confidence_level: number // e.g., 95 for 95% confidence
}

export interface ABTestResult {
  test_id: string
  status: 'running' | 'completed' | 'stopped'
  start_date: string
  end_date?: string
  variant_a_results: {
    sent: number
    opened: number
    clicked: number
    converted: number
    open_rate: number
    click_rate: number
    conversion_rate: number
  }
  variant_b_results: {
    sent: number
    opened: number
    clicked: number
    converted: number
    open_rate: number
    click_rate: number
    conversion_rate: number
  }
  winner?: 'variant_a' | 'variant_b' | 'inconclusive'
  statistical_significance: number
  recommendations: string[]
}

export interface OptimalSendTimeAnalysis {
  user_segment: string
  recommended_times: {
    hour: number
    day_of_week: number
    open_rate: number
    click_rate: number
    sample_size: number
  }[]
  timezone: string
  confidence_score: number
}

export class EmailOptimizationService {
  
  /**
   * Create A/B test for email campaigns
   */
  static async createABTest(config: ABTestConfig): Promise<{
    test_id: string
    error: string | null
  }> {
    try {
      const testId = `ab-test-${Date.now()}`
      
      if (!supabaseAdmin) {
        throw new Error('Database not available')
      }

      // Store A/B test configuration
      const { error } = await (supabaseAdmin?.from('ab_tests') as any)?.insert([{
        test_id: testId,
        campaign_id: config.campaign_id,
        test_name: config.test_name,
        test_type: config.test_type,
        variant_a: config.variant_a,
        variant_b: config.variant_b,
        split_percentage: config.split_percentage,
        sample_size: config.sample_size,
        duration_hours: config.duration_hours,
        success_metric: config.success_metric,
        confidence_level: config.confidence_level,
        status: 'running',
        start_date: new Date().toISOString()
      }])

      if (error) {
        return { test_id: '', error: error.message }
      }

      return { test_id: testId, error: null }
    } catch (err) {
      console.error('Error creating A/B test:', err)
      return { test_id: '', error: 'Failed to create A/B test' }
    }
  }

  /**
   * Analyze A/B test results
   */
  static async analyzeABTest(testId: string): Promise<{
    results: ABTestResult | null
    error: string | null
  }> {
    try {
      if (!supabaseAdmin) {
        throw new Error('Database not available')
      }

      // Get test configuration
      const { data: testConfig, error: testError } = await supabaseAdmin
        .from('ab_tests')
        .select('*')
        .eq('test_id', testId)
        .single()

      if (testError || !testConfig) {
        return { results: null, error: 'Test not found' }
      }

      // Get email events for both variants
      const { data: events, error: eventsError } = await supabaseAdmin
        .from('email_events')
        .select('*')
        .eq('campaign_id', (testConfig as any).campaign_id)

      if (eventsError) {
        return { results: null, error: eventsError.message }
      }

      // Calculate results for each variant
      const variantAResults = this.calculateVariantResults(
        (events as any[])?.filter(e => e.metadata?.ab_variant === 'a') || []
      )
      const variantBResults = this.calculateVariantResults(
        (events as any[])?.filter(e => e.metadata?.ab_variant === 'b') || []
      )

      // Determine statistical significance and winner
      const { winner, significance } = this.calculateStatisticalSignificance(
        variantAResults,
        variantBResults,
        (testConfig as any).success_metric,
        (testConfig as any).confidence_level
      )

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        variantAResults,
        variantBResults,
        testConfig,
        winner,
        significance
      )

      const results: ABTestResult = {
        test_id: testId,
        status: (testConfig as any).status,
        start_date: (testConfig as any).start_date,
        end_date: (testConfig as any).end_date,
        variant_a_results: variantAResults,
        variant_b_results: variantBResults,
        winner: winner as 'variant_a' | 'variant_b' | 'inconclusive',
        statistical_significance: significance,
        recommendations
      }

      return { results, error: null }
    } catch (err) {
      console.error('Error analyzing A/B test:', err)
      return { results: null, error: 'Failed to analyze A/B test' }
    }
  }

  /**
   * Analyze optimal send times for different user segments
   */
  static async analyzeOptimalSendTimes(
    segmentFilter?: {
      engagement_level?: 'high' | 'medium' | 'low'
      team_size?: string[]
      signup_age_days?: number
    }
  ): Promise<{
    analysis: OptimalSendTimeAnalysis[]
    error: string | null
  }> {
    try {
      if (!supabaseAdmin) {
        throw new Error('Database not available')
      }

      // Get email events with timestamps for the last 90 days
      const ninetyDaysAgo = new Date()
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

      const { data: events, error } = await supabaseAdmin
        .from('email_events')
        .select(`
          *,
          beta_signups!inner(*)
        `)
        .gte('timestamp', ninetyDaysAgo.toISOString())
        .in('event_type', ['opened', 'clicked'])

      if (error || !events) {
        return { analysis: [], error: 'Failed to fetch email events' }
      }

      // Group events by user segments and time patterns
      const timeAnalysis = this.groupEventsByTimeAndSegment(events, segmentFilter)
      
      // Calculate optimal send times for each segment
      const analysis = timeAnalysis.map(segment => {
        const recommendedTimes = this.calculateOptimalTimes(segment.events)
        return {
          user_segment: segment.name,
          recommended_times: recommendedTimes,
          timezone: 'UTC', // Could be enhanced to detect user timezones
          confidence_score: this.calculateConfidenceScore(segment.events.length)
        }
      })

      return { analysis, error: null }
    } catch (err) {
      console.error('Error analyzing optimal send times:', err)
      return { analysis: [], error: 'Failed to analyze send times' }
    }
  }

  /**
   * Get engagement rates by different factors
   */
  static async getEngagementAnalytics(
    timeframe: 'week' | 'month' | 'quarter' = 'month'
  ): Promise<{
    analytics: {
      overall_rates: {
        open_rate: number
        click_rate: number
        unsubscribe_rate: number
      }
      by_campaign_type: Array<{
        type: string
        open_rate: number
        click_rate: number
        send_count: number
      }>
      by_day_of_week: Array<{
        day: string
        open_rate: number
        click_rate: number
        send_count: number
      }>
      by_hour: Array<{
        hour: number
        open_rate: number
        click_rate: number
        send_count: number
      }>
      trends: {
        open_rate_trend: number // percentage change
        click_rate_trend: number
        growth_rate: number
      }
    }
    error: string | null
  }> {
    try {
      if (!supabaseAdmin) {
        throw new Error('Database not available')
      }

      const timeframeDays = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 90
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - timeframeDays)

      // Get email events for the timeframe
      const { data: events, error } = await supabaseAdmin
        .from('email_events')
        .select('*')
        .gte('timestamp', startDate.toISOString())

      if (error || !events) {
        return { 
          analytics: {
            overall_rates: { open_rate: 0, click_rate: 0, unsubscribe_rate: 0 },
            by_campaign_type: [],
            by_day_of_week: [],
            by_hour: [],
            trends: { open_rate_trend: 0, click_rate_trend: 0, growth_rate: 0 }
          }, 
          error: 'Failed to fetch analytics data' 
        }
      }

      // Calculate overall rates
      const sentEvents = (events as any[]).filter(e => e.event_type === 'sent')
      const openedEvents = (events as any[]).filter(e => e.event_type === 'opened')
      const clickedEvents = (events as any[]).filter(e => e.event_type === 'clicked')
      const unsubscribeEvents = (events as any[]).filter(e => e.event_type === 'unsubscribe')

      const overallRates = {
        open_rate: sentEvents.length > 0 ? (openedEvents.length / sentEvents.length) * 100 : 0,
        click_rate: sentEvents.length > 0 ? (clickedEvents.length / sentEvents.length) * 100 : 0,
        unsubscribe_rate: sentEvents.length > 0 ? (unsubscribeEvents.length / sentEvents.length) * 100 : 0
      }

      // Group by campaign type
      const campaignTypes = [...new Set((events as any[]).map(e => e.email_type).filter(Boolean))]
      const byCampaignType = campaignTypes.map(type => {
        const typeEvents = (events as any[]).filter(e => e.email_type === type)
        const typeSent = typeEvents.filter(e => e.event_type === 'sent')
        const typeOpened = typeEvents.filter(e => e.event_type === 'opened')
        const typeClicked = typeEvents.filter(e => e.event_type === 'clicked')

        return {
          type,
          open_rate: typeSent.length > 0 ? (typeOpened.length / typeSent.length) * 100 : 0,
          click_rate: typeSent.length > 0 ? (typeClicked.length / typeSent.length) * 100 : 0,
          send_count: typeSent.length
        }
      })

      // Group by day of week
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const byDayOfWeek = dayNames.map(dayName => {
        const dayIndex = dayNames.indexOf(dayName)
        const dayEvents = (events as any[]).filter(e => new Date(e.timestamp).getDay() === dayIndex)
        const daySent = dayEvents.filter(e => e.event_type === 'sent')
        const dayOpened = dayEvents.filter(e => e.event_type === 'opened')
        const dayClicked = dayEvents.filter(e => e.event_type === 'clicked')

        return {
          day: dayName,
          open_rate: daySent.length > 0 ? (dayOpened.length / daySent.length) * 100 : 0,
          click_rate: daySent.length > 0 ? (dayClicked.length / daySent.length) * 100 : 0,
          send_count: daySent.length
        }
      })

      // Group by hour of day
      const byHour = Array.from({ length: 24 }, (_, hour) => {
        const hourEvents = (events as any[]).filter(e => new Date(e.timestamp).getHours() === hour)
        const hourSent = hourEvents.filter(e => e.event_type === 'sent')
        const hourOpened = hourEvents.filter(e => e.event_type === 'opened')
        const hourClicked = hourEvents.filter(e => e.event_type === 'clicked')

        return {
          hour,
          open_rate: hourSent.length > 0 ? (hourOpened.length / hourSent.length) * 100 : 0,
          click_rate: hourSent.length > 0 ? (hourClicked.length / hourSent.length) * 100 : 0,
          send_count: hourSent.length
        }
      })

      // Calculate trends (simplified - comparing to previous period)
      const trends = {
        open_rate_trend: 0, // Would need historical data
        click_rate_trend: 0, // Would need historical data  
        growth_rate: 0 // Would calculate based on new signups
      }

      return {
        analytics: {
          overall_rates: overallRates,
          by_campaign_type: byCampaignType,
          by_day_of_week: byDayOfWeek,
          by_hour: byHour,
          trends
        },
        error: null
      }
    } catch (err) {
      console.error('Error getting engagement analytics:', err)
      return { 
        analytics: {
          overall_rates: { open_rate: 0, click_rate: 0, unsubscribe_rate: 0 },
          by_campaign_type: [],
          by_day_of_week: [],
          by_hour: [],
          trends: { open_rate_trend: 0, click_rate_trend: 0, growth_rate: 0 }
        }, 
        error: 'Failed to calculate analytics' 
      }
    }
  }

  // Private helper methods
  private static calculateVariantResults(events: EmailEvent[]) {
    const sent = events.filter(e => e.event_type === 'sent').length
    const opened = events.filter(e => e.event_type === 'opened').length
    const clicked = events.filter(e => e.event_type === 'clicked').length
    const converted = 0 // Would need conversion tracking

    return {
      sent,
      opened,
      clicked,
      converted,
      open_rate: sent > 0 ? (opened / sent) * 100 : 0,
      click_rate: sent > 0 ? (clicked / sent) * 100 : 0,
      conversion_rate: sent > 0 ? (converted / sent) * 100 : 0
    }
  }

  private static calculateStatisticalSignificance(
    variantA: any,
    variantB: any,
    metric: string,
    confidenceLevel: number
  ) {
    // Simplified statistical significance calculation
    // In production, use proper statistical methods like Chi-square test
    const getMetricValue = (variant: any, metric: string) => {
      switch (metric) {
        case 'open_rate': return variant.open_rate
        case 'click_rate': return variant.click_rate
        case 'conversion_rate': return variant.conversion_rate
        default: return 0
      }
    }

    const valueA = getMetricValue(variantA, metric)
    const valueB = getMetricValue(variantB, metric)
    const difference = Math.abs(valueA - valueB)
    
    // Simplified significance calculation (would use proper statistical test in production)
    const significance = Math.min(difference * 10, 99) // Placeholder calculation

    const winner = significance >= (100 - confidenceLevel) 
      ? (valueA > valueB ? 'variant_a' : 'variant_b')
      : 'inconclusive'

    return { winner, significance }
  }

  private static generateRecommendations(
    variantA: any,
    variantB: any,
    testConfig: any,
    winner: string | undefined,
    significance: number
  ): string[] {
    const recommendations: string[] = []

    if (winner === 'inconclusive') {
      recommendations.push('Test is inconclusive. Consider running longer or with a larger sample size.')
    } else if (winner === 'variant_a') {
      recommendations.push('Variant A performed better. Consider implementing these changes.')
    } else {
      recommendations.push('Variant B performed better. Consider implementing these changes.')
    }

    // Add specific recommendations based on test type
    if (testConfig.test_type === 'subject_line') {
      if (variantA.open_rate > variantB.open_rate) {
        recommendations.push('Consider using more engaging subject lines similar to Variant A.')
      }
    }

    if (significance < 95) {
      recommendations.push('Statistical significance is low. Results may not be reliable.')
    }

    return recommendations
  }

  private static groupEventsByTimeAndSegment(events: any[], _segmentFilter?: any) {
    // Simplified segmentation - would be more sophisticated in production
    return [{
      name: 'all_users',
      events: events
    }]
  }

  private static calculateOptimalTimes(events: any[]) {
    // Group events by hour and day of week, calculate engagement rates
    const timeSlots: Record<string, { opens: number, clicks: number, total: number }> = {}

    events.forEach(event => {
      const date = new Date(event.timestamp)
      const hour = date.getHours()
      const dayOfWeek = date.getDay()
      const key = `${dayOfWeek}-${hour}`

      if (!timeSlots[key]) {
        timeSlots[key] = { opens: 0, clicks: 0, total: 0 }
      }

      timeSlots[key].total++
      if (event.event_type === 'opened') timeSlots[key].opens++
      if (event.event_type === 'clicked') timeSlots[key].clicks++
    })

    // Convert to recommended times format
    return Object.entries(timeSlots)
      .map(([key, stats]) => {
        const [dayOfWeek, hour] = key.split('-').map(Number)
        return {
          hour,
          day_of_week: dayOfWeek,
          open_rate: stats.total > 0 ? (stats.opens / stats.total) * 100 : 0,
          click_rate: stats.total > 0 ? (stats.clicks / stats.total) * 100 : 0,
          sample_size: stats.total
        }
      })
      .filter(time => time.sample_size >= 10) // Only include times with sufficient data
      .sort((a, b) => b.open_rate - a.open_rate)
      .slice(0, 5) // Top 5 times
  }

  private static calculateConfidenceScore(sampleSize: number): number {
    // Simple confidence scoring based on sample size
    if (sampleSize >= 1000) return 95
    if (sampleSize >= 500) return 85
    if (sampleSize >= 100) return 70
    if (sampleSize >= 50) return 60
    return 40
  }
}
