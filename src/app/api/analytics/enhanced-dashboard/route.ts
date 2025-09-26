/**
 * Enhanced Analytics Dashboard API
 * Provides detailed analytics data for Phase 6 custom event tracking
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateRange = searchParams.get('range') || '7d' // 7d, 30d, 90d
    const metric = searchParams.get('metric') // specific metric to query

    const endDate = new Date()
    const startDate = new Date()

    switch (dateRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(endDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(endDate.getDate() - 90)
        break
      default:
        startDate.setDate(endDate.getDate() - 7)
    }

    // Query different analytics tables based on metric
    let data = {}

    if (!metric || metric === 'all') {
      // Get comprehensive dashboard data
      data = await getComprehensiveAnalytics(startDate, endDate)
    } else {
      // Get specific metric data
      data = await getSpecificMetric(metric, startDate, endDate)
    }

    return NextResponse.json({
      success: true,
      data,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        range: dateRange,
      },
    })
  } catch (error) {
    console.error('Enhanced analytics dashboard error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch analytics data',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

async function getComprehensiveAnalytics(startDate: Date, endDate: Date) {
  const results = await Promise.allSettled([
    getFormAnalytics(startDate, endDate),
    getCTAAnalytics(startDate, endDate),
    getScrollDepthAnalytics(startDate, endDate),
    getEngagementAnalytics(startDate, endDate),
    getReferrerAnalytics(startDate, endDate),
    getFunnelAnalytics(startDate, endDate),
    getConversionAnalytics(startDate, endDate),
  ])

  return {
    formAnalytics: results[0].status === 'fulfilled' ? results[0].value : null,
    ctaAnalytics: results[1].status === 'fulfilled' ? results[1].value : null,
    scrollDepthAnalytics:
      results[2].status === 'fulfilled' ? results[2].value : null,
    engagementAnalytics:
      results[3].status === 'fulfilled' ? results[3].value : null,
    referrerAnalytics:
      results[4].status === 'fulfilled' ? results[4].value : null,
    funnelAnalytics:
      results[5].status === 'fulfilled' ? results[5].value : null,
    conversionAnalytics:
      results[6].status === 'fulfilled' ? results[6].value : null,
    errors: results
      .filter((r) => r.status === 'rejected')
      .map((r, i) => ({
        metric: [
          'form',
          'cta',
          'scroll',
          'engagement',
          'referrer',
          'funnel',
          'conversion',
        ][i],
        error: r.reason,
      })),
  }
}

async function getSpecificMetric(
  metric: string,
  startDate: Date,
  endDate: Date
) {
  switch (metric) {
    case 'forms':
      return getFormAnalytics(startDate, endDate)
    case 'cta':
      return getCTAAnalytics(startDate, endDate)
    case 'scroll':
      return getScrollDepthAnalytics(startDate, endDate)
    case 'engagement':
      return getEngagementAnalytics(startDate, endDate)
    case 'referrer':
      return getReferrerAnalytics(startDate, endDate)
    case 'funnel':
      return getFunnelAnalytics(startDate, endDate)
    case 'conversion':
      return getConversionAnalytics(startDate, endDate)
    default:
      throw new Error(`Unknown metric: ${metric}`)
  }
}

async function getFormAnalytics(startDate: Date, endDate: Date) {
  // Form interaction analytics
  const { data: interactions } = await supabase
    .from('page_analytics')
    .select('*')
    .eq('event_type', 'form_interaction_detailed')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  // Form abandonment analytics
  const { data: abandonments } = await supabase
    .from('page_analytics')
    .select('*')
    .eq('event_type', 'form_abandonment')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  // Aggregate form data
  const formMetrics: {
    totalInteractions: number
    totalAbandonments: number
    completionRate: number
    averageTimePerField: number
    dropOffByStep: Record<string, number>
    mostProblematicFields: Array<{ field: string; errors: number }>
    formPerformance: Record<
      string,
      {
        completionRate: number
        averageTimeSpent: number
        dropOffStep: any
        totalAttempts: number
        completions: number
        abandonments: number
      }
    >
  } = {
    totalInteractions: interactions?.length || 0,
    totalAbandonments: abandonments?.length || 0,
    completionRate: 0,
    averageTimePerField: 0,
    dropOffByStep: {},
    mostProblematicFields: [],
    formPerformance: {},
  }

  if (interactions && interactions.length > 0) {
    // Calculate completion rates by form
    const formGroups = interactions.reduce((acc, interaction) => {
      const formId = interaction.properties?.form_id
      if (!acc[formId]) {
        acc[formId] = {
          interactions: [],
          completions: 0,
          abandonments: 0,
        }
      }
      acc[formId].interactions.push(interaction)

      if (
        interaction.properties?.action === 'submit' &&
        interaction.properties?.step_number ===
          interaction.properties?.total_steps
      ) {
        acc[formId].completions++
      }

      return acc
    }, {})

    // Add abandonment data
    abandonments?.forEach((abandonment) => {
      const formId = abandonment.properties?.form_id
      if (formGroups[formId]) {
        formGroups[formId].abandonments++
      }
    })

    // Calculate metrics per form
    Object.entries(formGroups).forEach(([formId, data]: [string, any]) => {
      const totalAttempts = new Set(
        data.interactions.map((i: any) => i.visitor_id)
      ).size
      formMetrics.formPerformance[formId] = {
        completionRate:
          totalAttempts > 0 ? (data.completions / totalAttempts) * 100 : 0,
        averageTimeSpent:
          data.interactions.reduce(
            (sum: number, i: any) => sum + (i.properties?.time_spent || 0),
            0
          ) / data.interactions.length,
        dropOffStep: calculateDropOffStep(data.interactions),
        totalAttempts,
        completions: data.completions,
        abandonments: data.abandonments,
      }
    })

    // Overall metrics
    const totalAttempts = new Set(interactions.map((i) => i.visitor_id)).size
    const totalCompletions = interactions.filter(
      (i) =>
        i.properties?.action === 'submit' &&
        i.properties?.step_number === i.properties?.total_steps
    ).length

    formMetrics.completionRate =
      totalAttempts > 0 ? (totalCompletions / totalAttempts) * 100 : 0
    formMetrics.averageTimePerField =
      interactions.reduce(
        (sum, i) => sum + (i.properties?.time_spent || 0),
        0
      ) / interactions.length

    // Calculate most problematic fields (highest error rates)
    const fieldErrors = interactions
      .filter((i) => i.properties?.has_errors)
      .reduce((acc, interaction) => {
        const fieldName = interaction.properties?.field_name
        acc[fieldName] = (acc[fieldName] || 0) + 1
        return acc
      }, {})

    formMetrics.mostProblematicFields = Object.entries(fieldErrors)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([field, errors]) => ({ field, errors: errors as number }))
  }

  return formMetrics
}

async function getCTAAnalytics(startDate: Date, endDate: Date) {
  const { data: ctaClicks } = await supabase
    .from('page_analytics')
    .select('*')
    .eq('event_type', 'cta_click_detailed')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  const ctaMetrics: {
    totalClicks: number
    clicksByPosition: Record<string, number>
    clicksByType: Record<string, number>
    topPerformingCTAs: Array<{
      text: string
      clicks: number
      uniqueUsers: number
      clickThroughRate: number
      positions: string[]
      destinations: string[]
    }>
    conversionRates: Record<string, number>
  } = {
    totalClicks: ctaClicks?.length || 0,
    clicksByPosition: {},
    clicksByType: {},
    topPerformingCTAs: [],
    conversionRates: {},
  }

  if (ctaClicks && ctaClicks.length > 0) {
    // Group by position
    ctaMetrics.clicksByPosition = ctaClicks.reduce((acc, click) => {
      const position = click.properties?.cta_position || 'unknown'
      acc[position] = (acc[position] || 0) + 1
      return acc
    }, {})

    // Group by type
    ctaMetrics.clicksByType = ctaClicks.reduce((acc, click) => {
      const type = click.properties?.cta_type || 'unknown'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {})

    // Top performing CTAs
    const ctaGroups = ctaClicks.reduce((acc, click) => {
      const ctaText = click.properties?.cta_text || 'Unknown CTA'
      if (!acc[ctaText]) {
        acc[ctaText] = {
          clicks: 0,
          uniqueUsers: new Set(),
          positions: new Set(),
          destinations: new Set(),
        }
      }
      acc[ctaText].clicks++
      acc[ctaText].uniqueUsers.add(click.visitor_id)
      if (click.properties?.cta_position)
        acc[ctaText].positions.add(click.properties.cta_position)
      if (click.properties?.destination)
        acc[ctaText].destinations.add(click.properties.destination)
      return acc
    }, {})

    ctaMetrics.topPerformingCTAs = Object.entries(ctaGroups)
      .map(([text, data]: [string, any]) => ({
        text,
        clicks: data.clicks as number,
        uniqueUsers: data.uniqueUsers.size as number,
        clickThroughRate:
          (data.uniqueUsers.size as number) / (data.clicks as number),
        positions: Array.from(data.positions) as string[],
        destinations: Array.from(data.destinations) as string[],
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10)
  }

  return ctaMetrics
}

async function getScrollDepthAnalytics(startDate: Date, endDate: Date) {
  const { data: scrollEvents } = await supabase
    .from('page_analytics')
    .select('*')
    .eq('event_type', 'scroll_depth_detailed')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  const scrollMetrics = {
    averageScrollDepth: 0,
    scrollDistribution: {},
    bounceRate: 0,
    engagementByDepth: {},
    pagePerformance: {},
  }

  if (scrollEvents && scrollEvents.length > 0) {
    // Calculate average scroll depth
    const totalDepth = scrollEvents.reduce(
      (sum, event) => sum + (event.properties?.depth_percentage || 0),
      0
    )
    scrollMetrics.averageScrollDepth = totalDepth / scrollEvents.length

    // Scroll distribution by milestones
    scrollMetrics.scrollDistribution = scrollEvents.reduce((acc, event) => {
      const depth = event.properties?.depth_percentage || 0
      const milestone = Math.floor(depth / 25) * 25 // Group by 25% milestones
      acc[milestone] = (acc[milestone] || 0) + 1
      return acc
    }, {})

    // Bounce rate (users who scrolled less than 25%)
    const uniqueUsers = new Set(scrollEvents.map((e) => e.visitor_id))
    const bouncedUsers = new Set(
      scrollEvents.filter((e) => e.properties?.bounced).map((e) => e.visitor_id)
    )
    scrollMetrics.bounceRate =
      uniqueUsers.size > 0 ? (bouncedUsers.size / uniqueUsers.size) * 100 : 0

    // Engagement by scroll depth
    const depthGroups = scrollEvents.reduce((acc, event) => {
      const depth = event.properties?.depth_percentage || 0
      if (!acc[depth]) {
        acc[depth] = {
          users: new Set(),
          totalTime: 0,
          engagementScores: [],
        }
      }
      acc[depth].users.add(event.visitor_id)
      acc[depth].totalTime += event.properties?.time_to_reach || 0
      if (event.properties?.engagement_score) {
        acc[depth].engagementScores.push(event.properties.engagement_score)
      }
      return acc
    }, {})

    scrollMetrics.engagementByDepth = Object.entries(depthGroups)
      .map(([depth, data]: [string, any]) => ({
        depth: parseInt(depth),
        uniqueUsers: data.users.size,
        averageTimeToReach: data.totalTime / data.users.size,
        averageEngagementScore:
          data.engagementScores.length > 0
            ? data.engagementScores.reduce(
                (sum: number, score: number) => sum + score,
                0
              ) / data.engagementScores.length
            : 0,
      }))
      .sort((a, b) => a.depth - b.depth)
  }

  return scrollMetrics
}

async function getEngagementAnalytics(startDate: Date, endDate: Date) {
  const { data: engagementEvents } = await supabase
    .from('page_analytics')
    .select('*')
    .eq('event_type', 'engagement_time_detailed')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  return {
    averageSessionTime:
      engagementEvents?.reduce(
        (sum, event) => sum + (event.properties?.active_time || 0),
        0
      ) / (engagementEvents?.length || 1),
    averageInteractions:
      engagementEvents?.reduce(
        (sum, event) => sum + (event.properties?.interactions || 0),
        0
      ) / (engagementEvents?.length || 1),
    engagementDistribution: calculateEngagementDistribution(
      engagementEvents || []
    ),
    bounceScore: calculateAverageBounceScore(engagementEvents || []),
  }
}

async function getReferrerAnalytics(startDate: Date, endDate: Date) {
  const { data: referrerEvents } = await supabase
    .from('page_analytics')
    .select('*')
    .eq('event_type', 'referrer_attribution')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  return {
    topSources: calculateTopSources(referrerEvents || []),
    campaignPerformance: calculateCampaignPerformance(referrerEvents || []),
    channelDistribution: calculateChannelDistribution(referrerEvents || []),
  }
}

async function getFunnelAnalytics(startDate: Date, endDate: Date) {
  const { data: funnelEvents } = await supabase
    .from('page_analytics')
    .select('*')
    .eq('event_type', 'conversion_funnel_step')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  return {
    funnelPerformance: calculateFunnelPerformance(funnelEvents || []),
    dropOffAnalysis: calculateDropOffAnalysis(funnelEvents || []),
    conversionTimes: calculateConversionTimes(funnelEvents || []),
  }
}

async function getConversionAnalytics(startDate: Date, endDate: Date) {
  const { data: conversions } = await supabase
    .from('email_events')
    .select('*')
    .eq('event_type', 'signup')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  return {
    totalConversions: conversions?.length || 0,
    conversionRate: await calculateConversionRate(startDate, endDate),
    conversionsBySource: calculateConversionsBySource(conversions || []),
    timeToConversion: calculateTimeToConversion(conversions || []),
  }
}

// Helper functions
function calculateDropOffStep(interactions: any[]) {
  const stepGroups = interactions.reduce((acc, interaction) => {
    const step = interaction.properties?.step_number || 1
    acc[step] = (acc[step] || 0) + 1
    return acc
  }, {})

  const steps = Object.keys(stepGroups).map(Number).sort()
  let maxDropOff = 0
  let dropOffStep = 1

  for (let i = 0; i < steps.length - 1; i++) {
    const currentStep = steps[i]
    const nextStep = steps[i + 1]
    const dropOff = stepGroups[currentStep] - stepGroups[nextStep]

    if (dropOff > maxDropOff) {
      maxDropOff = dropOff
      dropOffStep = currentStep
    }
  }

  return { step: dropOffStep, count: maxDropOff }
}

function calculateEngagementDistribution(events: any[]) {
  return events.reduce((acc, event) => {
    const timeSpent = event.properties?.active_time || 0
    const bucket = getTimeBucket(timeSpent)
    acc[bucket] = (acc[bucket] || 0) + 1
    return acc
  }, {})
}

function calculateAverageBounceScore(events: any[]) {
  if (events.length === 0) return 0
  return (
    events.reduce(
      (sum, event) => sum + (event.properties?.bounce_probability || 0),
      0
    ) / events.length
  )
}

function getTimeBucket(timeMs: number) {
  if (timeMs < 15000) return '0-15s'
  if (timeMs < 30000) return '15-30s'
  if (timeMs < 60000) return '30-60s'
  if (timeMs < 300000) return '1-5min'
  return '5min+'
}

function calculateTopSources(events: any[]) {
  return events.reduce((acc, event) => {
    const source = event.properties?.source || 'direct'
    acc[source] = (acc[source] || 0) + 1
    return acc
  }, {})
}

function calculateCampaignPerformance(events: any[]) {
  return events
    .filter((event) => event.properties?.utm_campaign)
    .reduce((acc, event) => {
      const campaign = event.properties.utm_campaign
      if (!acc[campaign]) {
        acc[campaign] = { visits: 0, sources: new Set() }
      }
      acc[campaign].visits++
      acc[campaign].sources.add(event.properties?.utm_source || 'unknown')
      return acc
    }, {})
}

function calculateChannelDistribution(events: any[]) {
  return events.reduce((acc, event) => {
    const medium = event.properties?.medium || 'direct'
    acc[medium] = (acc[medium] || 0) + 1
    return acc
  }, {})
}

function calculateFunnelPerformance(events: any[]) {
  const funnelGroups = events.reduce((acc, event) => {
    const funnelName = event.properties?.funnel_name || 'unknown'
    if (!acc[funnelName]) {
      acc[funnelName] = { steps: {}, users: new Set() }
    }

    const step = event.properties?.step_number || 1
    acc[funnelName].steps[step] = (acc[funnelName].steps[step] || 0) + 1
    acc[funnelName].users.add(event.visitor_id)

    return acc
  }, {})

  return Object.entries(funnelGroups).map(([name, data]: [string, any]) => ({
    name,
    totalUsers: data.users.size,
    stepPerformance: data.steps,
    overallConversionRate: calculateOverallConversionRate(data.steps),
  }))
}

function calculateDropOffAnalysis(_events: any[]) {
  // Implementation for drop-off analysis
  return {}
}

function calculateConversionTimes(_events: any[]) {
  // Implementation for conversion time analysis
  return {}
}

async function calculateConversionRate(startDate: Date, endDate: Date) {
  // Get total unique visitors
  const { count: totalVisitors } = await supabase
    .from('page_analytics')
    .select('visitor_id', { count: 'exact', head: true })
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  // Get total conversions
  const { count: totalConversions } = await supabase
    .from('email_events')
    .select('*', { count: 'exact', head: true })
    .eq('event_type', 'signup')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  return totalVisitors && totalVisitors > 0
    ? ((totalConversions || 0) / totalVisitors) * 100
    : 0
}

function calculateConversionsBySource(conversions: any[]) {
  return conversions.reduce((acc, conversion) => {
    const source = conversion.metadata?.source || 'direct'
    acc[source] = (acc[source] || 0) + 1
    return acc
  }, {})
}

function calculateTimeToConversion(_conversions: any[]) {
  // Implementation for time to conversion analysis
  return {}
}

function calculateOverallConversionRate(steps: Record<string, number>) {
  const stepNumbers = Object.keys(steps).map(Number).sort()
  if (stepNumbers.length < 2) return 0

  const firstStep = steps[stepNumbers[0]]
  const lastStep = steps[stepNumbers[stepNumbers.length - 1]]

  return firstStep > 0 ? (lastStep / firstStep) * 100 : 0
}
