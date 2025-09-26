import { cn } from '@/lib/utils'
import { forwardRef, TextareaHTMLAttributes, useState, useId } from 'react'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  success?: boolean
  showCharCount?: boolean
  showCount?: boolean // Alias for showCharCount
  maxLength?: number
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText, 
    success, 
    showCharCount = false,
    showCount = false,
    maxLength,
    id, 
    value,
    onChange,
    ...props 
  }, ref) => {
    const [charCount, setCharCount] = useState(
      typeof value === 'string' ? value.length : 0
    )
    
    const generatedId = useId()
    const textareaId = id || generatedId
    
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (showCharCount || showCount || maxLength) {
        setCharCount(e.target.value.length)
      }
      onChange?.(e)
    }
    
    const isNearLimit = maxLength && charCount > maxLength * 0.8
    const isOverLimit = maxLength && charCount > maxLength
    
    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-ui-label text-text-gray font-medium"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          className={cn(
            'flex min-h-[80px] w-full rounded-card border bg-parchment-white px-3 py-2 text-body ring-offset-background placeholder:text-muted-gray focus:outline-none focus:ring-2 focus:ring-focus-purple focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-vertical',
            {
              'border-border-gray': !error && !success,
              'border-error-crimson focus:ring-error-crimson': error || isOverLimit,
              'border-suggestion-green focus:ring-suggestion-green': success && !isOverLimit,
              'border-warning-amber focus:ring-warning-amber': isNearLimit && !isOverLimit && !error,
            },
            className
          )}
          value={value}
          onChange={handleChange}
          maxLength={maxLength}
          ref={ref}
          {...props}
        />
        <div className="flex justify-between items-center">
          <div>
            {(error || helperText) && (
              <p
                className={cn('text-caption', {
                  'text-error-crimson': error || isOverLimit,
                  'text-muted-gray': helperText && !error && !isOverLimit,
                })}
              >
                {error || helperText}
              </p>
            )}
          </div>
          {(showCharCount || showCount || maxLength) && (
            <p
              className={cn('text-caption', {
                'text-muted-gray': !isNearLimit,
                'text-warning-amber': isNearLimit && !isOverLimit,
                'text-error-crimson': isOverLimit,
              })}
            >
              {charCount}{maxLength && `/${maxLength}`}
            </p>
          )}
        </div>
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }
