'use client'

import { cn } from '@/lib/utils'
import { forwardRef, ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react'

type ButtonElement = HTMLButtonElement | HTMLAnchorElement

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'href'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  href?: string
  target?: string
}

const Button = forwardRef<ButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      children,
      disabled,
      href,
      target,
      ...props
    },
    ref
  ) => {
    const baseClasses = cn(
      // Base styles
      'inline-flex items-center justify-center rounded-card font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-focus-purple focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
      // Size variants
      {
        'h-8 px-3 text-caption': size === 'sm',
        'h-10 px-4 text-ui-label': size === 'md',
        'h-12 px-6 text-body': size === 'lg',
      },
      // Color variants
      {
        'bg-quill-blue text-parchment-white hover:bg-blue-700 active:bg-blue-800':
          variant === 'primary',
        'bg-document-gray text-text-gray border border-border-gray hover:bg-gray-50 active:bg-gray-100':
          variant === 'secondary',
        'text-text-gray hover:bg-document-gray active:bg-gray-100':
          variant === 'ghost',
        'bg-error-crimson text-parchment-white hover:bg-red-600 active:bg-red-700':
          variant === 'danger',
      },
      className
    )

    const content = (
      <>
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
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
        {children}
      </>
    )

    if (href) {
      return (
        <a
          className={baseClasses}
          href={href}
          target={target}
          ref={ref as React.ForwardedRef<HTMLAnchorElement>}
          {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {content}
        </a>
      )
    }

    return (
      <button
        className={baseClasses}
        disabled={disabled || loading}
        ref={ref as React.ForwardedRef<HTMLButtonElement>}
        {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button }
