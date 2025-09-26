import { cn } from '@/lib/utils'
import { forwardRef, SelectHTMLAttributes, useId } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  success?: boolean
  placeholder?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, success, placeholder, id, children, ...props }, ref) => {
    const generatedId = useId()
    const selectId = id || generatedId
    
    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-ui-label text-text-gray font-medium"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            className={cn(
              'flex h-10 w-full rounded-card border bg-parchment-white px-3 py-2 text-body ring-offset-background focus:outline-none focus:ring-2 focus:ring-focus-purple focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none pr-10',
              {
                'border-border-gray': !error && !success,
                'border-error-crimson focus:ring-error-crimson': error,
                'border-suggestion-green focus:ring-suggestion-green': success,
              },
              className
            )}
            ref={ref}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {children}
          </select>
          <ChevronDownIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-gray pointer-events-none" />
        </div>
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
Select.displayName = 'Select'

export { Select }
