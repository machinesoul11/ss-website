'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MultiStepForm,
  StepIndicator,
  FormStep,
  FormNavigation,
} from '@/components/forms/multi-step-form'
import { CheckboxGroup } from '@/components/forms/checkbox-group'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'

// Form validation schema
const betaSignupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  githubUsername: z.string().optional(),
  currentTools: z.array(z.string()).min(1, 'Please select at least one tool'),
  documentationPlatforms: z
    .array(z.string())
    .min(1, 'Please select at least one platform'),
  painPoints: z
    .array(z.string())
    .min(1, 'Please select at least one pain point'),
  teamSize: z.string().optional(),
  useCase: z
    .string()
    .min(10, 'Please provide at least 10 characters describing your use case'),
  privacyConsent: z
    .boolean()
    .refine((val) => val === true, 'Privacy consent is required'),
  marketingOptIn: z.boolean(),
})

type FormData = z.infer<typeof betaSignupSchema>

const steps = [
  {
    id: 'contact',
    title: 'Contact Information',
    description: 'Basic details to get started',
  },
  {
    id: 'preferences',
    title: 'Tool Preferences',
    description: 'Current workflow and pain points',
  },
  {
    id: 'details',
    title: 'Use Case Details',
    description: 'Team context and specific needs',
  },
]

const toolOptions = [
  {
    value: 'grammarly',
    label: 'Grammarly',
    description: 'General-purpose writing assistant',
  },
  { value: 'vale', label: 'Vale', description: 'Command-line prose linter' },
  {
    value: 'textlint',
    label: 'textlint',
    description: 'Pluggable natural language linter',
  },
  {
    value: 'markdownlint',
    label: 'markdownlint',
    description: 'Markdown style checker',
  },
  {
    value: 'alex',
    label: 'Alex',
    description: 'Catch insensitive, inconsiderate writing',
  },
  {
    value: 'write-good',
    label: 'write-good',
    description: 'Naive linter for English prose',
  },
  {
    value: 'languagetool',
    label: 'LanguageTool',
    description: 'Style and grammar checker',
  },
  { value: 'proselint', label: 'proselint', description: 'Linter for prose' },
  {
    value: 'none',
    label: 'None of the above',
    description: "I don't currently use writing tools",
  },
]

const platformOptions = [
  {
    value: 'github',
    label: 'GitHub',
    description: 'README files, wikis, and markdown docs',
  },
  { value: 'gitlab', label: 'GitLab', description: 'Repository documentation' },
  {
    value: 'confluence',
    label: 'Confluence',
    description: 'Atlassian wiki platform',
  },
  { value: 'notion', label: 'Notion', description: 'All-in-one workspace' },
  {
    value: 'gitbook',
    label: 'GitBook',
    description: 'Modern documentation platform',
  },
  {
    value: 'docusaurus',
    label: 'Docusaurus',
    description: 'Static site generator for documentation',
  },
  {
    value: 'mkdocs',
    label: 'MkDocs',
    description: 'Static site generator with Python',
  },
  {
    value: 'sphinx',
    label: 'Sphinx',
    description: 'Python documentation generator',
  },
  { value: 'hugo', label: 'Hugo', description: 'Fast static site generator' },
  {
    value: 'other',
    label: 'Other',
    description: 'Custom or less common platforms',
  },
]

const painPointOptions = [
  {
    value: 'setup-complexity',
    label: 'Setup Complexity',
    description: 'Tools are too difficult to configure',
  },
  {
    value: 'privacy-concerns',
    label: 'Privacy Concerns',
    description: "Don't want to send code/docs to third parties",
  },
  {
    value: 'false-positives',
    label: 'Too Many False Positives',
    description: 'Tools flag valid technical terms',
  },
  {
    value: 'no-customization',
    label: 'Limited Customization',
    description: "Can't adapt tools to our style guide",
  },
  {
    value: 'workflow-integration',
    label: 'Poor Workflow Integration',
    description: "Doesn't fit into existing development process",
  },
  {
    value: 'consistency-issues',
    label: 'Consistency Issues',
    description: 'Hard to maintain consistent style across team',
  },
  {
    value: 'technical-context',
    label: 'Lacks Technical Context',
    description: "Doesn't understand code or technical terminology",
  },
  {
    value: 'performance',
    label: 'Performance Issues',
    description: 'Tools are slow or resource-heavy',
  },
  {
    value: 'no-collaboration',
    label: 'No Team Collaboration',
    description: 'Hard to share rules and standards across team',
  },
]

