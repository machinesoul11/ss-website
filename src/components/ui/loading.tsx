import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-current border-t-transparent',
        {
          'h-4 w-4': size === 'sm',
          'h-6 w-6': size === 'md',
          'h-8 w-8': size === 'lg',
        },
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

interface LoadingDotsProps {
  className?: string
}

export function LoadingDots({ className }: LoadingDotsProps) {
  return (
    <div className={cn('flex space-x-1', className)} role="status" aria-label="Loading">
      <div className="h-2 w-2 bg-current rounded-full animate-pulse"></div>
      <div className="h-2 w-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
      <div className="h-2 w-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
      <span className="sr-only">Loading...</span>
    </div>
  )
}

interface LoadingSkeletonProps {
  className?: string
  lines?: number
}

export function LoadingSkeleton({ className, lines = 1 }: LoadingSkeletonProps) {
  return (
    <div className={cn('animate-pulse', className)} role="status" aria-label="Loading content">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn('h-4 bg-border-gray rounded', {
            'mb-2': i < lines - 1,
            'w-full': i === 0,
            'w-3/4': i === 1,
            'w-1/2': i >= 2,
          })}
        />
      ))}
      <span className="sr-only">Loading content...</span>
    </div>
  )
}
