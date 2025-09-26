/**
 * Enhanced Beta Signup Page Example
 * Demonstrates Phase 6 custom event tracking implementation
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  EnhancedMultiStepForm, 
  TrackedFormField,
  EnhancedButton,
  ScrollDepthTracker,
  ConversionFunnelStep
  // useEnhancedAnalyticsContext
} from '@/components/analytics'
import { Container } from '@/components/layout/containers'
import { CheckboxGroup } from '@/components/forms/checkbox-group'
import { Textarea } from '@/components/ui/textarea'

// Define the form steps for tracking
const formSteps = [
  {
    id: 'contact_info',
    title: 'Contact Information',
    description: 'Basic details to get started',
  },
  {
    id: 'tool_preferences',
    title: 'Tool Preferences',
    description: 'Current workflow and pain points',
  },
  {
    id: 'use_case_details',
    title: 'Use Case Details',
    description: 'Tell us about your needs',
  },
  {
    id: 'confirmation',
    title: 'Confirmation',
    description: 'Review and submit',
  }
]

interface FormData {
  email: string
  githubUsername: string
  currentTools: string[]
  documentationPlatforms: string[]
  painPoints: string[]
  teamSize: string
  useCase: string
  privacyConsent: boolean
  marketingOptIn: boolean
}

export default function EnhancedBetaPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<Partial<FormData>>({
    currentTools: [],
    documentationPlatforms: [],
    painPoints: []
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // const { startFunnelTracking } = useEnhancedAnalyticsContext()

  const handleFieldChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNext = () => {
    if (currentStep < formSteps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch('/api/beta-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Signup failed. Please try again.')
      }

      setIsSubmitted(true)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <ConversionFunnelStep
        stepName="signup_success"
        stepNumber={5}
        funnelName="beta_signup"
      >
        <ScrollDepthTracker trackingId="success-page">
          <div className="min-h-screen bg-gradient-to-br from-parchment-white to-document-gray py-24">
            <Container>
              <div className="max-w-2xl mx-auto text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-lg p-8"
                >
                  <div className="w-16 h-16 bg-suggestion-green rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h1 className="text-3xl font-bold text-ink-black mb-4">
                    Welcome to Silent Scribe Beta!
                  </h1>
                  <p className="text-lg text-text-gray mb-6">
                    Thank you for joining our beta program. You'll receive an email with next steps shortly.
                  </p>
                  <div className="space-y-4 text-left bg-parchment-white rounded-lg p-6">
                    <h3 className="font-semibold text-ink-black">What happens next?</h3>
                    <ul className="space-y-2 text-text-gray">
                      <li className="flex items-start">
                        <span className="text-quill-blue mr-2">1.</span>
                        We'll send you early access instructions within 24 hours
                      </li>
                      <li className="flex items-start">
                        <span className="text-quill-blue mr-2">2.</span>
                        Join our developer community for updates and feedback
                      </li>
                      <li className="flex items-start">
                        <span className="text-quill-blue mr-2">3.</span>
                        Get exclusive access to new features as they're released
                      </li>
                    </ul>
                  </div>
                </motion.div>
              </div>
            </Container>
          </div>
        </ScrollDepthTracker>
      </ConversionFunnelStep>
    )
  }

  return (
    <ScrollDepthTracker trackingId="beta-signup">
      <div className="min-h-screen bg-gradient-to-br from-parchment-white to-document-gray py-24">
        <Container>
          <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <ConversionFunnelStep
              stepName="page_view"
              stepNumber={1}
              funnelName="beta_signup"
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
              >
                <h1 className="text-4xl font-bold text-ink-black mb-4">
                  Join the Silent Scribe Beta
                </h1>
                <p className="text-lg text-text-gray max-w-2xl mx-auto">
                  Help us build the future of privacy-first writing assistance. 
                  Get early access and shape the product with your feedback.
                </p>
              </motion.div>
            </ConversionFunnelStep>

            {/* Multi-Step Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-lg p-8"
            >
              <EnhancedMultiStepForm
                formName="beta_signup_form"
                steps={formSteps}
                currentStep={currentStep}
                onStepChange={setCurrentStep}
                enableTracking={true}
                funnelName="beta_signup"
              >
                {/* Step 1: Contact Information */}
                {currentStep === 1 && (
                  <ConversionFunnelStep
                    stepName="contact_info"
                    stepNumber={2}
                    funnelName="beta_signup"
                  >
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h2 className="text-2xl font-semibold text-ink-black">
                        Let's get started
                      </h2>
                      
                      <TrackedFormField
                        label="Email Address"
                        name="email"
                        type="email"
                        required={true}
                        placeholder="you@company.com"
                        description="We'll use this to send you beta access instructions"
                        formName="beta_signup_form"
                        value={formData.email}
                        onChange={(value) => handleFieldChange('email', value)}
                        validation={{
                          required: true,
                          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Please enter a valid email address'
                        }}
                      />

                      <TrackedFormField
                        label="GitHub Username"
                        name="githubUsername"
                        type="text"
                        placeholder="@yourusername"
                        description="Optional: helps us understand your development background"
                        formName="beta_signup_form"
                        value={formData.githubUsername}
                        onChange={(value) => handleFieldChange('githubUsername', value)}
                      />

                      <div className="flex justify-end">
                        <EnhancedButton
                          onClick={handleNext}
                          disabled={!formData.email?.includes('@')}
                          ctaText="Continue"
                          ctaPosition="content"
                          ctaType="primary"
                          section="step_1"
                          userFlow="beta_signup"
                          className="px-6 py-2 bg-quill-blue text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                        >
                          Continue
                        </EnhancedButton>
                      </div>
                    </motion.div>
                  </ConversionFunnelStep>
                )}

                {/* Step 2: Tool Preferences */}
                {currentStep === 2 && (
                  <ConversionFunnelStep
                    stepName="tool_preferences"
                    stepNumber={3}
                    funnelName="beta_signup"
                  >
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h2 className="text-2xl font-semibold text-ink-black">
                        Tell us about your current workflow
                      </h2>

                      <div>
                        <label className="block text-ui-label font-medium text-text-gray mb-3">
                          What writing tools do you currently use? *
                        </label>
                        <CheckboxGroup
                          options={[
                            { value: 'grammarly', label: 'Grammarly' },
                            { value: 'vale', label: 'Vale' },
                            { value: 'textlint', label: 'textlint' },
                            { value: 'markdownlint', label: 'markdownlint' },
                            { value: 'none', label: 'No automated tools' },
                            { value: 'other', label: 'Other tools' }
                          ]}
                          selectedValues={formData.currentTools || []}
                          onChange={(values) => handleFieldChange('currentTools', values)}
                        />
                      </div>

                      <div>
                        <label className="block text-ui-label font-medium text-text-gray mb-3">
                          What documentation platforms do you use? *
                        </label>
                        <CheckboxGroup
                          options={[
                            { value: 'github', label: 'GitHub/GitLab (Markdown)' },
                            { value: 'confluence', label: 'Confluence' },
                            { value: 'notion', label: 'Notion' },
                            { value: 'gitbook', label: 'GitBook' },
                            { value: 'docusaurus', label: 'Docusaurus' },
                            { value: 'mkdocs', label: 'MkDocs' },
                            { value: 'other', label: 'Other platforms' }
                          ]}
                          selectedValues={formData.documentationPlatforms || []}
                          onChange={(values) => handleFieldChange('documentationPlatforms', values)}
                        />
                      </div>

                      <div className="flex justify-between">
                        <EnhancedButton
                          onClick={handlePrev}
                          ctaText="Back"
                          ctaPosition="content"
                          ctaType="secondary"
                          section="step_2"
                          userFlow="beta_signup"
                          className="px-6 py-2 border border-border-gray text-text-gray rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Back
                        </EnhancedButton>
                        
                        <EnhancedButton
                          onClick={handleNext}
                          disabled={!formData.currentTools?.length || !formData.documentationPlatforms?.length}
                          ctaText="Continue"
                          ctaPosition="content"
                          ctaType="primary"
                          section="step_2"
                          userFlow="beta_signup"
                          className="px-6 py-2 bg-quill-blue text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                        >
                          Continue
                        </EnhancedButton>
                      </div>
                    </motion.div>
                  </ConversionFunnelStep>
                )}

                {/* Step 3: Use Case Details */}
                {currentStep === 3 && (
                  <ConversionFunnelStep
                    stepName="use_case_details"
                    stepNumber={4}
                    funnelName="beta_signup"
                  >
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h2 className="text-2xl font-semibold text-ink-black">
                        Help us understand your needs
                      </h2>

                      <div>
                        <label className="block text-ui-label font-medium text-text-gray mb-3">
                          What are your biggest pain points with current tools? *
                        </label>
                        <CheckboxGroup
                          options={[
                            { value: 'privacy_concerns', label: 'Privacy concerns with cloud-based tools' },
                            { value: 'slow_performance', label: 'Slow performance or reliability issues' },
                            { value: 'poor_tech_context', label: 'Poor understanding of technical context' },
                            { value: 'complex_setup', label: 'Complex setup and configuration' },
                            { value: 'limited_customization', label: 'Limited customization options' },
                            { value: 'expensive_pricing', label: 'Expensive pricing for teams' },
                            { value: 'integration_issues', label: 'Poor IDE/workflow integration' }
                          ]}
                          selectedValues={formData.painPoints || []}
                          onChange={(values) => handleFieldChange('painPoints', values)}
                        />
                      </div>

                      <TrackedFormField
                        label="Team Size"
                        name="teamSize"
                        type="text"
                        placeholder="e.g., Solo developer, 5-10 people, 50+ team"
                        description="Help us understand your team context"
                        formName="beta_signup_form"
                        value={formData.teamSize}
                        onChange={(value) => handleFieldChange('teamSize', value)}
                      />

                      <div>
                        <label htmlFor="useCase" className="block text-ui-label font-medium text-text-gray mb-2">
                          Describe your use case *
                        </label>
                        <Textarea
                          id="useCase"
                          placeholder="Tell us about the type of documentation you write, your workflow, and what you hope Silent Scribe can help you with..."
                          value={formData.useCase || ''}
                          onChange={(e) => handleFieldChange('useCase', e.target.value)}
                          className="w-full min-h-[100px]"
                          required
                        />
                        <p className="text-caption text-muted-gray mt-1">
                          At least 10 characters required
                        </p>
                      </div>

                      <div className="flex justify-between">
                        <EnhancedButton
                          onClick={handlePrev}
                          ctaText="Back"
                          ctaPosition="content"
                          ctaType="secondary"
                          section="step_3"
                          userFlow="beta_signup"
                          className="px-6 py-2 border border-border-gray text-text-gray rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Back
                        </EnhancedButton>
                        
                        <EnhancedButton
                          onClick={handleNext}
                          disabled={!formData.painPoints?.length || !formData.useCase || formData.useCase.length < 10}
                          ctaText="Continue"
                          ctaPosition="content"
                          ctaType="primary"
                          section="step_3"
                          userFlow="beta_signup"
                          className="px-6 py-2 bg-quill-blue text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                        >
                          Continue
                        </EnhancedButton>
                      </div>
                    </motion.div>
                  </ConversionFunnelStep>
                )}

                {/* Step 4: Confirmation */}
                {currentStep === 4 && (
                  <ConversionFunnelStep
                    stepName="confirmation"
                    stepNumber={5}
                    funnelName="beta_signup"
                  >
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h2 className="text-2xl font-semibold text-ink-black">
                        Ready to join the beta?
                      </h2>

                      <div className="bg-parchment-white rounded-lg p-6 space-y-4">
                        <h3 className="font-semibold text-ink-black">Review your information:</h3>
                        <div className="text-caption text-text-gray space-y-2">
                          <p><strong>Email:</strong> {formData.email}</p>
                          <p><strong>Current Tools:</strong> {formData.currentTools?.join(', ')}</p>
                          <p><strong>Platforms:</strong> {formData.documentationPlatforms?.join(', ')}</p>
                          <p><strong>Main Pain Points:</strong> {formData.painPoints?.join(', ')}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            checked={formData.privacyConsent || false}
                            onChange={(e) => handleFieldChange('privacyConsent', e.target.checked)}
                            className="mt-1"
                            required
                          />
                          <span className="text-caption text-text-gray">
                            I agree to the <a href="/privacy" className="text-quill-blue hover:underline">Privacy Policy</a> and 
                            understand that my data will be processed for the beta program. *
                          </span>
                        </label>

                        <label className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            checked={formData.marketingOptIn || false}
                            onChange={(e) => handleFieldChange('marketingOptIn', e.target.checked)}
                            className="mt-1"
                          />
                          <span className="text-caption text-text-gray">
                            I'd like to receive product updates and development news via email.
                          </span>
                        </label>
                      </div>

                      {submitError && (
                        <div className="bg-error-red/10 border border-error-red/20 rounded-lg p-4">
                          <p className="text-error-red text-caption">{submitError}</p>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <EnhancedButton
                          onClick={handlePrev}
                          ctaText="Back"
                          ctaPosition="content"
                          ctaType="secondary"
                          section="step_4"
                          userFlow="beta_signup"
                          className="px-6 py-2 border border-border-gray text-text-gray rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Back
                        </EnhancedButton>
                        
                        <EnhancedButton
                          onClick={handleSubmit}
                          disabled={!formData.privacyConsent || isSubmitting}
                          ctaText="Join Beta Program"
                          ctaPosition="content"
                          ctaType="primary"
                          section="step_4_submit"
                          userFlow="beta_signup"
                          destination="/beta/success"
                          trackAsGoal={true}
                          goalName="Beta Signup Complete"
                          className="px-8 py-2 bg-suggestion-green text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
                        >
                          {isSubmitting ? 'Submitting...' : 'Join Beta Program'}
                        </EnhancedButton>
                      </div>
                    </motion.div>
                  </ConversionFunnelStep>
                )}
              </EnhancedMultiStepForm>
            </motion.div>
          </div>
        </Container>
      </div>
    </ScrollDepthTracker>
  )
}