const teamSizeOptions = [
  { value: 'solo', label: 'Just me' },
  { value: 'small', label: '2-5 people' },
  { value: 'medium', label: '6-20 people' },
  { value: 'large', label: '21-100 people' },
  { value: 'enterprise', label: '100+ people' },
]

export default function BetaSignupPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = useForm<FormData>({
    resolver: zodResolver(betaSignupSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      githubUsername: '',
      currentTools: [],
      documentationPlatforms: [],
      painPoints: [],
      teamSize: '',
      useCase: '',
      privacyConsent: false,
      marketingOptIn: false,
    },
  })

  const watchedValues = watch()

  const handleNext = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep)
    const isStepValid = await trigger(fieldsToValidate)

    if (isStepValid) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => prev - 1)
  }

  const handleFormSubmit = async (data: FormData) => {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/beta-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to submit form')
      }

      setIsSubmitted(true)
    } catch (error) {
      console.error('Form submission error:', error)
      // Handle error (show toast notification, etc.)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getFieldsForStep = (step: number): (keyof FormData)[] => {
    switch (step) {
      case 0:
        return ['email', 'githubUsername']
      case 1:
        return ['currentTools', 'documentationPlatforms', 'painPoints']
      case 2:
        return ['useCase', 'privacyConsent']
      default:
        return []
    }
  }

  const isStepValid = (step: number): boolean => {
    const fields = getFieldsForStep(step)

    return fields.every((field) => {
      const value = watchedValues[field]
      const error = errors[field]

      // Check for validation errors first
      if (error) {
        return false
      }

      // Required field validations
      switch (field) {
        case 'email':
          return (
            typeof value === 'string' && value.length > 0 && value.includes('@')
          )

        case 'currentTools':
        case 'documentationPlatforms':
        case 'painPoints':
          return Array.isArray(value) && value.length > 0

        case 'useCase':
          return typeof value === 'string' && value.length >= 10

        case 'privacyConsent':
          return value === true

        // Optional fields
        case 'githubUsername':
        case 'teamSize':
        case 'marketingOptIn':
          return true

        default:
          return true
      }
    })
  }

  if (isSubmitted) {
    return <SuccessPage />
  }

  return (
    <div className="min-h-screen bg-parchment-white py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-h1 font-medium text-ink-black mb-4">
            Join the Silent Scribe Beta
          </h1>
          <p className="text-body text-muted-gray max-w-lg mx-auto">
            Be among the first to experience privacy-first writing assistance
            designed specifically for developers and technical writers.
          </p>
        </div>

        {/* Progress Indicator */}
        <StepIndicator steps={steps} currentStep={currentStep} />

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <MultiStepForm>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep === 0 && (
                  <FormStep
                    title="Contact Information"
                    description="Let's start with the basics so we can keep you updated on our progress."
                  >
                    <Input
                      {...register('email')}
                      label="Email Address"
                      placeholder="your.email@company.com"
                      error={errors.email?.message}
                      required
                    />

                    <Input
                      {...register('githubUsername')}
                      label="GitHub Username"
                      placeholder="your-username"
                      helperText="Optional: Help us understand your development background"
                      error={errors.githubUsername?.message}
                    />
                  </FormStep>
                )}

                {currentStep === 1 && (
                  <FormStep
                    title="Tool Preferences & Pain Points"
                    description="Help us understand your current workflow and the challenges you face."
                  >
                    <CheckboxGroup
                      name="currentTools"
                      label="What writing/linting tools do you currently use?"
                      options={toolOptions}
                      value={watchedValues.currentTools}
                      onChange={(value) => setValue('currentTools', value)}
                      error={errors.currentTools?.message}
                      required
                      maxSelections={5}
                    />

                    <CheckboxGroup
                      name="documentationPlatforms"
                      label="Where do you write and maintain documentation?"
                      options={platformOptions}
                      value={watchedValues.documentationPlatforms}
                      onChange={(value) =>
                        setValue('documentationPlatforms', value)
                      }
                      error={errors.documentationPlatforms?.message}
                      required
                      maxSelections={5}
                    />

                    <CheckboxGroup
                      name="painPoints"
                      label="What are your biggest pain points with current tools?"
                      options={painPointOptions}
                      value={watchedValues.painPoints}
                      onChange={(value) => setValue('painPoints', value)}
                      error={errors.painPoints?.message}
                      required
                      maxSelections={5}
                    />
                  </FormStep>
                )}

                {currentStep === 2 && (
                  <FormStep
                    title="Use Case Details"
                    description="Tell us more about your team and specific needs for Silent Scribe."
                  >
                    <Select
                      {...register('teamSize')}
                      label="Team Size"
                      placeholder="Select your team size"
                      error={errors.teamSize?.message}
                    >
                      {teamSizeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>

                    <Textarea
                      {...register('useCase')}
                      label="Describe your documentation workflow and use case"
                      placeholder="Tell us about your current documentation process, the types of content you create, and how you envision Silent Scribe fitting into your workflow..."
                      rows={4}
                      error={errors.useCase?.message}
                      required
                      maxLength={1000}
                      showCount
                    />

                    <div className="space-y-4 p-4 bg-gray-50 rounded-card">
                      <div>
                        <Checkbox
                          {...register('privacyConsent')}
                          label="I consent to data processing"
                          description="I agree to the collection and processing of my information as described in the Privacy Policy. All data is processed locally and never sent to third-party services."
                          checked={watchedValues.privacyConsent}
                          onChange={(e) =>
                            setValue('privacyConsent', e.target.checked)
                          }
                          required
                        />
                        {errors.privacyConsent?.message && (
                          <p className="text-caption text-error-crimson mt-1">
                            {errors.privacyConsent.message}
                          </p>
                        )}
                      </div>

                      <Checkbox
                        {...register('marketingOptIn')}
                        label="Keep me updated"
                        description="I'd like to receive occasional updates about Silent Scribe's development progress and early access opportunities."
                        checked={watchedValues.marketingOptIn}
                        onChange={(e) =>
                          setValue('marketingOptIn', e.target.checked)
                        }
                      />
                    </div>
                  </FormStep>
                )}
              </motion.div>
            </AnimatePresence>

            <FormNavigation
              onPrevious={currentStep > 0 ? handlePrevious : undefined}
              onNext={currentStep < steps.length - 1 ? handleNext : undefined}
              onSubmit={
                currentStep === steps.length - 1
                  ? () => handleSubmit(handleFormSubmit)()
                  : undefined
              }
              canGoNext={isStepValid(currentStep)}
              canSubmit={
                isStepValid(currentStep) && currentStep === steps.length - 1
              }
              isLoading={isSubmitting}
              showPrevious={currentStep > 0}
              showNext={currentStep < steps.length - 1}
              showSubmit={currentStep === steps.length - 1}
              submitLabel="Join Beta Program"
            />
          </MultiStepForm>
        </form>

        {/* Social Proof */}
        <div className="mt-12 text-center">
          <p className="text-caption text-muted-gray mb-4">
            Trusted by developers who value privacy and quality
          </p>
          <div className="flex items-center justify-center space-x-8 opacity-60">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-suggestion-green rounded-full"></div>
              <span className="text-caption text-muted-gray">
                Local Processing
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-quill-blue rounded-full"></div>
              <span className="text-caption text-muted-gray">Open Source</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-focus-purple rounded-full"></div>
              <span className="text-caption text-muted-gray">
                Developer First
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SuccessPage() {
  return (
    <div className="min-h-screen bg-parchment-white flex items-center justify-center py-12">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-16 h-16 bg-suggestion-green rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-parchment-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-h2 font-medium text-ink-black mb-4">
            Welcome to Silent Scribe!
          </h1>

          <p className="text-body text-muted-gray mb-6">
            Thank you for joining our beta program. We'll be in touch soon with
            early access information and updates on our progress.
          </p>

          <div className="bg-gray-50 rounded-card p-4 mb-6">
            <h3 className="text-ui-label font-medium text-text-gray mb-2">
              What's Next?
            </h3>
            <ul className="text-caption text-muted-gray space-y-1">
              <li>• You'll receive a welcome email within 24 hours</li>
              <li>• Early access invitations will be sent in batches</li>
              <li>• Join our community Discord for updates and discussions</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button
              href="https://discord.gg/silent-scribe"
              target="_blank"
              className="w-full"
            >
              Join Our Discord Community
            </Button>

            <Button href="/" variant="secondary" className="w-full">
              Return to Homepage
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
