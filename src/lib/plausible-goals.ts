/**
 * Plausible Goals Configuration
 * Define and track conversion goals for Silent Scribe
 */

export interface PlausibleGoal {
  name: string
  description: string
  value?: number
  currency?: string
}

/**
 * Predefined goals for Silent Scribe
 */
export const PLAUSIBLE_GOALS: Record<string, PlausibleGoal> = {
  // Primary conversion goals
  BETA_SIGNUP: {
    name: 'Beta Signup',
    description: 'User completes beta program signup form',
    value: 1,
  },

  NEWSLETTER_SIGNUP: {
    name: 'Newsletter Signup',
    description: 'User subscribes to newsletter updates',
  },

  // Engagement goals
  FORM_SUBMIT: {
    name: 'Form Submit',
    description: 'Any form submission on the site',
  },

  CTA_CLICK: {
    name: 'CTA Click',
    description: 'Click on any call-to-action button',
  },

  OUTBOUND_CLICK: {
    name: 'Outbound Link: Click',
    description: 'Click on external links (automatically tracked)',
  },

  FILE_DOWNLOAD: {
    name: 'File Download',
    description: 'Download of any file (automatically tracked)',
  },

  // Page engagement goals
  SCROLL_DEPTH_75: {
    name: 'Scroll Depth',
    description: '75% scroll depth reached',
  },

  TIME_ON_PAGE_2MIN: {
    name: 'Time on Page',
    description: '2+ minutes spent on page',
  },

  // Funnel goals
  BETA_FORM_START: {
    name: 'Beta Form Start',
    description: 'User starts filling beta signup form',
  },

  BETA_FORM_STEP_2: {
    name: 'Beta Form Step 2',
    description: 'User reaches step 2 of beta form',
  },

  BETA_FORM_STEP_3: {
    name: 'Beta Form Step 3',
    description: 'User reaches final step of beta form',
  },

  // Error tracking
  FORM_ERROR: {
    name: 'Form Error',
    description: 'Form submission failed',
  },

  PAGE_ERROR: {
    name: 'Page Error',
    description: 'JavaScript or loading error',
  },
}

/**
 * Track specific Silent Scribe conversion events
 */
export function trackSilentScribeGoals() {
  return {
    // Beta signup funnel tracking
    trackBetaFormStart: () => trackPlausibleGoal('Beta Form Start'),
    trackBetaFormStep2: () => trackPlausibleGoal('Beta Form Step 2'),
    trackBetaFormStep3: () => trackPlausibleGoal('Beta Form Step 3'),
    trackBetaSignupComplete: (source?: string) =>
      trackPlausibleGoal('Beta Signup', {
        props: { source: source || 'direct' },
      }),

    // Engagement tracking
    trackNewsletterSignup: (location: string) =>
      trackPlausibleGoal('Newsletter Signup', { props: { location } }),

    trackCTAClick: (ctaText: string, position: string) =>
      trackPlausibleGoal('CTA Click', {
        props: {
          cta_text: ctaText,
          cta_position: position,
        },
      }),

    // Content engagement
    trackScrollMilestone: (percentage: number) =>
      trackPlausibleGoal('Scroll Depth', { props: { depth: percentage } }),

    trackTimeEngagement: (seconds: number) =>
      trackPlausibleGoal('Time on Page', { props: { duration: seconds } }),

    // Error tracking
    trackFormError: (formName: string, errorType: string) =>
      trackPlausibleGoal('Form Error', {
        props: {
          form_name: formName,
          error_type: errorType,
        },
      }),
  }
}

// Import the trackPlausibleGoal function
import { trackPlausibleGoal } from '@/lib/plausible'
