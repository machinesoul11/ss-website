/**
 * Analytics-Enhanced Components
 * Wrapper components that add automatic analytics tracking
 */

'use client'

import React, { forwardRef } from 'react'
import { useCombinedAnalytics } from '@/lib/combined-analytics'

interface AnalyticsButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  ctaText?: string
  ctaPosition?: string
  trackAsGoal?: boolean
  goalName?: string
  children: React.ReactNode
}

/**
 * Button component with automatic CTA tracking
 */
export const AnalyticsButton = forwardRef<
  HTMLButtonElement,
  AnalyticsButtonProps
>(
  (
    {
      ctaText,
      ctaPosition,
      trackAsGoal,
      goalName,
      onClick,
      children,
      ...domProps
    },
    ref
  ) => {
    const analytics = useCombinedAnalytics()

    const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
      // Track the CTA click
      const text =
        ctaText || (typeof children === 'string' ? children : 'Button Click')
      const position = ctaPosition || 'unknown'

      await analytics.trackCTAClick(text, position)

      // Track as goal if specified
      if (trackAsGoal && goalName) {
        await analytics.trackConversion(goalName, 1, {
          cta_text: text,
          cta_position: position,
        })
      }

      // Call original onClick handler
      if (onClick) {
        onClick(event)
      }
    }

    return (
      <button
        ref={ref}
        onClick={handleClick}
        data-cta={ctaText || true}
        data-cta-position={ctaPosition}
        {...domProps}
      >
        {children}
      </button>
    )
  }
)

AnalyticsButton.displayName = 'AnalyticsButton'

interface AnalyticsLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  trackClick?: boolean
  eventName?: string
  eventProperties?: Record<string, any>
  children: React.ReactNode
}

/**
 * Link component with automatic click tracking
 */
export const AnalyticsLink = forwardRef<HTMLAnchorElement, AnalyticsLinkProps>(
  (
    {
      trackClick = true,
      eventName,
      eventProperties,
      onClick,
      href,
      children,
      ...props
    },
    ref
  ) => {
    const analytics = useCombinedAnalytics()

    const handleClick = async (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (trackClick) {
        const isOutbound =
          href?.startsWith('http') &&
          href &&
          !href.includes(window.location.hostname)
        const linkText =
          typeof children === 'string' ? children : href || 'Link'

        await analytics.trackEvent({
          name:
            eventName ||
            (isOutbound ? 'outbound_link_click' : 'internal_link_click'),
          properties: {
            link_text: linkText,
            link_url: href,
            is_outbound: isOutbound,
            ...eventProperties,
          },
        })
      }

      if (onClick) {
        onClick(event)
      }
    }

    return (
      <a ref={ref} href={href} onClick={handleClick} {...props}>
        {children}
      </a>
    )
  }
)

AnalyticsLink.displayName = 'AnalyticsLink'

interface AnalyticsFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  formName: string
  trackSubmission?: boolean
  children: React.ReactNode
}

/**
 * Form component with automatic submission and interaction tracking
 */
export const AnalyticsForm = forwardRef<HTMLFormElement, AnalyticsFormProps>(
  ({ formName, trackSubmission = true, onSubmit, children, ...props }, ref) => {
    const analytics = useCombinedAnalytics()

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      if (trackSubmission) {
        try {
          await analytics.trackFormSubmission(formName, true)

          // If this is the beta signup form, track the conversion
          if (formName.toLowerCase().includes('beta')) {
            await analytics.trackBetaSignup({}, 'form')
          }
        } catch (error) {
          console.error('Error tracking form submission:', error)
          await analytics.trackFormSubmission(formName, false, {
            error: error instanceof Error ? error.message : String(error),
          })
        }
      }

      if (onSubmit) {
        onSubmit(event)
      }
    }

    return (
      <form
        ref={ref}
        data-form-name={formName}
        onSubmit={handleSubmit}
        {...props}
      >
        {children}
      </form>
    )
  }
)

AnalyticsForm.displayName = 'AnalyticsForm'

interface AnalyticsImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  trackView?: boolean
  eventProperties?: Record<string, any>
}

/**
 * Image component with view tracking
 */
export const AnalyticsImage = forwardRef<HTMLImageElement, AnalyticsImageProps>(
  ({ trackView = false, eventProperties, onLoad, src, alt, ...props }, ref) => {
    const analytics = useCombinedAnalytics()

    const handleLoad = async (
      event: React.SyntheticEvent<HTMLImageElement>
    ) => {
      if (trackView) {
        await analytics.trackEvent({
          name: 'image_view',
          properties: {
            image_src: src,
            image_alt: alt,
            ...eventProperties,
          },
        })
      }

      if (onLoad) {
        onLoad(event)
      }
    }

    return <img ref={ref} src={src} alt={alt} onLoad={handleLoad} {...props} />
  }
)

AnalyticsImage.displayName = 'AnalyticsImage'

/**
 * Higher-order component to add analytics to any component
 */
export function withAnalytics<P extends object>(
  Component: React.ComponentType<P>,
  defaultEventName: string,
  defaultProperties?: Record<string, any>
) {
  const WrappedComponent = forwardRef<
    any,
    P & {
      trackEvent?: boolean
      eventName?: string
      eventProperties?: Record<string, any>
    }
  >((props, ref) => {
    const {
      trackEvent = true,
      eventName,
      eventProperties,
      ...componentProps
    } = props
    const analytics = useCombinedAnalytics()

    const handleInteraction = React.useCallback(async () => {
      if (trackEvent) {
        await analytics.trackEvent({
          name: eventName || defaultEventName,
          properties: {
            ...defaultProperties,
            ...eventProperties,
          },
        })
      }
    }, [trackEvent, eventName, eventProperties, analytics])

    // Add the interaction handler to common events
    const enhancedProps = {
      ...componentProps,
      onClick: (event: any) => {
        handleInteraction()
        if (
          'onClick' in componentProps &&
          typeof componentProps.onClick === 'function'
        ) {
          componentProps.onClick(event)
        }
      },
    }

    return <Component ref={ref} {...(enhancedProps as P)} />
  })

  WrappedComponent.displayName = `withAnalytics(${Component.displayName || Component.name})`
  return WrappedComponent
}
