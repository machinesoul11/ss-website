/**
 * Enhanced Analytics Components
 * Components with built-in enhanced tracking capabilities
 */

'use client'

import React, { forwardRef, useEffect, useRef, useState } from 'react'
import { useEnhancedAnalyticsContext } from './EnhancedAnalyticsProvider'
import { Button } from '@/components/ui/button'
import type { CTAClickData, FormInteractionData } from '@/lib/enhanced-tracking'
import { safeAnalyticsCall } from '@/lib/analytics-throttle'

interface EnhancedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  ctaText?: string
  ctaPosition?: CTAClickData['ctaPosition']
  ctaType?: CTAClickData['ctaType']
  section?: string
  destination?: string
  userFlow?: string
  trackAsGoal?: boolean
  goalName?: string
  children: React.ReactNode
}

/**
 * Enhanced Button with detailed CTA tracking
 */
export const EnhancedButton = forwardRef<
  HTMLButtonElement,
  EnhancedButtonProps
>(
  (
    {
      ctaText,
      ctaPosition = 'content',
      ctaType = 'primary',
      section,
      destination,
      userFlow,
      trackAsGoal,
      goalName,
      onClick,
      children,
      ...domProps
    },
    ref
  ) => {
    const { trackCTAClick } = useEnhancedAnalyticsContext()

    const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
      const text =
        ctaText || (typeof children === 'string' ? children : 'Button Click')

      await trackCTAClick({
        ctaText: text,
        ctaPosition,
        ctaType,
        page: typeof window !== 'undefined' ? window.location.pathname : '',
        section,
        destination,
        userFlow,
      })

      if (onClick) {
        onClick(event)
      }
    }

    return (
      <Button
        ref={ref}
        onClick={handleClick}
        data-cta={ctaText || true}
        data-cta-position={ctaPosition}
        data-cta-type={ctaType}
        {...domProps}
      >
        {children}
      </Button>
    )
  }
)

EnhancedButton.displayName = 'EnhancedButton'

interface EnhancedFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  formName: string
  totalSteps?: number
  funnelName?: string
  enableFormTracking?: boolean
  enableFunnelTracking?: boolean
  children: React.ReactNode
  onStepComplete?: (step: number) => void
  onAbandon?: (step: number) => void
  onComplete?: () => void
}

/**
 * Enhanced Form with detailed interaction and funnel tracking
 */
export const EnhancedForm = forwardRef<HTMLFormElement, EnhancedFormProps>(
  (
    {
      formName,
      totalSteps = 1,
      funnelName,
      enableFormTracking = true,
      enableFunnelTracking = false,
      onStepComplete,
      // onAbandon,
      onComplete,
      onSubmit,
      children,
      ...props
    },
    ref
  ) => {
    const { startFormTracking, startFunnelTracking } =
      useEnhancedAnalyticsContext()
    const formTracker = useRef(
      enableFormTracking ? startFormTracking(formName, totalSteps) : null
    )
    const funnelTracker = useRef(
      enableFunnelTracking && funnelName
        ? startFunnelTracking(funnelName, totalSteps)
        : null
    )
    const [currentStep, setCurrentStep] = useState(1)
    // const startTimeRef = useRef(Date.now())

    // Track form abandonment on unmount or page leave
    useEffect(() => {
      const handleBeforeUnload = () => {
        if (currentStep < totalSteps && formTracker.current) {
          formTracker.current.trackAbandonment(currentStep)
        }
        if (currentStep < totalSteps && funnelTracker.current) {
          funnelTracker.current.trackAbandonment(currentStep)
        }
      }

      window.addEventListener('beforeunload', handleBeforeUnload)
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload)
        // Track abandonment if form is unmounted before completion
        if (currentStep < totalSteps) {
          formTracker.current?.trackAbandonment(currentStep)
          funnelTracker.current?.trackAbandonment(currentStep)
        }
      }
    }, [currentStep, totalSteps])

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      try {
        // Track completion
        if (currentStep === totalSteps) {
          formTracker.current?.trackCompletion()
          funnelTracker.current?.trackCompletion()
          onComplete?.()
        } else {
          // Track step completion
          formTracker.current?.trackStepCompletion(currentStep)
          funnelTracker.current?.trackStep(`step_${currentStep}`, currentStep)
          onStepComplete?.(currentStep)
        }

        if (onSubmit) {
          onSubmit(event)
        }
      } catch (error) {
        console.error('Error in form submission tracking:', error)
        if (onSubmit) {
          onSubmit(event)
        }
      }
    }

    // Provide methods to manually control step tracking
    const stepControls = {
      nextStep: () => {
        const newStep = currentStep + 1
        setCurrentStep(newStep)
        funnelTracker.current?.trackStep(`step_${newStep}`, newStep)
      },

      trackStepCompletion: (step: number) => {
        formTracker.current?.trackStepCompletion(step)
        funnelTracker.current?.trackStep(`step_${step}`, step)
      },

      trackFieldInteraction: (
        fieldName: string,
        action: FormInteractionData['action'],
        value?: string
      ) => {
        formTracker.current?.trackFieldInteraction(fieldName, action, value)
      },
    }

    // Attach step controls to form element for external access
    React.useImperativeHandle(ref, () => {
      const form = document.querySelector(
        `form[data-form-name="${formName}"]`
      ) as HTMLFormElement
      if (form) {
        ;(form as any).stepControls = stepControls
      }
      return form
    })

    return (
      <form
        ref={ref}
        data-form-name={formName}
        data-total-steps={totalSteps}
        data-current-step={currentStep}
        onSubmit={handleSubmit}
        {...props}
      >
        {children}
      </form>
    )
  }
)

