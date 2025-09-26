'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { CheckIcon } from '@heroicons/react/24/outline'

interface Step {
  id: string
  title: string
  description?: string
  isCompleted?: boolean
  isActive?: boolean
}

interface MultiStepFormProps {
  children: ReactNode
  className?: string
}

export function MultiStepForm({ children, className }: MultiStepFormProps) {
  return <div className={cn('space-y-6', className)}>{children}</div>
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
  className?: string
}

export function StepIndicator({
  steps,
  currentStep,
  className,
}: StepIndicatorProps) {
  return (
    <nav className={cn('mb-8', className)} aria-label="Progress">
      <ol className="flex items-center">
        {steps.map((step, stepIdx) => {
          const isCompleted = stepIdx < currentStep
          const isActive = stepIdx === currentStep

          return (
            <li
              key={step.id}
              className={cn('flex items-center', {
                'flex-1': stepIdx < steps.length - 1,
              })}
            >
              <div className="flex items-center">
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
                <div className="ml-3">
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
              </div>
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

interface FormStepProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export function FormStep({
  title,
  description,
  children,
  className,
}: FormStepProps) {
  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <h2 className="text-h2 font-medium text-ink-black">{title}</h2>
        {description && (
          <p className="mt-1 text-body text-muted-gray">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

interface FormNavigationProps {
  onPrevious?: () => void
  onNext?: () => void
  onSubmit?: () => void
  previousLabel?: string
  nextLabel?: string
  submitLabel?: string
  canGoNext?: boolean
  canSubmit?: boolean
  isLoading?: boolean
  showPrevious?: boolean
  showNext?: boolean
  showSubmit?: boolean
  className?: string
}

export function FormNavigation({
  onPrevious,
  onNext,
  onSubmit,
  previousLabel = 'Previous',
  nextLabel = 'Next',
  submitLabel = 'Submit',
  canGoNext = true,
  canSubmit = true,
  isLoading = false,
  showPrevious = true,
  showNext = true,
  showSubmit = false,
  className,
}: FormNavigationProps) {
  return (
    <div
      className={cn(
        'flex justify-between pt-6 border-t border-border-gray',
        className
      )}
    >
      <div>
        {showPrevious && onPrevious && (
          <button
            type="button"
            onClick={onPrevious}
            disabled={isLoading}
            className="px-4 py-2 text-ui-label font-medium text-muted-gray hover:text-text-gray disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {previousLabel}
          </button>
        )}
      </div>

      <div className="flex space-x-3">
        {showNext && onNext && (
          <button
            type="button"
            onClick={onNext}
            disabled={!canGoNext || isLoading}
            className="px-6 py-2 bg-quill-blue text-parchment-white rounded-card hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-ui-label"
          >
            {nextLabel}
          </button>
        )}

        {showSubmit && onSubmit && (
          <button
            type="submit"
            onClick={onSubmit}
            disabled={!canSubmit || isLoading}
            className="px-6 py-2 bg-suggestion-green text-parchment-white rounded-card hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-ui-label flex items-center"
          >
            {isLoading && (
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-parchment-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {submitLabel}
          </button>
        )}
      </div>
    </div>
  )
}
