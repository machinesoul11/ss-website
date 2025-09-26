// Database Types - matching exact Supabase schema
export interface BetaSignup {
  id: string
  email: string
  github_username?: string
  gitlab_username?: string
  current_tools: string[]
  documentation_platform: string[]
  pain_points: string
  use_case_description: string
  team_size?:
    | 'individual'
    | 'small_team'
    | 'medium_team'
    | 'large_team'
    | 'enterprise'
  signup_source?: string
  referrer_code?: string
  created_at: string
  email_verified: boolean
  beta_status: 'pending' | 'invited' | 'active'
  engagement_score: number
  notes?: string
  opted_in_marketing: boolean
  opted_in_research: boolean
}

export interface EmailEvent {
  id: string
  user_id: string
  email_type:
    | 'welcome'
    | 'update'
    | 'early_access'
    | 'feedback_request'
    | 're_engagement'
    | 'monthly_newsletter'
  event_type:
    | 'sent'
    | 'delivered'
    | 'opened'
    | 'clicked'
    | 'bounced'
    | 'spam_report'
    | 'unsubscribe'
    | 'group_unsubscribe'
  timestamp: string
  email_subject?: string
  campaign_id?: string
  metadata?: Record<string, unknown>
}

export interface FeedbackSubmission {
  id: string
  user_id: string
  feedback_type: 'survey' | 'bug_report' | 'feature_request'
  survey_id?: string
  responses?: Record<string, unknown>
  free_form_feedback?: string
  rating?: number // 1-5 with CHECK constraint
  submitted_at: string
  internal_status: 'new' | 'reviewed' | 'addressed'
}

export interface PageAnalytics {
  id: string
  page_path: string
  visitor_id?: string
  session_id?: string
  event_type: string
  timestamp: string
  referrer?: string
  user_agent_hash?: string
  metadata?: Record<string, unknown>
}

// Phase 6: Enhanced Analytics Types
export interface AnonymousVisitor {
  id: string
  visitor_hash: string
  session_id: string
  first_seen: string
  last_seen: string
  page_views: number
  total_sessions: number
  user_agent_hash?: string
  timezone_offset?: number
  screen_resolution?: string
  referrer_domain?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  is_returning: boolean
  created_at: string
  updated_at: string
}

export interface AnalyticsSession {
  id: string
  visitor_id: string
  session_start: string
  session_end?: string
  pages_visited: number
  total_interactions: number
  max_scroll_depth: number
  time_on_site: number
  entry_page: string
  exit_page?: string
  referrer?: string
  utm_data?: Record<string, string>
  device_data?: Record<string, any>
  engagement_score: number
  converted: boolean
  bounce: boolean
  created_at: string
  updated_at: string
}

export interface AnalyticsEventRecord {
  id: string
  visitor_id: string
  session_id: string
  event_type: string
  page_path: string
  timestamp: string
  properties?: Record<string, any>
  user_agent_hash?: string
  created_at: string
}

export interface UserPreferences {
  user_id: string // Primary key & FK to beta_signups
  communication_frequency: 'daily' | 'weekly' | 'monthly'
  preferred_contact_method: string
  timezone?: string
  beta_testing_availability?: Record<string, unknown>
  technical_background?: 'beginner' | 'intermediate' | 'expert'
  areas_of_interest?: string[]
  updated_at: string
}

// Form Types
export interface BetaSignupFormData {
  email: string
  githubUsername?: string
  gitlabUsername?: string
  currentTools: string[]
  documentationPlatforms: string[]
  painPoints: string
  teamSize?:
    | 'individual'
    | 'small_team'
    | 'medium_team'
    | 'large_team'
    | 'enterprise'
  useCaseDescription: string
  signupSource?: string
  referrerCode?: string
  privacyConsent: boolean
  marketingOptIn: boolean
  researchOptIn: boolean
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Email Template Types
export interface EmailTemplate {
  id: string
  name: string
  subject: string
  html_content: string
  text_content?: string
}

// Extended Email Template Data Types
export interface EarlyAccessEmailData {
  first_name?: string
  user_email: string
  access_level: 'alpha' | 'beta' | 'preview'
  download_link?: string
  instructions_link?: string
  exclusive_features: string[]
  unsubscribe_url: string
  invitation_date: string
}

export interface ReEngagementEmailData {
  first_name?: string
  user_email: string
  inactivity_days: number
  recent_updates: string[]
  feedback_link: string
  unsubscribe_url: string
  campaign_date: string
}

export interface MonthlyNewsletterData {
  first_name?: string
  user_email: string
  update_title: string
  update_content: string
  features_highlights: string[]
  roadmap_items?: string[]
  community_stats?: {
    beta_users: number
    github_stars: number
    discord_members: number
  }
  feedback_link: string
  unsubscribe_url: string
  update_date: string
}

// Email Campaign Types
export interface EmailCampaign {
  id?: string
  campaign_id: string
  campaign_type: string
  name?: string
  subject: string
  template_id?: string
  segment_filter: string
  scheduled_at?: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
  total_recipients: number
  sent_count?: number
  error_count?: number
  sent_at?: string
  created_at?: string
  updated_at?: string
}

// Analytics Types
export interface AnalyticsEvent {
  event: string
  properties?: Record<string, unknown>
  timestamp?: number
}

export interface AnalyticsDashboardData {
  overview: {
    totalVisitors: number
    totalPageViews: number
    totalSignups: number
    conversionRate: number
    averageEngagement: number
    bounceRate: number
    returnVisitorRate: number
  }
  traffic: {
    visitorsOverTime: Record<string, number>
    topPages: Array<{ page: string; views: number; uniqueVisitors: number }>
    trafficSources: Record<string, number>
    deviceTypes: Record<string, number>
    geographicData: Record<string, number>
  }
  conversions: {
    signupsOverTime: Record<string, number>
    conversionFunnel: Array<{ step: string; users: number; dropOff: number }>
    signupSources: Record<string, number>
    teamSizeDistribution: Record<string, number>
    conversionsByPage: Record<string, number>
  }
  engagement: {
    engagementScore: {
      totalScore: number
      averageScore: number
      highEngagementSessions: number
    }
    contentPerformance: Array<{
      page: string
      views: number
      totalEngagement: number
      avgEngagement: number
    }>
    userFlow: {
      mostCommonPaths: Array<{ path: string; count: number }>
      exitPages: Record<string, number>
    }
    timeMetrics: {
      averageTimeOnPage: number
      totalTime: number
    }
    interactionHeatmap: Array<{ target: string; count: number }>
  }
  email: {
    campaignPerformance: Array<{
      campaign: string
      sent: number
      opened: number
      clicked: number
      openRate: number
      clickRate: number
    }>
    engagementRates: {
      openRate: number
      clickRate: number
      clickThroughRate: number
    }
    optInRates: {
      marketing: number
      research: number
    }
    unsubscribeRates: {
      rate: number
      total: number
    }
  }
  feedback: {
    feedbackSummary: {
      total: number
      byType: Record<string, number>
      byStatus: Record<string, number>
    }
    satisfactionScores: {
      average: number
      distribution: Record<string, number>
    }
    commonIssues: Array<{ issue: string; count: number }>
    featureRequests: {
      total: number
      recent: Array<{
        id: string
        request: string
        submitted: string
        status: string
      }>
    }
  }
  realTime: {
    activeVisitors: number
    liveConversions: number
    currentTopPages: Array<{ page: string; views: number }>
    recentSignups: Array<{
      id: string
      email: string
      source: string
      timestamp: string
    }>
  }
}