EnhancedForm.displayName = 'EnhancedForm'

interface EnhancedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  trackInteractions?: boolean
  fieldName?: string
  formName?: string
}

/**
 * Enhanced Input with automatic interaction tracking
 */
export const EnhancedInput = forwardRef<HTMLInputElement, EnhancedInputProps>(
  (
    {
      trackInteractions = true,
      fieldName,
      formName,
      onFocus,
      onBlur,
      onChange,
      ...props
    },
    ref
  ) => {
    const { trackFormInteraction } = useEnhancedAnalyticsContext()
    const focusTimeRef = useRef<number>(0)

    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
      focusTimeRef.current = Date.now()

      if (trackInteractions && fieldName && formName) {
        safeAnalyticsCall(() => {
          trackFormInteraction({
            formId: formName,
            fieldName,
            action: 'focus',
          })
        })
      }

      if (onFocus) {
        onFocus(event)
      }
    }

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      const timeSpent = Date.now() - focusTimeRef.current

      if (trackInteractions && fieldName && formName) {
        safeAnalyticsCall(() => {
          trackFormInteraction({
            formId: formName,
            fieldName,
            action: 'blur',
            value: event.target.value,
            timeSpent,
          })
        })
      }

      if (onBlur) {
        onBlur(event)
      }
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (trackInteractions && fieldName && formName) {
        safeAnalyticsCall(() => {
          trackFormInteraction({
            formId: formName,
            fieldName,
            action: 'change',
            value: event.target.value,
          })
        })
      }

      if (onChange) {
        onChange(event)
      }
    }

    return (
      <input
        ref={ref}
        name={fieldName || props.name}
        data-field-name={fieldName}
        data-form-name={formName}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        {...props}
      />
    )
  }
)

EnhancedInput.displayName = 'EnhancedInput'

interface ScrollDepthTrackerProps {
  children: React.ReactNode
  trackingId?: string
}

/**
 * Component that tracks scroll depth within a specific section
 */
export function ScrollDepthTracker({
  children,
  trackingId,
}: ScrollDepthTrackerProps) {
  const { trackScrollDepth } = useEnhancedAnalyticsContext()
  const elementRef = useRef<HTMLDivElement>(null)
  const trackedMilestones = useRef(new Set<number>())
  const startTime = useRef(Date.now())

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const rect = entry.boundingClientRect
            const elementHeight = element.scrollHeight
            const visibleHeight = rect.height
            const scrollPercentage = Math.round(
              (visibleHeight / elementHeight) * 100
            )

            // Track milestones specific to this section
            const milestones = [25, 50, 75, 100]
            milestones.forEach((milestone) => {
              if (
                scrollPercentage >= milestone &&
                !trackedMilestones.current.has(milestone)
              ) {
                trackedMilestones.current.add(milestone)

                trackScrollDepth({
                  percentage: milestone,
                  page:
                    window.location.pathname +
                    (trackingId ? `#${trackingId}` : ''),
                  timeToReach: Date.now() - startTime.current,
                  maxDepthReached: Math.max(
                    ...Array.from(trackedMilestones.current)
                  ),
                  bounced:
                    trackedMilestones.current.size === 1 && milestone === 25,
                })
              }
            })
          }
        })
      },
      { threshold: [0.25, 0.5, 0.75, 1.0] }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [trackScrollDepth, trackingId])

  return (
    <div ref={elementRef} data-scroll-tracking-id={trackingId}>
      {children}
    </div>
  )
}

interface ConversionFunnelStepProps {
  children: React.ReactNode
  stepName: string
  stepNumber: number
  funnelName: string
  onStepEnter?: () => void
  onStepExit?: () => void
}

