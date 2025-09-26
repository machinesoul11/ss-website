import { cn } from '@/lib/utils'
import { forwardRef, InputHTMLAttributes, useId } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  success?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      helperText,
      success,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId()
    const inputId = id || generatedId

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-ui-label text-text-gray font-medium"
          >
            {label}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          className={cn(
            'flex h-10 w-full rounded-card border bg-parchment-white px-3 py-2 text-body ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-gray focus:outline-none focus:ring-2 focus:ring-focus-purple focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            {
              'border-border-gray': !error && !success,
              'border-error-crimson focus:ring-error-crimson': error,
              'border-suggestion-green focus:ring-suggestion-green': success,
            },
            className
          )}
          ref={ref}
          {...props}
        />
        {(error || helperText) && (
          <p
            className={cn('text-caption', {
              'text-error-crimson': error,
              'text-muted-gray': helperText && !error,
            })}
          >
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
