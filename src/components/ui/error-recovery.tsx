/**
 * Error Recovery Components
 * Phase 6: Performance Monitoring - Error Recovery Mechanisms
 *
 * Provides recovery mechanisms for failed operations
 */

'use client'

import React, { useState, useCallback } from 'react'
import { useErrorHandler } from './error-boundary'

interface RetryConfig {
  maxAttempts?: number
  initialDelay?: number
  backoffMultiplier?: number
  maxDelay?: number
  shouldRetry?: (error: Error) => boolean
}

const defaultRetryConfig: Required<RetryConfig> = {
  maxAttempts: 3,
  initialDelay: 1000,
  backoffMultiplier: 2,
  maxDelay: 10000,
  shouldRetry: (error: Error) => {
    // Retry network errors and 5xx errors, but not 4xx errors
    return (
      !error.message.includes('400') &&
      !error.message.includes('401') &&
      !error.message.includes('403') &&
      !error.message.includes('404')
    )
  },
}

/**
 * Hook for automatic retry logic with exponential backoff
 */
export function useRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = {}
) {
  const [isRetrying, setIsRetrying] = useState(false)
  const [attemptCount, setAttemptCount] = useState(0)
  const [lastError, setLastError] = useState<Error | null>(null)
  const handleError = useErrorHandler()

  const finalConfig = { ...defaultRetryConfig, ...config }

  const retry = useCallback(async (): Promise<T> => {
    setIsRetrying(true)
    setLastError(null)

    for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
      try {
        setAttemptCount(attempt)
        const result = await operation()
        setIsRetrying(false)
        setAttemptCount(0)
        return result
      } catch (error) {
        const err = error as Error
        setLastError(err)

        // Report error to tracking system
        handleError(err, {
          attempt,
          maxAttempts: finalConfig.maxAttempts,
          operation: operation.name || 'anonymous',
        })

        // Check if we should retry this error
        if (
          !finalConfig.shouldRetry(err) ||
          attempt === finalConfig.maxAttempts
        ) {
          setIsRetrying(false)
          throw err
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          finalConfig.initialDelay *
            Math.pow(finalConfig.backoffMultiplier, attempt - 1),
          finalConfig.maxDelay
        )

        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }

    setIsRetrying(false)
    throw lastError
  }, [operation, finalConfig, handleError, lastError])

  return {
    retry,
    isRetrying,
    attemptCount,
    lastError,
    reset: () => {
      setIsRetrying(false)
      setAttemptCount(0)
      setLastError(null)
    },
  }
}

/**
 * Component for handling form submission errors with retry
 */
interface FormErrorRecoveryProps {
  error: Error | null
  onRetry: () => Promise<void>
  onReset: () => void
  isLoading?: boolean
  showDetails?: boolean
}

export function FormErrorRecovery({
  error,
  onRetry,
  onReset,
  isLoading = false,
  showDetails = false,
}: FormErrorRecoveryProps) {
  if (!error) return null

  const isNetworkError =
    error.message.toLowerCase().includes('network') ||
    error.message.toLowerCase().includes('fetch')
  const isServerError =
    error.message.includes('500') ||
    error.message.includes('502') ||
    error.message.includes('503')

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            {isNetworkError
              ? 'Connection Problem'
              : isServerError
                ? 'Server Error'
                : 'Submission Error'}
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>
              {isNetworkError
                ? 'Please check your internet connection and try again.'
                : isServerError
                  ? 'Our servers are experiencing issues. Please try again in a moment.'
                  : 'There was a problem processing your request.'}
            </p>
          </div>

          {showDetails && (
            <details className="mt-2">
              <summary className="text-sm text-red-600 cursor-pointer hover:text-red-800">
                Technical Details
              </summary>
              <pre className="mt-1 text-xs text-red-600 bg-red-100 p-2 rounded overflow-auto">
                {error.message}
              </pre>
            </details>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onRetry}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Retrying...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-1.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Try Again
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center px-3 py-2 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Reset Form
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Component wrapper that automatically retries failed operations
 */
interface AutoRetryWrapperProps {
  children: React.ReactNode
  onError?: (error: Error) => void
  retryConfig?: RetryConfig
  fallbackComponent?: React.ComponentType<{ error: Error; retry: () => void }>
}

export function AutoRetryWrapper({
  children,
  onError: _onError,
  // retryConfig,
  fallbackComponent: FallbackComponent,
}: AutoRetryWrapperProps) {
  const [error, setError] = useState<Error | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  // const handleError = useCallback((error: Error) => {
  //   setError(error)
  //   onError?.(error)
  // }, [onError])

  const retry = useCallback(() => {
    setError(null)
    setRetryKey((prev) => prev + 1)
  }, [])

  if (error && FallbackComponent) {
    return <FallbackComponent error={error} retry={retry} />
  }

  if (error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Component Error
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>Something went wrong loading this section.</p>
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={retry}
                className="bg-yellow-100 px-2 py-1.5 rounded-md text-sm font-medium text-yellow-800 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <React.Suspense fallback={<div>Loading...</div>} key={retryKey}>
      {children}
    </React.Suspense>
  )
}

/**
 * Hook for graceful degradation when features fail
 */
export function useGracefulDegradation<T>(
  primaryOperation: () => Promise<T>,
  fallbackOperation: () => Promise<T> | T,
  config: RetryConfig = {}
) {
  const [isUsingFallback, setIsUsingFallback] = useState(false)
  const { retry, isRetrying, lastError } = useRetry(primaryOperation, config)

  const execute = useCallback(async (): Promise<T> => {
    try {
      const result = await retry()
      setIsUsingFallback(false)
      return result
    } catch (error) {
      console.warn('Primary operation failed, falling back:', error)
      setIsUsingFallback(true)
      return await fallbackOperation()
    }
  }, [retry, fallbackOperation])

  return {
    execute,
    isRetrying,
    isUsingFallback,
    lastError,
  }
}

/**
 * Offline detection and recovery component
 */
export function OfflineRecovery({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true)
  const [showOfflineMessage, setShowOfflineMessage] = useState(false)

  React.useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
      if (navigator.onLine) {
        setShowOfflineMessage(false)
      } else {
        setShowOfflineMessage(true)
      }
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  return (
    <>
      {showOfflineMessage && (
        <div className="bg-orange-50 border-l-4 border-orange-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-orange-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-orange-700">
                You're currently offline. Some features may not work until your
                connection is restored.
              </p>
            </div>
          </div>
        </div>
      )}
      <div className={isOnline ? '' : 'opacity-75 pointer-events-none'}>
        {children}
      </div>
    </>
  )
}
