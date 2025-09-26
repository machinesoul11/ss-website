export {
  AnalyticsProvider,
  useAnalytics,
  usePageTracking,
  useConversionTracking,
  CTATracker,
  FormTracker,
  FieldTracker,
  PageViewTracker,
} from './AnalyticsProvider'

export {
  AnalyticsButton,
  AnalyticsLink,
  AnalyticsForm,
  AnalyticsImage,
  withAnalytics,
} from './AnalyticsComponents'

export {
  EnhancedAnalyticsProvider,
  useEnhancedAnalyticsContext,
} from './EnhancedAnalyticsProvider'

export { PrivacyAnalyticsProvider } from './PrivacyAnalyticsProvider'

// Phase 6: Performance Monitoring Components
export {
  PerformanceProvider,
  usePerformanceContext,
  withPerformanceMonitoring,
} from './PerformanceProvider'
export {
  PerformanceMonitoringIntegration,
  useApplicationPerformance,
  getPerformanceConfig,
  PerformanceConfig,
} from './PerformanceMonitoringIntegration'
export {
  EnhancedButton,
  EnhancedForm,
  EnhancedInput,
  EnhancedMultiStepForm,
  TrackedFormField,
  ScrollDepthTracker,
  ConversionFunnelStep,
} from './EnhancedComponents'
