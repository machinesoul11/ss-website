// Database Types
export interface BetaSignup {
  id: string
  email: string
  github_username?: string
  current_tools: string[]
  documentation_platforms: string[]
  pain_points: string[]
  team_size?: string
  signup_source?: string
  utm_parameters?: Record<string, string>
  referrer_code?: string
  engagement_score: number
  privacy_consent: boolean
  marketing_opt_in: boolean
  created_at: string
  updated_at: string
}

export interface EmailEvent {
  id: string
  user_email: string
  event_type: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'spam'
  campaign_id?: string
  template_id?: string
  metadata?: Record<string, unknown>
  created_at: string
}

export interface FeedbackSubmission {
  id: string
  user_email: string
  feedback_type: string
  content: string
  rating?: number
  metadata?: Record<string, unknown>
  created_at: string
}

export interface PageAnalytics {
  id: string
  visitor_id: string
  page_path: string
  referrer?: string
  user_agent_hash: string
  session_id: string
  event_type: string
  metadata?: Record<string, unknown>
  created_at: string
}

// Form Types
export interface BetaSignupFormData {
  email: string
  githubUsername?: string
  currentTools: string[]
  documentationPlatforms: string[]
  painPoints: string[]
  teamSize?: string
  useCase?: string
  privacyConsent: boolean
  marketingOptIn: boolean
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
  variables?: string[]
  created_at: string
  updated_at: string
}

// Analytics Types
export interface AnalyticsEvent {
  event: string
  properties?: Record<string, unknown>
  timestamp?: number
}
