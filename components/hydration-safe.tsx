"use client"

import { useState, useEffect, ReactNode } from "react"

interface HydrationSafeProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * A wrapper component that only renders its children after hydration is complete.
 * This prevents hydration mismatches caused by client-side only operations.
 */
export default function HydrationSafe({ children, fallback = null }: HydrationSafeProps) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  if (!isHydrated) {
    return <>{fallback}</>
  }

  return <>{children}</>
} 