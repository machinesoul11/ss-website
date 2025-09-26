'use client'

import { useEffect, useState } from 'react'

interface ClientOnlyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * ClientOnly component to prevent hydration mismatches
 * Renders fallback on server and during hydration, then shows children
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

/**
 * Dynamic year component that's hydration-safe
 */
export function DynamicYear() {
  return (
    <ClientOnly fallback="2025">
      {new Date().getFullYear()}
    </ClientOnly>
  )
}
