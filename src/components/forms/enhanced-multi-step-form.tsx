/**
 * Enhanced Multi-Step Form with Detailed Analytics Tracking
 * Implements comprehensive form interaction and funnel analysis
 */

'use client'

import { ReactNode, useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { CheckIcon } from '@heroicons/react/24/outline'
import {
  EnhancedForm,
  EnhancedInput,
  ConversionFunnelStep,
} from '@/components/analytics'
import { useEnhancedAnalyticsContext } from '@/components/analytics'

interface Step {
  id: string
  title: string
  description?: string
  isCompleted?: boolean
  isActive?: boolean
}

interface EnhancedMultiStepFormProps {
  children: ReactNode
  className?: string
  formName: string
  steps: Step[]
  currentStep: number
  onStepChange?: (step: number) => void
  enableTracking?: boolean
  funnelName?: string
}

export function EnhancedMultiStepForm({
  children,
  className,
  formName,
  steps,
  currentStep,
  onStepChange,
  enableTracking = true,
  funnelName = 'multi_step_form',
}: EnhancedMultiStepFormProps) {
  const [internalCurrentStep, setInternalCurrentStep] = useState(
    currentStep || 0
  )
  const { startFormTracking, startFunnelTracking } =
    useEnhancedAnalyticsContext()
  const formTracker = useRef(
    enableTracking ? startFormTracking(formName, steps.length) : null
  )
  const funnelTracker = useRef(
    enableTracking ? startFunnelTracking(funnelName, steps.length) : null
  )
  const stepStartTime = useRef(Date.now())
  const stepInteractions = useRef(0)

  const activeStep = onStepChange ? currentStep : internalCurrentStep

  // Track step changes
  useEffect(() => {
    if (enableTracking && activeStep > 0) {
      // const stepTime = Date.now() - stepStartTime.current

      // Track the current step
      funnelTracker.current?.trackStep(
        steps[activeStep - 1]?.id || `step_${activeStep}`,
        activeStep
      )

      // If moving to next step, track completion of previous step
      if (activeStep > 1) {
        formTracker.current?.trackStepCompletion(activeStep - 1)
      }

      // Reset step tracking
      stepStartTime.current = Date.now()
      stepInteractions.current = 0
    }
  }, [activeStep, enableTracking, steps])

  // Track abandonment on unmount
  useEffect(() => {
    return () => {
      if (enableTracking && activeStep < steps.length) {
        // const stepTime = Date.now() - stepStartTime.current
        formTracker.current?.trackAbandonment(activeStep)
        funnelTracker.current?.trackAbandonment(activeStep)
      }
    }
  }, [activeStep, steps.length, enableTracking])

  const handleStepChange = (newStep: number) => {
    if (onStepChange) {
      onStepChange(newStep)
    } else {
      setInternalCurrentStep(newStep)
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      <StepIndicator
        steps={steps}
        currentStep={activeStep}
        formName={formName}
        enableTracking={enableTracking}
      />

      <ConversionFunnelStep
        stepName={steps[activeStep - 1]?.id || `step_${activeStep}`}
        stepNumber={activeStep}
        funnelName={funnelName}
      >
        <EnhancedForm
          formName={formName}
          totalSteps={steps.length}
          funnelName={funnelName}
          enableFormTracking={enableTracking}
          enableFunnelTracking={enableTracking}
          onStepComplete={(step) => {
            if (step < steps.length) {
              handleStepChange(step + 1)
            }
          }}
        >
          {children}
        </EnhancedForm>
      </ConversionFunnelStep>
    </div>
  )
}

interface EnhancedStepIndicatorProps {
  steps: Step[]
  currentStep: number
  className?: string
  formName?: string
  enableTracking?: boolean
}

export function StepIndicator({
  steps,
  currentStep,
  className,
  formName,
  enableTracking = true,
}: EnhancedStepIndicatorProps) {
  const { trackFormInteraction } = useEnhancedAnalyticsContext()

  const handleStepClick = async (stepIndex: number) => {
    if (enableTracking && formName) {
      await trackFormInteraction({
        formId: formName,
        fieldName: `step_indicator`,
        action: 'change',
        value: `step_${stepIndex + 1}`,
        stepNumber: currentStep,
        totalSteps: steps.length,
      })
    }
  }

  return (
    <nav className={cn('mb-8', className)} aria-label="Progress">
      <ol className="flex items-center">
        {steps.map((step, stepIdx) => {
          const isCompleted = stepIdx < currentStep - 1
          const isActive = stepIdx === currentStep - 1

          return (
            <li
              key={step.id}
              className={cn('flex items-center', {
                'flex-1': stepIdx < steps.length - 1,
              })}
            >
              <button
                type="button"
                onClick={() => handleStepClick(stepIdx)}
                className="flex items-center focus:outline-none focus:ring-2 focus:ring-quill-blue rounded-lg p-2"
                aria-current={isActive ? 'step' : undefined}
                disabled={stepIdx > currentStep} // Prevent skipping ahead
              >
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2',
                    {
                      'bg-suggestion-green border-suggestion-green':
                        isCompleted,
                      'border-quill-blue bg-quill-blue': isActive,
                      'border-border-gray bg-parchment-white':
                        !isCompleted && !isActive,
                    }
                  )}
                >
                  {isCompleted ? (
                    <CheckIcon className="h-4 w-4 text-parchment-white" />
                  ) : (
                    <span
                      className={cn('text-ui-label font-medium', {
                        'text-parchment-white': isActive,
                        'text-muted-gray': !isActive,
                      })}
                    >
                      {stepIdx + 1}
                    </span>
                  )}
                </div>
                <div className="ml-3 text-left">
                  <p
                    className={cn('text-ui-label font-medium', {
                      'text-quill-blue': isActive,
                      'text-suggestion-green': isCompleted,
                      'text-text-gray': !isCompleted && !isActive,
                    })}
                  >
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-caption text-muted-gray">
                      {step.description}
                    </p>
                  )}
                </div>
              </button>
              {stepIdx < steps.length - 1 && (
                <div
                  className={cn('ml-6 flex-1 h-0.5', {
                    'bg-suggestion-green': isCompleted,
                    'bg-border-gray': !isCompleted,
                  })}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

interface TrackedFormFieldProps {
  label: string
  name: string
  type?: string
  required?: boolean
  placeholder?: string
  description?: string
  formName: string
  value?: string
  onChange?: (value: string) => void
  validation?: {
    pattern?: RegExp
    minLength?: number
    maxLength?: number
    required?: boolean
    message?: string
  }
  className?: string
}

/**
 * Form field component with comprehensive interaction tracking
 */
export function TrackedFormField({
  label,
  name,
  type = 'text',
  required = false,
  placeholder,
  description,
  formName,
  value,
  onChange,
  validation,
  className,
}: TrackedFormFieldProps) {
  const [fieldValue, setFieldValue] = useState(value || '')
  // const [hasInteracted, setHasInteracted] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const { trackFormInteraction } = useEnhancedAnalyticsContext()
  const focusTimeRef = useRef<number>(0)
  const interactionCountRef = useRef(0)

  const validateField = (val: string) => {
    if (!validation) return null

    if (validation.required && !val.trim()) {
      return validation.message || `${label} is required`
    }

    if (validation.minLength && val.length < validation.minLength) {
      return (
        validation.message ||
        `${label} must be at least ${validation.minLength} characters`
      )
    }

    if (validation.maxLength && val.length > validation.maxLength) {
      return (
        validation.message ||
        `${label} must be no more than ${validation.maxLength} characters`
      )
    }

    if (validation.pattern && !validation.pattern.test(val)) {
      return validation.message || `${label} format is invalid`
    }

    return null
  }

  const handleFocus = async () => {
    focusTimeRef.current = Date.now()
    // setHasInteracted(true)

    await trackFormInteraction({
      formId: formName,
      fieldName: name,
      action: 'focus',
    })
  }

  const handleBlur = async () => {
    const timeSpent = Date.now() - focusTimeRef.current

    await trackFormInteraction({
      formId: formName,
      fieldName: name,
      action: 'blur',
      value: fieldValue,
      timeSpent,
    })

    // Validate on blur
    const error = validateField(fieldValue)
    setValidationError(error)

    if (error) {
      await trackFormInteraction({
        formId: formName,
        fieldName: name,
        action: 'error',
        errors: [error],
      })
    }
  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setFieldValue(newValue)
    interactionCountRef.current++

    if (onChange) {
      onChange(newValue)
    }

    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError(null)
    }

    // Track every 5th character or significant changes
    if (
      interactionCountRef.current % 5 === 0 ||
      newValue.length === 0 ||
      newValue.length === 1
    ) {
      await trackFormInteraction({
        formId: formName,
        fieldName: name,
        action: 'change',
        value: newValue,
      })
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      <label
        htmlFor={name}
        className="block text-ui-label font-medium text-text-gray"
      >
        {label}
        {required && <span className="text-error-red ml-1">*</span>}
      </label>

      <EnhancedInput
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        value={fieldValue}
        formName={formName}
        fieldName={name}
        trackInteractions={true}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        className={cn(
          'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-quill-blue',
          {
            'border-error-red': validationError,
            'border-border-gray': !validationError,
          }
        )}
        aria-describedby={description ? `${name}-description` : undefined}
        aria-invalid={!!validationError}
      />

      {description && (
        <p id={`${name}-description`} className="text-caption text-muted-gray">
          {description}
        </p>
      )}

      {validationError && (
        <p className="text-caption text-error-red" role="alert">
          {validationError}
        </p>
      )}
    </div>
  )
}
