/**
 * Demo Page: Enhanced Analytics Tracking
 * Shows Phase 6 custom event tracking in action
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Container } from '@/components/layout/containers'
import { 
  EnhancedButton, 
  ScrollDepthTracker,
  ConversionFunnelStep,
  useEnhancedAnalyticsContext
} from '@/components/analytics'
// import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function AnalyticsDemo() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { trackFormInteraction, trackCTAClick } = useEnhancedAnalyticsContext()

  const handleEmailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    
    // Track form interaction with enhanced analytics
    await trackFormInteraction({
      formId: 'analytics_demo',
      fieldName: 'email',
      action: 'change',
      value: e.target.value
    })
  }

  const handleSubmit = async () => {
    setIsSubmitted(true)
    
    // Track form completion
    await trackFormInteraction({
      formId: 'analytics_demo',
      fieldName: 'submit',
      action: 'submit',
      stepNumber: 1,
      totalSteps: 1
    })
  }

  const handleCTAClick = async (ctaText: string, position: string) => {
    await trackCTAClick({
      ctaText,
      ctaPosition: position as any,
      ctaType: 'primary',
      page: '/demo/analytics',
      section: 'demo'
    })
  }

  return (
    <ScrollDepthTracker trackingId="analytics-demo">
      <div className="min-h-screen bg-gradient-to-br from-parchment-white to-document-gray py-24">
        <Container>
          <ConversionFunnelStep
            stepName="demo_page_view"
            stepNumber={1}
            funnelName="analytics_demo"
          >
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
              >
                <h1 className="text-4xl font-bold text-ink-black mb-4">
                  Enhanced Analytics Demo
                </h1>
                <p className="text-lg text-text-gray max-w-2xl mx-auto">
                  This page demonstrates Phase 6 custom event tracking. Every interaction 
                  is being tracked with detailed analytics data.
                </p>
              </motion.div>

              {/* Demo Sections */}
              <div className="space-y-8">
                {/* CTA Tracking Demo */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-lg shadow-lg p-8"
                >
                  <h2 className="text-2xl font-semibold text-ink-black mb-4">
                    CTA Click Tracking
                  </h2>
                  <p className="text-text-gray mb-6">
                    These buttons track detailed click analytics including position, 
                    type, user flow, and conversion data.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <EnhancedButton
                      onClick={() => handleCTAClick('Hero CTA', 'hero')}
                      ctaText="Hero CTA"
                      ctaPosition="hero"
                      ctaType="primary"
                      section="demo_hero"
                      userFlow="analytics_demo"
                      trackAsGoal={true}
                      goalName="Demo Hero Click"
                      className="w-full px-6 py-3 bg-quill-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Hero CTA
                    </EnhancedButton>

                    <EnhancedButton
                      onClick={() => handleCTAClick('Content CTA', 'content')}
                      ctaText="Content CTA"
                      ctaPosition="content"
                      ctaType="secondary"
                      section="demo_content"
                      userFlow="analytics_demo"
                      className="w-full px-6 py-3 border-2 border-quill-blue text-quill-blue rounded-lg hover:bg-quill-blue hover:text-white transition-colors"
                    >
                      Content CTA
                    </EnhancedButton>

                    <EnhancedButton
                      onClick={() => handleCTAClick('Footer CTA', 'footer')}
                      ctaText="Footer CTA"
                      ctaPosition="footer"
                      ctaType="ghost"
                      section="demo_footer"
                      userFlow="analytics_demo"
                      className="w-full px-6 py-3 text-quill-blue hover:bg-quill-blue/10 rounded-lg transition-colors"
                    >
                      Footer CTA
                    </EnhancedButton>
                  </div>
                </motion.div>

                {/* Form Tracking Demo */}
                <ConversionFunnelStep
                  stepName="form_interaction"
                  stepNumber={2}
                  funnelName="analytics_demo"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-lg shadow-lg p-8"
                  >
                    <h2 className="text-2xl font-semibold text-ink-black mb-4">
                      Form Interaction Tracking
                    </h2>
                    <p className="text-text-gray mb-6">
                      This form tracks detailed interactions including focus time, 
                      field changes, validation errors, and completion rates.
                    </p>

                    {!isSubmitted ? (
                      <div className="space-y-6 max-w-md">
                        <div>
                          <label htmlFor="demo-email" className="block text-ui-label font-medium text-text-gray mb-2">
                            Email Address
                          </label>
                          <Input
                            id="demo-email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={handleEmailChange}
                            onFocus={async () => {
                              await trackFormInteraction({
                                formId: 'analytics_demo',
                                fieldName: 'email',
                                action: 'focus'
                              })
                            }}
                            onBlur={async () => {
                              await trackFormInteraction({
                                formId: 'analytics_demo',
                                fieldName: 'email',
                                action: 'blur',
                                value: email
                              })
                            }}
                            className="w-full"
                          />
                        </div>
                        
                        <EnhancedButton
                          onClick={handleSubmit}
                          disabled={!email.includes('@')}
                          ctaText="Submit Form"
                          ctaPosition="content"
                          ctaType="primary"
                          section="demo_form"
                          userFlow="analytics_demo"
                          trackAsGoal={true}
                          goalName="Demo Form Submit"
                          className="w-full px-6 py-3 bg-suggestion-green text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
                        >
                          Submit Form
                        </EnhancedButton>
                      </div>
                    ) : (
                      <ConversionFunnelStep
                        stepName="form_submitted"
                        stepNumber={3}
                        funnelName="analytics_demo"
                      >
                        <div className="bg-suggestion-green/10 border border-suggestion-green/20 rounded-lg p-6">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-suggestion-green rounded-full flex items-center justify-center mr-3">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="font-semibold text-suggestion-green">Form Submitted Successfully!</h3>
                              <p className="text-caption text-text-gray">
                                Check your analytics dashboard to see the tracked data.
                              </p>
                            </div>
                          </div>
                        </div>
                      </ConversionFunnelStep>
                    )}
                  </motion.div>
                </ConversionFunnelStep>

                {/* Scroll Tracking Demo */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-lg shadow-lg p-8"
                >
                  <h2 className="text-2xl font-semibold text-ink-black mb-4">
                    Scroll Depth Tracking
                  </h2>
                  <p className="text-text-gray mb-6">
                    As you scroll through this page, we're tracking engagement milestones 
                    at 25%, 50%, 75%, and 100% depth.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="h-32 bg-gradient-to-r from-quill-blue/20 to-suggestion-green/20 rounded-lg flex items-center justify-center">
                      <p className="text-text-gray">Scroll tracking content area 1</p>
                    </div>
                    <div className="h-32 bg-gradient-to-r from-suggestion-green/20 to-error-red/20 rounded-lg flex items-center justify-center">
                      <p className="text-text-gray">Scroll tracking content area 2</p>
                    </div>
                    <div className="h-32 bg-gradient-to-r from-error-red/20 to-quill-blue/20 rounded-lg flex items-center justify-center">
                      <p className="text-text-gray">Scroll tracking content area 3</p>
                    </div>
                  </div>
                </motion.div>

                {/* Analytics Data Preview */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-lg shadow-lg p-8"
                >
                  <h2 className="text-2xl font-semibold text-ink-black mb-4">
                    What Data is Being Tracked?
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-ink-black mb-3">Form Interactions</h3>
                      <ul className="space-y-2 text-caption text-text-gray">
                        <li>• Field focus and blur events</li>
                        <li>• Time spent on each field</li>
                        <li>• Value changes and validation errors</li>
                        <li>• Form abandonment points</li>
                        <li>• Step completion rates</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-ink-black mb-3">CTA Analytics</h3>
                      <ul className="space-y-2 text-caption text-text-gray">
                        <li>• Click position and context</li>
                        <li>• Button type and styling</li>
                        <li>• User flow tracking</li>
                        <li>• Conversion goal attribution</li>
                        <li>• A/B testing support</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-ink-black mb-3">Scroll Engagement</h3>
                      <ul className="space-y-2 text-caption text-text-gray">
                        <li>• Depth percentage milestones</li>
                        <li>• Time to reach each milestone</li>
                        <li>• Bounce detection</li>
                        <li>• Engagement scoring</li>
                        <li>• Section-specific tracking</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-ink-black mb-3">Funnel Analysis</h3>
                      <ul className="space-y-2 text-caption text-text-gray">
                        <li>• Step progression tracking</li>
                        <li>• Drop-off point identification</li>
                        <li>• Time in funnel measurement</li>
                        <li>• Conversion rate calculation</li>
                        <li>• User journey mapping</li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </ConversionFunnelStep>
        </Container>
      </div>
    </ScrollDepthTracker>
  )
}
