import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageLayoutProps {
  children: ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: 'sm' | 'md' | 'lg' | 'xl'
}

export function PageLayout({ 
  children, 
  className, 
  maxWidth = 'xl',
  padding = 'lg'
}: PageLayoutProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full',
        {
          'max-w-sm': maxWidth === 'sm',
          'max-w-md': maxWidth === 'md', 
          'max-w-4xl': maxWidth === 'lg',
          'max-w-7xl': maxWidth === 'xl',
          'max-w-none': maxWidth === '2xl',
          'max-w-full': maxWidth === 'full',
        },
        {
          'px-4 py-6': padding === 'sm',
          'px-6 py-8': padding === 'md',
          'px-6 py-12 lg:px-8 lg:py-16': padding === 'lg',
          'px-8 py-16 lg:px-12 lg:py-24': padding === 'xl',
        },
        className
      )}
    >
      {children}
    </div>
  )
}

interface SectionProps {
  children: ReactNode
  className?: string
  background?: 'white' | 'gray' | 'blue'
  spacing?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Section({ 
  children, 
  className,
  background = 'white',
  spacing = 'lg'
}: SectionProps) {
  return (
    <section
      className={cn(
        {
          'bg-parchment-white': background === 'white',
          'bg-document-gray': background === 'gray',
          'bg-blue-50': background === 'blue',
        },
        {
          'py-8': spacing === 'sm',
          'py-12': spacing === 'md',
          'py-16 sm:py-24': spacing === 'lg',
          'py-24 sm:py-32': spacing === 'xl',
        },
        className
      )}
    >
      {children}
    </section>
  )
}

interface ContainerProps {
  children: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  center?: boolean
}

export function Container({ 
  children, 
  className,
  size = 'xl',
  center = true
}: ContainerProps) {
  return (
    <div
      className={cn(
        'w-full px-6 lg:px-8',
        {
          'max-w-2xl': size === 'sm',
          'max-w-4xl': size === 'md',
          'max-w-6xl': size === 'lg',
          'max-w-7xl': size === 'xl',
          'max-w-none': size === 'full',
        },
        {
          'mx-auto': center,
        },
        className
      )}
    >
      {children}
    </div>
  )
}

interface ContentWrapperProps {
  children: ReactNode
  className?: string
  prose?: boolean
}

export function ContentWrapper({ 
  children, 
  className,
  prose = false
}: ContentWrapperProps) {
  return (
    <div
      className={cn(
        {
          'prose prose-lg max-w-none': prose,
          'space-y-8': !prose,
        },
        className
      )}
    >
      {children}
    </div>
  )
}

interface GridProps {
  children: ReactNode
  className?: string
  cols?: 1 | 2 | 3 | 4 | 6 | 12
  gap?: 'sm' | 'md' | 'lg' | 'xl'
  responsive?: boolean
}

export function Grid({ 
  children, 
  className,
  cols = 3,
  gap = 'lg',
  responsive = true
}: GridProps) {
  return (
    <div
      className={cn(
        'grid',
        {
          'grid-cols-1': cols === 1,
          'grid-cols-1 md:grid-cols-2': cols === 2 && responsive,
          'grid-cols-2': cols === 2 && !responsive,
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-3': cols === 3 && responsive,
          'grid-cols-3': cols === 3 && !responsive,
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-4': cols === 4 && responsive,
          'grid-cols-4': cols === 4 && !responsive,
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6': cols === 6 && responsive,
          'grid-cols-6': cols === 6 && !responsive,
          'grid-cols-1 md:grid-cols-6 lg:grid-cols-12': cols === 12 && responsive,
          'grid-cols-12': cols === 12 && !responsive,
        },
        {
          'gap-4': gap === 'sm',
          'gap-6': gap === 'md',
          'gap-8': gap === 'lg',
          'gap-12': gap === 'xl',
        },
        className
      )}
    >
      {children}
    </div>
  )
}

interface FlexProps {
  children: ReactNode
  className?: string
  direction?: 'row' | 'col'
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  gap?: 'sm' | 'md' | 'lg' | 'xl'
  wrap?: boolean
}

export function Flex({ 
  children, 
  className,
  direction = 'row',
  align = 'start',
  justify = 'start',
  gap = 'md',
  wrap = false
}: FlexProps) {
  return (
    <div
      className={cn(
        'flex',
        {
          'flex-row': direction === 'row',
          'flex-col': direction === 'col',
        },
        {
          'items-start': align === 'start',
          'items-center': align === 'center',
          'items-end': align === 'end',
          'items-stretch': align === 'stretch',
        },
        {
          'justify-start': justify === 'start',
          'justify-center': justify === 'center',
          'justify-end': justify === 'end',
          'justify-between': justify === 'between',
          'justify-around': justify === 'around',
          'justify-evenly': justify === 'evenly',
        },
        {
          'gap-2': gap === 'sm',
          'gap-4': gap === 'md',
          'gap-6': gap === 'lg',
          'gap-8': gap === 'xl',
        },
        {
          'flex-wrap': wrap,
        },
        className
      )}
    >
      {children}
    </div>
  )
}
