/**
 * Error Boundary Component
 * Phase 6: Performance Monitoring - Error Handling System
 * 
 * Catches React component errors and reports them to error tracking
 */

'use client'

import React, { Component, ReactNode } from 'react'
import { errorTracker } from '@/lib/services/error-tracking'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Report error to tracking service
    errorTracker.captureComponentError(error, {
      componentStack: errorInfo.componentStack || ''
    })

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)

    // Update state with error info
    this.setState({
      error,
      errorInfo
    })

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      // Render custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return <DefaultErrorFallback error={this.state.error} />
    }

    return this.props.children
  }
}

/**
 * Default Error Fallback Component
 */
function DefaultErrorFallback({ error }: { error: Error | null }) {
  return (
    <div className="min-h-[400px] flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
      <div className="text-center p-6 max-w-md">
        <div className="text-red-500 mb-4">
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Something went wrong
        </h3>
        
        <p className="text-gray-600 mb-4">
          We're sorry, but something unexpected happened. The error has been reported and we'll look into it.
        </p>

        {process.env.NODE_ENV === 'development' && error && (
          <details className="text-left bg-gray-100 p-3 rounded text-sm text-gray-700 mb-4">
            <summary className="cursor-pointer font-medium">Error Details (Dev Mode)</summary>
            <pre className="mt-2 whitespace-pre-wrap break-all">
              {error.name}: {error.message}
              {error.stack && '\n\nStack trace:\n' + error.stack}
            </pre>
          </details>
        )}
        
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Reload Page
        </button>
      </div>
    </div>
  )
}

/**
 * Higher-Order Component for Error Boundaries
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

/**
 * Hook for manual error reporting within components
 */
export function useErrorHandler() {
  const handleError = React.useCallback((error: Error, errorInfo?: { [key: string]: any }) => {
    errorTracker.captureError({
      message: error.message,
      stack: error.stack,
      severity: 'high',
      category: 'user',
      metadata: errorInfo
    })
  }, [])

  return handleError
}

/**
 * Async Error Boundary for handling promise rejections in components
 */
export function AsyncErrorBoundary({ 
  children, 
  fallback,
  onError 
}: {
  children: ReactNode
  fallback?: (error: Error) => ReactNode
  onError?: (error: Error) => void
}) {
  const [error, setError] = React.useState<Error | null>(null)

  // Reset error when children change
  React.useEffect(() => {
    setError(null)
  }, [children])

  // Handle async errors
  const handleAsyncError = React.useCallback((error: Error) => {
    errorTracker.captureError({
      message: error.message,
      stack: error.stack,
      severity: 'high',
      category: 'javascript',
      metadata: { async: true }
    })

    onError?.(error)
    setError(error)
  }, [onError])

  // Provide error handler to children
  const contextValue = React.useMemo(() => ({
    handleAsyncError
  }), [handleAsyncError])

  if (error) {
    if (fallback) {
      return <>{fallback(error)}</>
    }
    return <DefaultErrorFallback error={error} />
  }

  return (
    <AsyncErrorContext.Provider value={contextValue}>
      <ErrorBoundary onError={onError}>
        {children}
      </ErrorBoundary>
    </AsyncErrorContext.Provider>
  )
}

/**
 * Context for async error handling
 */
const AsyncErrorContext = React.createContext<{
  handleAsyncError: (error: Error) => void
}>({
  handleAsyncError: () => {}
})

/**
 * Hook to handle async errors
 */
export function useAsyncErrorHandler() {
  const context = React.useContext(AsyncErrorContext)
  
  const handleAsyncError = React.useCallback(
    async function<T>(asyncFn: () => Promise<T>): Promise<T | null> {
      try {
        return await asyncFn()
      } catch (error) {
        context.handleAsyncError(error as Error)
        return null
      }
    },
    [context]
  )

  return {
    handleAsyncError,
    reportError: context.handleAsyncError
  }
}
