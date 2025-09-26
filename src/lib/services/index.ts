// Database Services - Centralized Export
export {
  BetaSignupService,
  EmailEventService,
  FeedbackService,
  AnalyticsService,
  UserPreferencesService,
} from './database'

export {
  EngagementService,
  SegmentationService,
  type UserSegment,
} from './engagement'

export { DatabaseMaintenanceService } from './maintenance'

export {
  RealtimeService,
  type RealtimeSubscription,
  type RealtimeEventType,
} from './realtime'

export {
  EmailCampaignService,
  EMAIL_TEMPLATES,
  type WelcomeEmailData,
  type DevelopmentUpdateData,
  type FeedbackRequestData,
  type EmailTemplateData,
} from './email-campaigns'

export { SendGridWebhookService } from './sendgrid-webhook'

// Re-export types from other modules
export type { EmailCampaign } from '../../types'

// Re-export types for convenience
export type {
  BetaSignup,
  EmailEvent,
  FeedbackSubmission,
  PageAnalytics,
  UserPreferences,
  BetaSignupFormData,
  ApiResponse,
} from '../../types'
