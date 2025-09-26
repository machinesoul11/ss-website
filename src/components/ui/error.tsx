'use client'

import { cn } from '@/lib/utils'
import {
  ExclamationTriangleIcon,
  XCircleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'

interface ErrorMessageProps {
  message: string
  type?: 'error' | 'warning' | 'success' | 'info'
  className?: string
  showIcon?: boolean
}

export function ErrorMessage({
  message,
  type = 'error',
  className,
  showIcon = true,
}: ErrorMessageProps) {
  const icons = {
    error: XCircleIcon,
    warning: ExclamationTriangleIcon,
    success: CheckCircleIcon,
    info: InformationCircleIcon,
  }

  const Icon = icons[type]

  return (
    <div
      className={cn(
        'flex items-center space-x-2 p-3 rounded-card border',
        {
          'bg-red-50 border-error-crimson text-red-800': type === 'error',
          'bg-amber-50 border-warning-amber text-amber-800': type === 'warning',
          'bg-green-50 border-suggestion-green text-green-800':
            type === 'success',
          'bg-blue-50 border-quill-blue text-blue-800': type === 'info',
        },
        className
      )}
      role="alert"
    >
      {showIcon && <Icon className="h-5 w-5 flex-shrink-0" />}
      <p className="text-ui-label">{message}</p>
    </div>
  )
}

interface ErrorBoundaryFallbackProps {
  error: Error
  resetError: () => void
}

export function ErrorBoundaryFallback({
  error,
  resetError,
}: ErrorBoundaryFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
      <XCircleIcon className="h-12 w-12 text-error-crimson mb-4" />
      <h2 className="text-h2 text-ink-black mb-2">Something went wrong</h2>
      <p className="text-body text-muted-gray mb-4 text-center max-w-md">
        We apologize for the inconvenience. An unexpected error occurred while
        loading this page.
      </p>
      <details className="mb-4">
        <summary className="cursor-pointer text-ui-label text-quill-blue hover:underline">
          View error details
        </summary>
        <pre className="mt-2 p-3 bg-document-gray border border-border-gray rounded-card text-code font-mono text-text-gray whitespace-pre-wrap">
          {error.message}
        </pre>
      </details>
      <button
        onClick={resetError}
        className="px-4 py-2 bg-quill-blue text-parchment-white rounded-card hover:bg-blue-700 transition-colors"
      >
        Try again
      </button>
    </div>
  )
}
