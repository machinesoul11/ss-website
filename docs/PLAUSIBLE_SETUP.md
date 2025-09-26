# Plausible Analytics Setup Guide

This document outlines the Plausible Analytics integration for Silent Scribe, providing privacy-first analytics while maintaining our commitment to user data protection.

## Overview

Silent Scribe uses Plausible Analytics as our primary external analytics provider because:

- **Privacy-First**: No cookies, respects DNT headers, GDPR/CCPA compliant
- **Lightweight**: <1KB script size, minimal performance impact
- **Open Source**: Transparent, auditable code
- **No Personal Data Collection**: No IP address storage, no cross-site tracking

## Setup Configuration

### 1. Environment Variables

Add to your `.env` file:

```bash
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=silentscribe.dev
```

### 2. Plausible Dashboard Setup

Configure these goals in your Plausible dashboard (`silentscribe.dev` → Settings → Goals):

#### Primary Conversion Goals
- `Beta Signup` - Custom event goal
- `Newsletter Signup` - Custom event goal
- `Form Submit` - Custom event goal

#### Engagement Goals
- `CTA Click` - Custom event goal  
- `Scroll Depth` - Custom event goal (with depth_percentage property)
- `Time on Page` - Custom event goal (with duration property)

#### Funnel Goals
- `Beta Form Start` - Custom event goal
- `Beta Form Step 2` - Custom event goal  
- `Beta Form Step 3` - Custom event goal

#### Error Tracking
- `Form Error` - Custom event goal
- `Page Error` - Custom event goal

### 3. Automatic Tracking Features

The Plausible script is configured with these extensions:

- **File Downloads**: Automatically tracks PDF, ZIP, and other file downloads
- **Outbound Links**: Automatically tracks clicks to external websites
- **Hash Changes**: Tracks SPA navigation and anchor links
- **Pageview Props**: Allows custom properties on page views
- **Tagged Events**: Enables custom event tracking with properties

## Implementation

### Basic Event Tracking

```typescript
import { trackPlausibleEvent } from '@/lib/plausible'

// Track a simple event
trackPlausibleEvent('Button Click')

// Track with properties
trackPlausibleEvent('Beta Signup', {
  props: {
    source: 'homepage',
    step: 'completed'
  }
})
```

### Using Combined Analytics

```typescript
import { useCombinedAnalytics } from '@/lib/combined-analytics'

function MyComponent() {
  const analytics = useCombinedAnalytics()
  
  const handleSignup = async () => {
    // Tracks to both Plausible and internal analytics
    await analytics.trackBetaSignup(formData, 'homepage')
  }
}
```

### Analytics-Enhanced Components

```typescript
import { AnalyticsButton, AnalyticsForm } from '@/components/analytics'

// Button with automatic CTA tracking
<AnalyticsButton 
  ctaText="Join Beta"
  ctaPosition="hero"
  trackAsGoal={true}
  goalName="Beta Signup"
>
  Join Beta Program
</AnalyticsButton>

// Form with automatic submission tracking
<AnalyticsForm formName="beta-signup">
  {/* Form fields */}
</AnalyticsForm>
```

## Privacy Compliance

### What Plausible Tracks

- **Page Views**: URLs visited (no personal data in URLs)
- **Custom Events**: Actions like form submissions, clicks
- **Referrer Sources**: Where traffic comes from
- **Device Information**: Browser type, OS, screen size (aggregated)
- **Geographic Data**: Country-level only (from IP, not stored)

### What Plausible Does NOT Track

- **Personal Information**: No emails, names, or user IDs
- **Cross-Site Tracking**: No tracking across other websites
- **IP Addresses**: Not stored or logged
- **Cookies**: Uses localStorage for session tracking only
- **Fingerprinting**: No device fingerprinting techniques

### DNT (Do Not Track) Support

Our implementation respects user privacy preferences:

```typescript
// Automatic DNT detection in analytics utils
if (navigator.doNotTrack === '1' || window.doNotTrack === '1') {
  // Analytics tracking is disabled
  return
}
```

## Goals & Conversion Tracking

### Beta Signup Funnel

Track the complete user journey:

```typescript
// Form start
analytics.trackEvent({ name: 'Beta Form Start' })

// Step progression  
analytics.trackEvent({ name: 'Beta Form Step 2' })
analytics.trackEvent({ name: 'Beta Form Step 3' })

// Completion
analytics.trackBetaSignup(formData, 'homepage')
```

### Engagement Metrics

Automatic tracking of user engagement:

- **Scroll Depth**: 25%, 50%, 75%, 90%, 100% milestones
- **Time on Page**: 30s, 1min, 2min, 5min milestones
- **CTA Interactions**: All button and link clicks

### Custom Properties

Add context to events:

```typescript
trackPlausibleEvent('Download', {
  props: {
    file_type: 'whitepaper',
    file_name: 'silent-scribe-architecture.pdf',
    download_source: 'footer'
  }
})
```

## Dashboard Access

### Public Dashboard

We maintain a public dashboard for transparency:
- URL: `https://plausible.io/silentscribe.dev` (if configured as public)

### Team Access

Admin access requires:
1. Plausible account invitation
2. Two-factor authentication enabled
3. Read-only access for non-admin team members

## Performance Impact

Plausible has minimal performance impact:

- **Script Size**: <1KB (vs 45KB+ for Google Analytics)
- **Load Time**: ~10ms additional page load
- **Bandwidth**: <100 bytes per event
- **Battery**: Negligible mobile battery impact

## Troubleshooting

### Script Not Loading

Check environment variables:
```bash
echo $NEXT_PUBLIC_PLAUSIBLE_DOMAIN
```

### Events Not Tracking  

Verify in browser console:
```javascript
// Check if Plausible is available
window.plausible
// Should return function

// Manual test event
window.plausible('Test Event', { props: { test: true } })
```

### AdBlockers

Plausible may be blocked by some ad blockers:
- Encourage users to whitelist `plausible.io`
- Consider proxy setup for business-critical tracking

## Data Export

Plausible provides:
- **CSV Exports**: Download raw data
- **API Access**: Programmatic data access
- **Real-time API**: Live statistics
- **Stats API**: Historical aggregated data

Access requires API key configuration in Plausible dashboard.

## Compliance Documentation

### GDPR Compliance

Plausible is GDPR compliant by design:
- No personal data collection
- No consent banner required
- Data processing lawful basis: legitimate interest
- Automatic data retention limits (2 years max)

### CCPA Compliance

No personal information collected = automatic CCPA compliance:
- No sale of personal information
- No personal information to opt-out of
- No personal information rights requests needed

## Support & Resources

- **Plausible Docs**: https://plausible.io/docs
- **Privacy Policy**: https://plausible.io/privacy
- **Data Policy**: https://plausible.io/data-policy
- **Support Email**: hello@plausible.io
