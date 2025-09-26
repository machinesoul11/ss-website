'use client'

import { cn } from '@/lib/utils'
import { forwardRef, InputHTMLAttributes, useId } from 'react'

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  description?: string
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const generatedId = useId()
    const checkboxId = id || generatedId

    return (
      <div className="flex items-start space-x-3">
        <div className="flex items-center h-5">
          <input
            type="checkbox"
            id={checkboxId}
            className={cn(
              'h-4 w-4 rounded border-2 border-border-gray text-quill-blue focus:ring-2 focus:ring-focus-purple focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="space-y-1">
            {label && (
              <label
                htmlFor={checkboxId}
                className="text-ui-label text-text-gray font-medium cursor-pointer"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-caption text-muted-gray">{description}</p>
            )}
          </div>
        )}
      </div>
    )
  }
)
Checkbox.displayName = 'Checkbox'

export { Checkbox }