/**
 * Component that tracks funnel steps using intersection observer
 */
export function ConversionFunnelStep({
  children,
  stepName,
  stepNumber,
  funnelName,
  onStepEnter,
  onStepExit,
}: ConversionFunnelStepProps) {
  const { startFunnelTracking } = useEnhancedAnalyticsContext()
  const elementRef = useRef<HTMLDivElement>(null)
  const funnelTracker = useRef(startFunnelTracking(funnelName, 10)) // Assume max 10 steps
  const hasEntered = useRef(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasEntered.current) {
            hasEntered.current = true
            funnelTracker.current.trackStep(stepName, stepNumber)
            onStepEnter?.()
          } else if (!entry.isIntersecting && hasEntered.current) {
            onStepExit?.()
          }
        })
      },
      { threshold: 0.5 } // Trigger when 50% of the element is visible
    )

    observer.observe(element)
    return () => {
      observer.disconnect()
      funnelTracker.current.cleanup()
    }
  }, [stepName, stepNumber, funnelName, onStepEnter, onStepExit])

  return (
    <div
      ref={elementRef}
      data-funnel-step={stepName}
      data-funnel-number={stepNumber}
      data-funnel-name={funnelName}
    >
      {children}
    </div>
  )
}

interface EnhancedMultiStepFormProps {
  children: React.ReactNode
  totalSteps: number
  currentStep: number
  onStepChange?: (step: number) => void
  formId?: string
  className?: string
}

/**
 * Multi-step form wrapper with step tracking
 */
export function EnhancedMultiStepForm({
  children,
  totalSteps,
  currentStep,
  onStepChange,
  formId = 'multi-step-form',
  className = '',
}: EnhancedMultiStepFormProps) {
  const { trackFormInteraction } = useEnhancedAnalyticsContext()

  useEffect(() => {
    trackFormInteraction({
      formId,
      fieldName: `step-${currentStep}`,
      action: 'focus',
      value: currentStep.toString(),
      stepNumber: currentStep,
      totalSteps,
    })
  }, [currentStep, formId, totalSteps, trackFormInteraction])

  const handleStepChange = (step: number) => {
    trackFormInteraction({
      formId,
      fieldName: `step-${step}`,
      action: 'change',
      value: step.toString(),
      stepNumber: step,
      totalSteps,
    })
    onStepChange?.(step)
  }

  return (
    <div className={`multi-step-form ${className}`} data-form-id={formId}>
      <div className="step-indicator mb-6">
        <div className="flex justify-between items-center">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`step ${i + 1 <= currentStep ? 'completed' : 'pending'}`}
              onClick={() => handleStepChange(i + 1)}
            >
              <div
                className={`step-number ${i + 1 === currentStep ? 'active' : ''}`}
              >
                {i + 1}
              </div>
            </div>
          ))}
        </div>
        <div className="progress-bar mt-2">
          <div
            className="progress-fill"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>
      {children}
    </div>
  )
}

interface TrackedFormFieldProps {
  fieldId: string
  label: string
  children: React.ReactNode
  formId?: string
  required?: boolean
  helpText?: string
  className?: string
}

/**
 * Form field wrapper with interaction tracking
 */
export function TrackedFormField({
  fieldId,
  label,
  children,
  formId = 'form',
  required = false,
  helpText,
  className = '',
}: TrackedFormFieldProps) {
  const { trackFormInteraction } = useEnhancedAnalyticsContext()
  const [focused, setFocused] = useState(false)
  const [touched, setTouched] = useState(false)

  const handleFocus = () => {
    setFocused(true)
    if (!touched) {
      setTouched(true)
      trackFormInteraction({
        formId,
        fieldName: fieldId,
        action: 'focus',
        value: '',
      })
    }
  }

  const handleBlur = () => {
    setFocused(false)
    trackFormInteraction({
      formId,
      fieldName: fieldId,
      action: 'blur',
      value: '',
    })
  }

  const handleChange = (value: string) => {
    trackFormInteraction({
      formId,
      fieldName: fieldId,
      action: 'change',
      value: value.length.toString(), // Track length, not actual value for privacy
    })
  }

  return (
    <div className={`form-field ${className} ${focused ? 'focused' : ''}`}>
      <label htmlFor={fieldId} className="field-label">
        {label}
        {required && <span className="required">*</span>}
      </label>
      <div
        className="field-wrapper"
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={(e: any) => handleChange(e.target.value)}
      >
        {children}
      </div>
      {helpText && <div className="field-help">{helpText}</div>}
    </div>
  )
}
